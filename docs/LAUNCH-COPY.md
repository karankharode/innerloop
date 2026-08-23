# Launch copy

Drafts for LinkedIn, X and Instagram, written for a building-in-public
audience. Product name is **Innerloop** throughout — swap it if you pick a
different one from [BRANDING.md](BRANDING.md).

**Two rules I stuck to:** no invented numbers, and no fake vulnerability.
Anywhere a real figure would land harder, there is a `[BRACKET]` for you to
fill in — or cut the sentence. Do not ship a launch post containing a number
you have not measured.

---

## LinkedIn

*Longer, first-person, reads as a build note rather than an announcement.
Post as text — LinkedIn suppresses link posts, so put the URL in the first
comment.*

> I built a thing this month, and the interesting part was what I had to leave
> out.
>
> Innerloop asks you ten questions — about your goals, your values, your
> habits, the decisions you are avoiding — and then shows you what you just
> said. That is the whole product. No account needed to start. No streak. No
> feed. No advice.
>
> The obvious version of this uses an LLM to generate questions from your
> answers. I built the boring version instead: a bank of questions I wrote by
> hand, and a set of deterministic rules for ordering them. Cover every theme
> before repeating one. Open with something you have to write, not something
> you have to rate. Do not put two questions from the same theme back to back.
>
> Why boring? Because the moment a model generates questions from what people
> write, you have built a system that learns from strangers' unvetted words and
> hands the result to the next person. For a product where people are being
> honest with themselves, that is not a trade I wanted to make.
>
> So the system logs signals instead — which questions get skipped, which
> themes pull the longest answers — as pending rows I review myself. Aggregate
> behaviour, never anyone's text. If a question makes it into the bank, I wrote
> it.
>
> It is live and free. Ten questions, about eight minutes. You can do it
> without giving me an email address, and if you never come back I have no way
> of knowing who you were — which is roughly the point.
>
> Link in the comments. Tell me which question was the annoying one.

**First comment:** `https://innerloop.app` — plus one line: *"Built with
Next.js and Supabase. Happy to go into the anonymous-session design if anyone
wants it — it was the fiddliest part."*

---

## X / Twitter

### Option A — single post

> Built Innerloop: 10 questions about your goals, values, habits and the
> decisions you keep postponing. Then it shows you what you said.
>
> No login to start. No streak. No advice.
>
> The questions are hand-written and rule-ordered, not model-generated. That
> was the whole design constraint.
>
> innerloop.app

### Option B — thread (the build-in-public version)

**1/**
> Shipped Innerloop today.
>
> 10 questions about your goals, values, habits and decisions. It shows you
> what you said. That's it.
>
> No login to start, no streak, no advice.
>
> innerloop.app

**2/**
> The obvious build is an LLM generating questions from your answers.
>
> I didn't build that, and the reason is the whole product.

**3/**
> If a model writes questions from what users type, you're shipping strangers'
> unvetted words to the next person who sits down to be honest with themselves.
>
> Hard no.

**4/**
> So: a bank of questions I wrote by hand, ordered by four deterministic rules.
>
> — breadth across themes before repeating one
> — open with a writing prompt, never a 1-5 scale
> — prefer questions you haven't seen
> — never two from the same theme in a row

**5/**
> The system still learns. Just not from your text.
>
> It logs aggregate signals — which questions get skipped, which themes pull
> long answers — as pending rows. I review them myself and write any new
> question by hand.

**6/**
> Anonymous by default was harder than expected.
>
> Random token in a signed HttpOnly cookie, only the sha256 in the DB. Knowing
> a session's UUID gets you nothing. Sign in later and your existing sessions
> attach to the account.

**7/**
> Next.js 15 + Supabase + Postgres RLS. Web only for now — mobile is a separate
> decision I haven't made.
>
> Free, no account needed to try it: innerloop.app
>
> Curious which question people find most annoying. It's question 4 for me.

---

## Instagram

*Carousel — the format that actually works for this. Six frames, then the
caption. Frame text is short on purpose; the caption carries the argument.*

**Frame 1** (big type, dark background)
> Ten questions.
> One honest look
> at where you
> actually are.

**Frame 2**
> No login.
> No streak.
> No feed.
> No advice.

**Frame 3**
> "What are you working toward right now that you would still choose if no one
> ever found out about it?"

**Frame 4**
> "What do you reliably do when you are avoiding something?"

**Frame 5**
> "What are you waiting for before you decide? Is that information actually
> coming?"

**Frame 6**
> Innerloop
> innerloop.app
> Free. Takes about 8 minutes.

**Caption:**

> I built something small and put it online.
>
> Innerloop asks you ten questions — goals, values, habits, the decisions you
> keep pushing to next week — and then shows you what you said. No score, no
> personality type, no advice. Just your own answers, in one place, where you
> have to look at them.
>
> You can do the whole thing without making an account. If you want to keep it,
> you can, and then it becomes a private history you can read back in six
> months. Nothing is public unless you decide it is.
>
> Every question is one I wrote by hand. Nothing is generated from what anyone
> else typed — that was the one line I wasn't willing to cross on this.
>
> Link in bio. It takes about eight minutes. Slide 3 is the one people go
> quiet on.
>
> #buildinpublic #indiehackers #productlaunch #selfreflection #nextjs
> #supabase #solofounder #shipit

---

## Posting notes

- **Order:** X first (fastest feedback, cheapest to correct), LinkedIn a few
  hours later, Instagram the next morning. If the X thread exposes a bad
  question or a broken flow, you can fix it before the slower channels land.
- **The share card is the loop.** Anyone who finishes and downloads their card
  posts a 1200×630 image with `innerloop.app` on it. Make sure the first thing
  in your bio and your first comment is the bare domain, not a UTM-laden link.
- **What to reply to.** Anyone who names a specific question is a real user;
  engage properly. Anyone asking "is this an AI thing?" — that is your opening
  for the hand-written-bank answer, which is the most differentiated thing you
  have to say.
- **Do not** add a "join the waitlist" line. There is no waitlist; the product
  is live and free, and saying so is stronger.

---

## Note on mobile (deliberately not decided here)

The launch copy says "web only for now" because that is true and because
saying it invites the useful question rather than dodging it. Before committing
to native Swift + Kotlin, the thing worth pricing is not the build — it is the
second and third year of maintaining two codebases against one Supabase schema,
with two release cycles and two review queues, as a solo founder.

The honest alternative worth checking first: this product is a form, a summary
screen and an image. A PWA with an install prompt covers most of it, and
would let you find out whether people want it on their phone before you buy the
answer twice. That is a feasibility check, not a recommendation — it is your
call, and it is out of scope for this phase.
