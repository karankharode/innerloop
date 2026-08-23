import type { QuestionKind, Json } from '@/lib/database.types'

export interface ClientQuestion {
  id: string
  kind: QuestionKind
  body: string
  helperText: string | null
  config: Json
  theme: { slug: string; title: string; accent: string }
}

export interface ClientAnswer {
  questionId: string
  text: string | null
  number: number | null
  skipped: boolean
}

export const ACCENT_HEX: Record<string, string> = {
  indigo: '#8b8cf0',
  amber: '#e8b45c',
  emerald: '#6fd0a2',
  rose: '#ef8fa3',
  sky: '#74c0ea',
  violet: '#b48ce8',
}

export function accentHex(accent: string) {
  return ACCENT_HEX[accent] ?? ACCENT_HEX.indigo
}
