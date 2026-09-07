import { type FormEvent, useState } from "react";
import { GAMES } from "@/data/site";
import { submitTicket } from "@/lib/api";

type Props = {
	disabled?: boolean;
};

export function TicketForm({ disabled }: Props) {
	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");
	const [gameId, setGameId] = useState("hub");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [resultUrl, setResultUrl] = useState<string | null>(null);
	const [devNote, setDevNote] = useState<string | null>(null);

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setBusy(true);
		setError(null);
		setResultUrl(null);
		setDevNote(null);
		try {
			const res = await submitTicket({
				title,
				body,
				gameId: gameId === "hub" ? null : gameId,
				context: `hub page=${window.location.href}\nua=${navigator.userAgent}`,
			});
			setTitle("");
			setBody("");
			if (res.url) setResultUrl(res.url);
			if (res.devNote) setDevNote(res.devNote);
			else if (!res.url) setDevNote("Saved locally; no GitHub URL returned.");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not file ticket");
		} finally {
			setBusy(false);
		}
	};

	return (
		<section>
			<h2 className="font-display text-2xl text-ice-50">File a ticket</h2>
			<p className="mt-1 text-sm text-ice-200/60">
				Opens a GitHub issue on the hub or the selected game repo. Trusted
				reporters only.
			</p>

			{error && (
				<p className="mt-4 rounded-lg border border-salmon-500/40 bg-salmon-500/10 px-4 py-3 text-sm text-salmon-400">
					{error}
				</p>
			)}
			{resultUrl && (
				<p className="mt-4 rounded-lg border border-sea-400/30 bg-sea-400/10 px-4 py-3 text-sm text-ice-100">
					Issue created:{" "}
					<a
						href={resultUrl}
						target="_blank"
						rel="noreferrer"
						className="font-semibold text-sea-300 hover:text-sea-200"
					>
						{resultUrl}
					</a>
				</p>
			)}
			{devNote && !resultUrl && (
				<p className="mt-4 rounded-lg border border-ice-200/15 bg-ice-100/5 px-4 py-3 text-sm text-ice-100">
					{devNote}
				</p>
			)}

			<form onSubmit={onSubmit} className="mt-4 space-y-4">
				<label className="block text-sm text-ice-200/80">
					Repo
					<select
						value={gameId}
						onChange={(e) => setGameId(e.target.value)}
						disabled={busy || disabled}
						className="mt-2 w-full rounded-lg border border-ice-200/15 bg-depth-900 px-3 py-2.5 text-ice-50 outline-none ring-sea-400/40 focus:ring-2"
					>
						<option value="hub">Hub (sockeye-games-hub)</option>
						{GAMES.map((game) => (
							<option key={game.id} value={game.id}>
								{game.title}
							</option>
						))}
					</select>
				</label>
				<label className="block text-sm text-ice-200/80">
					Title
					<input
						required
						maxLength={200}
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						disabled={busy || disabled}
						className="mt-2 w-full rounded-lg border border-ice-200/15 bg-depth-900 px-3 py-2.5 text-ice-50 outline-none ring-sea-400/40 focus:ring-2"
						placeholder="Short summary"
					/>
				</label>
				<label className="block text-sm text-ice-200/80">
					Details
					<textarea
						required
						maxLength={20_000}
						rows={6}
						value={body}
						onChange={(e) => setBody(e.target.value)}
						disabled={busy || disabled}
						className="mt-2 w-full rounded-lg border border-ice-200/15 bg-depth-900 px-3 py-2.5 text-ice-50 outline-none ring-sea-400/40 focus:ring-2"
						placeholder="What happened, steps to reproduce, expected vs actual…"
					/>
				</label>
				<button
					type="submit"
					disabled={busy || disabled}
					className="rounded-lg bg-salmon-500 px-5 py-2.5 text-sm font-semibold text-ice-50 transition hover:bg-salmon-400 disabled:opacity-60"
				>
					{busy ? "Filing…" : "Create GitHub issue"}
				</button>
			</form>
		</section>
	);
}
