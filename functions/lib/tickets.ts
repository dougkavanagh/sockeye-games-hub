import type { Env } from "./http";

/** Hub / unspecified gameId → core sockeye games hub repo. */
export const HUB_GITHUB_REPO = "dougkavanagh/sockeye-games-hub";

/** gameId (site.ts / OIDC client_id) → GitHub owner/repo. */
export const GAME_GITHUB_REPOS: Record<string, string> = {
	"final-quest": "dougkavanagh/final-quest",
	dryou: "dougkavanagh/dryou",
	immunitd: "dougkavanagh/immunitd",
	peptidy: "dougkavanagh/peptidy",
	"pizza-perfection": "dougkavanagh/pizza-perfection",
	"pharoahs-tomb": "dougkavanagh/pharoahs-tomb",
	"temple-of-the-morning-star": "dougkavanagh/temple-of-the-morning-star",
	"zombie-canyon": "dougkavanagh/zombie-canyon",
};

const DEFAULT_TRUSTED_EMAILS = ["dougkavanagh@gmail.com"];

export function trustedReporterEmails(env: Env): string[] {
	const fromEnv = (env.TRUSTED_REPORTER_EMAILS ?? "")
		.split(",")
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
	if (fromEnv.length > 0) return fromEnv;
	return DEFAULT_TRUSTED_EMAILS;
}

export function isTrustedReporter(env: Env, email: string): boolean {
	return trustedReporterEmails(env).includes(email.trim().toLowerCase());
}

/** Resolve which GitHub repo receives the issue. Unknown gameId → hub. */
export function githubRepoForGameId(gameId: string | null | undefined): string {
	const id = gameId?.trim() ?? "";
	if (!id || id === "hub") return HUB_GITHUB_REPO;
	return GAME_GITHUB_REPOS[id] ?? HUB_GITHUB_REPO;
}

export type CreatedIssue = {
	number: number;
	html_url: string;
};

export async function createGithubIssue(
	token: string,
	repo: string,
	input: { title: string; body: string; labels?: string[] },
): Promise<CreatedIssue> {
	const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
			"Content-Type": "application/json",
			"User-Agent": "sockeye-games-hub",
		},
		body: JSON.stringify({
			title: input.title,
			body: input.body,
			...(input.labels?.length ? { labels: input.labels } : {}),
		}),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`GitHub issue create failed (${res.status}): ${text}`);
	}

	const data = (await res.json()) as { number: number; html_url: string };
	return { number: data.number, html_url: data.html_url };
}
