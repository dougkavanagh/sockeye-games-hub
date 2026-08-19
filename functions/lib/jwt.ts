// HS256 JWT utilities for Cloudflare Workers (Web Crypto API)

const DEV_SECRET = "dev-oidc-secret-change-in-production-min-32-chars!!";

function b64url(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function b64urlEncode(str: string): string {
	return b64url(new TextEncoder().encode(str));
}

function b64urlDecode(input: string): Uint8Array {
	const padded = input.replace(/-/g, "+").replace(/_/g, "/");
	const pad = (4 - (padded.length % 4)) % 4;
	const binary = atob(padded + "=".repeat(pad));
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

async function importKey(secret: string): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"],
	);
}

export async function signJwt(
	payload: Record<string, unknown>,
	secret: string | undefined,
): Promise<string> {
	const key = await importKey(secret ?? DEV_SECRET);
	const header = b64urlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const body = b64urlEncode(JSON.stringify(payload));
	const message = new TextEncoder().encode(`${header}.${body}`);
	const sig = await crypto.subtle.sign("HMAC", key, message);
	return `${header}.${body}.${b64url(new Uint8Array(sig))}`;
}

export async function verifyJwt(
	token: string,
	secret: string | undefined,
): Promise<Record<string, unknown> | null> {
	const parts = token.split(".");
	if (parts.length !== 3) return null;
	const [header, body, sig] = parts;
	const key = await importKey(secret ?? DEV_SECRET);
	const message = new TextEncoder().encode(`${header}.${body}`);
	const sigBytes = b64urlDecode(sig);
	const valid = await crypto.subtle.verify("HMAC", key, sigBytes, message);
	if (!valid) return null;
	try {
		const payload = JSON.parse(
			new TextDecoder().decode(b64urlDecode(body)),
		) as Record<string, unknown>;
		if (
			typeof payload.exp === "number" &&
			payload.exp < Math.floor(Date.now() / 1000)
		) {
			return null; // expired
		}
		return payload;
	} catch {
		return null;
	}
}
