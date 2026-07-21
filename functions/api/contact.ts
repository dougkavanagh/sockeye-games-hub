import { json, newId } from "../lib/http";
import type { PagesFn } from "../lib/types";

type Body = {
	name?: string;
	email?: string;
	role?: string;
	message?: string;
	turnstileToken?: string;
};

async function verifyTurnstile(
	secret: string,
	token: string,
	ip: string | null,
): Promise<boolean> {
	const form = new FormData();
	form.append("secret", secret);
	form.append("response", token);
	if (ip) form.append("remoteip", ip);

	const res = await fetch(
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		{ method: "POST", body: form },
	);
	if (!res.ok) return false;
	const data = (await res.json()) as { success: boolean };
	return data.success;
}

export const onRequestPost: PagesFn = async (context) => {
	const { request, env } = context;
	let body: Body;
	try {
		body = (await request.json()) as Body;
	} catch {
		return json(env, request, { error: "Invalid JSON" }, { status: 400 });
	}

	const name = body.name?.trim().slice(0, 200);
	const email = body.email?.trim().toLowerCase().slice(0, 200);
	const role = body.role?.trim().slice(0, 60) || null;
	const message = body.message?.trim().slice(0, 5000);
	const turnstileToken = body.turnstileToken?.trim();

	if (
		!name ||
		!email ||
		!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
		!message
	) {
		return json(
			env,
			request,
			{ error: "Name, valid email, and message are required" },
			{ status: 400 },
		);
	}

	if (env.TURNSTILE_SECRET_KEY) {
		if (!turnstileToken) {
			return json(
				env,
				request,
				{ error: "Verification failed, please try again" },
				{ status: 400 },
			);
		}
		const ip = request.headers.get("CF-Connecting-IP");
		const verified = await verifyTurnstile(
			env.TURNSTILE_SECRET_KEY,
			turnstileToken,
			ip,
		);
		if (!verified) {
			return json(
				env,
				request,
				{ error: "Verification failed, please try again" },
				{ status: 400 },
			);
		}
	}

	await env.DB.prepare(
		`INSERT INTO contact_message (id, name, email, role, message) VALUES (?, ?, ?, ?, ?)`,
	)
		.bind(newId(), name, email, role, message)
		.run();

	let emailed = false;
	if (env.RESEND_API_KEY && env.CONTACT_TO_EMAIL) {
		const from = env.MAGIC_LINK_FROM ?? "Sockeye Games <onboarding@resend.dev>";
		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.RESEND_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from,
				to: [env.CONTACT_TO_EMAIL],
				reply_to: email,
				subject: `Sockeye contact: ${name}${role ? ` (${role})` : ""}`,
				text: `From: ${name} <${email}>\nRole: ${role ?? "n/a"}\n\n${message}`,
			}),
		});
		emailed = res.ok;
		if (!res.ok) {
			console.error("Resend failed", await res.text());
		}
	}

	return json(env, request, { ok: true, emailed });
};
