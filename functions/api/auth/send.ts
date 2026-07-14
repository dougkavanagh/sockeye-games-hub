import {
	hubOrigin,
	isoInMinutes,
	json,
	MAGIC_LINK_MINUTES,
	newId,
	sha256Hex,
} from "../../lib/http";
import type { PagesFn } from "../../lib/types";

type Body = { email?: string };

export const onRequestPost: PagesFn = async (context) => {
	const { request, env } = context;
	let body: Body;
	try {
		body = (await request.json()) as Body;
	} catch {
		return json(env, request, { error: "Invalid JSON" }, { status: 400 });
	}

	const email = body.email?.trim().toLowerCase();
	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return json(
			env,
			request,
			{ error: "Valid email required" },
			{ status: 400 },
		);
	}

	const token = newId() + newId().replace(/-/g, "");
	const tokenHash = await sha256Hex(token);
	const expiresAt = isoInMinutes(MAGIC_LINK_MINUTES);

	await env.DB.prepare(
		`INSERT INTO magic_link (token_hash, email, expires_at) VALUES (?, ?, ?)`,
	)
		.bind(tokenHash, email, expiresAt)
		.run();

	const verifyUrl = `${hubOrigin(env, request)}/#/account?token=${encodeURIComponent(token)}`;

	let emailed = false;
	if (env.RESEND_API_KEY) {
		const from = env.MAGIC_LINK_FROM ?? "Sockeye Games <onboarding@resend.dev>";
		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.RESEND_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from,
				to: [email],
				subject: "Sign in to Sockeye Games",
				text: `Sign in to Sockeye Games:\n\n${verifyUrl}\n\nThis link expires in ${MAGIC_LINK_MINUTES} minutes. If you did not request it, ignore this email.`,
			}),
		});
		emailed = res.ok;
		if (!res.ok) {
			const detail = await res.text();
			console.error("Resend failed", detail);
		}
	} else {
		console.log("[magic-link]", verifyUrl);
	}

	return json(env, request, {
		ok: true,
		emailed,
		// Dev convenience when Resend is not configured
		...(emailed ? {} : { devVerifyUrl: verifyUrl }),
	});
};
