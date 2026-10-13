/**
 * POST /api/auth/password — App Review demo sign-in.
 *
 * Magic-link email is the normal path. Apple asks for static demo
 * credentials, so this accepts one email/password pair from env
 * (APP_REVIEW_EMAIL / APP_REVIEW_PASSWORD), creates the user if needed,
 * and ensures a kid profile so OIDC saves are not stuck on
 * "Select a kid profile first".
 */
import {
	ensureProfile,
	findOrCreateUser,
	issueSession,
	reviewPasswordOk,
} from "../../lib/account";
import { json } from "../../lib/http";
import type { PagesFn } from "../../lib/types";

type Body = { email?: string; password?: string };

export const onRequestPost: PagesFn = async (context) => {
	const { request, env } = context;
	let body: Body;
	try {
		body = (await request.json()) as Body;
	} catch {
		return json(env, request, { error: "Invalid JSON" }, { status: 400 });
	}

	const email = body.email?.trim().toLowerCase() ?? "";
	const password = typeof body.password === "string" ? body.password : "";
	if (!email || !password) {
		return json(
			env,
			request,
			{ error: "Email and password required" },
			{ status: 400 },
		);
	}

	if (!env.APP_REVIEW_EMAIL || !env.APP_REVIEW_PASSWORD) {
		return json(
			env,
			request,
			{ error: "Password sign-in is not available" },
			{ status: 400 },
		);
	}

	if (!reviewPasswordOk(env, email, password)) {
		return json(
			env,
			request,
			{ error: "Wrong email or password. Try the email link instead." },
			{ status: 401 },
		);
	}

	const user = await findOrCreateUser(env, email);
	const profileId = await ensureProfile(env, user.id, "Review");
	return issueSession(env, request, user.id, user.email, profileId);
};

export const onRequestOptions: PagesFn = async (context) => {
	const { request, env } = context;
	return json(env, request, null, { status: 204 });
};
