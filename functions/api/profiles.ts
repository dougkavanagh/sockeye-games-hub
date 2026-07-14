import { getSession, json, newId } from "../lib/http";
import type { PagesFn } from "../lib/types";

type CreateBody = {
	displayName?: string;
	birthYear?: number | null;
	gradeBand?: string | null;
};

type SelectBody = {
	profileId?: string;
};

export const onRequestGet: PagesFn = async (context) => {
	const { request, env } = context;
	const session = await getSession(env, request);
	if (!session) {
		return json(env, request, { error: "Unauthorized" }, { status: 401 });
	}

	const profiles = await env.DB.prepare(
		`SELECT id, display_name, birth_year, grade_band, created_at
		 FROM kid_profile WHERE user_id = ? ORDER BY created_at ASC`,
	)
		.bind(session.userId)
		.all<{
			id: string;
			display_name: string;
			birth_year: number | null;
			grade_band: string | null;
			created_at: string;
		}>();

	return json(env, request, {
		activeProfileId: session.activeProfileId,
		profiles: (profiles.results ?? []).map((p) => ({
			id: p.id,
			displayName: p.display_name,
			birthYear: p.birth_year,
			gradeBand: p.grade_band,
			createdAt: p.created_at,
		})),
	});
};

export const onRequestPost: PagesFn = async (context) => {
	const { request, env } = context;
	const session = await getSession(env, request);
	if (!session) {
		return json(env, request, { error: "Unauthorized" }, { status: 401 });
	}

	let body: CreateBody;
	try {
		body = (await request.json()) as CreateBody;
	} catch {
		return json(env, request, { error: "Invalid JSON" }, { status: 400 });
	}

	const displayName = body.displayName?.trim();
	if (!displayName || displayName.length > 40) {
		return json(
			env,
			request,
			{ error: "displayName required (max 40 chars)" },
			{ status: 400 },
		);
	}

	const id = newId();
	await env.DB.prepare(
		`INSERT INTO kid_profile (id, user_id, display_name, birth_year, grade_band)
		 VALUES (?, ?, ?, ?, ?)`,
	)
		.bind(
			id,
			session.userId,
			displayName,
			body.birthYear ?? null,
			body.gradeBand ?? null,
		)
		.run();

	if (!session.activeProfileId) {
		await env.DB.prepare(
			`UPDATE session SET active_profile_id = ? WHERE id = ?`,
		)
			.bind(id, session.sessionId)
			.run();
	}

	return json(env, request, {
		id,
		displayName,
		birthYear: body.birthYear ?? null,
		gradeBand: body.gradeBand ?? null,
	});
};

export const onRequestPut: PagesFn = async (context) => {
	const { request, env } = context;
	const session = await getSession(env, request);
	if (!session) {
		return json(env, request, { error: "Unauthorized" }, { status: 401 });
	}

	let body: SelectBody;
	try {
		body = (await request.json()) as SelectBody;
	} catch {
		return json(env, request, { error: "Invalid JSON" }, { status: 400 });
	}

	const profileId = body.profileId?.trim();
	if (!profileId) {
		return json(env, request, { error: "profileId required" }, { status: 400 });
	}

	const profile = await env.DB.prepare(
		`SELECT id FROM kid_profile WHERE id = ? AND user_id = ?`,
	)
		.bind(profileId, session.userId)
		.first<{ id: string }>();

	if (!profile) {
		return json(env, request, { error: "Profile not found" }, { status: 404 });
	}

	await env.DB.prepare(`UPDATE session SET active_profile_id = ? WHERE id = ?`)
		.bind(profileId, session.sessionId)
		.run();

	return json(env, request, { ok: true, activeProfileId: profileId });
};
