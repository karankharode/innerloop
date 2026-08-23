/**
 * Hand-maintained to match supabase/migrations. Regenerate with:
 *   npx supabase gen types typescript --project-id <id> > lib/database.types.ts
 */
export type Json = string | number | boolean | null | { [k: string]: Json } | Json[]

export type QuestionKind = 'open_text' | 'scale' | 'single_choice'
export type SessionStatus = 'in_progress' | 'completed'
export type CandidateStatus = 'pending' | 'approved' | 'rejected'

export type ThemeRow = {
  slug: string
  title: string
  description: string
  accent: string
  sort_order: number
}

export type ScaleConfig = {
  min: number
  max: number
  min_label: string
  max_label: string
}
export type ChoiceConfig = {
  choices: { value: string; label: string }[]
}

export type QuestionRow = {
  id: string
  theme_slug: string
  kind: QuestionKind
  body: string
  helper_text: string | null
  config: Json
  source: 'curated' | 'approved_candidate'
  is_active: boolean
  sort_order: number
  created_at: string
}

export type SessionSummary = {
  answered: number
  skipped: number
  total: number
  words: number
  themes: { slug: string; title: string; answered: number }[]
  dominant_theme: { slug: string; title: string } | null
  headline: string
  highlight: { question: string; answer: string } | null
  signature: { label: string; value: string }[]
  generated_at: string
}

export type SessionRow = {
  id: string
  user_id: string | null
  anon_token_hash: string | null
  status: SessionStatus
  question_ids: string[]
  summary: SessionSummary | null
  share_slug: string | null
  is_public: boolean
  started_at: string
  completed_at: string | null
  claimed_at: string | null
}

export type AnswerRow = {
  id: string
  session_id: string
  question_id: string
  question_snapshot: {
    body: string
    kind: QuestionKind
    theme_slug: string
    theme_title: string
    helper_text: string | null
    config: Json
  }
  sort_index: number
  value_text: string | null
  value_number: number | null
  skipped: boolean
  answered_at: string
}

export type QuestionCandidateRow = {
  id: string
  kind: 'question' | 'pattern'
  theme_slug: string | null
  proposed_body: string
  rationale: string
  dedupe_key: string
  occurrences: number
  signal_payload: Json
  status: CandidateStatus
  reviewed_by: string | null
  reviewed_at: string | null
  review_note: string | null
  first_seen_at: string
  last_seen_at: string
}

export type ProfileRow = {
  id: string
  display_name: string | null
  created_at: string
  updated_at: string
}

/** supabase-js requires Relationships on every table entry. */
type Table<Row> = {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow>
      themes: Table<ThemeRow>
      questions: Table<QuestionRow>
      sessions: Table<SessionRow>
      answers: Table<AnswerRow>
      question_candidates: Table<QuestionCandidateRow>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    CompositeTypes: Record<string, never>
    Enums: {
      question_kind: QuestionKind
      session_status: SessionStatus
      candidate_status: CandidateStatus
    }
  }
}
