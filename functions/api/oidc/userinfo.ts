import { hubOrigin, json } from "../../lib/http";
import { verifyJwt } from "../../lib/jwt";
import type { PagesFn } from "../../lib/types";

export const onRequestGet: PagesFn = async (context) => {
	const { request, env } = context;
	const authHeader = request.headers.get("Authorization") ?? "";
	const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
	if (!token) {
		return json(env, request, { error: "Unauthorized" }, { status: 401 });
	}
	const payload = await verifyJwt(token, env.OIDC_SECRET);
	if (!payload) {
		return json(env, request, { error: "Invalid token" }, { status: 401 });
	}
	// Verify issuer
	const expectedIss = hubOrigin(env, request);
	if (payload.iss !== expectedIss) {
		return json(env, request, { error: "Invalid token" }, { status: 401 });
	}
	// Native clients have no session cookie, so this is their only way to learn
	// who they are. Returning the profile list as well means a game can name the
	// active kid, and show which others exist, without `/api/me`.
	const profiles = await env.DB.prepare(
		`SELECT id, display_name FROM kid_profile WHERE user_id = ? ORDER BY created_at ASC`,
	)
		.bind(payload.sub)
		.all<{ id: string; display_name: string }>();

	const rows = profiles.results ?? [];
	const active = rows.find((row) => row.id === payload.profile_id);

	return json(env, request, {
		sub: payload.sub,
		email: payload.email,
		profile_id: payload.profile_id,
		profile_name: active?.display_name ?? null,
		profiles: rows.map((row) => ({
			id: row.id,
			displayName: row.display_name,
		})),
	});
};
