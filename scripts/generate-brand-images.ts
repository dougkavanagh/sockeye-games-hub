#!/usr/bin/env bun
import { promises as fs } from "node:fs";
import path from "node:path";
import {
	generateFalImageBuffer,
	getFalDelayMs,
	requireFalKey,
} from "./lib/fal-images";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");

const delayMs = getFalDelayMs(2000);

const repoRoot = path.resolve(import.meta.dir, "..");
const outputDir = path.join(repoRoot, "public", "images");

requireFalKey(dryRun);

await fs.mkdir(outputDir, { recursive: true });

const STYLE =
	"Bright whimsical illustration for a kids educational game brand. Vivid saturated colours — turquoise water, emerald forests, sunny sky, punchy sockeye red-orange. Playful and inviting, still calm and nature-rooted. Soft painterly light, not dark or moody. Highly detailed. No UI, no text, no watermark, no logos.";

interface ImageTask {
	slug: string;
	prompt: string;
	imageSize: "landscape_16_9" | "square_hd";
	removeBackground?: boolean;
}

const TASKS: ImageTask[] = [
	{
		slug: "hero",
		imageSize: "landscape_16_9",
		prompt: `${STYLE} Wide Canadian river landscape on a bright clear day. Turquoise river cutting through green forested hills under a luminous sky. A large stylized sockeye salmon leaps prominently in the foreground — vivid red-orange body filling much of the lower-center frame, playful and energetic with a splash of spray. Warm sunlight, cheerful atmosphere. Full-bleed environment art. No people, no boats.`,
	},
	{
		slug: "og",
		imageSize: "landscape_16_9",
		prompt: `${STYLE} Tight composition of a bright Canadian river scene. Large leaping sockeye salmon dominates the center — vivid red-orange flesh, teal accents, expressive and friendly. Turquoise water and green shoreline behind. Strong center focus for social preview. No characters, no people, no text.`,
	},
	{
		slug: "mark",
		imageSize: "square_hd",
		removeBackground: true,
		prompt: `${STYLE} Simple iconic sockeye salmon leaping mid-jump, side view, clean graphic mark suitable for a logo. LARGE fish filling most of the frame. Bright vivid sockeye red-orange body, teal-green fins and belly flash of gold. Friendly slightly whimsical face with a clear eye. Solid form, readable at small sizes. Plain solid light grey background (#c8c8c8). Centered. No scenery, no text, no shadow.`,
	},
	{
		slug: "badge-mark",
		imageSize: "square_hd",
		removeBackground: true,
		prompt: `Extremely simple flat vector icon of a sockeye salmon, side view, swimming left to right. Sticker / app-icon style: bold thick clean black outline (die-cut sticker look), flat solid colour fills, zero gradients, zero texture, zero shading, zero blur, tack sharp crisp vector edges throughout. Only 2-3 flat colours — vivid sockeye red-orange body, small teal-green fin accents, single solid dot eye. Chunky simplified shapes, high contrast, legible at 32px. Centered, fills most of the frame, plain solid light grey background (#c8c8c8), no scenery, no text, no watermark, no drop shadow.`,
	},
];

for (const task of TASKS) {
	const outputPath = path.join(outputDir, `${task.slug}.png`);
	const publicPath = `/images/${task.slug}.png`;

	const exists = await fileExists(outputPath);
	if (exists && !force) {
		console.log(`Skipping existing: ${publicPath}`);
		continue;
	}

	if (dryRun) {
		console.log(`\n[dry-run] ${publicPath}\n${task.prompt}\n`);
		continue;
	}

	console.log(`Generating ${publicPath}...`);
	try {
		const imageData = await generateFalImageBuffer(task.prompt, {
			imageSize: task.imageSize,
			removeBackground: task.removeBackground ?? false,
		});
		await fs.writeFile(outputPath, imageData);
		console.log(`  Saved ${outputPath}`);
	} catch (err) {
		console.error(`  Failed: ${err}`);
	}

	if (delayMs > 0) await sleep(delayMs);
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
