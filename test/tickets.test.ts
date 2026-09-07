import { expect, test } from "bun:test";
import type { Env } from "../functions/lib/http";
import {
	GAME_GITHUB_REPOS,
	githubRepoForGameId,
	HUB_GITHUB_REPO,
	isTrustedReporter,
	trustedReporterEmails,
} from "../functions/lib/tickets";

const emptyEnv = {} as Env;

test("hub and empty gameId map to the core hub repo", () => {
	expect(githubRepoForGameId(null)).toBe(HUB_GITHUB_REPO);
	expect(githubRepoForGameId(undefined)).toBe(HUB_GITHUB_REPO);
	expect(githubRepoForGameId("")).toBe(HUB_GITHUB_REPO);
	expect(githubRepoForGameId("hub")).toBe(HUB_GITHUB_REPO);
});

test("known games map to their repos", () => {
	expect(githubRepoForGameId("final-quest")).toBe("dougkavanagh/final-quest");
	expect(githubRepoForGameId("dryou")).toBe("dougkavanagh/dryou");
	for (const [id, repo] of Object.entries(GAME_GITHUB_REPOS)) {
		expect(githubRepoForGameId(id)).toBe(repo);
	}
});

test("unknown gameId falls back to hub", () => {
	expect(githubRepoForGameId("not-a-game")).toBe(HUB_GITHUB_REPO);
});

test("default trusted email is dougkavanagh@gmail.com", () => {
	expect(trustedReporterEmails(emptyEnv)).toEqual(["dougkavanagh@gmail.com"]);
	expect(isTrustedReporter(emptyEnv, "dougkavanagh@gmail.com")).toBe(true);
	expect(isTrustedReporter(emptyEnv, "DougKavanagh@gmail.com")).toBe(true);
	expect(isTrustedReporter(emptyEnv, "other@example.com")).toBe(false);
});

test("TRUSTED_REPORTER_EMAILS overrides the default", () => {
	const env = {
		TRUSTED_REPORTER_EMAILS: "a@example.com, b@example.com",
	} as Env;
	expect(trustedReporterEmails(env)).toEqual([
		"a@example.com",
		"b@example.com",
	]);
	expect(isTrustedReporter(env, "dougkavanagh@gmail.com")).toBe(false);
	expect(isTrustedReporter(env, "a@example.com")).toBe(true);
});
