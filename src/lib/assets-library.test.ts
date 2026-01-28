// @vitest-environment node

import { describe, expect, it } from "vitest";
import {
	ASSET_CATEGORIES,
	ASSETS_LIBRARY,
	type AssetCategory,
	getAssetsByCategory,
	searchAssets,
} from "./assets-library";

/**
 * CE-033: Expanded Materials Library Tests
 *
 * Tests for the comprehensive asset library with:
 * - Wedding Elements (rings, hearts, champagne, cake)
 * - Double Happiness (囍 variations)
 * - Bouquets (floral designs)
 * - Frames (decorative frames)
 * - Icons (wedding-themed icons)
 * - Existing categories expanded
 */

describe("assets-library", () => {
	describe("CE-033: Asset Structure", () => {
		it("exports ASSETS_LIBRARY array", () => {
			expect(Array.isArray(ASSETS_LIBRARY)).toBe(true);
			expect(ASSETS_LIBRARY.length).toBeGreaterThan(0);
		});

		it("exports ASSET_CATEGORIES array", () => {
			expect(Array.isArray(ASSET_CATEGORIES)).toBe(true);
			expect(ASSET_CATEGORIES.length).toBeGreaterThan(0);
		});

		it("each asset has required properties", () => {
			for (const asset of ASSETS_LIBRARY) {
				expect(asset.id).toBeDefined();
				expect(typeof asset.id).toBe("string");

				expect(asset.name).toBeDefined();
				expect(typeof asset.name).toBe("string");

				expect(asset.category).toBeDefined();
				expect(typeof asset.category).toBe("string");

				expect(asset.src).toBeDefined();
				expect(typeof asset.src).toBe("string");

				expect(Array.isArray(asset.tags)).toBe(true);

				expect(typeof asset.width).toBe("number");
				expect(typeof asset.height).toBe("number");
			}
		});

		it("each asset has a unique id", () => {
			const ids = ASSETS_LIBRARY.map((a) => a.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length);
		});
	});

	describe("CE-033: New Categories", () => {
		it("includes Wedding Elements category", () => {
			const categories = ASSET_CATEGORIES.map((c) => c.id);
			expect(categories).toContain("wedding");
		});

		it("includes Double Happiness category", () => {
			const categories = ASSET_CATEGORIES.map((c) => c.id);
			expect(categories).toContain("double-happiness");
		});

		it("includes Bouquets category", () => {
			const categories = ASSET_CATEGORIES.map((c) => c.id);
			expect(categories).toContain("bouquets");
		});

		it("includes expanded Frames category", () => {
			const categories = ASSET_CATEGORIES.map((c) => c.id);
			expect(categories).toContain("frames");
		});
	});

	describe("CE-033: Wedding Elements Assets", () => {
		it("has wedding rings asset", () => {
			const rings = ASSETS_LIBRARY.find((a) => a.tags.includes("rings"));
			expect(rings).toBeDefined();
			expect(rings?.category).toBe("wedding");
		});

		it("has heart assets", () => {
			const hearts = ASSETS_LIBRARY.filter((a) => a.tags.includes("heart"));
			expect(hearts.length).toBeGreaterThan(0);
		});

		it("has champagne/toast assets", () => {
			const champagne = ASSETS_LIBRARY.filter(
				(a) => a.tags.includes("champagne") || a.tags.includes("toast"),
			);
			expect(champagne.length).toBeGreaterThan(0);
		});

		it("has wedding cake asset", () => {
			const cake = ASSETS_LIBRARY.find((a) => a.tags.includes("cake"));
			expect(cake).toBeDefined();
		});
	});

	describe("CE-033: Double Happiness Assets", () => {
		it("has at least 3 double happiness variations", () => {
			const doubleHappiness = ASSETS_LIBRARY.filter(
				(a) => a.category === "double-happiness",
			);
			expect(doubleHappiness.length).toBeGreaterThanOrEqual(3);
		});

		it("double happiness assets have 囍 in tags", () => {
			const doubleHappiness = ASSETS_LIBRARY.filter(
				(a) => a.category === "double-happiness",
			);
			for (const asset of doubleHappiness) {
				expect(
					asset.tags.some(
						(t) => t.includes("囍") || t.includes("double happiness"),
					),
				).toBe(true);
			}
		});
	});

	describe("CE-033: Bouquet Assets", () => {
		it("has at least 5 bouquet designs", () => {
			const bouquets = ASSETS_LIBRARY.filter((a) => a.category === "bouquets");
			expect(bouquets.length).toBeGreaterThanOrEqual(5);
		});

		it("bouquet assets have floral-related tags", () => {
			const bouquets = ASSETS_LIBRARY.filter((a) => a.category === "bouquets");
			for (const bouquet of bouquets) {
				const hasFloralTag = bouquet.tags.some(
					(t) =>
						t.includes("flower") ||
						t.includes("bouquet") ||
						t.includes("floral") ||
						t.includes("rose") ||
						t.includes("peony"),
				);
				expect(hasFloralTag).toBe(true);
			}
		});
	});

	describe("CE-033: Frame Assets", () => {
		it("has at least 5 frame designs", () => {
			const frames = ASSETS_LIBRARY.filter((a) => a.category === "frames");
			expect(frames.length).toBeGreaterThanOrEqual(5);
		});

		it("includes various frame styles", () => {
			const frames = ASSETS_LIBRARY.filter((a) => a.category === "frames");
			const allTags = frames.flatMap((f) => f.tags);

			// Should have variety - ornate, simple, modern, etc.
			const hasVariety =
				allTags.includes("ornate") ||
				allTags.includes("elegant") ||
				allTags.includes("simple") ||
				allTags.includes("modern");
			expect(hasVariety).toBe(true);
		});
	});

	describe("CE-033: getAssetsByCategory", () => {
		it("returns all assets when category is 'all'", () => {
			const result = getAssetsByCategory("all");
			expect(result.length).toBe(ASSETS_LIBRARY.length);
		});

		it("returns only wedding assets when category is 'wedding'", () => {
			const result = getAssetsByCategory("wedding");
			expect(result.every((a) => a.category === "wedding")).toBe(true);
		});

		it("returns only double-happiness assets when category is 'double-happiness'", () => {
			const result = getAssetsByCategory("double-happiness");
			expect(result.every((a) => a.category === "double-happiness")).toBe(true);
		});

		it("returns empty array for unknown category", () => {
			const result = getAssetsByCategory("unknown" as AssetCategory);
			expect(result.length).toBe(0);
		});
	});

	describe("CE-033: searchAssets", () => {
		it("returns all assets for empty query", () => {
			const result = searchAssets("");
			expect(result.length).toBe(ASSETS_LIBRARY.length);
		});

		it("searches by asset name", () => {
			const result = searchAssets("rose");
			expect(result.length).toBeGreaterThan(0);
			expect(
				result.every(
					(a) =>
						a.name.toLowerCase().includes("rose") || a.tags.includes("rose"),
				),
			).toBe(true);
		});

		it("searches by tag", () => {
			const result = searchAssets("wedding");
			expect(result.length).toBeGreaterThan(0);
			expect(
				result.every(
					(a) =>
						a.name.toLowerCase().includes("wedding") ||
						a.tags.some((t) => t.includes("wedding")),
				),
			).toBe(true);
		});

		it("search is case-insensitive", () => {
			const result1 = searchAssets("HEART");
			const result2 = searchAssets("heart");
			expect(result1.length).toBe(result2.length);
		});

		it("can combine with category filter", () => {
			const result = searchAssets("gold", "wedding");
			expect(result.length).toBeGreaterThanOrEqual(0);
			for (const asset of result) {
				expect(asset.category).toBe("wedding");
			}
		});
	});

	describe("CE-033: Asset Sources", () => {
		it("all assets have valid SVG or image sources", () => {
			for (const asset of ASSETS_LIBRARY) {
				expect(
					asset.src.startsWith("data:image/svg+xml") ||
						asset.src.startsWith("data:image/png") ||
						asset.src.startsWith("/assets/"),
				).toBe(true);
			}
		});

		it("assets have reasonable dimensions", () => {
			for (const asset of ASSETS_LIBRARY) {
				expect(asset.width).toBeGreaterThan(0);
				expect(asset.width).toBeLessThanOrEqual(500);
				expect(asset.height).toBeGreaterThan(0);
				expect(asset.height).toBeLessThanOrEqual(500);
			}
		});
	});

	describe("CE-033: Total Asset Count", () => {
		it("has at least 30 total assets", () => {
			expect(ASSETS_LIBRARY.length).toBeGreaterThanOrEqual(30);
		});

		it("has assets in each new category", () => {
			const newCategories = [
				"wedding",
				"double-happiness",
				"bouquets",
				"frames",
				"flowers",
				"dividers",
				"icons",
				"shapes",
			];

			for (const category of newCategories) {
				const assetsInCategory = ASSETS_LIBRARY.filter(
					(a) => a.category === category,
				);
				expect(
					assetsInCategory.length,
					`Category ${category} should have assets`,
				).toBeGreaterThan(0);
			}
		});
	});
});
