import { GameCard } from "@/components/GameCard";
import type { PageId } from "@/data/site";
import { GAMES, PILLARS } from "@/data/site";

type Props = {
	onNavigate: (page: PageId) => void;
};

export function HomePage({ onNavigate }: Props) {
	return (
		<div>
			<section className="relative overflow-hidden px-5 pb-16 pt-14 sm:pt-20">
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(232,93,58,0.22),transparent_55%),radial-gradient(ellipse_at_80%_20%,rgba(184,220,227,0.12),transparent_50%),linear-gradient(180deg,#0a242e_0%,#06161c_70%)]"
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute -left-16 top-24 h-64 w-64 rounded-full bg-salmon-500/10 blur-3xl"
				/>
				<div className="relative mx-auto max-w-5xl">
					<p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-salmon-400">
						Canadian educational games
					</p>
					<h1 className="max-w-3xl font-display text-5xl leading-[1.05] text-ice-50 sm:text-6xl md:text-7xl">
						Sockeye Games
					</h1>
					<p className="mt-5 max-w-xl text-lg leading-relaxed text-ice-200/80">
						Free fantasy learning games for students — private, safe, and
						actually fun. Like the adventure kids love, without the upsell.
					</p>
					<div className="mt-8 flex flex-wrap gap-3">
						<button
							type="button"
							onClick={() => onNavigate("games")}
							className="rounded-lg bg-salmon-500 px-5 py-2.5 text-sm font-semibold text-depth-950 transition hover:bg-salmon-400"
						>
							Play free
						</button>
						<button
							type="button"
							onClick={() => onNavigate("privacy")}
							className="rounded-lg border border-ice-200/20 px-5 py-2.5 text-sm font-medium text-ice-100 transition hover:border-ice-200/40 hover:bg-ice-100/5"
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
						className="text-sm text-ice-200/60 hover:text-ice-50"
					>
						View all
					</button>
				</div>
				<div className="grid gap-4 md:grid-cols-2">
					{GAMES.map((game) => (
						<GameCard key={game.id} game={game} />
					))}
				</div>
			</section>

			<section className="border-t border-ice-200/10 bg-depth-900/40 px-5 py-16">
				<div className="mx-auto max-w-5xl">
					<h2 className="mb-8 font-display text-3xl text-ice-50">
						Built for trust
					</h2>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{PILLARS.map((pillar) => (
							<div key={pillar.title}>
								<h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-salmon-400">
									{pillar.title}
								</h3>
								<p className="text-sm leading-relaxed text-ice-200/70">
									{pillar.body}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
