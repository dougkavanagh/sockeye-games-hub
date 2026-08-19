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
	return json(env, request, {
		sub: payload.sub,
		email: payload.email,
		profile_id: payload.profile_id,
	});
};
