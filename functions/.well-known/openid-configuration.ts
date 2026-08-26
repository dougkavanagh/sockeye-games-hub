import { hubOrigin, json } from "../lib/http";
import type { PagesFn } from "../lib/types";

export const onRequestGet: PagesFn = (context) => {
	const { env, request } = context;
	const iss = hubOrigin(env, request);
	return json(env, request, {
		issuer: iss,
		authorization_endpoint: `${iss}/api/oidc/authorize`,
		token_endpoint: `${iss}/api/oidc/token`,
		userinfo_endpoint: `${iss}/api/oidc/userinfo`,
		response_types_supported: ["code"],
		grant_types_supported: ["authorization_code", "refresh_token"],
		subject_types_supported: ["public"],
		id_token_signing_alg_values_supported: ["HS256"],
		code_challenge_methods_supported: ["S256"],
		scopes_supported: ["openid", "profile", "email", "offline_access"],
		token_endpoint_auth_methods_supported: ["none"],
	});
};
