import {
	type Env,
	hubOrigin,
	isoInDays,
	newId,
	nowIso,
	sha256Hex,
} from "../../lib/http";
import { signJwt } from "../../lib/jwt";
import type { PagesFn } from "../../lib/types";

const ACCESS_TOKEN_SECONDS = 3600; // 1 hour
/** Match the hub session cookie so a signed-in parent keeps games alive. */
const REFRESH_TOKEN_DAYS = 30;

async function sha256B64url(value: string): Promise<string> {
	const hash = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(value),
	);
	let binary = "";
	for (const b of new Uint8Array(hash)) binary += String.fromCharCode(b);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function hasOfflineAccess(scope: string): boolean {
	return scope.split(/\s+/).includes("offline_access");
}

function mintRefreshToken(): string {
	return newId() + newId().replace(/-/g, "");
}

type TokenSubject = {
	clientId: string;
	userId: string;
	activeProfileId: string | null;
	scope: string;
};

async function issueTokenResponse(
	env: Env,
	request: Request,
	subject: TokenSubject,
	opts: { includeRefresh: boolean },
): Promise<Response> {
	const user = await env.DB.prepare("SELECT email FROM user WHERE id = ?")
		.bind(subject.userId)
		.first<{ email: string }>();

	const iss = hubOrigin(env, request);
	const iat = Math.floor(Date.now() / 1000);
	const exp = iat + ACCESS_TOKEN_SECONDS;

	const accessToken = await signJwt(
		{
			iss,
			sub: subject.userId,
			aud: subject.clientId,
			exp,
			iat,
			profile_id: subject.activeProfileId,
			email: user?.email,
		},
		env.OIDC_SECRET,
	);
	const idToken = await signJwt(
		{
			iss,
			sub: subject.userId,
			aud: subject.clientId,
			exp,
			iat,
			email: user?.email,
		},
		env.OIDC_SECRET,
	);

	const body: Record<string, unknown> = {
		access_token: accessToken,
		token_type: "Bearer",
		expires_in: ACCESS_TOKEN_SECONDS,
		id_token: idToken,
		scope: subject.scope,
	};

	if (opts.includeRefresh) {
		const refreshToken = mintRefreshToken();
		const tokenHash = await sha256Hex(refreshToken);
		await env.DB.prepare(
			`INSERT INTO oidc_refresh_token
         (token_hash, client_id, user_id, active_profile_id, scope, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
		)
			.bind(
				tokenHash,
				subject.clientId,
				subject.userId,
				subject.activeProfileId,
				subject.scope,
				isoInDays(REFRESH_TOKEN_DAYS),
			)
			.run();
		body.refresh_token = refreshToken;
	}

	return tokenJson(request, body);
}

async function handleAuthorizationCode(
	env: Env,
	request: Request,
	params: URLSearchParams,
): Promise<Response> {
	const code = params.get("code") ?? "";
	const redirectUri = params.get("redirect_uri") ?? "";
	const clientId = params.get("client_id") ?? "";
	const codeVerifier = params.get("code_verifier") ?? "";

	if (!code || !redirectUri || !clientId || !codeVerifier) {
		return errorResponse("invalid_request", 400);
	}

	const codeHash = await sha256Hex(code);
	const row = await env.DB.prepare(
		`SELECT client_id, user_id, active_profile_id, redirect_uri, code_challenge, expires_at, consumed_at, scope
     FROM oidc_auth_code WHERE code_hash = ?`,
	)
		.bind(codeHash)
		.first<{
			client_id: string;
			user_id: string;
			active_profile_id: string | null;
			redirect_uri: string;
			code_challenge: string;
			expires_at: string;
			consumed_at: string | null;
			scope: string;
		}>();

	if (!row || row.consumed_at) return errorResponse("invalid_grant", 400);
	if (new Date(row.expires_at).getTime() < Date.now())
		return errorResponse("invalid_grant", 400);
	if (row.client_id !== clientId) return errorResponse("invalid_grant", 400);
	if (row.redirect_uri !== redirectUri)
		return errorResponse("invalid_grant", 400);

	const computedChallenge = await sha256B64url(codeVerifier);
	if (computedChallenge !== row.code_challenge)
		return errorResponse("invalid_grant", 400);

	await env.DB.prepare(
		"UPDATE oidc_auth_code SET consumed_at = ? WHERE code_hash = ?",
	)
		.bind(nowIso(), codeHash)
		.run();

	return issueTokenResponse(
		env,
		request,
		{
			clientId: row.client_id,
			userId: row.user_id,
			activeProfileId: row.active_profile_id,
			scope: row.scope,
		},
		{ includeRefresh: hasOfflineAccess(row.scope) },
	);
}

async function handleRefreshToken(
	env: Env,
	request: Request,
	params: URLSearchParams,
): Promise<Response> {
	const refreshToken = params.get("refresh_token") ?? "";
	const clientId = params.get("client_id") ?? "";

	if (!refreshToken || !clientId) {
		return errorResponse("invalid_request", 400);
	}

	const tokenHash = await sha256Hex(refreshToken);
	const row = await env.DB.prepare(
		`SELECT token_hash, client_id, user_id, active_profile_id, scope, expires_at, revoked_at
     FROM oidc_refresh_token WHERE token_hash = ?`,
	)
		.bind(tokenHash)
		.first<{
			token_hash: string;
			client_id: string;
			user_id: string;
			active_profile_id: string | null;
			scope: string;
			expires_at: string;
			revoked_at: string | null;
		}>();

	if (!row || row.client_id !== clientId) {
		return errorResponse("invalid_grant", 400);
	}

	// Reuse of a rotated token: burn every refresh token for this client+user.
	if (row.revoked_at) {
		await env.DB.prepare(
			`UPDATE oidc_refresh_token SET revoked_at = COALESCE(revoked_at, ?)
       WHERE user_id = ? AND client_id = ? AND revoked_at IS NULL`,
		)
			.bind(nowIso(), row.user_id, row.client_id)
			.run();
		return errorResponse("invalid_grant", 400);
	}

	if (new Date(row.expires_at).getTime() < Date.now()) {
		await env.DB.prepare(
			"UPDATE oidc_refresh_token SET revoked_at = ? WHERE token_hash = ?",
		)
			.bind(nowIso(), tokenHash)
			.run();
		return errorResponse("invalid_grant", 400);
	}

	// Rotate: revoke the presented token, then mint a replacement.
	await env.DB.prepare(
		"UPDATE oidc_refresh_token SET revoked_at = ? WHERE token_hash = ?",
	)
		.bind(nowIso(), tokenHash)
		.run();

	return issueTokenResponse(
		env,
		request,
		{
			clientId: row.client_id,
			userId: row.user_id,
			activeProfileId: row.active_profile_id,
			scope: row.scope,
		},
		{ includeRefresh: true },
	);
}

export const onRequestPost: PagesFn = async (context) => {
	const { request, env } = context;

	let params: URLSearchParams | null = null;
	const ct = request.headers.get("Content-Type") ?? "";
	if (ct.includes("application/x-www-form-urlencoded")) {
		params = new URLSearchParams(await request.text());
	} else {
		try {
			const body = (await request.json()) as Record<string, string>;
			params = new URLSearchParams(body);
		} catch {
			return errorResponse("invalid_request", 400);
		}
	}

	const grantType = params.get("grant_type") ?? "";
	if (grantType === "authorization_code") {
		return handleAuthorizationCode(env, request, params);
	}
	if (grantType === "refresh_token") {
		return handleRefreshToken(env, request, params);
	}
	return errorResponse("unsupported_grant_type", 400);
};

export const onRequestOptions: PagesFn = (context) => {
	const origin = context.request.headers.get("Origin") ?? "*";
	return new Response(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": origin,
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
};

function tokenJson(request: Request, body: Record<string, unknown>): Response {
	const headers = new Headers({
		"Content-Type": "application/json",
		"Cache-Control": "no-store",
	});
	const origin = request.headers.get("Origin");
	if (origin) {
		headers.set("Access-Control-Allow-Origin", origin);
		headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
		headers.set("Access-Control-Allow-Headers", "Content-Type");
		headers.set("Vary", "Origin");
	}
	return new Response(JSON.stringify(body), { status: 200, headers });
}

function errorResponse(error: string, status: number): Response {
	return new Response(JSON.stringify({ error }), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}
