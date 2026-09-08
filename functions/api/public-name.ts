/**
 * The player's public name: the only account detail a leaderboard shows to
 * strangers. It is null until the player picks one, and nothing is published
 * before that.
 */
import { resolveAuth } from "../lib/auth";
import { json } from "../lib/http";
import {
	getPublicName,
	normalizePublicName,
	PUBLIC_NAME_MAX,
	PUBLIC_NAME_MIN,
} from "../lib/publicName";
import type { PagesFn } from "../lib/types";

export const onRequestGet: PagesFn = async (context) => {
	const { request, env } = context;
	const auth = await resolveAuth(env, request);
	if (!auth) {
		return json(env, request, { error: "Unauthorized" }, { status: 401 });
	}
	return json(env, request, {
		publicName: await getPublicName(env, auth.userId),
		minLength: PUBLIC_NAME_MIN,
		maxLength: PUBLIC_NAME_MAX,
	});
};

export const onRequestPut: PagesFn = async (context) => {
	const { request, env } = context;
	const auth = await resolveAuth(env, request);
	if (!auth) {
		return json(env, request, { error: "Unauthorized" }, { status: 401 });
	}

	let body: { publicName?: unknown };
	try {
		body = (await request.json()) as { publicName?: unknown };
	} catch {
		return json(env, request, { error: "Invalid JSON" }, { status: 400 });
	}

	const checked = normalizePublicName(body.publicName);
	if (!checked.ok) {
		return json(env, request, { error: checked.error }, { status: 400 });
	}

	await env.DB.prepare("UPDATE user SET public_name = ? WHERE id = ?")
		.bind(checked.name, auth.userId)
		.run();

	// Rows already on a board carry a copy of the name, so renaming has to
	// reach them or the boards keep showing the old one.
	await env.DB.prepare(
		"UPDATE leaderboard SET display_name = ? WHERE user_id = ?",
	)
		.bind(checked.name, auth.userId)
		.run();

	return json(env, request, { ok: true, publicName: checked.name });
};

export const onRequestOptions: PagesFn = async (context) => {
	const { request, env } = context;
	return json(env, request, null, { status: 204 });
};
