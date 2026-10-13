export function PrivacyPage() {
	return (
		<article className="mx-auto max-w-3xl px-5 py-14">
			<h1 className="font-display text-4xl text-ice-50 sm:text-5xl">Privacy</h1>
			<p className="mt-3 text-ice-200/60">
				Plain language. Updated October 2026.
			</p>
			<div className="mt-8 space-y-8 text-base leading-relaxed text-ice-200/80">
				<section>
					<h2 className="mb-2 font-display text-2xl text-ice-50">
						The short version
					</h2>
					<ul className="list-disc space-y-2 pl-5">
						<li>No ads. No trackers for advertising. We do not sell data.</li>
						<li>
							Kids can play without an account. Progress stays on the device.
						</li>
						<li>
							Optional accounts are parent-owned (email magic link). Kids do not
							need an email address.
						</li>
						<li>
							We store the least we can: parent email, kid display names, and
							game save data you choose to sync.
						</li>
					</ul>
				</section>
				<section>
					<h2 className="mb-2 font-display text-2xl text-ice-50">
						What we collect
					</h2>
					<ul className="list-disc space-y-2 pl-5">
						<li>
							<strong className="text-ice-50">Parent email</strong>: only if you
							create an account, to send sign-in links.
						</li>
						<li>
							<strong className="text-ice-50">Kid profiles</strong>: display
							name and optional birth year / grade band you provide.
						</li>
						<li>
							<strong className="text-ice-50">Game progress</strong>: opaque
							save data for games you sync while signed in.
						</li>
					</ul>
				</section>
				<section>
					<h2 className="mb-2 font-display text-2xl text-ice-50">
						What we do not do
					</h2>
					<ul className="list-disc space-y-2 pl-5">
						<li>Sell or rent personal information</li>
						<li>Show behavioural advertising</li>
						<li>Require kids to create their own accounts</li>
						<li>Offer open chat with strangers</li>
					</ul>
				</section>
				<section>
					<h2 className="mb-2 font-display text-2xl text-ice-50">
						Your controls
					</h2>
					<p>
						You can sign out anytime. Delete the account from the Account page,
						or from Delete account inside a signed-in Sockeye game. That removes
						the email, kid profiles, synced saves, and leaderboard names.
						Progress that never left the device stays on the device. Games also
						let you report or hide a public ranking name.
					</p>
				</section>
				<section>
					<h2 className="mb-2 font-display text-2xl text-ice-50">
						Canada-first
					</h2>
					<p>
						We design with Canadian privacy expectations in mind (PIPEDA-minded
						minimal collection). School / classroom features, if added later,
						will use stricter defaults and clearer agreements.
					</p>
				</section>
			</div>
		</article>
	);
}
