import { getSession, json, nowIso } from "../../lib/http";
import type { PagesFn } from "../../lib/types";

type PutBody = {
	blob?: unknown;
};

export const onRequestGet: PagesFn = async (context) => {
	const { request, env, params } = context;
	const session = await getSession(env, request);
	if (!session) {
		return json(env, request, { error: "Unauthorized" }, { status: 401 });
	}
	if (!session.activeProfileId) {
		return json(
			env,
			request,
			{ error: "Select a kid profile first" },
			{ status: 400 },
		);
	}

	const gameId = String(params.gameId ?? "");
	if (!gameId || gameId.length > 64) {
		return json(env, request, { error: "Invalid gameId" }, { status: 400 });
	}

	const row = await env.DB.prepare(
		`SELECT blob, updated_at FROM game_progress
		 WHERE profile_id = ? AND game_id = ?`,
	)
		.bind(session.activeProfileId, gameId)
		.first<{ blob: string; updated_at: string }>();

	if (!row) {
		return json(env, request, { blob: null, updatedAt: null });
	}

	return json(env, request, {
		blob: JSON.parse(row.blob) as unknown,
		updatedAt: row.updated_at,
	});
};

export const onRequestPut: PagesFn = async (context) => {
	const { request, env, params } = context;
	const session = await getSession(env, request);
	if (!session) {
		return json(env, request, { error: "Unauthorized" }, { status: 401 });
	}
	if (!session.activeProfileId) {
		return json(
			env,
			request,
			{ error: "Select a kid profile first" },
			{ status: 400 },
		);
	}

	const gameId = String(params.gameId ?? "");
	if (!gameId || gameId.length > 64) {
		return json(env, request, { error: "Invalid gameId" }, { status: 400 });
	}

	let body: PutBody;
	try {
		body = (await request.json()) as PutBody;
	} catch {
		return json(env, request, { error: "Invalid JSON" }, { status: 400 });
	}

	if (body.blob === undefined) {
		return json(env, request, { error: "blob required" }, { status: 400 });
	}

	const serialized = JSON.stringify(body.blob);
	if (serialized.length > 500_000) {
		return json(env, request, { error: "blob too large" }, { status: 413 });
	}

	const updatedAt = nowIso();
	await env.DB.prepare(
		`INSERT INTO game_progress (profile_id, game_id, blob, updated_at)
		 VALUES (?, ?, ?, ?)
		 ON CONFLICT(profile_id, game_id) DO UPDATE SET
		   blob = excluded.blob,
		   updated_at = excluded.updated_at`,
	)
		.bind(session.activeProfileId, gameId, serialized, updatedAt)
		.run();

	return json(env, request, { ok: true, updatedAt });
};
