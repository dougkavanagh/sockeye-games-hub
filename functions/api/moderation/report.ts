/**
 * POST /api/moderation/report — Apple 1.2 UGC flag.
 *
 * Auth is optional so a signed-out player who can see a leaderboard can
 * still report a name. Signed-in reports keep the user id for follow-up.
 */
import { resolveAuth } from "../../lib/auth";
import { json, newId } from "../../lib/http";
import type { PagesFn } from "../../lib/types";

type Body = {
	gameId?: unknown;
	scenarioId?: unknown;
	publicName?: unknown;
	reason?: unknown;
};

function clip(value: unknown, max: number): string | null {
	if (typeof value !== "string") return null;
	const trimmed = value.replace(/\s+/gu, " ").trim();
	if (!trimmed) return null;
	return trimmed.slice(0, max);
}

export const onRequestPost: PagesFn = async (context) => {
	const { request, env } = context;
	let body: Body;
	try {
		body = (await request.json()) as Body;
	} catch {
		return json(env, request, { error: "Invalid JSON" }, { status: 400 });
	}

	const publicName = clip(body.publicName, 40);
	const gameId = clip(body.gameId, 64) ?? "unknown";
	const scenarioId = clip(body.scenarioId, 64);
	const reason = clip(body.reason, 280) ?? "inappropriate";
	if (!publicName) {
		return json(
			env,
			request,
			{ error: "publicName required" },
			{ status: 400 },
		);
	}

	const auth = await resolveAuth(env, request);

	await env.DB.prepare(
		`INSERT INTO content_report (id, reporter_user_id, game_id, scenario_id, public_name, reason)
		 VALUES (?, ?, ?, ?, ?, ?)`,
	)
		.bind(newId(), auth?.userId ?? null, gameId, scenarioId, publicName, reason)
		.run();

	let emailed = false;
	if (env.RESEND_API_KEY && env.CONTACT_TO_EMAIL) {
		const from = env.MAGIC_LINK_FROM ?? "Sockeye Games <onboarding@resend.dev>";
		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.RESEND_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from,
				to: [env.CONTACT_TO_EMAIL],
				subject: `UGC report: ${publicName} (${gameId})`,
				text: `Name: ${publicName}\nGame: ${gameId}\nScenario: ${scenarioId ?? "n/a"}\nReason: ${reason}\nReporter: ${auth?.email ?? "signed out"}`,
			}),
		});
		emailed = res.ok;
		if (!res.ok) {
			console.error("Resend failed", await res.text());
		}
	}

	return json(env, request, { ok: true, emailed });
};

export const onRequestOptions: PagesFn = async (context) => {
	const { request, env } = context;
	return json(env, request, null, { status: 204 });
};
