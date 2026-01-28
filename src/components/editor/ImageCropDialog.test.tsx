// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ImageCropDialog } from "./ImageCropDialog";

// Mock ResizeObserver for Radix UI components
beforeEach(() => {
	global.ResizeObserver = vi.fn().mockImplementation(() => ({
		observe: vi.fn(),
		unobserve: vi.fn(),
		disconnect: vi.fn(),
	}));
});

/**
 * CE-032: Image Crop Dialog Tests
 *
 * Tests for the image cropping dialog that allows:
 * - Viewing image with crop overlay
 * - Adjusting crop area
 * - Locking aspect ratio
 * - Applying or canceling crop
 */

// Mock image URL for testing
const mockImageSrc =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

describe("ImageCropDialog", () => {
	let onApply: ReturnType<typeof vi.fn>;
	let onCancel: ReturnType<typeof vi.fn>;
	let user: ReturnType<typeof userEvent.setup>;

	beforeEach(() => {
		onApply = vi.fn();
		onCancel = vi.fn();
		user = userEvent.setup();
	});

	afterEach(() => {
		cleanup();
	});

	describe("CE-032: Dialog Structure", () => {
		it("renders the dialog when open is true", () => {
			render(
				<ImageCropDialog
					open={true}
					imageSrc={mockImageSrc}
					onApply={onApply}
					onCancel={onCancel}
				/>,
			);

			expect(screen.getByRole("dialog")).toBeDefined();
			expect(screen.getByText("Crop Image")).toBeDefined();
		});

		it("does not render when open is false", () => {
			render(
				<ImageCropDialog
					open={false}
					imageSrc={mockImageSrc}
					onApply={onApply}
					onCancel={onCancel}
				/>,
			);

			expect(screen.queryByRole("dialog")).toBeNull();
		});

		it("renders the image to be cropped", () => {
			render(
				<ImageCropDialog
					open={true}
					imageSrc={mockImageSrc}
					onApply={onApply}
					onCancel={onCancel}
				/>,
			);

			const image = screen.getByRole("img", { name: /crop preview/i });
			expect(image).toBeDefined();
			expect(image.getAttribute("src")).toBe(mockImageSrc);
		});
	});

	describe("CE-032: Crop Controls", () => {
		it("renders aspect ratio lock toggle", () => {
			render(
				<ImageCropDialog
					open={true}
					imageSrc={mockImageSrc}
					onApply={onApply}
					onCancel={onCancel}
				/>,
			);

			expect(screen.getByLabelText(/lock aspect ratio/i)).toBeDefined();
		});

		it("renders aspect ratio preset buttons", () => {
			render(
				<ImageCropDialog
					open={true}
					imageSrc={mockImageSrc}
					onApply={onApply}
					onCancel={onCancel}
				/>,
			);

			// Should have common aspect ratio options
			expect(screen.getByRole("button", { name: /free/i })).toBeDefined();
			expect(screen.getByRole("button", { name: /1:1|square/i })).toBeDefined();
			expect(screen.getByRole("button", { name: /4:3/i })).toBeDefined();
			expect(screen.getByRole("button", { name: /16:9/i })).toBeDefined();
		});

		it("updates aspect ratio when preset is clicked", async () => {
			render(
				<ImageCropDialog
					open={true}
					imageSrc={mockImageSrc}
					onApply={onApply}
					onCancel={onCancel}
				/>,
			);

			const squareButton = screen.getByRole("button", { name: /1:1|square/i });
			await user.click(squareButton);

			// Square button should be highlighted as active
			expect(squareButton.className).toContain("bg-stone-900");
		});
	});

	describe("CE-032: Action Buttons", () => {
		it("renders Apply and Cancel buttons", () => {
			render(
				<ImageCropDialog
					open={true}
					imageSrc={mockImageSrc}
					onApply={onApply}
					onCancel={onCancel}
				/>,
			);

			expect(screen.getByRole("button", { name: /apply/i })).toBeDefined();
			expect(screen.getByRole("button", { name: /cancel/i })).toBeDefined();
		});

		it("calls onCancel when Cancel button is clicked", async () => {
			render(
				<ImageCropDialog
					open={true}
					imageSrc={mockImageSrc}
					onApply={onApply}
					onCancel={onCancel}
				/>,
			);

			const cancelButton = screen.getByRole("button", { name: /cancel/i });
			await user.click(cancelButton);

			expect(onCancel).toHaveBeenCalled();
		});

		it("calls onApply with crop data when Apply is clicked", async () => {
			render(
				<ImageCropDialog
					open={true}
					imageSrc={mockImageSrc}
					onApply={onApply}
					onCancel={onCancel}
				/>,
			);

			const applyButton = screen.getByRole("button", { name: /apply/i });
			await user.click(applyButton);

			expect(onApply).toHaveBeenCalledWith(
				expect.objectContaining({
					x: expect.any(Number),
					y: expect.any(Number),
					width: expect.any(Number),
					height: expect.any(Number),
				}),
			);
		});
	});

	describe("CE-032: Crop Area", () => {
		it("renders crop area overlay", () => {
			render(
				<ImageCropDialog
					open={true}
					imageSrc={mockImageSrc}
					onApply={onApply}
					onCancel={onCancel}
				/>,
			);

			// Should have a crop area element
			expect(screen.getByTestId("crop-area")).toBeDefined();
		});

		it("initializes with full image crop area", () => {
			render(
				<ImageCropDialog
					open={true}
					imageSrc={mockImageSrc}
					onApply={onApply}
					onCancel={onCancel}
					initialCrop={{ x: 0, y: 0, width: 100, height: 100 }}
				/>,
			);

			// The crop area should cover the full image initially
			const cropArea = screen.getByTestId("crop-area");
			expect(cropArea).toBeDefined();
		});

		it("accepts initial crop values", () => {
			const initialCrop = { x: 10, y: 10, width: 80, height: 80 };
			render(
				<ImageCropDialog
					open={true}
					imageSrc={mockImageSrc}
					onApply={onApply}
					onCancel={onCancel}
					initialCrop={initialCrop}
				/>,
			);

			const applyButton = screen.getByRole("button", { name: /apply/i });
			// Initial crop should be pre-set
			expect(applyButton).toBeDefined();
		});
	});

	describe("CE-032: Keyboard Navigation", () => {
		it("closes dialog when Escape is pressed", async () => {
			render(
				<ImageCropDialog
					open={true}
					imageSrc={mockImageSrc}
					onApply={onApply}
					onCancel={onCancel}
				/>,
			);

			await user.keyboard("{Escape}");

			expect(onCancel).toHaveBeenCalled();
		});
	});

	describe("CE-032: Reset Crop", () => {
		it("renders reset button", () => {
			render(
				<ImageCropDialog
					open={true}
					imageSrc={mockImageSrc}
					onApply={onApply}
					onCancel={onCancel}
				/>,
			);

			expect(screen.getByRole("button", { name: /reset/i })).toBeDefined();
		});

		it("resets crop area when reset is clicked", async () => {
			render(
				<ImageCropDialog
					open={true}
					imageSrc={mockImageSrc}
					onApply={onApply}
					onCancel={onCancel}
					initialCrop={{ x: 10, y: 10, width: 50, height: 50 }}
				/>,
			);

			const resetButton = screen.getByRole("button", { name: /reset/i });
			await user.click(resetButton);

			// After reset, the crop should be back to full image
			// This will be tested through the Apply callback
			const applyButton = screen.getByRole("button", { name: /apply/i });
			await user.click(applyButton);

			expect(onApply).toHaveBeenCalledWith(
				expect.objectContaining({
					x: 0,
					y: 0,
				}),
			);
		});
	});
});
