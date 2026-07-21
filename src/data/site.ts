export type PageId = "home" | "games" | "privacy" | "about" | "account";

export type GameListing = {
	id: string;
	title: string;
	tagline: string;
	status: "live" | "preview" | "soon";
	href?: string;
	skills: string;
};

export const GAMES: GameListing[] = [
	{
		id: "final-quest",
		title: "Final Quest",
		tagline: "An epic adventure that STEMs from classic fantasy JRPGs.",
		status: "live",
		href: "https://final-quest.sockeyegames.org",
		skills: "Math, STEM, geometry, French, reading & more",
	},
	{
		id: "pizza-perfection",
		title: "Pizza Perfection",
		tagline: "Curious orders, real tools... measure, slice and serve.",
		status: "live",
		href: "https://pizza-perfection.sockeyegames.org",
		skills: "Geometry, measurement, number sense",
	},
	{
		id: "pharoahs-tomb",
		title: "Pharoah's Tomb",
		tagline:
			"A spine-tingling choose-your-own adventure. Crack codes and chart passages deep inside a buried pyramid.",
		status: "live",
		href: "https://pharoahs-tomb.sockeyegames.org",
		skills: "Literacy, verbal reasoning, logic, patterns",
	},
	{
		id: "immune-d",
		title: "Immune D",
		tagline:
			'Your body\'s defenses and medical treatments team up in a "tower D" style war against germs.',
		status: "preview",
		href: "https://immuned.sockeyegames.org",
		skills: "Biology, systems thinking, strategy",
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
