/** redirect_uri validation.
 *
 * This is the check that decides whether a native shell can sign in at all,
 * and it failed silently for every non-http scheme: `URL.origin` is the string
 * "null" for them, so an allow list entry of `capacitor://localhost` could
 * never match. The allow list looked right and nothing worked.
 */

import { expect, test } from "bun:test";
import { isRedirectUriAllowed, redirectOriginKey } from "../functions/lib/http";

const ALLOWED = [
	"https://dryou.sockeyegames.org",
	"http://localhost:5190",
	"capacitor://localhost",
	"http://localhost",
	"org.sockeyegames.dryou://callback",
];

test("web origins still match", () => {
	expect(
		isRedirectUriAllowed("https://dryou.sockeyegames.org/callback", ALLOWED),
	).toBe(true);
	expect(isRedirectUriAllowed("http://localhost:5190/callback", ALLOWED)).toBe(
		true,
	);
});

test("the iOS Capacitor origin matches", () => {
	expect(redirectOriginKey("capacitor://localhost/callback")).toBe(
		"capacitor://localhost",
	);
	expect(isRedirectUriAllowed("capacitor://localhost/callback", ALLOWED)).toBe(
		true,
	);
});

test("a per-app custom scheme matches", () => {
	expect(
		isRedirectUriAllowed("org.sockeyegames.dryou://callback", ALLOWED),
	).toBe(true);
});

test("a lookalike host is still rejected", () => {
	// The whole point of matching on scheme+authority rather than a prefix.
	expect(
		isRedirectUriAllowed("capacitor://localhost.evil.com/cb", ALLOWED),
	).toBe(false);
	expect(
		isRedirectUriAllowed("https://dryou.sockeyegames.org.evil.com/cb", ALLOWED),
	).toBe(false);
});

test("an unlisted scheme is rejected", () => {
	expect(
		isRedirectUriAllowed("org.sockeyegames.other://callback", ALLOWED),
	).toBe(false);
	expect(isRedirectUriAllowed("javascript:alert(1)", ALLOWED)).toBe(false);
});

test("garbage is rejected rather than thrown", () => {
	expect(redirectOriginKey("not a url")).toBe(null);
	expect(isRedirectUriAllowed("not a url", ALLOWED)).toBe(false);
	expect(isRedirectUriAllowed("", ALLOWED)).toBe(false);
});
