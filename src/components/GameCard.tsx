import type { GameListing } from "@/data/site";

type Props = {
	game: GameListing;
	/** Skip lazy-loading for the banners that sit at the top of a listing. */
	priority?: boolean;
};

export function GameCard({ game, priority = false }: Props) {
	const inner = (
		<>
			<div className="relative aspect-[1200/520] overflow-hidden bg-depth-800">
				{game.header ? (
					<img
						src={game.header}
						alt=""
						loading={priority ? "eager" : "lazy"}
						decoding="async"
						className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
					/>
				) : (
					<div
						aria-hidden
						className="h-full w-full bg-[radial-gradient(ellipse_at_30%_20%,rgba(46,184,198,0.35),transparent_55%),linear-gradient(160deg,#0f4d59,#072a32)]"
					/>
				)}
				<div
					aria-hidden
					className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-depth-950 via-depth-950/80 to-transparent"
				/>
				<span
					className={`absolute right-3 top-3 rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm ${
						game.status === "live"
							? "bg-kelp-600/80 text-ice-50"
							: "bg-depth-950/70 text-ice-200/80"
					}`}
				>
					{game.status === "live" ? "Play free" : "Soon"}
				</span>
				<h3 className="absolute inset-x-0 bottom-0 px-6 pb-4 font-display text-2xl leading-tight text-ice-50 drop-shadow-[0_2px_10px_rgba(7,42,50,0.9)]">
					{game.title}
				</h3>
			</div>
			<div className="px-6 pb-6 pt-4">
				<p className="mb-4 text-sm leading-relaxed text-ice-200/75">
					{game.tagline}
				</p>
				<p className="text-xs uppercase tracking-[0.14em] text-ice-200/45">
					{game.skills}
				</p>
			</div>
		</>
	);

	const className =
		"group block overflow-hidden rounded-2xl border border-ice-200/15 bg-depth-900/80 text-left shadow-[0_16px_40px_rgba(7,42,50,0.35)] transition hover:border-sea-300/50 hover:bg-depth-800";

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
