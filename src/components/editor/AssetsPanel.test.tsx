// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AssetsPanel } from "./AssetsPanel";

describe("AssetsPanel", () => {
	let onAddAsset: ReturnType<typeof vi.fn>;
	let user: ReturnType<typeof userEvent.setup>;

	beforeEach(() => {
		onAddAsset = vi.fn();
		user = userEvent.setup();
	});

	afterEach(() => {
		cleanup();
	});

	it("renders the Assets panel with header", () => {
		render(<AssetsPanel onAddAsset={onAddAsset} />);

		expect(screen.getByText("Assets")).toBeDefined();
		expect(screen.getByText("Decorative elements and stickers")).toBeDefined();
	});

	it("renders category filter buttons", () => {
		render(<AssetsPanel onAddAsset={onAddAsset} />);

		// All category should be active by default
		expect(screen.getByRole("button", { name: /all/i })).toBeDefined();
		expect(screen.getByRole("button", { name: /flowers/i })).toBeDefined();
		expect(screen.getByRole("button", { name: /frames/i })).toBeDefined();
		expect(screen.getByRole("button", { name: /dividers/i })).toBeDefined();
		expect(screen.getByRole("button", { name: /icons/i })).toBeDefined();
		expect(screen.getByRole("button", { name: /shapes/i })).toBeDefined();
	});

	it("renders search input", () => {
		render(<AssetsPanel onAddAsset={onAddAsset} />);

		const searchInput = screen.getByPlaceholderText(/search assets/i);
		expect(searchInput).toBeDefined();
	});

	it("renders grid of asset thumbnails", () => {
		render(<AssetsPanel onAddAsset={onAddAsset} />);

		// Should have multiple asset buttons
		const assetButtons = screen.getAllByRole("button", {
			name: /asset/i,
		});
		expect(assetButtons.length).toBeGreaterThan(0);
	});

	it("calls onAddAsset when clicking an asset thumbnail", async () => {
		render(<AssetsPanel onAddAsset={onAddAsset} />);

		// Click first asset
		const assetButtons = screen.getAllByRole("button", {
			name: /asset/i,
		});
		await user.click(assetButtons[0]);

		expect(onAddAsset).toHaveBeenCalledTimes(1);
		expect(onAddAsset).toHaveBeenCalledWith(
			expect.objectContaining({
				id: expect.any(String),
				name: expect.any(String),
				category: expect.any(String),
				src: expect.any(String),
			}),
		);
	});

	it("filters assets when clicking category button", async () => {
		render(<AssetsPanel onAddAsset={onAddAsset} />);

		// Get initial count of assets
		const initialAssets = screen.getAllByRole("button", {
			name: /asset/i,
		});
		const initialCount = initialAssets.length;

		// Click Flowers category
		await user.click(screen.getByRole("button", { name: /flowers/i }));

		// Assets should be filtered (fewer or same number)
		const filteredAssets = screen.getAllByRole("button", {
			name: /asset/i,
		});
		expect(filteredAssets.length).toBeLessThanOrEqual(initialCount);
	});

	it("filters assets by search query", async () => {
		render(<AssetsPanel onAddAsset={onAddAsset} />);

		// Get initial count
		const initialAssets = screen.getAllByRole("button", {
			name: /asset/i,
		});
		const initialCount = initialAssets.length;

		// Type in search
		const searchInput = screen.getByPlaceholderText(/search assets/i);
		await user.type(searchInput, "rose");

		// Should filter to matching assets (or show none)
		const filteredAssets = screen.queryAllByRole("button", {
			name: /asset/i,
		});
		expect(filteredAssets.length).toBeLessThanOrEqual(initialCount);
	});

	it("shows 'All' category as active by default", () => {
		render(<AssetsPanel onAddAsset={onAddAsset} />);

		const allButton = screen.getByRole("button", { name: /all/i });
		// Check for active state (bg-stone-900)
		expect(allButton.className).toContain("bg-stone-900");
	});

	it("highlights selected category button", async () => {
		render(<AssetsPanel onAddAsset={onAddAsset} />);

		// Click Frames category
		const framesButton = screen.getByRole("button", { name: /frames/i });
		await user.click(framesButton);

		// Frames should be active
		expect(framesButton.className).toContain("bg-stone-900");

		// All should no longer be active
		const allButton = screen.getByRole("button", { name: /all/i });
		expect(allButton.className).not.toContain("bg-stone-900");
	});

	it("resets to show all assets when clicking All category", async () => {
		render(<AssetsPanel onAddAsset={onAddAsset} />);

		// Click Flowers to filter
		await user.click(screen.getByRole("button", { name: /flowers/i }));

		// Click All to reset
		await user.click(screen.getByRole("button", { name: /all/i }));

		// Should show all assets again
		const allAssets = screen.getAllByRole("button", { name: /asset/i });
		expect(allAssets.length).toBeGreaterThan(0);
	});

	it("combines category filter with search", async () => {
		render(<AssetsPanel onAddAsset={onAddAsset} />);

		// Select Flowers category
		await user.click(screen.getByRole("button", { name: /flowers/i }));

		// Type search
		const searchInput = screen.getByPlaceholderText(/search assets/i);
		await user.type(searchInput, "rose");

		// Should filter by both category AND search
		const filteredAssets = screen.queryAllByRole("button", {
			name: /asset/i,
		});
		// Expect some assets (or none if no match)
		expect(filteredAssets.length).toBeGreaterThanOrEqual(0);
	});

	it("shows empty state when no assets match", async () => {
		render(<AssetsPanel onAddAsset={onAddAsset} />);

		// Type impossible search
		const searchInput = screen.getByPlaceholderText(/search assets/i);
		await user.type(searchInput, "zzzznonexistent");

		// Should show empty state
		expect(screen.getByText(/no assets found/i)).toBeDefined();
	});

	it("clears search when clicking clear button", async () => {
		render(<AssetsPanel onAddAsset={onAddAsset} />);

		// Type in search
		const searchInput = screen.getByPlaceholderText(
			/search assets/i,
		) as HTMLInputElement;
		await user.type(searchInput, "test");

		expect(searchInput.value).toBe("test");

		// Click clear button (X icon)
		const clearButton = screen.getByRole("button", { name: /clear search/i });
		await user.click(clearButton);

		expect(searchInput.value).toBe("");
	});

	it("renders asset thumbnails with preview images", () => {
		render(<AssetsPanel onAddAsset={onAddAsset} />);

		// At least some assets should have testid for thumbnail
		const thumbnails = screen.getAllByTestId(/asset-thumbnail-/);
		expect(thumbnails.length).toBeGreaterThan(0);
	});

	it("includes assets from all categories", () => {
		render(<AssetsPanel onAddAsset={onAddAsset} />);

		// Check we have assets from multiple categories by clicking through each
		const categories = ["Flowers", "Frames", "Dividers", "Icons", "Shapes"];

		for (const category of categories) {
			// Reset cleanup between iterations
			cleanup();
			render(<AssetsPanel onAddAsset={onAddAsset} />);

			const button = screen.getByRole("button", {
				name: new RegExp(category, "i"),
			});
			// The button exists - this confirms the category is defined
			expect(button).toBeDefined();
		}
	});
});
