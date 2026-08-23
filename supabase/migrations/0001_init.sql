-- =====================================================================
-- Innerloop — core schema
-- Guided self-introspection. Anonymous-first, claimable by an account.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles: one row per auth user
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-create a profile whenever an auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- themes + questions: the curated, rule-based question bank (MVP engine)
-- ---------------------------------------------------------------------
create table if not exists public.themes (
  slug        text primary key,
  title       text not null,
  description text not null,
  accent      text not null default 'indigo',
  sort_order  int  not null default 0
);

do $$ begin
  create type public.question_kind as enum ('open_text', 'scale', 'single_choice');
exception when duplicate_object then null; end $$;

create table if not exists public.questions (
  id          uuid primary key default gen_random_uuid(),
  theme_slug  text not null references public.themes(slug) on delete restrict,
  kind        public.question_kind not null default 'open_text',
  body        text not null,
  helper_text text,
  -- for scale: {"min":1,"max":5,"min_label":"...","max_label":"..."}
  -- for single_choice: {"choices":[{"value":"...","label":"..."}]}
  config      jsonb not null default '{}'::jsonb,
  -- 'curated' = written by us. 'approved_candidate' = a candidate a human
  -- reviewer explicitly promoted. Nothing reaches this table automatically.
  source      text not null default 'curated'
                check (source in ('curated', 'approved_candidate')),
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists questions_theme_active_idx
  on public.questions (theme_slug, is_active, sort_order);

-- ---------------------------------------------------------------------
-- sessions: one introspection run
-- Anonymous until claimed. anon_token_hash is the sha256 of a secret held
-- only in the visitor's signed cookie, so an unclaimed session can be
-- resumed and later claimed without any account.
-- ---------------------------------------------------------------------
do $$ begin
  create type public.session_status as enum ('in_progress', 'completed');
exception when duplicate_object then null; end $$;

create table if not exists public.sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,
  anon_token_hash text,
  status          public.session_status not null default 'in_progress',
  -- ordered question ids selected by the rule-based engine for this run
  question_ids    uuid[] not null default '{}',
  -- derived at completion: counts, themes touched, highlight answer, etc.
  summary         jsonb,
  -- public read-only link. null until the user opts in (requires an account).
  share_slug      text unique,
  is_public       boolean not null default false,
  started_at      timestamptz not null default now(),
  completed_at    timestamptz,
  claimed_at      timestamptz,
  constraint sessions_owner_present
    check (user_id is not null or anon_token_hash is not null),
  constraint sessions_public_requires_owner
    check (is_public = false or (user_id is not null and share_slug is not null))
);

create index if not exists sessions_user_idx
  on public.sessions (user_id, completed_at desc nulls last);
create index if not exists sessions_anon_idx
  on public.sessions (anon_token_hash);
create unique index if not exists sessions_share_slug_idx
  on public.sessions (share_slug) where share_slug is not null;

-- ---------------------------------------------------------------------
-- answers: every session's answers are retained as introspection history
-- question_snapshot freezes the wording shown, so history stays truthful
-- even if the bank is later edited.
-- ---------------------------------------------------------------------
create table if not exists public.answers (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references public.sessions(id) on delete cascade,
  question_id       uuid not null references public.questions(id) on delete restrict,
  question_snapshot jsonb not null,
  sort_index        int not null,
  value_text        text,
  value_number      numeric,
  skipped           boolean not null default false,
  answered_at       timestamptz not null default now(),
  unique (session_id, question_id)
);

create index if not exists answers_session_idx
  on public.answers (session_id, sort_index);

-- ---------------------------------------------------------------------
-- question_candidates: structured logging for the future review loop.
--
-- Nothing here is ever served to a user and nothing is ever trained on.
-- Rows land as 'pending' and only a human reviewer can move them to
-- 'approved', which is a manual, deliberate act (see docs/REVIEW-LOOP.md).
--
-- signal_payload holds *derived, aggregate* signals (theme, answer length
-- bucket, skip rate) — not raw answer text — so review is possible without
-- exposing anyone's writing.
-- ---------------------------------------------------------------------
do $$ begin
  create type public.candidate_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.question_candidates (
  id             uuid primary key default gen_random_uuid(),
  -- 'question' = a concrete proposed question.
  -- 'pattern'  = an observation about the bank (e.g. a theme that is
  --              consistently skipped) that a human might turn into one.
  kind           text not null check (kind in ('question', 'pattern')),
  theme_slug     text references public.themes(slug) on delete set null,
  proposed_body  text not null,
  rationale      text not null,
  -- dedupe key: repeat observations bump occurrences instead of piling up
  dedupe_key     text not null unique,
  occurrences    int not null default 1,
  signal_payload jsonb not null default '{}'::jsonb,
  status         public.candidate_status not null default 'pending',
  reviewed_by    uuid references auth.users(id) on delete set null,
  reviewed_at    timestamptz,
  review_note    text,
  first_seen_at  timestamptz not null default now(),
  last_seen_at   timestamptz not null default now()
);

create index if not exists question_candidates_status_idx
  on public.question_candidates (status, occurrences desc, last_seen_at desc);

-- ---------------------------------------------------------------------
-- Row Level Security
--
-- Posture: the question bank is world-readable. Everything else is
-- readable only by its owner. Anonymous sessions, share-link reads and
-- candidate logging all go through server route handlers using the
-- service role, so no anon-writable policy is needed anywhere.
-- ---------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.themes              enable row level security;
alter table public.questions           enable row level security;
alter table public.sessions            enable row level security;
alter table public.answers             enable row level security;
alter table public.question_candidates enable row level security;

-- profiles: owner read/update
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- question bank: readable by everyone, writable by no one (service role only)
drop policy if exists themes_select_all on public.themes;
create policy themes_select_all on public.themes
  for select using (true);

drop policy if exists questions_select_active on public.questions;
create policy questions_select_active on public.questions
  for select using (is_active = true);

-- sessions: owner reads own; public rows readable by anyone (share links)
drop policy if exists sessions_select_own on public.sessions;
create policy sessions_select_own on public.sessions
  for select using (auth.uid() = user_id);

drop policy if exists sessions_select_public on public.sessions;
create policy sessions_select_public on public.sessions
  for select using (is_public = true and share_slug is not null);

drop policy if exists sessions_update_own on public.sessions;
create policy sessions_update_own on public.sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists sessions_delete_own on public.sessions;
create policy sessions_delete_own on public.sessions
  for delete using (auth.uid() = user_id);

-- answers: follow the parent session's visibility
drop policy if exists answers_select_own on public.answers;
create policy answers_select_own on public.answers
  for select using (
    exists (
      select 1 from public.sessions s
      where s.id = answers.session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists answers_select_public on public.answers;
create policy answers_select_public on public.answers
  for select using (
    exists (
      select 1 from public.sessions s
      where s.id = answers.session_id and s.is_public = true
    )
  );

-- question_candidates: no policies at all. Service role bypasses RLS;
-- every other role is denied by default. Review happens in the Supabase
-- dashboard until a proper review UI exists.
