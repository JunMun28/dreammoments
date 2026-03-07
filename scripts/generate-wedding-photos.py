"""Generate wedding couple images using Gemini API for the Double Happiness template."""

import os
import sys
import time

from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "photos")
os.makedirs(OUTPUT_DIR, exist_ok=True)

STYLE_PREFIX = (
    "Modern luxury wedding photography, champagne/cream/espresso color palette, "
    "soft editorial film quality, warm tones, Chinese couple features, "
    "cinematic shallow depth of field, professional studio quality"
)

IMAGES = [
    ("hero-couple.jpg", f"{STYLE_PREFIX}, full-length formal couple portrait in a luxury garden setting, the groom in a dark tailored suit and the bride in an elegant modern gown, champagne and warm gold ambient light, wide shot with beautiful bokeh background"),
    ("groom-portrait.jpg", f"{STYLE_PREFIX}, individual portrait of a Chinese groom, dark tailored suit, confident warm expression, warm bokeh background, natural light"),
    ("bride-portrait.jpg", f"{STYLE_PREFIX}, individual portrait of a Chinese bride, modern elegant gown or qipao, soft gold tones, gentle smile, warm ambient light"),
    ("couple-walking.jpg", f"{STYLE_PREFIX}, couple walking hand-in-hand along a garden path, natural afternoon light, candid moment, flowing dress movement"),
    ("garden-portrait.jpg", f"{STYLE_PREFIX}, couple seated together in a blooming flower garden, warm afternoon golden hour light, romantic and relaxed pose"),
    ("candid-laugh.jpg", f"{STYLE_PREFIX}, candid laughing moment between the couple, close crop, natural joy and connection, warm tones"),
    ("ceremony-moment.jpg", f"{STYLE_PREFIX}, wedding ceremony moment, exchanging rings or vows, soft focus background, emotional and intimate"),
    ("detail-rings.jpg", f"{STYLE_PREFIX}, close-up of wedding rings on intertwined hands, champagne styling, soft bokeh, warm gold tones"),
    ("detail-bouquet.jpg", f"{STYLE_PREFIX}, bride holding a champagne and white rose bouquet, soft focus, elegant styling, cream and gold tones"),
    ("couple-sunset.jpg", f"{STYLE_PREFIX}, couple silhouetted against a golden sunset, warm orange and champagne sky, romantic wide shot"),
    ("reception-toast.jpg", f"{STYLE_PREFIX}, couple raising champagne glasses at a beautifully set reception table, warm ambient lighting, celebration mood"),
    ("couple-close.jpg", f"{STYLE_PREFIX}, close romantic portrait of the couple, foreheads touching, eyes closed, warm intimate tones, shallow depth of field"),
]


def generate_image(filename: str, prompt: str) -> bool:
    output_path = os.path.join(OUTPUT_DIR, filename)
    print(f"Generating: {filename}...")

    try:
        aspect = "3:4" if "portrait" in filename or "close" in filename else "3:2"
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"],
                image_config=types.ImageConfig(
                    aspect_ratio=aspect,
                ),
            ),
        )

        for part in response.parts:
            if part.inline_data:
                image = part.as_image()
                image.save(output_path)
                print(f"  Saved: {output_path}")
                return True

        print(f"  WARNING: No image returned for {filename}")
        return False

    except Exception as e:
        print(f"  ERROR generating {filename}: {e}")
        return False


def main():
    print(f"Generating {len(IMAGES)} wedding photos...")
    print(f"Output directory: {OUTPUT_DIR}\n")

    success = 0
    failed = 0

    for filename, prompt in IMAGES:
        if generate_image(filename, prompt):
            success += 1
        else:
            failed += 1
        # Brief pause between API calls to avoid rate limiting
        time.sleep(2)

    print(f"\nDone! {success} succeeded, {failed} failed.")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
