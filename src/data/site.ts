export type PageId = "home" | "games" | "privacy" | "about" | "account";

export type GameListing = {
	id: string;
	title: string;
	tagline: string;
	status: "live" | "soon";
	href?: string;
	skills: string;
};

export const GAMES: GameListing[] = [
	{
		id: "final-quest",
		title: "Final Quest",
		tagline: "Math vs monsters. Train skills, fight bosses, keep exploring.",
		status: "live",
		href: "https://final-quest.sockeyegames.org",
		skills: "Math, STEM, geometry, French, reading & more",
	},
	{
		id: "pizza-perfection",
		title: "Pizza Perfection",
		tagline: "Curious orders, real tools — slice, measure, and serve.",
		status: "live",
		href: "https://pizza-perfection.sockeyegames.org",
		skills: "Geometry, measurement, number sense",
	},
	{
		id: "pharoahs-tomb",
		title: "Pharoah's Tomb",
		tagline: "Crack codes and chart passages deep inside a buried pyramid.",
		status: "live",
		href: "https://pharoahs-tomb.sockeyegames.org",
		skills: "Logic, patterns, problem solving",
	},
	{
		id: "immune-d",
		title: "Immune D",
		tagline:
			"Command the body's defenses and stop outbreaks before they spread.",
		status: "soon",
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
