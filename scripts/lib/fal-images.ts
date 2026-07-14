import { Buffer } from "node:buffer";
import { fal } from "@fal-ai/client";

type ImageSize =
	| "square_hd"
	| "square"
	| "portrait_4_3"
	| "portrait_16_9"
	| "landscape_4_3"
	| "landscape_16_9";

type GenerateFalImageOptions = {
	model?: string;
	imageSize?: ImageSize;
	removeBackground?: boolean;
};

type FalImageResult = {
	images?: Array<{ url?: string }>;
	image?: { url?: string };
};

const apiKey = process.env.FAL_KEY ?? process.env.FAL_AI_API_KEY ?? "";
const defaultModel = process.env.FAL_MODEL ?? "fal-ai/flux/dev";

export function requireFalKey(dryRun: boolean) {
	if (!apiKey && !dryRun) {
		console.error(
			"Missing FAL_KEY or FAL_AI_API_KEY. Set it to run image generation.",
		);
		process.exit(1);
	}
	if (!dryRun) {
		fal.config({ credentials: apiKey });
	}
}

export function getFalDelayMs(defaultDelayMs: number) {
	return Number(process.env.FAL_DELAY_MS ?? String(defaultDelayMs));
}

export async function generateFalImageBuffer(
	prompt: string,
	{
		model = defaultModel,
		imageSize = "square_hd",
		removeBackground = false,
	}: GenerateFalImageOptions = {},
): Promise<Buffer> {
	const result = (await fal.subscribe(model, {
		input: { prompt, image_size: imageSize, num_images: 1 },
	})) as { data: FalImageResult };
	return downloadFalImageResult(result.data, removeBackground);
}

async function downloadFalImageResult(
	result: FalImageResult,
	removeBackground: boolean,
) {
	const imageUrl = result.images?.[0]?.url ?? result.image?.url;
	if (!imageUrl) throw new Error("fal.ai did not return an image URL.");

	const finalUrl = removeBackground
		? await removeImageBackground(imageUrl)
		: imageUrl;
	const response = await fetch(finalUrl);
	if (!response.ok) {
		throw new Error(`Failed to download fal.ai image: ${response.status}`);
	}
	return Buffer.from(await response.arrayBuffer());
}

async function removeImageBackground(imageUrl: string) {
	const result = (await fal.subscribe("fal-ai/imageutils/rembg", {
		input: { image_url: imageUrl },
	})) as { data: FalImageResult };
	return result.data.image?.url ?? imageUrl;
}
