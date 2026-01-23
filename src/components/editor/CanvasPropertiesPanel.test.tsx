// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import type { Image as FabricImage, FabricObject, IText, Rect } from "fabric";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	CanvasPropertiesPanel,
	type CanvasSelectionInfo,
} from "./CanvasPropertiesPanel";

// Mock ResizeObserver for Slider component
beforeEach(() => {
	global.ResizeObserver = vi.fn().mockImplementation(() => ({
		observe: vi.fn(),
		unobserve: vi.fn(),
		disconnect: vi.fn(),
	}));
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

/**
 * CE-010: Element-based properties panel tests
 *
 * Acceptance criteria:
 * - No selection: shows page/canvas properties (background color, size)
 * - Text selected: shows text properties (font, size, color, alignment)
 * - Image selected: shows image properties (replace, crop, flip, border)
 * - Widget selected: shows widget-specific config
 * - Multi-selection: shows only common properties
 */
describe("CE-010: CanvasPropertiesPanel", () => {
	describe("No selection (canvas properties)", () => {
		it("shows 'Canvas Properties' header when nothing selected", () => {
			render(<CanvasPropertiesPanel selection={null} />);

			const header = screen.getByText("Canvas Properties");
			expect(header).toBeDefined();
		});

		it("shows background color picker", () => {
			render(<CanvasPropertiesPanel selection={null} />);

			const bgInput = screen.getByLabelText(/background/i);
			expect(bgInput).toBeDefined();
		});

		it("shows canvas dimensions display", () => {
			render(
				<CanvasPropertiesPanel
					selection={null}
					canvasWidth={400}
					canvasHeight={700}
				/>,
			);

			const dimensions = screen.getByText("400 × 700");
			expect(dimensions).toBeDefined();
		});
	});

	describe("Text selection", () => {
		const textSelection: CanvasSelectionInfo = {
			type: "i-text",
			object: {
				type: "i-text",
				fontFamily: "serif",
				fontSize: 24,
				fill: "#000000",
				textAlign: "left",
			} as unknown as IText,
		};

		it("shows 'Text Properties' header when text is selected", () => {
			render(<CanvasPropertiesPanel selection={textSelection} />);

			const header = screen.getByText("Text Properties");
			expect(header).toBeDefined();
		});

		it("shows font family selector", () => {
			render(<CanvasPropertiesPanel selection={textSelection} />);

			const fontSelect = screen.getByLabelText(/font family/i);
			expect(fontSelect).toBeDefined();
		});

		it("shows font size input", () => {
			render(<CanvasPropertiesPanel selection={textSelection} />);

			const sizeInput = screen.getByLabelText(/font size/i);
			expect(sizeInput).toBeDefined();
		});

		it("shows text color picker", () => {
			render(<CanvasPropertiesPanel selection={textSelection} />);

			const colorInput = screen.getByLabelText(/text color/i);
			expect(colorInput).toBeDefined();
		});

		it("shows text alignment buttons", () => {
			render(<CanvasPropertiesPanel selection={textSelection} />);

			const alignGroup = screen.getByRole("group", { name: /alignment/i });
			expect(alignGroup).toBeDefined();
		});
	});

	describe("Rectangle/Shape selection", () => {
		const rectSelection: CanvasSelectionInfo = {
			type: "rect",
			object: {
				type: "rect",
				fill: "#c4a373",
				stroke: "#8b7355",
				strokeWidth: 2,
			} as unknown as Rect,
		};

		it("shows 'Shape Properties' header when rectangle is selected", () => {
			render(<CanvasPropertiesPanel selection={rectSelection} />);

			const header = screen.getByText("Shape Properties");
			expect(header).toBeDefined();
		});

		it("shows fill color picker", () => {
			render(<CanvasPropertiesPanel selection={rectSelection} />);

			const fillInput = screen.getByLabelText(/fill color/i);
			expect(fillInput).toBeDefined();
		});

		it("shows stroke color picker", () => {
			render(<CanvasPropertiesPanel selection={rectSelection} />);

			const strokeInput = screen.getByLabelText(/stroke color/i);
			expect(strokeInput).toBeDefined();
		});

		it("shows stroke width input", () => {
			render(<CanvasPropertiesPanel selection={rectSelection} />);

			const widthInput = screen.getByLabelText(/stroke width/i);
			expect(widthInput).toBeDefined();
		});
	});

	describe("Image selection", () => {
		const imageSelection: CanvasSelectionInfo = {
			type: "image",
			object: {
				type: "image",
				opacity: 1,
			} as unknown as FabricImage,
		};

		it("shows 'Image Properties' header when image is selected", () => {
			render(<CanvasPropertiesPanel selection={imageSelection} />);

			const header = screen.getByText("Image Properties");
			expect(header).toBeDefined();
		});

		it("shows replace image button", () => {
			render(<CanvasPropertiesPanel selection={imageSelection} />);

			const replaceBtn = screen.getByRole("button", { name: /replace/i });
			expect(replaceBtn).toBeDefined();
		});

		it("shows flip horizontal button", () => {
			render(<CanvasPropertiesPanel selection={imageSelection} />);

			const flipHBtn = screen.getByRole("button", { name: /flip horizontal/i });
			expect(flipHBtn).toBeDefined();
		});

		it("shows flip vertical button", () => {
			render(<CanvasPropertiesPanel selection={imageSelection} />);

			const flipVBtn = screen.getByRole("button", { name: /flip vertical/i });
			expect(flipVBtn).toBeDefined();
		});

		it("shows opacity slider", () => {
			render(<CanvasPropertiesPanel selection={imageSelection} />);

			// Radix Slider renders as role="slider"
			const opacitySlider = screen.getByRole("slider");
			expect(opacitySlider).toBeDefined();
		});
	});

	describe("Multi-selection", () => {
		const multiSelection: CanvasSelectionInfo = {
			type: "activeselection",
			object: {
				type: "activeselection",
			} as unknown as FabricObject,
			count: 3,
		};

		it("shows 'Multiple Selected' header for multi-selection", () => {
			render(<CanvasPropertiesPanel selection={multiSelection} />);

			const header = screen.getByText("Multiple Selected");
			expect(header).toBeDefined();
		});

		it("shows count of selected elements", () => {
			render(<CanvasPropertiesPanel selection={multiSelection} />);

			const count = screen.getByText(/3 elements/i);
			expect(count).toBeDefined();
		});

		it("shows common opacity control", () => {
			render(<CanvasPropertiesPanel selection={multiSelection} />);

			// Radix Slider renders as role="slider"
			const opacitySlider = screen.getByRole("slider");
			expect(opacitySlider).toBeDefined();
		});
	});
});
