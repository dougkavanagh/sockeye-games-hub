import { ContactForm } from "@/components/ContactForm";

export function AboutPage() {
	return (
		<article className="mx-auto max-w-3xl px-5 py-14">
			<h1 className="font-display text-4xl text-ice-50 sm:text-5xl">About</h1>
			<div className="mt-8 space-y-5 text-base leading-relaxed text-ice-200/85">
				<p>
					Sockeye Games is a Canadian studio making free educational games for
					kids. The name comes from the salmon run: a long journey home. We want
					learning that brings kids back to curiosity, not to an upsell.
				</p>
				<p>
					Each game stays its own adventure. Sockeye is the front door, the
					trust layer, and optional shared progress for families who want it.
				</p>
			</div>

			<section className="mt-12 border-t border-ice-200/15 pt-10">
				<h2 className="font-display text-3xl text-ice-50">
					Where this started
				</h2>
				<div className="mt-5 space-y-5 text-base leading-relaxed text-ice-200/85">
					<p>
						This began with a Toronto dad who wanted his kids to learn in a fun,
						engaging way without all the usual baggage. No ads in the middle of
						a lesson. No games engineered for dopamine hits. No fretting about
						AI safety, surprise payments, or a “free trial” that turns into a
						checkout screen.
					</p>
					<p>
						He wanted something closer to a public good: free education made
						possible by charitable work, not by selling attention or student
						data. Sockeye is that bet. Build games kids actually want to play.
						Keep them private. Keep them free.
					</p>
					<p>Made for learners, not advertisers.</p>
				</div>
			</section>

			<section className="mt-12 border-t border-ice-200/15 pt-10">
				<h2 className="font-display text-3xl text-ice-50">Contact</h2>
				<p className="mt-3 text-base leading-relaxed text-ice-200/85">
					Parent or teacher with a question, a bug report, or feedback on a
					game? Send a note below — a real person reads every message.
				</p>
				<ContactForm />
			</section>
		</article>
	);
}
