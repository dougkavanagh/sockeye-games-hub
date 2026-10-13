/**
 * GET / POST /api/moderation/blocks — Apple 1.2 hide abusive users.
 *
 * Signed-in only on the hub side. Games also keep a local list so a
 * player who never signs in can still hide a row on this device.
 */
import { resolveAuth } from "../../lib/auth";
import { json } from "../../lib/http";
import type { PagesFn } from "../../lib/types";

function clipName(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const name = value.replace(/\s+/gu, " ").trim();
	if (name.length < 1 || name.length > 40) return null;
	return name;
}

export const onRequestGet: PagesFn = async (context) => {
	const { request, env } = context;
	const auth = await resolveAuth(env, request);
	if (!auth) {
		return json(env, request, { names: [] });
	}
	const rows = await env.DB.prepare(
		`SELECT public_name FROM user_block WHERE user_id = ? ORDER BY created_at DESC`,
	)
		.bind(auth.userId)
		.all<{ public_name: string }>();
	return json(env, request, {
		names: (rows.results ?? []).map((r) => r.public_name),
	});
};

export const onRequestPost: PagesFn = async (context) => {
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

	const publicName = clipName(body.publicName);
	if (!publicName) {
		return json(
			env,
			request,
			{ error: "publicName required" },
			{ status: 400 },
		);
	}

	await env.DB.prepare(
		`INSERT OR IGNORE INTO user_block (user_id, public_name) VALUES (?, ?)`,
	)
		.bind(auth.userId, publicName)
		.run();

	return json(env, request, { ok: true, publicName });
};

export const onRequestOptions: PagesFn = async (context) => {
	const { request, env } = context;
	return json(env, request, null, { status: 204 });
};
