import {
	type Env,
	isoInDays,
	json,
	newId,
	SESSION_DAYS,
	setSessionCookie,
} from "./http";

/** True when this email/password pair is the App Review demo account. */
export function reviewPasswordOk(
	env: Env,
	email: string,
	password: string,
): boolean {
	const expectedEmail = (env.APP_REVIEW_EMAIL ?? "").trim().toLowerCase();
	const expectedPassword = env.APP_REVIEW_PASSWORD ?? "";
	if (!expectedEmail || !expectedPassword) return false;
	return (
		email.trim().toLowerCase() === expectedEmail &&
		password === expectedPassword
	);
}

export async function findOrCreateUser(
	env: Env,
	email: string,
): Promise<{ id: string; email: string }> {
	const normalized = email.trim().toLowerCase();
	const existing = await env.DB.prepare(
		`SELECT id, email FROM user WHERE email = ?`,
	)
		.bind(normalized)
		.first<{ id: string; email: string }>();
	if (existing) return existing;
	const id = newId();
	await env.DB.prepare(`INSERT INTO user (id, email) VALUES (?, ?)`)
		.bind(id, normalized)
		.run();
	return { id, email: normalized };
}

/** First kid profile, or a new one named `displayName`. */
export async function ensureProfile(
	env: Env,
	userId: string,
	displayName: string,
): Promise<string> {
	const existing = await env.DB.prepare(
		`SELECT id FROM kid_profile WHERE user_id = ? ORDER BY created_at ASC LIMIT 1`,
	)
		.bind(userId)
		.first<{ id: string }>();
	if (existing) return existing.id;
	const id = newId();
	await env.DB.prepare(
		`INSERT INTO kid_profile (id, user_id, display_name) VALUES (?, ?, ?)`,
	)
		.bind(id, userId, displayName)
		.run();
	return id;
}

export async function issueSession(
	env: Env,
	request: Request,
	userId: string,
	email: string,
	activeProfileId: string | null,
): Promise<Response> {
	const sessionId = newId();
	const expiresAt = isoInDays(SESSION_DAYS);
	await env.DB.prepare(
		`INSERT INTO session (id, user_id, active_profile_id, expires_at) VALUES (?, ?, ?, ?)`,
	)
		.bind(sessionId, userId, activeProfileId, expiresAt)
		.run();
	const headers = new Headers();
	headers.append(
		"Set-Cookie",
		setSessionCookie(request, sessionId, SESSION_DAYS * 86_400),
	);
	return json(env, request, { ok: true, email }, { headers });
}

/**
 * Wipe the account and everything keyed to it. Order matters: progress
 * rows hang off kid profiles, and D1 may not enforce ON DELETE CASCADE.
 */
export async function deleteUserAccount(
	env: Env,
	userId: string,
	email: string,
): Promise<void> {
	await env.DB.prepare(
		`DELETE FROM game_progress WHERE profile_id IN (SELECT id FROM kid_profile WHERE user_id = ?)`,
	)
		.bind(userId)
		.run();
	await env.DB.prepare(`DELETE FROM oidc_refresh_token WHERE user_id = ?`)
		.bind(userId)
		.run();
	await env.DB.prepare(`DELETE FROM oidc_auth_code WHERE user_id = ?`)
		.bind(userId)
		.run();
	await env.DB.prepare(`DELETE FROM session WHERE user_id = ?`)
		.bind(userId)
		.run();
	await env.DB.prepare(`DELETE FROM leaderboard WHERE user_id = ?`)
		.bind(userId)
		.run();
	await env.DB.prepare(`DELETE FROM ticket_request WHERE user_id = ?`)
		.bind(userId)
		.run();
	await env.DB.prepare(`DELETE FROM user_block WHERE user_id = ?`)
		.bind(userId)
		.run();
	await env.DB.prepare(
		`UPDATE content_report SET reporter_user_id = NULL WHERE reporter_user_id = ?`,
	)
		.bind(userId)
		.run();
	await env.DB.prepare(`DELETE FROM kid_profile WHERE user_id = ?`)
		.bind(userId)
		.run();
	await env.DB.prepare(`DELETE FROM magic_link WHERE email = ?`)
		.bind(email)
		.run();
	await env.DB.prepare(`DELETE FROM user WHERE id = ?`).bind(userId).run();
}
