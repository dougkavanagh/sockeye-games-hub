import {
	getSession,
	hubOrigin,
	isoInMinutes,
	isRedirectUriAllowed,
	newId,
	sha256Hex,
} from "../../lib/http";
import type { PagesFn } from "../../lib/types";

const CODE_MINUTES = 5;

function redirect(url: string): Response {
	return new Response(null, { status: 302, headers: { Location: url } });
}

export const onRequestGet: PagesFn = async (context) => {
	const { request, env } = context;
	const url = new URL(request.url);
	const p = url.searchParams;

	const clientId = p.get("client_id") ?? "";
	const redirectUri = p.get("redirect_uri") ?? "";
	const responseType = p.get("response_type") ?? "";
	const state = p.get("state") ?? "";
	const codeChallenge = p.get("code_challenge") ?? "";
	const codeChallengeMethod = p.get("code_challenge_method") ?? "";

	// Validate required params
	if (responseType !== "code") {
		return new Response("unsupported_response_type", { status: 400 });
	}
	if (!codeChallenge || codeChallengeMethod !== "S256") {
		return new Response("code_challenge required (S256)", { status: 400 });
	}
	if (!clientId || !redirectUri) {
		return new Response("client_id and redirect_uri required", { status: 400 });
	}

	// Look up client
	const client = await env.DB.prepare(
		"SELECT redirect_origins FROM oidc_client WHERE client_id = ?",
	)
		.bind(clientId)
		.first<{ redirect_origins: string }>();

	if (!client) {
		return new Response("unknown client_id", { status: 400 });
	}

	// Validate redirect_uri against allowed origins
	const allowedOrigins = JSON.parse(client.redirect_origins) as string[];
	if (!isRedirectUriAllowed(redirectUri, allowedOrigins)) {
		return new Response("redirect_uri not allowed", { status: 400 });
	}

	// Check session
	const session = await getSession(env, request);
	if (!session) {
		// Redirect to hub sign-in page with OIDC params encoded
		const oidcReturn = url.search.slice(1); // query string without leading "?"
		const hub = hubOrigin(env, request);
		return redirect(
			`${hub}/#/account?oidc_return=${encodeURIComponent(oidcReturn)}`,
		);
	}

	// Issue authorization code
	const code = newId() + newId().replace(/-/g, "");
	const codeHash = await sha256Hex(code);
	const expiresAt = isoInMinutes(CODE_MINUTES);

	await env.DB.prepare(
		`INSERT INTO oidc_auth_code
       (code_hash, client_id, user_id, active_profile_id, redirect_uri, code_challenge, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
	)
		.bind(
			codeHash,
			clientId,
			session.userId,
			session.activeProfileId,
			redirectUri,
			codeChallenge,
			expiresAt,
		)
		.run();

	const dest = new URL(redirectUri);
	dest.searchParams.set("code", code);
	if (state) dest.searchParams.set("state", state);
	return redirect(dest.toString());
};

export const onRequestOptions: PagesFn = (context) => {
	const origin = context.request.headers.get("Origin") ?? "*";
	return new Response(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": origin,
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
};
