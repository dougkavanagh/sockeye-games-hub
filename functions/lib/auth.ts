import { type Env, getBearerToken, getSession, hubOrigin } from "./http";
import { verifyJwt } from "./jwt";

export type AuthResult = {
	userId: string;
	email: string;
	activeProfileId: string | null;
};

/** Session cookie or OIDC Bearer access token. */
export async function resolveAuth(
	env: Env,
	request: Request,
): Promise<AuthResult | null> {
	const session = await getSession(env, request);
	if (session) {
		return {
			userId: session.userId,
			email: session.email,
			activeProfileId: session.activeProfileId,
		};
	}

	const token = getBearerToken(request);
	if (!token) return null;

	const payload = await verifyJwt(token, env.OIDC_SECRET);
	if (!payload || typeof payload.sub !== "string") return null;

	const iss = hubOrigin(env, request);
	if (payload.iss !== iss) return null;

	let email =
		typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
	if (!email) {
		const row = await env.DB.prepare("SELECT email FROM user WHERE id = ?")
			.bind(payload.sub)
			.first<{ email: string }>();
		email = row?.email?.toLowerCase() ?? "";
	}
	if (!email) return null;

	return {
		userId: payload.sub,
		email,
		activeProfileId:
			typeof payload.profile_id === "string" ? payload.profile_id : null,
	};
}
