export interface Env {
	DB: D1Database;
	/** Optional Resend API key. Without it, magic links are returned in JSON for local/dev. */
	RESEND_API_KEY?: string;
	/** From address for magic links, e.g. noreply@sockeyegames.org */
	MAGIC_LINK_FROM?: string;
	/** Public hub origin for magic-link URLs, e.g. https://sockeyegames.org */
	HUB_ORIGIN?: string;
	/** Comma-separated allowed game origins for CORS, plus hub origin */
	ALLOWED_ORIGINS?: string;
	/** Cloudflare Turnstile secret key, used to verify contact-form submissions */
	TURNSTILE_SECRET_KEY?: string;
	/** Inbox that receives parent/teacher contact-form messages */
	CONTACT_TO_EMAIL?: string;
	/** HS256 secret for OIDC JWT signing. Defaults to a dev fallback if not set. */
	OIDC_SECRET?: string;
}

export const SESSION_COOKIE = "sockeye_session";
export const SESSION_DAYS = 30;
export const MAGIC_LINK_MINUTES = 20;

export function hubOrigin(env: Env, request: Request): string {
	if (env.HUB_ORIGIN) return env.HUB_ORIGIN.replace(/\/$/, "");
	return new URL(request.url).origin;
}

/**
 * The origin key a redirect_uri is matched by, or `null` if it cannot be
 * parsed.
 *
 * `URL.origin` is only defined for special schemes (http, https, ws...).
 * Everything else — `capacitor://localhost` on an iOS shell, or a per-app
 * scheme like `org.sockeyegames.dryou://callback` — reports an opaque origin of
 * the string "null", so matching on `.origin` rejects every native redirect no
 * matter what the client's allow list says. Fall back to scheme plus authority,
 * which is still an exact comparison: `capacitor://localhost.evil.com` does not
 * match an entry of `capacitor://localhost`.
 */
export function redirectOriginKey(redirectUri: string): string | null {
	let url: URL;
	try {
		url = new URL(redirectUri);
	} catch {
		return null;
	}
	if (url.origin && url.origin !== "null") return url.origin;
	if (!url.host) return null;
	return `${url.protocol}//${url.host}`;
}

/** Whether a client may be redirected back to this URI. */
export function isRedirectUriAllowed(
	redirectUri: string,
	allowed: string[],
): boolean {
	const key = redirectOriginKey(redirectUri);
	return key !== null && allowed.includes(key);
}

export function allowedOrigins(env: Env, request: Request): string[] {
	const hub = hubOrigin(env, request);
	const defaults = [
		hub,
		"http://localhost:5180",
		"http://127.0.0.1:5180",
		"http://localhost:5177",
		"http://localhost:5190",
		"http://127.0.0.1:5190",
		"capacitor://localhost",
		"http://localhost",
		"https://final-quest.pages.dev",
		"https://final-quest.sockeyegames.org",
		"https://geometry.sockeyegames.org",
		"https://dryou.pages.dev",
		"https://dryou.sockeyegames.org",
		"https://immunitd.pages.dev",
		"https://immunitd.sockeyegames.org",
	];
	const extra = (env.ALLOWED_ORIGINS ?? "")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	return [...new Set([...defaults, ...extra])];
}

export function corsHeaders(
	env: Env,
	request: Request,
): Record<string, string> {
	const origin = request.headers.get("Origin");
	const allowed = allowedOrigins(env, request);
	const headers: Record<string, string> = {
		Vary: "Origin",
		"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Allow-Credentials": "true",
	};
	if (origin && allowed.includes(origin)) {
		headers["Access-Control-Allow-Origin"] = origin;
	}
	return headers;
}

export function json(
	env: Env,
	request: Request,
	data: unknown,
	init: ResponseInit = {},
): Response {
	const headers = new Headers(init.headers);
	const cors = corsHeaders(env, request);
	for (const [k, v] of Object.entries(cors)) headers.set(k, v);
	if (!headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json; charset=utf-8");
	}
	return new Response(JSON.stringify(data), { ...init, headers });
}

export function cookieDomain(request: Request): string | undefined {
	const host = new URL(request.url).hostname;
	if (host === "localhost" || host === "127.0.0.1") return undefined;
	if (host.endsWith("sockeyegames.org")) return ".sockeyegames.org";
	if (host.endsWith("pages.dev")) return undefined;
	return undefined;
}

function isLocalHost(request: Request): boolean {
	const host = new URL(request.url).hostname;
	return host === "localhost" || host === "127.0.0.1";
}

export function setSessionCookie(
	request: Request,
	sessionId: string,
	maxAgeSec: number,
): string {
	const parts = [
		`${SESSION_COOKIE}=${sessionId}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		`Max-Age=${maxAgeSec}`,
	];
	if (!isLocalHost(request)) parts.push("Secure");
	const domain = cookieDomain(request);
	if (domain) parts.push(`Domain=${domain}`);
	return parts.join("; ");
}

export function clearSessionCookie(request: Request): string {
	const parts = [
		`${SESSION_COOKIE}=`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		"Max-Age=0",
	];
	if (!isLocalHost(request)) parts.push("Secure");
	const domain = cookieDomain(request);
	if (domain) parts.push(`Domain=${domain}`);
	return parts.join("; ");
}

export function getCookie(request: Request, name: string): string | null {
	const raw = request.headers.get("Cookie");
	if (!raw) return null;
	for (const part of raw.split(";")) {
		const [k, ...rest] = part.trim().split("=");
		if (k === name) return decodeURIComponent(rest.join("="));
	}
	return null;
}

export function newId(): string {
	return crypto.randomUUID();
}

export async function sha256Hex(value: string): Promise<string> {
	const data = new TextEncoder().encode(value);
	const hash = await crypto.subtle.digest("SHA-256", data);
	return [...new Uint8Array(hash)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

export function isoInMinutes(minutes: number): string {
	return new Date(Date.now() + minutes * 60_000).toISOString();
}

export function isoInDays(days: number): string {
	return new Date(Date.now() + days * 86_400_000).toISOString();
}

export function nowIso(): string {
	return new Date().toISOString();
}

export type SessionUser = {
	sessionId: string;
	userId: string;
	email: string;
	activeProfileId: string | null;
};

export function getBearerToken(request: Request): string | null {
	const auth = request.headers.get("Authorization") ?? "";
	return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

export async function getSession(
	env: Env,
	request: Request,
): Promise<SessionUser | null> {
	const sessionId = getCookie(request, SESSION_COOKIE);
	if (!sessionId) return null;

	const row = await env.DB.prepare(
		`SELECT s.id AS session_id, s.user_id, s.active_profile_id, u.email, s.expires_at
		 FROM session s
		 JOIN user u ON u.id = s.user_id
		 WHERE s.id = ?`,
	)
		.bind(sessionId)
		.first<{
			session_id: string;
			user_id: string;
			active_profile_id: string | null;
			email: string;
			expires_at: string;
		}>();

	if (!row) return null;
	if (new Date(row.expires_at).getTime() < Date.now()) {
		await env.DB.prepare("DELETE FROM session WHERE id = ?")
			.bind(sessionId)
			.run();
		return null;
	}

	return {
		sessionId: row.session_id,
		userId: row.user_id,
		email: row.email,
		activeProfileId: row.active_profile_id,
	};
}
