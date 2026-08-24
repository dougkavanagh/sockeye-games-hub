#!/usr/bin/env bun
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
	generateFalImageBuffer,
	getFalDelayMs,
	requireFalKey,
} from "./lib/fal-images";

const argv = process.argv.slice(2);
const args = new Set(argv);
const dryRun = args.has("--dry-run");
const force = args.has("--force");
/**
 * `--only=dryou,final-quest` limits the run. Worth reaching for with
 * `--force`: several of the generated images are hand-picked takes, and a
 * blanket `--force` re-rolls them.
 */
const onlyArg = argv.find((a) => a.startsWith("--only="));
const only = onlyArg
	? new Set(
			onlyArg
				.slice("--only=".length)
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
		)
	: null;

const delayMs = getFalDelayMs(2000);

const repoRoot = path.resolve(import.meta.dir, "..");
const outputDir = path.join(repoRoot, "public", "images", "games");

await fs.mkdir(outputDir, { recursive: true });

const STYLE =
	"Bright whimsical painterly illustration for a kids educational game. Vivid saturated colours, soft warm light, playful and inviting, never dark or scary. Wide cinematic banner composition with the subject centered and generous empty sky or space along the bottom edge. Highly detailed. No UI, no text, no letters, no watermark, no logos, no borders.";

/**
 * Matches the `id` of the listing in src/data/site.ts. Art either comes from
 * the game's own repo (`from`, preferred — it keeps the card on-brand with the
 * real game) or is generated to order via fal.ai (`prompt`).
 */
type ArtTask = { slug: string } & (
	| { from: string; prompt?: never }
	| { prompt: string; from?: never }
);

const TASKS: ArtTask[] = [
	{
		slug: "final-quest",
		from: "../final-quest/public/images/screens/title.png",
	},
	{
		slug: "dryou",
		from: "../dryou/public/assets/screens/title.png",
	},
	{
		slug: "immunitd",
		prompt: `${STYLE} Cartoon tower-defense level set inside a blood vessel, viewed at a three-quarter angle like a game board. A clear winding path runs through the middle of the frame; a line of goofy smiling germ characters — round purple and green blobs with little arms — marches along it. Flanking the path stand chunky candy-coloured defence towers built from syringes, pill capsules and shield-carrying white blood cells, firing bright cartoon energy bolts at the germs. Warm red vessel walls, glowing plasma, clean readable game-level layout. Playful and comic, not gross or scary.`,
	},
	{
		slug: "pizza-perfection",
		prompt: `${STYLE} Sunny pizzeria kitchen counter from a low angle. A perfect pizza sliced into clean geometric wedges sits on a wooden peel beside a ruler, protractor and measuring cups. Flour dust catches the light, a wood-fired oven glows warm orange behind. Appetising, tidy, cheerful.`,
	},
	{
		slug: "pharoahs-tomb",
		prompt: `${STYLE} Ancient Egyptian tomb corridor, adventurous rather than frightening. Warm torchlight on carved sandstone walls covered in colourful hieroglyph panels, a golden sarcophagus glowing at the end of the passage, scattered gems and scarab motifs. Rich amber, lapis blue and turquoise palette.`,
	},
	{
		slug: "temple-of-the-morning-star",
		prompt: `${STYLE} Living Maya city at night under a brilliant starry sky with a bright morning star low on the horizon. A grand stepped pyramid lit by braziers, jungle canopy and stone plazas below, warm firelight against deep teal and indigo night. Awe-struck and beautiful, safe and welcoming.`,
	},
];

// Only the fal.ai-generated tasks need a key; imports from game repos don't.
requireFalKey(dryRun || TASKS.every((task) => task.from !== undefined));
await requireCwebp(dryRun);

for (const task of TASKS) {
	if (only && !only.has(task.slug)) continue;
	const outputPath = path.join(outputDir, `${task.slug}.webp`);
	const publicPath = `/images/games/${task.slug}.webp`;

	const exists = await fileExists(outputPath);
	if (exists && !force) {
		console.log(`Skipping existing: ${publicPath}`);
		continue;
	}

	if (dryRun) {
		console.log(`\n[dry-run] ${publicPath}\n${task.prompt}\n`);
		continue;
	}

	console.log(`${task.from ? "Importing" : "Generating"} ${publicPath}...`);
	try {
		const imageData = task.from
			? await fs.readFile(path.resolve(repoRoot, task.from))
			: await generateFalImageBuffer(task.prompt, {
					imageSize: "landscape_16_9",
				});
		// Source art is a ~1024-1584px PNG (~500KB+). The cards render at most ~480px
		// wide, and six of them share the home page, so downscale to a 2x-ish
		// width and re-encode as WebP — roughly a 12x saving per image.
		const tempPng = path.join(
			await fs.mkdtemp(path.join(os.tmpdir(), "sockeye-art-")),
			`${task.slug}.png`,
		);
		await fs.writeFile(tempPng, imageData);
		await encodeWebp(tempPng, outputPath);
		await fs.rm(path.dirname(tempPng), { recursive: true, force: true });
		console.log(`  Saved ${outputPath}`);
	} catch (err) {
		console.error(`  Failed: ${err}`);
	}

	if (delayMs > 0 && !task.from) await sleep(delayMs);
}

console.log("Done.");

async function fileExists(p: string) {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requireCwebp(skip: boolean) {
	if (skip) return;
	const probe = Bun.spawnSync(["cwebp", "-version"]);
	if (!probe.success) {
		console.error("Missing `cwebp`. Install it with: brew install webp");
		process.exit(1);
	}
}

async function encodeWebp(inputPath: string, outputPath: string) {
	const result = Bun.spawnSync([
		"cwebp",
		"-q",
		"82",
		"-resize",
		"960",
		"0",
		inputPath,
		"-o",
		outputPath,
	]);
	if (!result.success) {
		throw new Error(`cwebp failed: ${result.stderr.toString().trim()}`);
	}
}
