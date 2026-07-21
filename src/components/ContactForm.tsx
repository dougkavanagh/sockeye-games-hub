import { type FormEvent, useEffect, useRef, useState } from "react";
import { sendContact } from "@/lib/api";

declare global {
	interface Window {
		turnstile?: {
			render: (
				container: HTMLElement,
				options: {
					sitekey: string;
					callback: (token: string) => void;
					"expired-callback"?: () => void;
					theme?: "light" | "dark";
				},
			) => string;
			reset: (widgetId?: string) => void;
		};
	}
}

const TURNSTILE_SCRIPT_SRC =
	"https://challenges.cloudflare.com/turnstile/v0/api.js";

function useTurnstile(onToken: (token: string) => void) {
	const containerRef = useRef<HTMLDivElement>(null);
	const widgetId = useRef<string | null>(null);
	const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

	useEffect(() => {
		if (!siteKey || !containerRef.current) return;

		const render = () => {
			if (!containerRef.current || !window.turnstile) return;
			widgetId.current = window.turnstile.render(containerRef.current, {
				sitekey: siteKey,
				theme: "dark",
				callback: onToken,
				"expired-callback": () => onToken(""),
			});
		};

		if (window.turnstile) {
			render();
			return;
		}

		const existing = document.querySelector(
			`script[src="${TURNSTILE_SCRIPT_SRC}"]`,
		);
		if (existing) {
			existing.addEventListener("load", render, { once: true });
			return;
		}

		const script = document.createElement("script");
		script.src = TURNSTILE_SCRIPT_SRC;
		script.async = true;
		script.defer = true;
		script.addEventListener("load", render, { once: true });
		document.head.appendChild(script);
	}, [onToken]);

	return { containerRef, hasSiteKey: Boolean(siteKey) };
}

export function ContactForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("");
	const [message, setMessage] = useState("");
	const [turnstileToken, setTurnstileToken] = useState("");
	const [busy, setBusy] = useState(false);
	const [status, setStatus] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const { containerRef, hasSiteKey } = useTurnstile(setTurnstileToken);

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setBusy(true);
		setError(null);
		setStatus(null);
		try {
			await sendContact({
				name,
				email,
				role: role || undefined,
				message,
				turnstileToken,
			});
			setStatus("Thanks — we read every message and will reply by email.");
			setName("");
			setEmail("");
			setRole("");
			setMessage("");
			setTurnstileToken("");
			if (window.turnstile) window.turnstile.reset();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setBusy(false);
		}
	};

	return (
		<form onSubmit={onSubmit} className="mt-6 space-y-4">
			<label className="block text-sm text-ice-200/80">
				Your name
				<input
					type="text"
					required
					maxLength={200}
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="mt-2 w-full rounded-lg border border-ice-200/15 bg-depth-900 px-3 py-2.5 text-ice-50 outline-none ring-sea-400/40 focus:ring-2"
					autoComplete="name"
				/>
			</label>
			<label className="block text-sm text-ice-200/80">
				Email
				<input
					type="email"
					required
					maxLength={200}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="mt-2 w-full rounded-lg border border-ice-200/15 bg-depth-900 px-3 py-2.5 text-ice-50 outline-none ring-sea-400/40 focus:ring-2"
					placeholder="you@example.com"
					autoComplete="email"
				/>
			</label>
			<label className="block text-sm text-ice-200/80">
				I am a... (optional)
				<input
					type="text"
					maxLength={60}
					value={role}
					onChange={(e) => setRole(e.target.value)}
					className="mt-2 w-full rounded-lg border border-ice-200/15 bg-depth-900 px-3 py-2.5 text-ice-50 outline-none ring-sea-400/40 focus:ring-2"
					placeholder="Parent, teacher, etc."
				/>
			</label>
			<label className="block text-sm text-ice-200/80">
				Message
				<textarea
					required
					maxLength={5000}
					rows={5}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className="mt-2 w-full resize-y rounded-lg border border-ice-200/15 bg-depth-900 px-3 py-2.5 text-ice-50 outline-none ring-sea-400/40 focus:ring-2"
				/>
			</label>

			{hasSiteKey && <div ref={containerRef} />}

			<button
				type="submit"
				disabled={busy || (hasSiteKey && !turnstileToken)}
				className="rounded-lg bg-salmon-500 px-5 py-2.5 text-sm font-semibold text-ice-50 transition hover:bg-salmon-400 disabled:opacity-60"
			>
				Send message
			</button>

			{error && (
				<p className="rounded-lg border border-salmon-500/40 bg-salmon-500/10 px-4 py-3 text-sm text-salmon-400">
					{error}
				</p>
			)}
			{status && (
				<p className="rounded-lg border border-ice-200/15 bg-ice-100/5 px-4 py-3 text-sm text-ice-100">
					{status}
				</p>
			)}
		</form>
	);
}
