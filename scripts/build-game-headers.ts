#!/usr/bin/env bun
/**
 * Builds the card header banners in `public/images/games/` from each game's own
 * artwork. Sources live in the sibling game repos, so point `--games-dir` at
 * wherever those are checked out (defaults to the parent of this repo).
 *
 *   bun run build:game-headers
 *   bun run build:game-headers -- --games-dir ~/code --force
 *
 * Outputs are committed, so this only needs re-running when a game's art
 * changes. Anything missing on disk is skipped with a warning.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 520;
const QUALITY = 80;

type Position = "centre" | "top" | "bottom" | "left" | "right";

type CropSpec = {
	/** Game id, matching `GameListing.id` in src/data/site.ts. */
	id: string;
	/** Sibling repo directory name. */
	repo: string;
	/** Artwork path inside that repo. */
	source: string;
	/** Which part of the art to keep when cropping to the banner ratio. */
	position?: Position;
	/** Lift dim art so it still reads at card size. */
	brightness?: number;
};

const CROPS: CropSpec[] = [
	{
		id: "final-quest",
		repo: "final-quest",
		source: "public/images/screens/title.png",
	},
	{
		id: "dryou",
		repo: "dryou",
		source: "public/assets/screens/title.png",
	},
	{
		id: "immunitd",
		repo: "immunitd",
		source: "public/assets/title.jpg",
	},
	{
		id: "pharoahs-tomb",
		repo: "pharoahs-tomb",
		source: "public/images/sphinx_causeway.png",
		brightness: 1.18,
	},
	{
		id: "temple-of-the-morning-star",
		repo: "temple-of-the-morning-star",
		source: "public/images/ruins_dusk.png",
		brightness: 1.1,
	},
];

/**
 * Pizza Perfection has no title screen to crop, so its banner is a flat-lay
 * assembled from the game's own board texture, toppings, tools and characters.
 */
const PIZZA = {
	id: "pizza-perfection",
	repo: "pizza-perfection",
	board: "public/assets/textures/tex-board.jpg",
	cheese: "public/assets/textures/tex-cheese.jpg",
	pie: { cx: 300, cy: 262, d: 400 },
	/** Keyed-out props laid on the board; `cx`/`cy` are centres in output px. */
	props: [
		{
			source: "public/assets/toppings/topping-pepperoni.png",
			cx: 222,
			cy: 168,
			d: 124,
		},
		{
			source: "public/assets/toppings/topping-mushroom.png",
			cx: 388,
			cy: 196,
			d: 128,
		},
		{
			source: "public/assets/toppings/topping-pineapple.png",
			cx: 306,
			cy: 268,
			d: 122,
		},
		{
			source: "public/assets/toppings/topping-olive.png",
			cx: 208,
			cy: 322,
			d: 114,
		},
		{
			source: "public/assets/toppings/topping-pepper.png",
			cx: 392,
			cy: 348,
			d: 126,
		},
		{ source: "public/assets/tools/tool-slicer.png", cx: 690, cy: 292, d: 285 },
		{
			source: "public/assets/tools/tool-protractor.png",
			cx: 905,
			cy: 198,
			d: 255,
		},
		{ source: "public/assets/tools/tool-tape.png", cx: 962, cy: 388, d: 205 },
	],
	/** Painted portraits keep their own backdrop, so they read as medallions. */
	medallions: [
		{
			source: "public/assets/characters/char-mira.png",
			cx: 1090,
			cy: 148,
			d: 190,
		},
	],
};

const args = process.argv.slice(2);
const force = args.includes("--force");
const gamesDir = resolveGamesDir();

const repoRoot = path.resolve(import.meta.dir, "..");
const outputDir = path.join(repoRoot, "public", "images", "games");

await fs.mkdir(outputDir, { recursive: true });

for (const spec of CROPS) {
	const outputPath = path.join(outputDir, `${spec.id}.webp`);
	if (!force && (await exists(outputPath))) {
		console.log(`Skipping existing: ${spec.id}.webp`);
		continue;
	}

	const sourcePath = path.join(gamesDir, spec.repo, spec.source);
	if (!(await exists(sourcePath))) {
		console.warn(`Missing source for ${spec.id}: ${sourcePath}`);
		continue;
	}

	let pipeline = sharp(sourcePath).resize(WIDTH, HEIGHT, {
		fit: "cover",
		position: spec.position ?? "centre",
	});
	if (spec.brightness)
		pipeline = pipeline.modulate({ brightness: spec.brightness });

	await pipeline.webp({ quality: QUALITY }).toFile(outputPath);
	console.log(`Wrote ${spec.id}.webp`);
}

await buildPizzaHeader();

console.log("Done.");

async function buildPizzaHeader() {
	const outputPath = path.join(outputDir, `${PIZZA.id}.webp`);
	if (!force && (await exists(outputPath))) {
		console.log(`Skipping existing: ${PIZZA.id}.webp`);
		return;
	}

	const boardPath = path.join(gamesDir, PIZZA.repo, PIZZA.board);
	const cheesePath = path.join(gamesDir, PIZZA.repo, PIZZA.cheese);
	if (!(await exists(boardPath)) || !(await exists(cheesePath))) {
		console.warn(
			`Missing pizza textures under ${path.join(gamesDir, PIZZA.repo)}`,
		);
		return;
	}

	const layers: sharp.OverlayOptions[] = [];

	const { cx, cy, d } = PIZZA.pie;
	layers.push({
		input: await circleCrop(cheesePath, d),
		left: Math.round(cx - d / 2),
		top: Math.round(cy - d / 2),
	});
	layers.push({
		input: crust(d),
		left: Math.round(cx - d / 2),
		top: Math.round(cy - d / 2),
	});

	for (const prop of PIZZA.props) {
		const propPath = path.join(gamesDir, PIZZA.repo, prop.source);
		if (!(await exists(propPath))) {
			console.warn(`Missing pizza prop: ${propPath}`);
			continue;
		}
		layers.push({
			input: await keyOutBackdrop(propPath, prop.d),
			left: Math.round(prop.cx - prop.d / 2),
			top: Math.round(prop.cy - prop.d / 2),
		});
	}

	for (const medallion of PIZZA.medallions) {
		const medallionPath = path.join(gamesDir, PIZZA.repo, medallion.source);
		if (!(await exists(medallionPath))) {
			console.warn(`Missing pizza medallion: ${medallionPath}`);
			continue;
		}
		layers.push({
			input: await circleCrop(medallionPath, medallion.d, true),
			left: Math.round(medallion.cx - medallion.d / 2),
			top: Math.round(medallion.cy - medallion.d / 2),
		});
	}

	const board = await sharp(boardPath)
		.resize(WIDTH, HEIGHT, { fit: "cover" })
		.modulate({ brightness: 0.9 })
		.toBuffer();

	await sharp(board)
		.composite([...layers, { input: vignette() }])
		.webp({ quality: QUALITY })
		.toFile(outputPath);
	console.log(`Wrote ${PIZZA.id}.webp`);
}

/** Masks a square asset into a circle, optionally with a light rim. */
async function circleCrop(sourcePath: string, diameter: number, rim = false) {
	const r = diameter / 2;
	const mask = Buffer.from(
		`<svg width="${diameter}" height="${diameter}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`,
	);
	const overlays: sharp.OverlayOptions[] = [{ input: mask, blend: "dest-in" }];
	if (rim) {
		overlays.push({
			input: Buffer.from(
				`<svg width="${diameter}" height="${diameter}"><circle cx="${r}" cy="${r}" r="${r - 3}"
					fill="none" stroke="rgba(255,246,232,0.7)" stroke-width="6"/></svg>`,
			),
		});
	}
	return sharp(sourcePath)
		.resize(diameter, diameter, { fit: "cover" })
		.composite(overlays)
		.png()
		.toBuffer();
}

/** Baked crust rim that turns a disc of cheese texture into a pizza. */
function crust(diameter: number) {
	const r = diameter / 2;
	return Buffer.from(
		`<svg width="${diameter}" height="${diameter}">
			<circle cx="${r}" cy="${r}" r="${r - 11}" fill="none" stroke="#c8873f" stroke-width="22"/>
			<circle cx="${r}" cy="${r}" r="${r - 6}" fill="none" stroke="rgba(120,68,22,0.55)" stroke-width="9"/>
			<circle cx="${r}" cy="${r}" r="${r - 24}" fill="none" stroke="rgba(154,86,30,0.35)" stroke-width="7"/>
		</svg>`,
	);
}

/**
 * The game's props are flat icons on a near-uniform cream card. Flood-fill from
 * the edges so they can sit on the board without their backing square.
 */
async function keyOutBackdrop(sourcePath: string, diameter: number) {
	const { data, info } = await sharp(sourcePath)
		.resize(diameter, diameter, {
			fit: "contain",
			background: { r: 253, g: 245, b: 232, alpha: 1 },
		})
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	const { width, height, channels } = info;
	const at = (x: number, y: number) => (y * width + x) * channels;
	const key = [data[0], data[1], data[2]];
	const tolerance = 26;
	const matchesKey = (i: number) =>
		Math.abs(data[i] - key[0]) +
			Math.abs(data[i + 1] - key[1]) +
			Math.abs(data[i + 2] - key[2]) <=
		tolerance * 3;

	const seen = new Uint8Array(width * height);
	const stack: number[] = [];
	for (let x = 0; x < width; x++) {
		stack.push(x, 0, x, height - 1);
	}
	for (let y = 0; y < height; y++) {
		stack.push(0, y, width - 1, y);
	}

	while (stack.length) {
		const y = stack.pop() as number;
		const x = stack.pop() as number;
		if (x < 0 || y < 0 || x >= width || y >= height) continue;
		const p = y * width + x;
		if (seen[p]) continue;
		const i = at(x, y);
		if (!matchesKey(i)) continue;
		seen[p] = 1;
		data[i + 3] = 0;
		stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
	}

	// Soften the cut edge so the icons don't look stamped onto the board.
	return sharp(data, { raw: { width, height, channels } })
		.png()
		.toBuffer()
		.then((buffer) => sharp(buffer).blur(0.4).png().toBuffer());
}

/** Warm corner falloff so the flat-lay reads as lit from the centre. */
function vignette() {
	return Buffer.from(
		`<svg width="${WIDTH}" height="${HEIGHT}">
			<defs>
				<radialGradient id="v" cx="42%" cy="45%" r="74%">
					<stop offset="52%" stop-color="rgba(0,0,0,0)"/>
					<stop offset="100%" stop-color="rgba(12,6,2,0.5)"/>
				</radialGradient>
			</defs>
			<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#v)"/>
		</svg>`,
	);
}

function resolveGamesDir() {
	const index = args.indexOf("--games-dir");
	const value = index >= 0 ? args[index + 1] : undefined;
	return path.resolve(value ?? path.join(import.meta.dir, "..", ".."));
}

async function exists(p: string) {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}
