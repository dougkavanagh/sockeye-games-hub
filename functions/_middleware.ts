import { corsHeaders } from "./lib/http";
import type { PagesFn } from "./lib/types";

export const onRequest: PagesFn = async (context) => {
	if (context.request.method === "OPTIONS") {
		return new Response(null, {
			status: 204,
			headers: corsHeaders(context.env, context.request),
		});
	}
	return context.next();
};
