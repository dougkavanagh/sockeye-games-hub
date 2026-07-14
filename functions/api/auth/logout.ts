import {
	clearSessionCookie,
	getCookie,
	json,
	SESSION_COOKIE,
} from "../../lib/http";
import type { PagesFn } from "../../lib/types";

export const onRequestPost: PagesFn = async (context) => {
	const { request, env } = context;
	const sessionId = getCookie(request, SESSION_COOKIE);
	if (sessionId) {
		await env.DB.prepare(`DELETE FROM session WHERE id = ?`)
			.bind(sessionId)
			.run();
	}

	const headers = new Headers();
	headers.append("Set-Cookie", clearSessionCookie(request));
	return json(env, request, { ok: true }, { headers });
};
