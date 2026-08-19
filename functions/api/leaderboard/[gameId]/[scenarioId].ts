import { getSession, json, newId, nowIso } from "../../../lib/http";
import type { PagesFn } from "../../../lib/types";

const MAX_ENTRIES = 100;

type PostBody = {
	personaId?: unknown;
	stars?: unknown;
	points?: unknown;
	misery?: unknown;
	days?: unknown;
	physicianMode?: unknown;
};

function deriveDisplayName(email: string): string {
	const local = email.split("@")[0] ?? email;
	return local.slice(0, 20);
}

export const onRequestGet: PagesFn = async (context) => {
	const { request, env, params } = context;
	const gameId = String(params.gameId ?? "");
	const scenarioId = String(params.scenarioId ?? "");
	if (!gameId || gameId.length > 64 || !scenarioId || scenarioId.length > 64) {
		return json(env, request, { error: "Invalid params" }, { status: 400 });
	}

	const url = new URL(request.url);
	const physicianMode = url.searchParams.get("physicianMode") === "1" ? 1 : 0;

	const rows = await env.DB.prepare(
		`SELECT display_name, persona_id, stars, points, misery, days, physician_mode, set_at
		 FROM leaderboard
		 WHERE game_id = ? AND scenario_id = ? AND physician_mode = ?
		 ORDER BY stars DESC, points DESC, days ASC
		 LIMIT ?`,
	)
		.bind(gameId, scenarioId, physicianMode, MAX_ENTRIES)
		.all<{
			display_name: string;
			persona_id: string;
			stars: number;
			points: number;
			misery: number;
			days: number;
			physician_mode: number;
			set_at: string;
		}>();

	const entries = (rows.results ?? []).map((r, i) => ({
		rank: i + 1,
		name: r.display_name,
		personaId: r.persona_id,
		stars: r.stars,
		points: r.points,
		misery: r.misery,
		days: r.days,
		physicianMode: r.physician_mode === 1,
		setAt: r.set_at,
	}));

	return json(env, request, { gameId, scenarioId, physicianMode: physicianMode === 1, entries });
};

export const onRequestPost: PagesFn = async (context) => {
	const { request, env, params } = context;
	const session = await getSession(env, request);
	if (!session) {
		return json(env, request, { error: "Unauthorized" }, { status: 401 });
	}

	const gameId = String(params.gameId ?? "");
	const scenarioId = String(params.scenarioId ?? "");
	if (!gameId || gameId.length > 64 || !scenarioId || scenarioId.length > 64) {
		return json(env, request, { error: "Invalid params" }, { status: 400 });
	}

	let body: PostBody;
	try {
		body = (await request.json()) as PostBody;
	} catch {
		return json(env, request, { error: "Invalid JSON" }, { status: 400 });
	}

	const personaId = typeof body.personaId === "string" ? body.personaId.slice(0, 32) : null;
	const stars = typeof body.stars === "number" ? Math.round(body.stars) : null;
	const points = typeof body.points === "number" ? Math.round(body.points) : null;
	const misery = typeof body.misery === "number" ? body.misery : null;
	const days = typeof body.days === "number" ? body.days : null;
	const physicianMode = body.physicianMode === true ? 1 : 0;

	if (!personaId || stars === null || points === null || misery === null || days === null) {
		return json(env, request, { error: "Missing required fields" }, { status: 400 });
	}
	if (stars < 0 || stars > 5 || points < 0 || points > 100 || days < 0) {
		return json(env, request, { error: "Invalid score values" }, { status: 400 });
	}

	const displayName = deriveDisplayName(session.email);
	const setAt = nowIso();
	const id = newId();

	// Upsert: keep the better score (higher stars → higher points → fewer days).
	await env.DB.prepare(
		`INSERT INTO leaderboard (id, game_id, scenario_id, user_id, display_name, persona_id, stars, points, misery, days, physician_mode, set_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		 ON CONFLICT(game_id, scenario_id, user_id, persona_id, physician_mode) DO UPDATE SET
		   id = excluded.id,
		   display_name = excluded.display_name,
		   stars = excluded.stars,
		   points = excluded.points,
		   misery = excluded.misery,
		   days = excluded.days,
		   set_at = excluded.set_at
		 WHERE
		   excluded.stars > leaderboard.stars OR
		   (excluded.stars = leaderboard.stars AND excluded.points > leaderboard.points) OR
		   (excluded.stars = leaderboard.stars AND excluded.points = leaderboard.points AND excluded.days < leaderboard.days)`,
	)
		.bind(id, gameId, scenarioId, session.userId, displayName, personaId, stars, points, misery, days, physicianMode, setAt)
		.run();

	return json(env, request, { ok: true });
};

export const onRequestOptions: PagesFn = async (context) => {
	const { request, env } = context;
	return json(env, request, null, { status: 204 });
};
