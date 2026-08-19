export type KidProfile = {
	id: string;
	displayName: string;
	birthYear: number | null;
	gradeBand: string | null;
	createdAt: string;
};

export type MeResponse =
	| { authenticated: false }
	| {
			authenticated: true;
			email: string;
			activeProfileId: string | null;
			profiles: KidProfile[];
	  };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(path, {
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...(init?.headers ?? {}),
		},
		...init,
	});
	const data = (await res.json()) as T & { error?: string };
	if (!res.ok) {
		throw new Error(data.error ?? `Request failed (${res.status})`);
	}
	return data;
}

export function fetchMe(): Promise<MeResponse> {
	return fetch("/api/me", { credentials: "include" }).then(async (res) => {
		if (res.status === 401) return { authenticated: false };
		if (!res.ok) throw new Error("Failed to load session");
		return res.json() as Promise<MeResponse>;
	});
}

export function sendMagicLink(email: string, oidcReturn?: string) {
	return api<{ ok: true; emailed: boolean; devVerifyUrl?: string }>(
		"/api/auth/send",
		{
			method: "POST",
			body: JSON.stringify({ email, ...(oidcReturn ? { oidcReturn } : {}) }),
		},
	);
}

export function verifyMagicLink(token: string) {
	return api<{ ok: true; email: string }>("/api/auth/verify", {
		method: "POST",
		body: JSON.stringify({ token }),
	});
}

export function logout() {
	return api<{ ok: true }>("/api/auth/logout", { method: "POST" });
}

export function createProfile(input: {
	displayName: string;
	birthYear?: number | null;
	gradeBand?: string | null;
}) {
	return api<KidProfile>("/api/profiles", {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export function sendContact(input: {
	name: string;
	email: string;
	role?: string;
	message: string;
	turnstileToken: string;
}) {
	return api<{ ok: true; emailed: boolean }>("/api/contact", {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export function selectProfile(profileId: string) {
	return api<{ ok: true; activeProfileId: string }>("/api/profiles", {
		method: "PUT",
		body: JSON.stringify({ profileId }),
	});
}
