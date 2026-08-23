export type {
  AnswerRow,
  SessionRow,
  SessionSummary,
  QuestionRow,
  QuestionKind,
  ThemeRow,
  ScaleConfig,
  ChoiceConfig,
  Json,
} from '@/lib/database.types'

import type { AnswerRow } from '@/lib/database.types'

export type EngineQuestionSnapshot = AnswerRow['question_snapshot']
