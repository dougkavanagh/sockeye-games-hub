import { type FormEvent, useEffect, useState } from "react";
import type { PageId } from "@/data/site";
import {
	createProfile,
	fetchMe,
	type KidProfile,
	logout,
	type MeResponse,
	selectProfile,
	sendMagicLink,
	verifyMagicLink,
} from "@/lib/api";
import { accountTokenFromUrl, oidcReturnFromUrl } from "@/lib/routing";

type Props = {
	onNavigate: (page: PageId) => void;
};

export function AccountPage({ onNavigate }: Props) {
	const [me, setMe] = useState<MeResponse | null>(null);
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [displayName, setDisplayName] = useState("");
	const [justSignedIn, setJustSignedIn] = useState(false);

	const refresh = async () => {
		const next = await fetchMe();
		setMe(next);
	};

	useEffect(() => {
		void fetchMe()
			.then(setMe)
			.catch((err: Error) => setError(err.message));
	}, []);

	useEffect(() => {
		const token = accountTokenFromUrl();
		if (!token) return;
		setBusy(true);
		verifyMagicLink(token)
			.then(async () => {
				const oidcReturn = oidcReturnFromUrl();
				if (oidcReturn) {
					// Complete the OIDC flow: redirect to authorize endpoint (now with session cookie set)
					window.location.href = `/api/oidc/authorize?${oidcReturn}`;
					return;
				}
				window.location.hash = "#/account";
				setStatus("Signed in.");
				setJustSignedIn(true);
				setMe(await fetchMe());
			})
			.catch((err: Error) => setError(err.message))
			.finally(() => setBusy(false));
	}, []);

	const onSend = async (e: FormEvent) => {
		e.preventDefault();
		setBusy(true);
		setError(null);
		setStatus(null);
		try {
			const oidcReturn = oidcReturnFromUrl();
			const res = await sendMagicLink(email, oidcReturn ?? undefined);
			if (res.devVerifyUrl) {
				setStatus(
					`Dev mode: magic link ready — open ${res.devVerifyUrl} (also logged on the server).`,
				);
			} else {
				setStatus("Check your email for a sign-in link.");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setBusy(false);
		}
	};

	const onLogout = async () => {
		setBusy(true);
		try {
			await logout();
			setMe({ authenticated: false });
			setStatus("Signed out.");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Logout failed");
		} finally {
			setBusy(false);
		}
	};

	const onCreateProfile = async (e: FormEvent) => {
		e.preventDefault();
		setBusy(true);
		setError(null);
		try {
			await createProfile({ displayName });
			setDisplayName("");
			await refresh();
			setStatus("Profile created.");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not create profile");
		} finally {
			setBusy(false);
		}
	};

	const onSelect = async (profile: KidProfile) => {
		setBusy(true);
		setError(null);
		try {
			await selectProfile(profile.id);
			await refresh();
			setStatus(`Playing as ${profile.displayName}.`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not select profile");
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="mx-auto max-w-lg px-5 py-14">
			<h1 className="font-display text-4xl text-ice-50 sm:text-5xl">Account</h1>
			<p className="mt-3 text-ice-200/75">
				Parent sign-in with a magic link. Optional: kids can keep playing
				offline with local saves.
			</p>

			{error && (
				<p className="mt-6 rounded-lg border border-salmon-500/40 bg-salmon-500/10 px-4 py-3 text-sm text-salmon-400">
					{error}
				</p>
			)}
			{status && (
				<p className="mt-6 rounded-lg border border-ice-200/15 bg-ice-100/5 px-4 py-3 text-sm text-ice-100">
					{status}
				</p>
			)}

			{!me && <p className="mt-8 text-sm text-ice-200/50">Loading session…</p>}

			{me && !me.authenticated && (
				<form onSubmit={onSend} className="mt-8 space-y-4">
					<label className="block text-sm text-ice-200/80">
						Parent email
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="mt-2 w-full rounded-lg border border-ice-200/15 bg-depth-900 px-3 py-2.5 text-ice-50 outline-none ring-sea-400/40 focus:ring-2"
							placeholder="you@example.com"
							autoComplete="email"
						/>
					</label>
					<button
						type="submit"
						disabled={busy}
						className="rounded-lg bg-salmon-500 px-5 py-2.5 text-sm font-semibold text-ice-50 transition hover:bg-salmon-400 disabled:opacity-60"
					>
						Email me a sign-in link
					</button>
				</form>
			)}

			{me?.authenticated && justSignedIn && (
				<div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sea-400/30 bg-sea-400/10 p-5">
					<p className="text-ice-50">You&apos;re signed in — ready to play?</p>
					<button
						type="button"
						onClick={() => onNavigate("games")}
						className="shrink-0 rounded-lg bg-salmon-500 px-5 py-2.5 text-sm font-semibold text-ice-50 transition hover:bg-salmon-400"
					>
						Play now
					</button>
				</div>
			)}

			{me?.authenticated && (
				<div className="mt-8 space-y-8">
					<div className="rounded-2xl border border-ice-200/10 bg-depth-900/70 p-5">
						<p className="text-xs uppercase tracking-[0.14em] text-ice-200/45">
							Signed in as
						</p>
						<p className="mt-1 text-ice-50">{me.email}</p>
						<div className="mt-4 flex items-center gap-4">
							<button
								type="button"
								onClick={() => onNavigate("games")}
								className="text-sm font-semibold text-sea-300 hover:text-sea-200"
							>
								Play games
							</button>
							<button
								type="button"
								onClick={onLogout}
								disabled={busy}
								className="text-sm text-ice-200/60 hover:text-ice-50"
							>
								Sign out
							</button>
						</div>
					</div>

					<section>
						<h2 className="font-display text-2xl text-ice-50">Kid profiles</h2>
						<p className="mt-1 text-sm text-ice-200/60">
							Active profile is used when games sync progress.
						</p>
						<ul className="mt-4 space-y-2">
							{me.profiles.map((profile) => {
								const active = me.activeProfileId === profile.id;
								return (
									<li key={profile.id}>
										<button
											type="button"
											onClick={() => onSelect(profile)}
											disabled={busy}
											className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
												active
													? "border-sea-400/50 bg-sea-400/10"
													: "border-ice-200/10 bg-depth-900/50 hover:border-ice-200/25"
											}`}
										>
											<span className="text-ice-50">{profile.displayName}</span>
											{active && (
												<span className="text-xs font-semibold uppercase tracking-wider text-sea-300">
													Active
												</span>
											)}
										</button>
									</li>
								);
							})}
							{me.profiles.length === 0 && (
								<p className="text-sm text-ice-200/50">No profiles yet.</p>
							)}
						</ul>

						<form onSubmit={onCreateProfile} className="mt-4 flex gap-2">
							<input
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								required
								maxLength={40}
								placeholder="Display name"
								className="min-w-0 flex-1 rounded-lg border border-ice-200/15 bg-depth-900 px-3 py-2.5 text-ice-50 outline-none ring-sea-400/40 focus:ring-2"
							/>
							<button
								type="submit"
								disabled={busy}
								className="shrink-0 rounded-lg border border-ice-200/20 px-4 py-2.5 text-sm font-medium text-ice-100 hover:bg-ice-100/5 disabled:opacity-60"
							>
								Add
							</button>
						</form>
					</section>
				</div>
			)}
		</div>
	);
}
