import { expect, test } from "bun:test";
import { reviewPasswordOk } from "../functions/lib/account";
import type { Env } from "../functions/lib/http";

test("password sign-in is off when secrets are missing", () => {
	expect(reviewPasswordOk({} as Env, "review@example.com", "secret")).toBe(
		false,
	);
});

test("review password matches only the configured pair", () => {
	const env = {
		APP_REVIEW_EMAIL: "AppStore-Review@sockeyegames.org",
		APP_REVIEW_PASSWORD: "demo-pass",
	} as Env;
	expect(
		reviewPasswordOk(env, "appstore-review@sockeyegames.org", "demo-pass"),
	).toBe(true);
	expect(
		reviewPasswordOk(env, "appstore-review@sockeyegames.org", "nope"),
	).toBe(false);
	expect(reviewPasswordOk(env, "other@example.com", "demo-pass")).toBe(false);
});
