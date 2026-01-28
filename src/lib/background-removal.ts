/**
 * Background removal utilities using fal.ai
 * Uses BiRefNet model for high-quality background removal
 */

import { fal } from "@fal-ai/client";

export interface BackgroundRemovalResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Initialize fal.ai client with API key
 */
function initFalClient(): boolean {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    return false;
  }
  fal.config({ credentials: apiKey });
  return true;
}

/**
 * Remove background from an image using fal.ai BiRefNet model
 * @param imageData - Image as ArrayBuffer or base64 data URL
 * @returns Result with processed image URL
 */
export async function removeBackground(
  imageData: ArrayBuffer | string,
): Promise<BackgroundRemovalResult> {
  if (!initFalClient()) {
    return {
      success: false,
      error: "FAL_KEY environment variable not set",
    };
  }

  try {
    // Convert ArrayBuffer to base64 data URL if needed
    let imageInput: string;
    if (imageData instanceof ArrayBuffer) {
      const base64 = Buffer.from(imageData).toString("base64");
      imageInput = `data:image/png;base64,${base64}`;
    } else {
      imageInput = imageData;
    }

    // Call fal.ai BiRefNet model for background removal
    const result = await fal.subscribe("fal-ai/birefnet", {
      input: {
        image_url: imageInput,
        model: "General", // Best for general images
        operating_resolution: "1024x1024",
        output_format: "png",
      },
    });

    // biome-ignore lint/suspicious/noExplicitAny: fal.ai response type
    const data = result.data as any;

    if (data?.image?.url) {
      return {
        success: true,
        imageUrl: data.image.url,
      };
    }

    return {
      success: false,
      error: "No image returned from fal.ai",
    };
  } catch (error) {
    console.error("fal.ai background removal error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Background removal failed",
    };
  }
}

/**
 * Check if background removal is available
 */
export function isBackgroundRemovalAvailable(): boolean {
  return !!process.env.FAL_KEY;
}

/**
 * Get background removal provider info
 */
export function getBackgroundRemovalProvider(): string | null {
  if (process.env.FAL_KEY) {
    return "fal.ai";
  }
  return null;
}
