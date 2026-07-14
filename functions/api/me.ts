import { getSession, json } from "../lib/http";
import type { PagesFn } from "../lib/types";

export const onRequestGet: PagesFn = async (context) => {
	const { request, env } = context;
	const session = await getSession(env, request);
	if (!session) {
		return json(env, request, { authenticated: false }, { status: 401 });
	}

	const profiles = await env.DB.prepare(
		`SELECT id, display_name, birth_year, grade_band, created_at
		 FROM kid_profile WHERE user_id = ? ORDER BY created_at ASC`,
	)
		.bind(session.userId)
		.all<{
			id: string;
			display_name: string;
			birth_year: number | null;
			grade_band: string | null;
			created_at: string;
		}>();

	return json(env, request, {
		authenticated: true,
		email: session.email,
		activeProfileId: session.activeProfileId,
		profiles: (profiles.results ?? []).map((p) => ({
			id: p.id,
			displayName: p.display_name,
			birthYear: p.birth_year,
			gradeBand: p.grade_band,
			createdAt: p.created_at,
		})),
	});
};
