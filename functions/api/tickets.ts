import { resolveAuth } from "../lib/auth";
import { json, newId } from "../lib/http";
import {
	createGithubIssue,
	GAME_GITHUB_REPOS,
	githubRepoForGameId,
	HUB_GITHUB_REPO,
	isTrustedReporter,
} from "../lib/tickets";
import type { PagesFn } from "../lib/types";

type PostBody = {
	title?: string;
	body?: string;
	gameId?: string | null;
	context?: string;
};

/** GET — eligibility + repo map for hub/game UIs. */
export const onRequestGet: PagesFn = async (context) => {
	const { request, env } = context;
	const auth = await resolveAuth(env, request);
	if (!auth) {
		return json(env, request, { error: "Unauthorized" }, { status: 401 });
	}

	const canFileTickets = isTrustedReporter(env, auth.email);
	return json(env, request, {
		canFileTickets,
		defaultRepo: HUB_GITHUB_REPO,
		repos: {
			hub: HUB_GITHUB_REPO,
			...GAME_GITHUB_REPOS,
		},
	});
};

/** POST — create a GitHub issue in the mapped repo (trusted reporters only). */
export const onRequestPost: PagesFn = async (context) => {
	const { request, env } = context;
	const auth = await resolveAuth(env, request);
	if (!auth) {
		return json(env, request, { error: "Unauthorized" }, { status: 401 });
	}
	if (!isTrustedReporter(env, auth.email)) {
		return json(env, request, { error: "Forbidden" }, { status: 403 });
	}

	let body: PostBody;
	try {
		body = (await request.json()) as PostBody;
	} catch {
		return json(env, request, { error: "Invalid JSON" }, { status: 400 });
	}

	const title = body.title?.trim().slice(0, 200);
	const description = body.body?.trim().slice(0, 20_000);
	const gameIdRaw = body.gameId?.trim().slice(0, 64) || null;
	const gameId = gameIdRaw === "hub" ? null : gameIdRaw;
	const contextNote = body.context?.trim().slice(0, 2000) || null;

	if (!title || !description) {
		return json(
			env,
			request,
			{ error: "Title and body are required" },
			{ status: 400 },
		);
	}

	const repo = githubRepoForGameId(gameId);
	const issueBody = [
		description,
		"",
		"---",
		`Submitted via Sockeye hub by \`${auth.email}\` (\`user_id=${auth.userId}\`).`,
		gameId ? `Game id: \`${gameId}\`` : "Target: hub",
		contextNote ? `Context:\n\`\`\`\n${contextNote}\n\`\`\`` : null,
	]
		.filter((line) => line !== null)
		.join("\n");

	const id = newId();
	let githubNumber: number | null = null;
	let githubUrl: string | null = null;

	if (env.GITHUB_TOKEN) {
		try {
			const issue = await createGithubIssue(env.GITHUB_TOKEN, repo, {
				title,
				body: issueBody,
			});
			githubNumber = issue.number;
			githubUrl = issue.html_url;
		} catch (err) {
			console.error("GitHub ticket failed", err);
			return json(
				env,
				request,
				{ error: "Could not create GitHub issue" },
				{ status: 502 },
			);
		}
	}

	await env.DB.prepare(
		`INSERT INTO ticket_request
		 (id, user_id, email, game_id, repo, title, body, github_number, github_url)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	)
		.bind(
			id,
			auth.userId,
			auth.email,
			gameId,
			repo,
			title,
			description,
			githubNumber,
			githubUrl,
		)
		.run();

	if (!env.GITHUB_TOKEN) {
		return json(env, request, {
			ok: true,
			stored: true,
			repo,
			number: null,
			url: null,
			devNote: "GITHUB_TOKEN not set; request saved to D1 only",
		});
	}

	return json(env, request, {
		ok: true,
		stored: true,
		repo,
		number: githubNumber,
		url: githubUrl,
	});
};
