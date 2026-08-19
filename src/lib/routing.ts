import { useEffect, useState } from "react";
import type { PageId } from "@/data/site";

const VALID: PageId[] = ["home", "games", "privacy", "about", "account"];

function pageFromHash(): PageId {
	const raw = window.location.hash.replace(/^#\/?/, "") || "home";
	const id = raw.split("?")[0] as PageId;
	return VALID.includes(id) ? id : "home";
}

export function useHashPage(): [PageId, (page: PageId) => void] {
	const [page, setPageState] = useState<PageId>(pageFromHash);

	useEffect(() => {
		const onHash = () => setPageState(pageFromHash());
		window.addEventListener("hashchange", onHash);
		return () => window.removeEventListener("hashchange", onHash);
	}, []);

	const setPage = (next: PageId) => {
		window.location.hash = next === "home" ? "" : `#/${next}`;
		setPageState(next);
	};

	return [page, setPage];
}

export function accountTokenFromUrl(): string | null {
	const hash = window.location.hash;
	const qIndex = hash.indexOf("?");
	if (qIndex === -1) return null;
	return new URLSearchParams(hash.slice(qIndex + 1)).get("token");
}

export function oidcReturnFromUrl(): string | null {
	const hash = window.location.hash;
	const qIndex = hash.indexOf("?");
	if (qIndex === -1) return null;
	return new URLSearchParams(hash.slice(qIndex + 1)).get("oidc_return");
}
