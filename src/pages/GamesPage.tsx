import { GameCard } from "@/components/GameCard";
import { GAMES } from "@/data/site";

export function GamesPage() {
	return (
		<div className="mx-auto max-w-5xl px-5 py-14">
			<h1 className="font-display text-4xl text-ice-50 sm:text-5xl">Games</h1>
			<p className="mt-3 max-w-2xl text-ice-200/75">
				Independent titles under one roof. Each game is its own project — open
				it, play it, optionally sync progress with a parent account.
			</p>
			<div className="mt-10 grid gap-4 md:grid-cols-2">
				{GAMES.map((game) => (
					<GameCard key={game.id} game={game} />
				))}
			</div>
		</div>
	);
}
