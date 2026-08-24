import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import { brand } from '@/lib/brand'

export const metadata: Metadata = {
  title: 'Privacy',
  description: `How ${brand.name} handles what you write.`,
}

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-2xl px-5 pb-24 sm:px-8">
        <div className="pt-10">
          <h1 className="font-serif text-3xl">Privacy</h1>
          <p className="mt-2 text-sm text-paper-faint">Plain English, no lawyering.</p>

          <div className="mt-10 space-y-8 leading-relaxed text-paper-dim">
            <section>
              <h2 className="font-serif text-xl text-paper">What we store</h2>
              <p className="mt-2">
                Your answers, the questions you were asked, and when you answered them.
                If you leave an email to hear what comes next, we store that address on
                a waitlist. If you create an account, we also store your email for sign-in.
                That is the whole list.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-paper">Answering anonymously</h2>
              <p className="mt-2">
                You can complete a session without an account. Your answers are stored
                against a random token held in a cookie in your browser — we cannot tie
                that to you. If you later sign in from the same browser, those sessions
                are attached to your account.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-paper">Who can read your sessions</h2>
              <p className="mt-2">
                Only you. A session becomes readable by others only when you explicitly
                create a public link for it, and turning that link off makes it private
                again immediately.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-paper">
                We do not train anything on what you write
              </h2>
              <p className="mt-2">
                The questions come from a bank we write and curate by hand. When we
                consider adding a question, we look at aggregate signals — which
                questions get skipped, which themes people spend the most time on —
                never at anyone&rsquo;s answers. No answer text is ever used to generate
                a question, and no model is trained on your writing.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-paper">Deleting things</h2>
              <p className="mt-2">
                You can delete any saved session from your history, which deletes its
                answers too. To delete your account entirely, email us and we will
                remove everything.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-paper">This is not therapy</h2>
              <p className="mt-2">
                {brand.name} is a reflection tool. It is not counselling, therapy, or
                medical advice, and it is not a substitute for talking to a
                professional.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
