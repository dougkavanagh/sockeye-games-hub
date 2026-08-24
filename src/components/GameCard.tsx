import type React from "react";
import type { GameListing } from "@/data/site";

type Props = {
	game: GameListing;
};

const STATUS_LABEL = {
	live: "Play free",
	preview: "Early preview",
	soon: "Soon",
} as const;

const STATUS_CLASS = {
	live: "bg-kelp-500/25 text-sea-300",
	preview: "bg-salmon-300/20 text-salmon-300",
	soon: "bg-ice-100/10 text-ice-200/70",
} as const;

export function GameCard({ game }: Props) {
	const inner = (
		<>
			<div className="relative aspect-[2/1] overflow-hidden bg-depth-950">
				<img
					src={game.art}
					alt=""
					loading="lazy"
					className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 bg-gradient-to-t from-depth-900 via-depth-900/35 to-transparent"
				/>
				<div
					aria-hidden
					style={{ backgroundColor: game.accent }}
					className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-50"
				/>
				<div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
					<h3 className="font-display text-2xl leading-tight text-ice-50 drop-shadow-[0_2px_8px_rgba(7,42,50,0.9)]">
						{game.title}
					</h3>
					<span
						className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm ${STATUS_CLASS[game.status]}`}
					>
						{STATUS_LABEL[game.status]}
					</span>
				</div>
			</div>
			<div className="p-6 pt-4">
				<p className="mb-4 text-sm leading-relaxed text-ice-200/75">
					{game.tagline}
				</p>
				<p
					style={{ color: game.accent }}
					className="text-xs uppercase tracking-[0.14em] opacity-70"
				>
					{game.skills}
				</p>
			</div>
		</>
	);

	const className =
		"group block overflow-hidden rounded-2xl border border-ice-200/15 bg-depth-900/80 text-left shadow-[0_16px_40px_rgba(7,42,50,0.35)] transition duration-300 hover:bg-depth-800 hover:[border-color:var(--accent)] hover:[box-shadow:0_18px_46px_var(--accent-glow)]";

	// Tint the card's hover state with the accent sampled from its own art.
	const accentVars = {
		"--accent": `${game.accent}80`,
		"--accent-glow": `${game.accent}40`,
	} as React.CSSProperties;

	if (game.href && (game.status === "live" || game.status === "preview")) {
		return (
			<a
				href={game.href}
				target="_blank"
				rel="noreferrer"
				style={accentVars}
				className={className}
			>
				{inner}
			</a>
		);
	}

	return (
		<div style={accentVars} className={`${className} opacity-80`}>
			{inner}
		</div>
	);
}
