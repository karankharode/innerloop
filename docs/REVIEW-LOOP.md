# The question review loop

The MVP question engine is a curated bank plus deterministic rules
(`lib/engine-rules.ts`). No model picks or writes questions. This document
describes the logging that exists today and the review loop it is designed to
feed later.

## The rule that shapes everything

**Nothing a stranger types ever becomes a question.** Not directly, not
paraphrased, not as training data. The bank grows only through questions you
write and approve yourself.

What the system is allowed to learn from is *behaviour in aggregate*: which
questions get skipped, which themes pull the longest answers, where sessions
concentrate. Those are signals about the bank, not content from users.

## What gets logged

`public.question_candidates`, written by `lib/candidates.ts` at session
completion. Three signals today:

| Signal | Trigger | Row kind | Dedupe key |
|---|---|---|---|
| Skip | A question was skipped | `pattern` | `skip:<question_id>` |
| Depth | An open-text answer ran past 100 words | `question` | `depth:<question_id>` |
| Dominance | One theme carried a session of 5+ answers | `pattern` | `dominant:<theme_slug>` |

Repeat observations bump `occurrences` and `last_seen_at` rather than creating
new rows, so the table stays a short ranked list rather than a log to wade
through.

Every row carries:

- `proposed_body` — generated from a fixed template in code. Never user text.
- `rationale` — why the signal fired, in plain English.
- `signal_payload` — derived values only: question id, theme slug, a length
  *bucket* (`terse` / `normal` / `long` / `essay`), counts. **Never answer text.**
- `status` — always `pending` on insert. Only a human moves it.

Failures are swallowed: candidate logging must never break someone's session.

## Reviewing, today

There is no approval UI yet — deliberately, since it would be a UI for an
audience of one. Review happens in the Supabase SQL editor.

Highest-signal candidates first:

```sql
select kind, theme_slug, occurrences, proposed_body, rationale, signal_payload
from public.question_candidates
where status = 'pending'
order by occurrences desc, last_seen_at desc
limit 25;
```

Rejecting one, with a note to your future self:

```sql
update public.question_candidates
set status = 'rejected', reviewed_at = now(), review_note = 'Skipped because it is the 9th question, not because it is bad'
where id = '<candidate_id>';
```

Approving is deliberately two steps, because approving a *candidate* is not the
same as writing a *question*. You write the question yourself; the candidate row
only records that you acted on the signal:

```sql
-- 1. Write the actual question. `source` marks where it came from.
insert into public.questions (theme_slug, kind, body, helper_text, config, source, sort_order)
values ('habits', 'open_text', 'Your wording here, written by you.', null, '{}', 'approved_candidate', 8);

-- 2. Close the candidate.
update public.question_candidates
set status = 'approved', reviewed_at = now(), review_note = 'Wrote a narrower follow-up'
where id = '<candidate_id>';
```

`questions.source` then tells you, forever, which questions were originally
curated and which came out of this loop.

## What to build next, when volume justifies it

1. **An admin review screen** — the SQL above with buttons, gated on an
   allowlist of user ids. Worth building at roughly 50 pending candidates.
2. **A rate floor** — ignore skip signals below N occurrences so one person's
   bad day does not flag a good question.
3. **Position-aware skip analysis** — a question skipped in slot 9 is a
   fatigue signal, not a quality signal. Log `sort_index` to tell them apart.
4. **A/B on wording** — two variants of one question, compare completion and
   answer length. Requires a variant column on `questions`.

## What deliberately stays out

- Generating questions from a model over user answers. This is the line, and
  the reason `proposed_body` is templated in code rather than composed.
- Showing anyone else's answers to anyone, in any aggregated or anonymised
  form. The share link is the only path out, and only its owner can open it.
