import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ThemeRow } from '@/lib/database.types'
import type { EngineQuestion } from '@/lib/engine-rules'

export { selectQuestions, QUESTIONS_PER_SESSION } from '@/lib/engine-rules'
export type { EngineQuestion } from '@/lib/engine-rules'

export async function loadBank(): Promise<{ questions: EngineQuestion[]; themes: ThemeRow[] }> {
  const db = supabaseAdmin()
  const [{ data: questions, error: qErr }, { data: themes, error: tErr }] = await Promise.all([
    db.from('questions').select('*').eq('is_active', true).order('sort_order'),
    db.from('themes').select('*').order('sort_order'),
  ])

  if (qErr) throw new Error(`Failed to load questions: ${qErr.message}`)
  if (tErr) throw new Error(`Failed to load themes: ${tErr.message}`)
  if (!questions?.length || !themes?.length) {
    throw new Error('Question bank is empty — run the seed migration')
  }

  const themeBySlug = new Map(themes.map((t) => [t.slug, t]))
  const enriched: EngineQuestion[] = questions.map((q) => ({
    ...q,
    theme_title: themeBySlug.get(q.theme_slug)?.title ?? q.theme_slug,
    theme_accent: themeBySlug.get(q.theme_slug)?.accent ?? 'indigo',
  }))

  return { questions: enriched, themes }
}

