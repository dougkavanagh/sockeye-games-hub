import { hubOrigin, nowIso, sha256Hex } from "../../lib/http";
import { signJwt } from "../../lib/jwt";
import type { PagesFn } from "../../lib/types";

const ACCESS_TOKEN_SECONDS = 3600; // 1 hour

async function sha256B64url(value: string): Promise<string> {
	const hash = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(value),
	);
	let binary = "";
	for (const b of new Uint8Array(hash)) binary += String.fromCharCode(b);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export const onRequestPost: PagesFn = async (context) => {
	const { request, env } = context;

	// Parse form body or JSON
	let params: URLSearchParams | null = null;
	const ct = request.headers.get("Content-Type") ?? "";
	if (ct.includes("application/x-www-form-urlencoded")) {
		params = new URLSearchParams(await request.text());
	} else {
		// Try JSON
		try {
			const body = (await request.json()) as Record<string, string>;
			params = new URLSearchParams(body);
		} catch {
			return errorResponse("invalid_request", 400);
		}
	}

	const grantType = params.get("grant_type") ?? "";
	const code = params.get("code") ?? "";
	const redirectUri = params.get("redirect_uri") ?? "";
	const clientId = params.get("client_id") ?? "";
	const codeVerifier = params.get("code_verifier") ?? "";

	if (grantType !== "authorization_code") {
		return errorResponse("unsupported_grant_type", 400);
	}
	if (!code || !redirectUri || !clientId || !codeVerifier) {
		return errorResponse("invalid_request", 400);
	}

	const codeHash = await sha256Hex(code);
	const row = await env.DB.prepare(
		`SELECT client_id, user_id, active_profile_id, redirect_uri, code_challenge, expires_at, consumed_at
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
		}>();

	if (!row || row.consumed_at) return errorResponse("invalid_grant", 400);
	if (new Date(row.expires_at).getTime() < Date.now())
		return errorResponse("invalid_grant", 400);
	if (row.client_id !== clientId) return errorResponse("invalid_grant", 400);
	if (row.redirect_uri !== redirectUri)
		return errorResponse("invalid_grant", 400);

	// Verify PKCE code_verifier
	const computedChallenge = await sha256B64url(codeVerifier);
	if (computedChallenge !== row.code_challenge)
		return errorResponse("invalid_grant", 400);

	// Consume the code
	await env.DB.prepare(
		"UPDATE oidc_auth_code SET consumed_at = ? WHERE code_hash = ?",
	)
		.bind(nowIso(), codeHash)
		.run();

	// Fetch user email
	const user = await env.DB.prepare("SELECT email FROM user WHERE id = ?")
		.bind(row.user_id)
		.first<{ email: string }>();

	const iss = hubOrigin(env, request);
	const iat = Math.floor(Date.now() / 1000);
	const exp = iat + ACCESS_TOKEN_SECONDS;

	const tokenPayload = {
		iss,
		sub: row.user_id,
		aud: clientId,
		exp,
		iat,
		profile_id: row.active_profile_id,
		email: user?.email,
	};

	const accessToken = await signJwt(tokenPayload, env.OIDC_SECRET);
	const idToken = await signJwt(
		{ iss, sub: row.user_id, aud: clientId, exp, iat, email: user?.email },
		env.OIDC_SECRET,
	);

	const headers = new Headers({
		"Content-Type": "application/json",
		"Cache-Control": "no-store",
	});
	// CORS: token endpoint is called cross-origin from games
	const origin = request.headers.get("Origin");
	if (origin) {
		headers.set("Access-Control-Allow-Origin", origin);
		headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
		headers.set("Access-Control-Allow-Headers", "Content-Type");
		headers.set("Vary", "Origin");
	}

	return new Response(
		JSON.stringify({
			access_token: accessToken,
			token_type: "Bearer",
			expires_in: ACCESS_TOKEN_SECONDS,
			id_token: idToken,
		}),
		{ status: 200, headers },
	);
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

function errorResponse(error: string, status: number): Response {
	return new Response(JSON.stringify({ error }), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}
