// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

/**
 * CE-011: Text element properties editor tests
 *
 * Acceptance criteria:
 * - Font family picker with Google Fonts options
 * - Font size slider/input (8-200px)
 * - Font weight toggle (normal/bold)
 * - Font style toggle (normal/italic)
 * - Text color picker
 * - Text alignment buttons (left, center, right, justify)
 * - Line height slider
 * - Letter spacing slider
 * - Changes apply in real-time to canvas
 */
describe("CE-011: Text Properties Editor", () => {
	const createTextSelection = (overrides = {}): CanvasSelectionInfo => ({
		type: "i-text",
		object: {
			type: "i-text",
			fontFamily: "serif",
			fontSize: 24,
			fill: "#000000",
			textAlign: "left",
			fontWeight: "normal",
			fontStyle: "normal",
			lineHeight: 1.2,
			charSpacing: 0,
			...overrides,
		} as unknown as IText,
	});

	describe("Font controls", () => {
		it("shows font weight toggle buttons (normal/bold)", () => {
			render(<CanvasPropertiesPanel selection={createTextSelection()} />);

			const boldBtn = screen.getByRole("button", { name: /bold/i });
			expect(boldBtn).toBeDefined();
		});

		it("shows font style toggle buttons (normal/italic)", () => {
			render(<CanvasPropertiesPanel selection={createTextSelection()} />);

			const italicBtn = screen.getByRole("button", { name: /italic/i });
			expect(italicBtn).toBeDefined();
		});

		it("displays font family selector with Google Fonts options", () => {
			render(<CanvasPropertiesPanel selection={createTextSelection()} />);

			const fontSelect = screen.getByLabelText(/font family/i);
			expect(fontSelect).toBeDefined();

			// Should have multiple font options including Google Fonts
			const options = fontSelect.querySelectorAll("option");
			expect(options.length).toBeGreaterThanOrEqual(5);
		});
	});

	describe("Spacing controls", () => {
		it("shows line height slider", () => {
			render(<CanvasPropertiesPanel selection={createTextSelection()} />);

			const lineHeightLabel = screen.getByText(/line height/i);
			expect(lineHeightLabel).toBeDefined();

			// Should have slider for line height
			const sliders = screen.getAllByRole("slider");
			expect(sliders.length).toBeGreaterThanOrEqual(1);
		});

		it("shows letter spacing slider", () => {
			render(<CanvasPropertiesPanel selection={createTextSelection()} />);

			const letterSpacingLabel = screen.getByText(/letter spacing/i);
			expect(letterSpacingLabel).toBeDefined();
		});
	});

	describe("Property change callbacks", () => {
		it("calls onPropertyChange with fontWeight when bold is clicked", async () => {
			const onPropertyChange = vi.fn();
			render(
				<CanvasPropertiesPanel
					selection={createTextSelection()}
					onPropertyChange={onPropertyChange}
				/>,
			);

			const boldBtn = screen.getByRole("button", { name: /bold/i });
			boldBtn.click();

			expect(onPropertyChange).toHaveBeenCalledWith("fontWeight", "bold");
		});

		it("calls onPropertyChange with fontStyle when italic is clicked", async () => {
			const onPropertyChange = vi.fn();
			render(
				<CanvasPropertiesPanel
					selection={createTextSelection()}
					onPropertyChange={onPropertyChange}
				/>,
			);

			const italicBtn = screen.getByRole("button", { name: /italic/i });
			italicBtn.click();

			expect(onPropertyChange).toHaveBeenCalledWith("fontStyle", "italic");
		});

		it("toggles fontWeight back to normal when already bold", async () => {
			const onPropertyChange = vi.fn();
			render(
				<CanvasPropertiesPanel
					selection={createTextSelection({ fontWeight: "bold" })}
					onPropertyChange={onPropertyChange}
				/>,
			);

			const boldBtn = screen.getByRole("button", { name: /bold/i });
			boldBtn.click();

			expect(onPropertyChange).toHaveBeenCalledWith("fontWeight", "normal");
		});

		it("toggles fontStyle back to normal when already italic", async () => {
			const onPropertyChange = vi.fn();
			render(
				<CanvasPropertiesPanel
					selection={createTextSelection({ fontStyle: "italic" })}
					onPropertyChange={onPropertyChange}
				/>,
			);

			const italicBtn = screen.getByRole("button", { name: /italic/i });
			italicBtn.click();

			expect(onPropertyChange).toHaveBeenCalledWith("fontStyle", "normal");
		});
	});
});

/**
 * CE-013: Position/Transform properties editor tests
 *
 * Acceptance criteria:
 * - X position input (pixels from left)
 * - Y position input (pixels from top)
 * - Width input
 * - Height input
 * - Rotation input (degrees)
 * - Lock aspect ratio toggle
 * - Changes sync bidirectionally with canvas
 */
describe("CE-013: Position/Transform Properties Editor", () => {
	const createRectSelection = (overrides = {}): CanvasSelectionInfo => ({
		type: "rect",
		object: {
			type: "rect",
			left: 100,
			top: 150,
			width: 200,
			height: 120,
			scaleX: 1,
			scaleY: 1,
			angle: 0,
			fill: "#c4a373",
			stroke: "#8b7355",
			strokeWidth: 2,
			...overrides,
		} as unknown as Rect,
	});

	const createTextSelection = (overrides = {}): CanvasSelectionInfo => ({
		type: "i-text",
		object: {
			type: "i-text",
			left: 50,
			top: 80,
			width: 150,
			height: 40,
			scaleX: 1,
			scaleY: 1,
			angle: 45,
			fontFamily: "serif",
			fontSize: 24,
			fill: "#000000",
			...overrides,
		} as unknown as IText,
	});

	describe("Transform section visibility", () => {
		it("shows Transform section for rectangle selection", () => {
			render(<CanvasPropertiesPanel selection={createRectSelection()} />);

			const transformHeader = screen.getByText("Transform");
			expect(transformHeader).toBeDefined();
		});

		it("shows Transform section for text selection", () => {
			render(<CanvasPropertiesPanel selection={createTextSelection()} />);

			const transformHeader = screen.getByText("Transform");
			expect(transformHeader).toBeDefined();
		});

		it("shows Transform section for image selection", () => {
			const imageSelection: CanvasSelectionInfo = {
				type: "image",
				object: {
					type: "image",
					left: 0,
					top: 0,
					width: 300,
					height: 200,
					scaleX: 1,
					scaleY: 1,
					angle: 0,
					opacity: 1,
				} as unknown as FabricImage,
			};
			render(<CanvasPropertiesPanel selection={imageSelection} />);

			const transformHeader = screen.getByText("Transform");
			expect(transformHeader).toBeDefined();
		});

		it("does NOT show Transform section when nothing is selected", () => {
			render(<CanvasPropertiesPanel selection={null} />);

			const transformHeader = screen.queryByText("Transform");
			expect(transformHeader).toBeNull();
		});
	});

	describe("Position inputs", () => {
		it("shows X position input with current value", () => {
			render(
				<CanvasPropertiesPanel
					selection={createRectSelection({ left: 100 })}
				/>,
			);

			const xInput = screen.getByLabelText(/^x$/i);
			expect(xInput).toBeDefined();
			expect((xInput as HTMLInputElement).value).toBe("100");
		});

		it("shows Y position input with current value", () => {
			render(
				<CanvasPropertiesPanel selection={createRectSelection({ top: 150 })} />,
			);

			const yInput = screen.getByLabelText(/^y$/i);
			expect(yInput).toBeDefined();
			expect((yInput as HTMLInputElement).value).toBe("150");
		});
	});

	describe("Size inputs", () => {
		it("shows Width input with current value (accounting for scale)", () => {
			render(
				<CanvasPropertiesPanel
					selection={createRectSelection({ width: 200, scaleX: 1 })}
				/>,
			);

			const widthInput = screen.getByLabelText(/^width$/i);
			expect(widthInput).toBeDefined();
			expect((widthInput as HTMLInputElement).value).toBe("200");
		});

		it("shows Height input with current value (accounting for scale)", () => {
			render(
				<CanvasPropertiesPanel
					selection={createRectSelection({ height: 120, scaleY: 1 })}
				/>,
			);

			const heightInput = screen.getByLabelText(/^height$/i);
			expect(heightInput).toBeDefined();
			expect((heightInput as HTMLInputElement).value).toBe("120");
		});

		it("calculates actual size with scale factor", () => {
			render(
				<CanvasPropertiesPanel
					selection={createRectSelection({
						width: 100,
						height: 50,
						scaleX: 2,
						scaleY: 2,
					})}
				/>,
			);

			const widthInput = screen.getByLabelText(/^width$/i);
			const heightInput = screen.getByLabelText(/^height$/i);
			expect((widthInput as HTMLInputElement).value).toBe("200");
			expect((heightInput as HTMLInputElement).value).toBe("100");
		});
	});

	describe("Rotation input", () => {
		it("shows Rotation input with current angle in degrees", () => {
			render(
				<CanvasPropertiesPanel
					selection={createRectSelection({ angle: 45 })}
				/>,
			);

			const rotationInput = screen.getByLabelText(/rotation/i);
			expect(rotationInput).toBeDefined();
			expect((rotationInput as HTMLInputElement).value).toBe("45");
		});

		it("shows 0 degrees for unrotated element", () => {
			render(
				<CanvasPropertiesPanel selection={createRectSelection({ angle: 0 })} />,
			);

			const rotationInput = screen.getByLabelText(/rotation/i);
			expect((rotationInput as HTMLInputElement).value).toBe("0");
		});
	});

	describe("Lock aspect ratio", () => {
		it("shows lock aspect ratio toggle", () => {
			render(<CanvasPropertiesPanel selection={createRectSelection()} />);

			const lockToggle = screen.getByRole("switch", {
				name: /lock aspect ratio/i,
			});
			expect(lockToggle).toBeDefined();
		});

		it("lock toggle is unchecked by default", () => {
			render(<CanvasPropertiesPanel selection={createRectSelection()} />);

			const lockToggle = screen.getByRole("switch", {
				name: /lock aspect ratio/i,
			});
			expect(lockToggle.getAttribute("aria-checked")).toBe("false");
		});
	});

	describe("Property change callbacks", () => {
		it("calls onPropertyChange with left when X is changed", async () => {
			const onPropertyChange = vi.fn();
			render(
				<CanvasPropertiesPanel
					selection={createRectSelection()}
					onPropertyChange={onPropertyChange}
				/>,
			);

			const xInput = screen.getByLabelText(/^x$/i);
			fireEvent.change(xInput, { target: { value: "200" } });

			expect(onPropertyChange).toHaveBeenCalledWith("left", 200);
		});

		it("calls onPropertyChange with top when Y is changed", async () => {
			const onPropertyChange = vi.fn();
			render(
				<CanvasPropertiesPanel
					selection={createRectSelection()}
					onPropertyChange={onPropertyChange}
				/>,
			);

			const yInput = screen.getByLabelText(/^y$/i);
			fireEvent.change(yInput, { target: { value: "250" } });

			expect(onPropertyChange).toHaveBeenCalledWith("top", 250);
		});

		it("calls onPropertyChange with angle when rotation is changed", async () => {
			const onPropertyChange = vi.fn();
			render(
				<CanvasPropertiesPanel
					selection={createRectSelection()}
					onPropertyChange={onPropertyChange}
				/>,
			);

			const rotationInput = screen.getByLabelText(/rotation/i);
			fireEvent.change(rotationInput, { target: { value: "90" } });

			expect(onPropertyChange).toHaveBeenCalledWith("angle", 90);
		});

		it("calls onPropertyChange with scaleX when width is changed", async () => {
			const onPropertyChange = vi.fn();
			render(
				<CanvasPropertiesPanel
					selection={createRectSelection({ width: 100, scaleX: 1 })}
					onPropertyChange={onPropertyChange}
				/>,
			);

			const widthInput = screen.getByLabelText(/^width$/i);
			fireEvent.change(widthInput, { target: { value: "200" } });

			// New width 200, original width 100 -> scaleX = 2
			expect(onPropertyChange).toHaveBeenCalledWith("scaleX", 2);
		});

		it("calls onPropertyChange with scaleY when height is changed", async () => {
			const onPropertyChange = vi.fn();
			render(
				<CanvasPropertiesPanel
					selection={createRectSelection({ height: 50, scaleY: 1 })}
					onPropertyChange={onPropertyChange}
				/>,
			);

			const heightInput = screen.getByLabelText(/^height$/i);
			fireEvent.change(heightInput, { target: { value: "100" } });

			// New height 100, original height 50 -> scaleY = 2
			expect(onPropertyChange).toHaveBeenCalledWith("scaleY", 2);
		});
	});
});
