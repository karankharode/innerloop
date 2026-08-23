# Innerloop

Guided self-introspection on the web. Ten curated questions about goals,
values, habits and decisions — answered anonymously, summarised on a results
screen, and saveable to a private history if you create an account.

Next.js 15 (App Router) · React 19 · Supabase (Postgres + Auth) · Tailwind v4.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill it in — see below
npm run dev
```

### Environment

| Variable | Where it comes from | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Settings → API Keys | Safe in the browser (`sb_publishable_…`) |
| `SUPABASE_SECRET_KEY` | Supabase → Settings → API Keys | **Server only.** Bypasses RLS (`sb_secret_…`) |
| `NEXT_PUBLIC_SITE_URL` | Your deployed origin | Used for share links and auth redirects |
| `SESSION_SECRET` | `openssl rand -base64 48` | Signs the anonymous-session cookie |

`lib/env.ts` validates all of these at boot, so a missing variable fails the
build rather than a request.

### Database

Run the two migrations in order, in the Supabase SQL editor or via the CLI:

```bash
supabase db push        # or paste supabase/migrations/*.sql in order
```

- `0001_init.sql` — tables, enums, RLS policies, the new-user trigger.
- `0002_seed_question_bank.sql` — 6 themes, 42 questions. Idempotent.

### Auth setup

Auth is passwordless email links. In Supabase → Authentication → URL
Configuration, set **Site URL** to your `NEXT_PUBLIC_SITE_URL` and add
`<site>/auth/callback` to the redirect allowlist. Do this for localhost and for
production separately.

---

## How it fits together

```
Visitor (no account)
  │  POST /api/sessions        → session row + 10 questions, anon cookie minted
  ├─ POST /api/sessions/:id/answers   (once per question, autosaved)
  │  POST /api/sessions/:id/complete  → summary derived and stored
  ▼
/results/:id   ── owner-only, works anonymously via the cookie
  │
  ├─ "Save my results" → /login → magic link → /auth/callback
  │                                   └─ claims every anon session in this browser
  ▼
Signed in
  ├─ GET  /api/card/:id?download=1    → PNG share card
  ├─ POST /api/sessions/:id/share     → public link at /s/:slug
  └─ /history                          → every saved session
```

### Anonymous ownership

A visitor gets a random token in an HttpOnly, HMAC-signed cookie
(`lib/anon-session.ts`). The database stores only `sha256(token)`. Knowing a
session UUID is not enough to read it — you need the token, which never leaves
the cookie. On sign-in, `claimAnonSessions()` reassigns those rows to the new
user id and clears the cookie.

### Security posture

- All writes go through route handlers using the service-role key. There is no
  anon-writable RLS policy anywhere, so nothing can be written directly from a
  browser.
- Reads are owner-scoped in `lib/sessions.ts` *and* constrained by RLS as a
  second layer.
- A session is private until its owner explicitly creates a public link, and
  turning the link off makes it private again immediately.
- `/results/*`, `/history` and `/login` are marked `noindex`.

### The question engine

`lib/engine-rules.ts` — pure, deterministic, no model. Four rules: breadth
across themes first, open with an open-text question, prefer questions this
person has not seen recently, never two adjacent questions from one theme.
Seeded per session so a reload gives the same run.

Candidate new questions are logged as `pending` rows for later human review.
See [docs/REVIEW-LOOP.md](docs/REVIEW-LOOP.md) — the short version is that no
user's text ever becomes a question.

### The share card

`lib/card.tsx` is one renderer with two consumers: the download button on the
results screen and the OpenGraph image on a public share page. What someone
downloads is exactly what unfurls in a timeline.

```bash
npm run preview:card   # writes public/sample-card.png
```

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run verify` | 14 checks over the engine rules and summary derivation |
| `npm run preview:card` | Renders a sample share card to `public/sample-card.png` |

---

## Deploying

Vercel: import the repo, add the five environment variables, deploy. Set
`NEXT_PUBLIC_SITE_URL` to the production origin *before* the first deploy —
share links and auth redirects are built from it.

After the first deploy, add the production `<site>/auth/callback` to the
Supabase redirect allowlist.

---

## Scope

Web only for this phase. Mobile is a separate decision — see the note at the
bottom of [docs/LAUNCH-COPY.md](docs/LAUNCH-COPY.md) for the two-codebase
question, which is not settled here.

## Not therapy

The question bank is deliberately general — work, direction, habits, choices.
Nothing probes mental health, trauma or relationships in distress. The
disclaimer on the landing page and in `/privacy` should stay there.
