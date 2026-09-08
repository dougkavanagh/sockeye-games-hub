/** Public name vetting.
 *
 * This string is the one account detail strangers see, so the rules matter:
 * it must never carry an email address, and it must survive being pasted with
 * stray whitespace.
 */

import { expect, test } from "bun:test";
import { normalizePublicName } from "../functions/lib/publicName";

test("collapses whitespace and trims", () => {
	const checked = normalizePublicName("  Dr   Frost  ");
	expect(checked).toEqual({ ok: true, name: "Dr Frost" });
});

test("accepts letters beyond ASCII", () => {
	expect(normalizePublicName("Priyā").ok).toBe(true);
});

test("rejects an email address", () => {
	const checked = normalizePublicName("someone@example.com");
	expect(checked.ok).toBe(false);
});

test("rejects too short, too long, and non-string input", () => {
	expect(normalizePublicName("a").ok).toBe(false);
	expect(normalizePublicName("x".repeat(21)).ok).toBe(false);
	expect(normalizePublicName(null).ok).toBe(false);
});

test("rejects markup and leading punctuation", () => {
	expect(normalizePublicName("<b>hi</b>").ok).toBe(false);
	expect(normalizePublicName("-nope").ok).toBe(false);
});
