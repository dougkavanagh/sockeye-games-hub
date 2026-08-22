import { GameCard } from "@/components/GameCard";
import type { PageId } from "@/data/site";
import { GAMES, PILLARS } from "@/data/site";

type Props = {
	onNavigate: (page: PageId) => void;
};

export function HomePage({ onNavigate }: Props) {
	return (
		<div>
			<section className="relative overflow-hidden px-5 pb-20 pt-14 sm:pb-24 sm:pt-20">
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(46,184,198,0.45),transparent_50%),radial-gradient(ellipse_at_85%_15%,rgba(241,90,58,0.28),transparent_45%),radial-gradient(ellipse_at_50%_100%,rgba(47,154,110,0.2),transparent_40%),linear-gradient(180deg,#0f4d59_0%,#072a32_70%)]"
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 overflow-hidden"
				>
					<img
						src="/images/hero.png"
						alt=""
						className="h-full w-full scale-105 object-cover object-[center_40%] opacity-55 saturate-[1.15] brightness-105 animate-hero-drift"
					/>
				</div>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 bg-gradient-to-b from-depth-950/20 via-depth-950/45 to-depth-950 animate-fog-pulse"
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute -left-16 top-20 h-80 w-80 rounded-full bg-sea-400/25 blur-3xl"
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute -right-10 bottom-4 h-64 w-64 rounded-full bg-salmon-400/20 blur-3xl"
				/>
				<div className="relative mx-auto max-w-5xl">
					<h1 className="max-w-3xl font-display text-5xl leading-[1.05] text-ice-50 sm:text-6xl md:text-7xl">
						Sockeye Games
					</h1>
					<p className="mt-5 max-w-xl text-lg leading-relaxed text-ice-100/90">
						Free learning games for kids. Private, safe, and actually fun. Play
						without the upsell.
					</p>
					<div className="mt-8 flex flex-wrap gap-3">
						<button
							type="button"
							onClick={() => onNavigate("games")}
							className="animate-cta-glow rounded-xl bg-salmon-500 px-5 py-2.5 text-sm font-bold text-ice-50 transition hover:bg-salmon-400"
						>
							Play free
						</button>
						<button
							type="button"
							onClick={() => onNavigate("privacy")}
							className="rounded-xl border border-ice-100/30 bg-depth-900/40 px-5 py-2.5 text-sm font-semibold text-ice-50 transition hover:border-sea-300/60 hover:bg-sea-400/15"
						>
							Our privacy promise
						</button>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-5xl px-5 pb-16">
				<div className="mb-6 flex items-end justify-between gap-4">
					<h2 className="font-display text-3xl text-ice-50">Games</h2>
					<button
						type="button"
						onClick={() => onNavigate("games")}
						className="text-sm font-semibold text-ice-200/70 transition hover:text-ice-50"
					>
						View all
					</button>
				</div>
				<div className="grid gap-4 md:grid-cols-2">
					{GAMES.map((game, index) => (
						<GameCard key={game.id} game={game} priority={index < 2} />
					))}
				</div>
			</section>

			<section className="border-t border-ice-200/15 bg-depth-900/60 px-5 py-16">
				<div className="mx-auto max-w-5xl">
					<h2 className="mb-8 font-display text-3xl text-ice-50">
						Built for trust
					</h2>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{PILLARS.map((pillar) => (
							<div key={pillar.title}>
								<h3 className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-sea-300">
									{pillar.title}
								</h3>
								<p className="text-sm leading-relaxed text-ice-200/80">
									{pillar.body}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="border-t border-ice-200/15 px-5 py-10">
				<p className="mx-auto flex max-w-5xl items-center justify-center gap-2 text-sm text-ice-200/55">
					<span aria-hidden className="text-base leading-none">
						🇨🇦
					</span>
					<span>Made for Canadians</span>
				</p>
			</section>

			<section className="border-t border-ice-200/15 px-5 py-16">
				<div className="mx-auto max-w-3xl">
					<h2 className="font-display text-3xl text-ice-50">
						Inspired by a Toronto dad
					</h2>
					<p className="mt-5 text-base leading-relaxed text-ice-200/85">
						Sockeye started with a simple wish: kids should be able to learn in
						a fun, engaging way without parents worrying about ads, dopamine
						loops, AI safety, payments, or free trials. Free education, rooted
						in charitable work, not another product funnel.
					</p>
					<button
						type="button"
						onClick={() => onNavigate("about")}
						className="mt-6 text-sm font-semibold text-sea-300 transition hover:text-ice-50"
					>
						Read the fuller story
					</button>
				</div>
			</section>
		</div>
	);
}
