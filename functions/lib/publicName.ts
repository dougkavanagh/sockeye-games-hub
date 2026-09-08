import type { Env } from "./http";

export const PUBLIC_NAME_MIN = 2;
export const PUBLIC_NAME_MAX = 20;

/** Letters (any script), digits, and a few separators people actually use. */
const ALLOWED = /^[\p{L}\p{N}][\p{L}\p{N} '._-]*$/u;

export type PublicNameCheck =
	| { ok: true; name: string }
	| { ok: false; error: string };

/**
 * Normalize and vet a player-chosen public name. This is the one string the
 * hub shows to strangers, so it stays short, printable, and free of anything
 * that reads as contact information.
 */
export function normalizePublicName(input: unknown): PublicNameCheck {
	if (typeof input !== "string") {
		return { ok: false, error: "A public name is required" };
	}
	const name = input.replace(/\s+/gu, " ").trim();
	if (name.length < PUBLIC_NAME_MIN) {
		return {
			ok: false,
			error: `Use at least ${PUBLIC_NAME_MIN} characters`,
		};
	}
	if (name.length > PUBLIC_NAME_MAX) {
		return { ok: false, error: `Use at most ${PUBLIC_NAME_MAX} characters` };
	}
	if (name.includes("@")) {
		return { ok: false, error: "Leave email addresses out of your name" };
	}
	if (!ALLOWED.test(name)) {
		return {
			ok: false,
			error: "Letters, numbers, spaces, and . ' _ - only",
		};
	}
	return { ok: true, name };
}

/** The account's public name, or null when the player has not chosen one. */
export async function getPublicName(
	env: Env,
	userId: string,
): Promise<string | null> {
	const row = await env.DB.prepare("SELECT public_name FROM user WHERE id = ?")
		.bind(userId)
		.first<{ public_name: string | null }>();
	return row?.public_name ?? null;
}
