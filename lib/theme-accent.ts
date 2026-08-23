/** Theme slug -> accent name. Mirrors the accents in the seed migration. */
const THEME_ACCENTS: Record<string, string> = {
  direction: 'indigo',
  values: 'amber',
  habits: 'emerald',
  decisions: 'rose',
  craft: 'sky',
  attention: 'violet',
}

export function accentForTheme(slug: string | null | undefined) {
  return slug ? (THEME_ACCENTS[slug] ?? 'indigo') : 'indigo'
}
