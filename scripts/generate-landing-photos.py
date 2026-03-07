#!/usr/bin/env python3
"""Generate cinematic tropical wedding photos for the DreamMoments landing page using Gemini."""

import base64
import os
import sys
from pathlib import Path

import requests

# Config
API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL = "gemini-3-pro-image-preview"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "photos" / "landing"

PHOTOS = [
    {
        "filename": "hero-bg.jpg",
        "prompt": (
            "Cinematic wide-angle photograph of a tropical garden wedding venue at golden hour. "
            "A couple in elegant wedding attire stands as silhouettes against warm golden sunlight "
            "filtering through tall coconut palm trees and lush tropical foliage. "
            "Warm earth tones, deep greens, soft golden bokeh. "
            "Shot on 35mm film, shallow depth of field, lens flare. "
            "Southeast Asian tropical setting, Malaysia or Singapore. "
            "16:9 aspect ratio, ultra high resolution, cinematic color grading."
        ),
    },
    {
        "filename": "hero-foliage.jpg",
        "prompt": (
            "Dense tropical foliage forming a natural frame border around the edges of the image. "
            "Monstera leaves, palm fronds, ferns, and tropical flowers in deep greens and warm earth tones. "
            "The center is open with soft, diffused golden light. No people. "
            "Lush Southeast Asian botanical garden aesthetic. "
            "Shot on medium format film, rich colors, soft natural lighting. "
            "16:9 aspect ratio, ultra high resolution, cinematic."
        ),
    },
    {
        "filename": "showcase-ceremony.jpg",
        "prompt": (
            "Beautiful Chinese tea ceremony at an outdoor tropical wedding in Malaysia. "
            "A Chinese couple in traditional red and gold wedding attire performing the tea ceremony "
            "with family elders seated. Tropical garden backdrop with palm trees and hanging lanterns. "
            "Warm, golden afternoon light. Candid, documentary-style photography. "
            "Rich warm tones, cultural details, red and gold accents against lush green foliage. "
            "3:2 aspect ratio, shot on 35mm, cinematic color grading, high resolution."
        ),
    },
    {
        "filename": "showcase-laughter.jpg",
        "prompt": (
            "Candid photograph of a joyful Chinese couple laughing together in a lush tropical garden. "
            "The bride wears an elegant white gown, the groom in a tailored suit. "
            "They are surrounded by tropical plants, palm trees, and soft dappled sunlight. "
            "Genuine, warm, romantic moment. Southeast Asian setting. "
            "Warm earth tones and vibrant greens, shallow depth of field, golden hour light. "
            "3:2 aspect ratio, documentary wedding photography style, high resolution."
        ),
    },
    {
        "filename": "showcase-details.jpg",
        "prompt": (
            "Elegant wedding details flat lay on a large tropical monstera leaf. "
            "Gold wedding bands, a Chinese double happiness symbol card, delicate invitation suite "
            "with dusty rose and gold accents, tropical flowers (orchids, frangipani), "
            "and fine jewelry arranged artfully. Soft natural light from above. "
            "Warm earth tones, gold, dusty rose pink, deep green. "
            "3:2 aspect ratio, styled product photography, high resolution, soft shadows."
        ),
    },
    {
        "filename": "showcase-reception.jpg",
        "prompt": (
            "Grand Chinese wedding reception dinner at an outdoor tropical venue in Malaysia. "
            "Round tables with red and gold table settings, Chinese lanterns hanging from tropical trees, "
            "fairy lights strung overhead. Warm evening ambiance, candle light mixed with lantern glow. "
            "Guests seated at beautifully decorated tables with tropical floral centerpieces. "
            "Rich warm tones, red and gold accents, lush green tropical backdrop. "
            "3:2 aspect ratio, cinematic wide shot, high resolution, warm color grading."
        ),
    },
    {
        "filename": "closing-couple.jpg",
        "prompt": (
            "Romantic cinematic photograph of a wedding couple walking away from camera "
            "down a path through a tropical garden at dusk. Soft purple and golden sky visible "
            "through tall palm trees. The couple holds hands, seen from behind. "
            "Fairy lights or lanterns line the garden path. Dreamy, ethereal atmosphere. "
            "Warm earth tones transitioning to cool dusk blues and purples. "
            "16:9 aspect ratio, shallow depth of field, shot on 35mm film, high resolution, "
            "cinematic color grading, emotional and evocative."
        ),
    },
]


def generate_image(prompt: str) -> bytes | None:
    """Call Gemini API to generate an image from a prompt. Returns image bytes or None."""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]},
    }

    resp = requests.post(API_URL, json=payload, timeout=120)

    if resp.status_code != 200:
        print(f"    API error {resp.status_code}: {resp.text[:300]}")
        return None

    data = resp.json()
    candidates = data.get("candidates", [])
    if not candidates:
        print(f"    No candidates in response")
        return None

    for part in candidates[0]["content"]["parts"]:
        if "inlineData" in part:
            image_b64 = part["inlineData"]["data"]
            return base64.b64decode(image_b64)
        elif "text" in part:
            # Gemini sometimes returns descriptive text alongside the image
            pass

    print("    No image data found in response parts")
    return None


def main():
    if not API_KEY:
        print("ERROR: Set GEMINI_API_KEY environment variable.")
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for i, photo in enumerate(PHOTOS, 1):
        filepath = OUTPUT_DIR / photo["filename"]
        if filepath.exists():
            size_kb = filepath.stat().st_size / 1024
            print(f"[{i}/{len(PHOTOS)}] {photo['filename']} already exists ({size_kb:.0f} KB), skipping.")
            continue

        print(f"[{i}/{len(PHOTOS)}] Generating {photo['filename']}...")

        try:
            image_data = generate_image(photo["prompt"])
            if image_data:
                with open(filepath, "wb") as f:
                    f.write(image_data)
                size_kb = len(image_data) / 1024
                print(f"    Saved {photo['filename']} ({size_kb:.0f} KB)")
            else:
                print(f"    FAILED to generate {photo['filename']}")
        except Exception as e:
            print(f"    ERROR: {e}")

    # Summary
    print("\n--- Summary ---")
    for photo in PHOTOS:
        filepath = OUTPUT_DIR / photo["filename"]
        if filepath.exists():
            size_kb = filepath.stat().st_size / 1024
            print(f"  {photo['filename']}: {size_kb:.0f} KB")
        else:
            print(f"  {photo['filename']}: MISSING")


if __name__ == "__main__":
    main()
