/**
 * Renders a sample share card to a PNG so the design can be eyeballed
 * without a database:  npm run preview:card
 */
import { writeFileSync } from 'node:fs'
import { renderCard } from '../lib/card'
import type { SessionSummary } from '../lib/database.types'

const sample: SessionSummary = {
  answered: 9,
  skipped: 1,
  total: 10,
  words: 412,
  themes: [
    { slug: 'direction', title: 'Direction', answered: 3 },
    { slug: 'habits', title: 'Habits & Energy', answered: 2 },
    { slug: 'decisions', title: 'Decisions', answered: 2 },
    { slug: 'values', title: 'Values', answered: 2 },
  ],
  dominant_theme: { slug: 'direction', title: 'Direction' },
  headline: 'You had a lot to say — most of it about Direction.',
  highlight: {
    question: 'What are you working toward right now?',
    answer:
      'Getting one thing genuinely finished instead of five things almost finished. I keep starting because starting is the part I am good at, and I have started to notice that.',
  },
  signature: [
    { label: 'Direction', value: 'Build something that lasts' },
    { label: 'Decisions', value: '3 / 5' },
  ],
  generated_at: new Date().toISOString(),
}

async function main() {
  const image = renderCard(sample, { accent: 'indigo', dateLabel: '23 Aug 2026' })
  const buffer = Buffer.from(await image.arrayBuffer())
  writeFileSync('public/sample-card.png', buffer)
  console.log(`wrote public/sample-card.png (${(buffer.length / 1024).toFixed(1)} kB)`)
}

void main()
