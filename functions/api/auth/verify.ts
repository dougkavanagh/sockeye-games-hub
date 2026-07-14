import {
	isoInDays,
	json,
	newId,
	nowIso,
	SESSION_DAYS,
	setSessionCookie,
	sha256Hex,
} from "../../lib/http";
import type { PagesFn } from "../../lib/types";

type Body = { token?: string };

export const onRequestPost: PagesFn = async (context) => {
	const { request, env } = context;
	let body: Body;
	try {
		body = (await request.json()) as Body;
	} catch {
		return json(env, request, { error: "Invalid JSON" }, { status: 400 });
	}

	const token = body.token?.trim();
	if (!token) {
		return json(env, request, { error: "Token required" }, { status: 400 });
	}

	const tokenHash = await sha256Hex(token);
	const link = await env.DB.prepare(
		`SELECT email, expires_at, consumed_at FROM magic_link WHERE token_hash = ?`,
	)
		.bind(tokenHash)
		.first<{ email: string; expires_at: string; consumed_at: string | null }>();

	if (!link || link.consumed_at) {
		return json(
			env,
			request,
			{ error: "Invalid or used link" },
			{ status: 400 },
		);
	}
	if (new Date(link.expires_at).getTime() < Date.now()) {
		return json(env, request, { error: "Link expired" }, { status: 400 });
	}

	await env.DB.prepare(
		`UPDATE magic_link SET consumed_at = ? WHERE token_hash = ?`,
	)
		.bind(nowIso(), tokenHash)
		.run();

	let user = await env.DB.prepare(`SELECT id, email FROM user WHERE email = ?`)
		.bind(link.email)
		.first<{ id: string; email: string }>();

	if (!user) {
		const id = newId();
		await env.DB.prepare(`INSERT INTO user (id, email) VALUES (?, ?)`)
			.bind(id, link.email)
			.run();
		user = { id, email: link.email };
	}

	const sessionId = newId();
	const expiresAt = isoInDays(SESSION_DAYS);
	await env.DB.prepare(
		`INSERT INTO session (id, user_id, expires_at) VALUES (?, ?, ?)`,
	)
		.bind(sessionId, user.id, expiresAt)
		.run();

	const headers = new Headers();
	headers.append(
		"Set-Cookie",
		setSessionCookie(request, sessionId, SESSION_DAYS * 86_400),
	);

	return json(env, request, { ok: true, email: user.email }, { headers });
};
