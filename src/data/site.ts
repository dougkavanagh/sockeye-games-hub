export type PageId = "home" | "games" | "privacy" | "about" | "account";

export type GameListing = {
	id: string;
	title: string;
	tagline: string;
	status: "live" | "preview" | "soon";
	href?: string;
	skills: string;
	/** Wide header artwork, produced by `bun run generate:game-art`. */
	art: string;
	/** Accent sampled from the game's own art, used to tint the card. */
	accent: string;
};

export const GAMES: GameListing[] = [
	{
		id: "final-quest",
		title: "Final Quest",
		tagline: "An epic adventure that STEMs from classic fantasy JRPGs.",
		status: "live",
		href: "https://final-quest.sockeyegames.org",
		skills: "Math, STEM, geometry, French, reading & more",
		art: "/images/games/final-quest.webp",
		accent: "#9284b8",
	},
	{
		id: "dryou",
		title: "Doctor You",
		tagline:
			"You are both the patient and the doctor — read the case, order tests, choose treatment, live with the tradeoffs.",
		status: "preview",
		href: "https://dryou.sockeyegames.org",
		skills: "Biology, medicine, critical thinking",
		art: "/images/games/dryou.webp",
		accent: "#e4a794",
	},
	{
		id: "immunitd",
		title: "ImmuniTD",
		tagline:
			"Place immune cells like towers and fight pathogens through real anatomical sites in this biology-driven tower defense.",
		status: "preview",
		href: "https://immunitd.sockeyegames.org",
		skills: "Biology, systems thinking, strategy",
		art: "/images/games/immunitd.webp",
		accent: "#d1525d",
	},
	{
		id: "pizza-perfection",
		title: "Pizza Perfection",
		tagline: "Curious orders, real tools... measure, slice and serve.",
		status: "live",
		href: "https://pizza-perfection.sockeyegames.org",
		skills: "Geometry, measurement, number sense",
		art: "/images/games/pizza-perfection.webp",
		accent: "#e6a44f",
	},
	{
		id: "pharoahs-tomb",
		title: "Pharoah's Tomb",
		tagline:
			"A spine-tingling choose-your-own adventure. Crack codes and chart passages deep inside a buried pyramid.",
		status: "live",
		href: "https://pharoahs-tomb.sockeyegames.org",
		skills: "Literacy, verbal reasoning, logic, patterns",
		art: "/images/games/pharoahs-tomb.webp",
		accent: "#eeb04c",
	},
	{
		id: "temple-of-the-morning-star",
		title: "Temple of the Morning Star",
		tagline:
			"A branching night adventure inside a living Maya city — gather knowledge and escape before dawn.",
		status: "preview",
		href: "https://temple-of-the-morning-star.sockeyegames.org",
		skills: "History, culture, reading & critical thinking",
		art: "/images/games/temple-of-the-morning-star.webp",
		accent: "#4a8fd0",
	},
];

export const PILLARS = [
	{
		title: "Privacy",
		body: "Minimal data. No ads. No selling student information. Parent-owned accounts only.",
	},
	{
		title: "Ease",
		body: "Open a game and play for free.",
	},
	{
		title: "Safety",
		body: "Age-appropriate games with no stranger chat. Built for home first.",
	},
	{
		title: "Learning",
		body: "Real skills inside real game loops, not worksheet skins.",
	},
] as const;
