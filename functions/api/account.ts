/**
 * DELETE /api/account — Apple 5.1.1(v) in-app account deletion.
 *
 * Cookie session or OIDC Bearer. Body `{ confirm: "DELETE" }` so a stray
 * tap cannot wipe the row. Games call this from a Delete account button,
 * then drop their local tokens.
 */
import { deleteUserAccount } from "../lib/account";
import { resolveAuth } from "../lib/auth";
import { clearSessionCookie, json } from "../lib/http";
import type { PagesFn } from "../lib/types";

export const onRequestDelete: PagesFn = async (context) => {
	const { request, env } = context;
	const auth = await resolveAuth(env, request);
	if (!auth) {
		return json(env, request, { error: "Unauthorized" }, { status: 401 });
	}

	let body: { confirm?: unknown } = {};
	try {
		body = (await request.json()) as { confirm?: unknown };
	} catch {
		body = {};
	}
	if (body.confirm !== "DELETE") {
		return json(
			env,
			request,
			{ error: 'Send { confirm: "DELETE" } to delete the account' },
			{ status: 400 },
		);
	}

	await deleteUserAccount(env, auth.userId, auth.email);

	const headers = new Headers();
	headers.append("Set-Cookie", clearSessionCookie(request));
	return json(env, request, { ok: true }, { headers });
};

export const onRequestOptions: PagesFn = async (context) => {
	const { request, env } = context;
	return json(env, request, null, { status: 204 });
};
