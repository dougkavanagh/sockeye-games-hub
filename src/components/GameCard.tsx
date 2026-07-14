import type { GameListing } from "@/data/site";

type Props = {
	game: GameListing;
};

export function GameCard({ game }: Props) {
	const inner = (
		<>
			<div className="mb-3 flex items-center justify-between gap-3">
				<h3 className="font-display text-2xl text-ice-50">{game.title}</h3>
				<span
					className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
						game.status === "live"
							? "bg-salmon-500/20 text-salmon-400"
							: "bg-ice-100/10 text-ice-200/70"
					}`}
				>
					{game.status === "live" ? "Play free" : "Soon"}
				</span>
			</div>
			<p className="mb-4 text-sm leading-relaxed text-ice-200/75">
				{game.tagline}
			</p>
			<p className="text-xs uppercase tracking-[0.14em] text-ice-200/45">
				{game.skills}
			</p>
		</>
	);

	const className =
		"block rounded-2xl border border-ice-200/10 bg-depth-900/70 p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition hover:border-salmon-500/35 hover:bg-depth-800/80";

	if (game.href && game.status === "live") {
		return (
			<a
				href={game.href}
				target="_blank"
				rel="noreferrer"
				className={className}
			>
				{inner}
			</a>
		);
	}

	return <div className={`${className} opacity-80`}>{inner}</div>;
}
