import type { Env } from "./http";

/**
 * Loose PagesFunction typing to avoid DOM vs @cloudflare/workers-types
 * Response/Request clashes in the same package.
 */
export type PagesFn = (context: {
	request: Request;
	env: Env;
	params: Record<string, string>;
	next: () => Promise<Response>;
	waitUntil: (promise: Promise<unknown>) => void;
}) => Response | Promise<Response>;
