// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Use vi.hoisted to define mocks that are used in vi.mock factories
const { mockFabricRect, mockFabricIText, mockFabricLine, mockFabricCanvas } =
	vi.hoisted(() => ({
		mockFabricRect: vi.fn(() => ({
			set: vi.fn().mockReturnThis(),
			setCoords: vi.fn(),
			type: "rect",
		})),
		mockFabricIText: vi.fn(() => ({
			set: vi.fn().mockReturnThis(),
			setCoords: vi.fn(),
			type: "i-text",
			text: "Sample Text",
		})),
		// CE-024: Mock Line for alignment guides
		mockFabricLine: vi.fn(() => ({
			set: vi.fn().mockReturnThis(),
			setCoords: vi.fn(),
			type: "line",
		})),
		mockFabricCanvas: {
			add: vi.fn(),
			remove: vi.fn(),
			renderAll: vi.fn(),
			setActiveObject: vi.fn(),
			// biome-ignore lint/suspicious/noExplicitAny: Mock needs flexible return type for testing
			getActiveObject: vi.fn((): any => null),
			getActiveObjects: vi.fn(() => []),
			discardActiveObject: vi.fn(),
			on: vi.fn(),
			off: vi.fn(),
			dispose: vi.fn(),
			// biome-ignore lint/suspicious/noExplicitAny: Mock needs flexible return type for testing
			getObjects: vi.fn((): any[] => []),
			setWidth: vi.fn(),
			setHeight: vi.fn(),
			requestRenderAll: vi.fn(),
			getZoom: vi.fn(() => 1),
			setZoom: vi.fn(),
			// CE-002: Zoom methods
			getCenterPoint: vi.fn(() => ({ x: 200, y: 350 })),
			zoomToPoint: vi.fn(),
			setViewportTransform: vi.fn(),
			// CE-003: History methods
			toJSON: vi.fn(() => ({ objects: [] })),
			loadFromJSON: vi.fn(() => Promise.resolve()),
			// CE-024: Guide methods
			bringObjectToFront: vi.fn(),
		},
	}));

// Mock Fabric.js - it requires actual DOM canvas which isn't available in jsdom
vi.mock("fabric", () => ({
	Canvas: vi.fn(() => mockFabricCanvas),
	Rect: mockFabricRect,
	IText: mockFabricIText,
	Line: mockFabricLine,
	FabricObject: class {},
	ActiveSelection: vi.fn((objects, options) => ({
		type: "activeselection",
		canvas: options?.canvas,
		forEachObject: vi.fn((cb) => objects.forEach(cb)),
		setCoords: vi.fn(),
		getObjects: vi.fn(() => objects),
	})),
}));

// Mock the InvitationBuilderContext
const mockSetActiveTool = vi.fn();
const mockInvitation = {
	id: "test-invitation-id",
	partner1Name: "Test Partner 1",
	partner2Name: "Test Partner 2",
	editorMode: "canvas",
};

vi.mock("@/contexts/InvitationBuilderContext", () => ({
	useInvitationBuilder: vi.fn(() => ({
		invitation: mockInvitation,
		editorState: {
			activeTool: "info",
			activeSection: null,
			zoomLevel: 1,
			canvasScrollPosition: 0,
		},
		setActiveTool: mockSetActiveTool,
		setZoomLevel: vi.fn(),
		setActiveSection: vi.fn(),
		setCanvasScrollPosition: vi.fn(),
	})),
}));

import { FabricCanvas } from "./FabricCanvas";

describe("FabricCanvas", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	describe("Canvas Foundation (CE-001)", () => {
		it("renders a canvas element in the center panel", async () => {
			render(<FabricCanvas />);

			// Canvas element should be present
			const canvasElement = screen.getByTestId("fabric-canvas");
			expect(canvasElement).toBeDefined();
			expect(canvasElement.tagName.toLowerCase()).toBe("canvas");
		});

		it("displays Add Rectangle button", async () => {
			render(<FabricCanvas />);

			const addRectButton = screen.getByRole("button", {
				name: /add rectangle/i,
			});
			expect(addRectButton).toBeDefined();
		});

		it("displays Add Text button", async () => {
			render(<FabricCanvas />);

			const addTextButton = screen.getByRole("button", { name: /add text/i });
			expect(addTextButton).toBeDefined();
		});

		it("creates a rectangle when Add Rectangle is clicked", async () => {
			const user = userEvent.setup();
			render(<FabricCanvas />);

			const addRectButton = screen.getByRole("button", {
				name: /add rectangle/i,
			});
			await user.click(addRectButton);

			// Verify Fabric.js Rect was constructed with expected properties
			expect(mockFabricRect).toHaveBeenCalledWith(
				expect.objectContaining({
					left: expect.any(Number),
					top: expect.any(Number),
					width: expect.any(Number),
					height: expect.any(Number),
					fill: expect.any(String),
				}),
			);

			// Verify the rectangle was added to canvas
			expect(mockFabricCanvas.add).toHaveBeenCalled();
		});

		it("creates a text element when Add Text is clicked", async () => {
			const user = userEvent.setup();
			render(<FabricCanvas />);

			const addTextButton = screen.getByRole("button", { name: /add text/i });
			await user.click(addTextButton);

			// Verify Fabric.js IText was constructed
			expect(mockFabricIText).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					left: expect.any(Number),
					top: expect.any(Number),
					fontSize: expect.any(Number),
				}),
			);

			// Verify the text was added to canvas
			expect(mockFabricCanvas.add).toHaveBeenCalled();
		});

		it("renders canvas with proper dimensions", async () => {
			render(<FabricCanvas />);

			const canvasElement = screen.getByTestId("fabric-canvas");
			// Check that canvas has width and height attributes
			expect(canvasElement.getAttribute("width")).toBeDefined();
			expect(canvasElement.getAttribute("height")).toBeDefined();
		});

		it("initializes Fabric.js Canvas on mount", async () => {
			const { Canvas } = await import("fabric");
			render(<FabricCanvas />);

			await waitFor(() => {
				expect(Canvas).toHaveBeenCalled();
			});
		});

		it("disposes Fabric.js Canvas on unmount", async () => {
			const { unmount } = render(<FabricCanvas />);

			unmount();

			expect(mockFabricCanvas.dispose).toHaveBeenCalled();
		});

		it("sets up selection event handler for canvas", async () => {
			render(<FabricCanvas />);

			// Verify event listeners were registered
			expect(mockFabricCanvas.on).toHaveBeenCalledWith(
				"selection:created",
				expect.any(Function),
			);
			expect(mockFabricCanvas.on).toHaveBeenCalledWith(
				"selection:updated",
				expect.any(Function),
			);
			expect(mockFabricCanvas.on).toHaveBeenCalledWith(
				"selection:cleared",
				expect.any(Function),
			);
		});

		it("renders without crashing when editorMode is canvas", () => {
			expect(() => render(<FabricCanvas />)).not.toThrow();
		});
	});

	describe("Element Selection", () => {
		it("exposes selected element state", async () => {
			render(<FabricCanvas />);

			// Selection info panel should be visible
			const selectionInfo = screen.getByTestId("selection-info");
			expect(selectionInfo).toBeDefined();
		});

		it("shows 'Nothing selected' when no element is selected", async () => {
			render(<FabricCanvas />);

			expect(screen.getByText(/nothing selected/i)).toBeDefined();
		});
	});

	describe("Canvas Controls", () => {
		it("displays delete button", async () => {
			render(<FabricCanvas />);

			// Delete button should be in the toolbar
			const deleteButton = screen.getByRole("button", {
				name: /delete/i,
			});
			expect(deleteButton).toBeDefined();
		});

		it("delete button is disabled when nothing is selected", async () => {
			render(<FabricCanvas />);

			const deleteButton = screen.getByRole("button", {
				name: /delete/i,
			});
			// Check the disabled attribute
			expect(deleteButton.hasAttribute("disabled")).toBe(true);
		});
	});

	describe("Keyboard Shortcuts (CE-004)", () => {
		it("Delete key removes selected element", async () => {
			const mockObject = { type: "rect", set: vi.fn(), setCoords: vi.fn() };
			mockFabricCanvas.getActiveObject.mockReturnValue(mockObject);

			const user = userEvent.setup();
			render(<FabricCanvas />);

			await user.keyboard("{Delete}");

			expect(mockFabricCanvas.remove).toHaveBeenCalledWith(mockObject);
			expect(mockFabricCanvas.discardActiveObject).toHaveBeenCalled();
		});

		it("Backspace key removes selected element", async () => {
			const mockObject = { type: "rect", set: vi.fn(), setCoords: vi.fn() };
			mockFabricCanvas.getActiveObject.mockReturnValue(mockObject);

			const user = userEvent.setup();
			render(<FabricCanvas />);

			await user.keyboard("{Backspace}");

			expect(mockFabricCanvas.remove).toHaveBeenCalled();
		});

		it("Ctrl+A selects all elements", async () => {
			const mockObjects = [
				{ type: "rect", set: vi.fn() },
				{ type: "i-text", set: vi.fn() },
			];
			mockFabricCanvas.getObjects.mockReturnValue(mockObjects);

			const user = userEvent.setup();
			render(<FabricCanvas />);

			await user.keyboard("{Control>}a{/Control}");

			expect(mockFabricCanvas.setActiveObject).toHaveBeenCalled();
		});

		it("Escape key deselects all elements", async () => {
			const mockObject = { type: "rect", set: vi.fn(), setCoords: vi.fn() };
			mockFabricCanvas.getActiveObject.mockReturnValue(mockObject);

			const user = userEvent.setup();
			render(<FabricCanvas />);

			await user.keyboard("{Escape}");

			expect(mockFabricCanvas.discardActiveObject).toHaveBeenCalled();
		});

		it("Arrow keys nudge selected element by 1px", async () => {
			const mockObject = {
				type: "rect",
				left: 100,
				top: 100,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
			};
			mockFabricCanvas.getActiveObject.mockReturnValue(mockObject);

			const user = userEvent.setup();
			render(<FabricCanvas />);

			await user.keyboard("{ArrowRight}");

			expect(mockObject.set).toHaveBeenCalledWith("left", 101);
		});

		it("Shift+Arrow keys nudge selected element by 10px", async () => {
			const mockObject = {
				type: "rect",
				left: 100,
				top: 100,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
			};
			mockFabricCanvas.getActiveObject.mockReturnValue(mockObject);

			const user = userEvent.setup();
			render(<FabricCanvas />);

			await user.keyboard("{Shift>}{ArrowDown}{/Shift}");

			expect(mockObject.set).toHaveBeenCalledWith("top", 110);
		});

		it("Ctrl+D duplicates selected element", async () => {
			const mockClone = {
				type: "rect",
				left: 100,
				top: 100,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
			};
			const mockObject = {
				type: "rect",
				left: 100,
				top: 100,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
				clone: vi.fn().mockResolvedValue(mockClone),
			};
			mockFabricCanvas.getActiveObject.mockReturnValue(mockObject);

			const user = userEvent.setup();
			render(<FabricCanvas />);

			await user.keyboard("{Control>}d{/Control}");

			await waitFor(() => {
				expect(mockObject.clone).toHaveBeenCalled();
			});
		});

		it("Ctrl+C copies selected element to clipboard", async () => {
			const mockClone = {
				type: "rect",
				left: 100,
				top: 100,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
			};
			const mockObject = {
				type: "rect",
				left: 100,
				top: 100,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
				clone: vi.fn().mockResolvedValue(mockClone),
			};
			mockFabricCanvas.getActiveObject.mockReturnValue(mockObject);

			const user = userEvent.setup();
			render(<FabricCanvas />);

			await user.keyboard("{Control>}c{/Control}");

			await waitFor(() => {
				expect(mockObject.clone).toHaveBeenCalled();
			});
		});

		it("Ctrl+X cuts selected element (copies then deletes)", async () => {
			const mockClone = {
				type: "rect",
				left: 100,
				top: 100,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
			};
			const mockObject = {
				type: "rect",
				left: 100,
				top: 100,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
				clone: vi.fn().mockResolvedValue(mockClone),
			};
			mockFabricCanvas.getActiveObject.mockReturnValue(mockObject);

			const user = userEvent.setup();
			render(<FabricCanvas />);

			await user.keyboard("{Control>}x{/Control}");

			await waitFor(() => {
				expect(mockObject.clone).toHaveBeenCalled();
			});
			await waitFor(() => {
				expect(mockFabricCanvas.remove).toHaveBeenCalled();
			});
		});

		it("does not trigger shortcuts when editing text", async () => {
			const mockTextObject = {
				type: "i-text",
				left: 100,
				top: 100,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
				isEditing: true, // Text is in edit mode
			};
			mockFabricCanvas.getActiveObject.mockReturnValue(mockTextObject);
			mockFabricCanvas.remove.mockClear();

			const user = userEvent.setup();
			render(<FabricCanvas />);

			await user.keyboard("{Delete}");

			// Should NOT delete when in text editing mode
			expect(mockFabricCanvas.remove).not.toHaveBeenCalled();
		});
	});

	describe("Alignment Guides / Smart Guides (CE-024)", () => {
		it("sets up object:moving event handler for alignment guides", async () => {
			render(<FabricCanvas />);

			// Verify object:moving event listener is registered
			expect(mockFabricCanvas.on).toHaveBeenCalledWith(
				"object:moving",
				expect.any(Function),
			);
		});

		it("sets up object:modified event handler to clear guides", async () => {
			render(<FabricCanvas />);

			// Verify object:modified event listener is registered
			expect(mockFabricCanvas.on).toHaveBeenCalledWith(
				"object:modified",
				expect.any(Function),
			);
		});

		it("sets up mouse:up event handler to clear guides", async () => {
			render(<FabricCanvas />);

			// Verify mouse:up event listener is registered
			expect(mockFabricCanvas.on).toHaveBeenCalledWith(
				"mouse:up",
				expect.any(Function),
			);
		});

		it("creates guide line when object center aligns with canvas center", async () => {
			// Canvas dimensions: 400x700, center: (200, 350)
			// Object at center - should trigger vertical alignment guide
			const movingObject = {
				type: "rect",
				left: 125, // left + width/2 = 125 + 75 = 200 (canvas center)
				top: 100,
				width: 150,
				height: 100,
				scaleX: 1,
				scaleY: 1,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
			};

			// Mock getObjects to return empty (only moving object on canvas)
			mockFabricCanvas.getObjects.mockReturnValue([]);

			render(<FabricCanvas />);

			// Get the object:moving handler
			const movingHandler = mockFabricCanvas.on.mock.calls.find(
				(call: unknown[]) => call[0] === "object:moving",
			)?.[1] as ((e: { target?: typeof movingObject }) => void) | undefined;
			expect(movingHandler).toBeDefined();

			// Trigger the moving event
			movingHandler?.({ target: movingObject });

			// Should have created a guide line (Line constructor called)
			expect(mockFabricLine).toHaveBeenCalled();
			// Should have added guide to canvas
			expect(mockFabricCanvas.add).toHaveBeenCalled();
		});

		it("snaps element to canvas center when within threshold", async () => {
			// Canvas center X: 200
			// Moving object center X: 198 (within 5px threshold)
			// Expected snap: left should be adjusted to center element at 200
			const movingObject = {
				type: "rect",
				left: 123, // center would be 123 + 75 = 198 (within 5px of 200)
				top: 100,
				width: 150,
				height: 100,
				scaleX: 1,
				scaleY: 1,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
			};

			mockFabricCanvas.getObjects.mockReturnValue([]);

			render(<FabricCanvas />);

			const movingHandler = mockFabricCanvas.on.mock.calls.find(
				(call: unknown[]) => call[0] === "object:moving",
			)?.[1] as ((e: { target?: typeof movingObject }) => void) | undefined;

			movingHandler?.({ target: movingObject });

			// Element should be snapped - set called with adjusted left position
			// Center X = 200, width = 150, so left = 200 - 75 = 125
			expect(movingObject.set).toHaveBeenCalledWith("left", 125);
		});

		it("snaps element to left canvas edge when within threshold", async () => {
			// Canvas left edge: 0
			// Moving object left: 3 (within 5px threshold)
			const movingObject = {
				type: "rect",
				left: 3,
				top: 100,
				width: 150,
				height: 100,
				scaleX: 1,
				scaleY: 1,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
			};

			mockFabricCanvas.getObjects.mockReturnValue([]);

			render(<FabricCanvas />);

			const movingHandler = mockFabricCanvas.on.mock.calls.find(
				(call: unknown[]) => call[0] === "object:moving",
			)?.[1] as ((e: { target?: typeof movingObject }) => void) | undefined;

			movingHandler?.({ target: movingObject });

			// Element should be snapped to left edge (left = 0)
			expect(movingObject.set).toHaveBeenCalledWith("left", 0);
		});

		it("snaps element right edge to canvas right edge when within threshold", async () => {
			// Canvas width: 400
			// Moving object: left=247, width=150, right edge = 397 (within 5px of 400)
			const movingObject = {
				type: "rect",
				left: 247,
				top: 100,
				width: 150,
				height: 100,
				scaleX: 1,
				scaleY: 1,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
			};

			mockFabricCanvas.getObjects.mockReturnValue([]);

			render(<FabricCanvas />);

			const movingHandler = mockFabricCanvas.on.mock.calls.find(
				(call: unknown[]) => call[0] === "object:moving",
			)?.[1] as ((e: { target?: typeof movingObject }) => void) | undefined;

			movingHandler?.({ target: movingObject });

			// Element should snap right edge to 400, so left = 400 - 150 = 250
			expect(movingObject.set).toHaveBeenCalledWith("left", 250);
		});

		it("snaps element to another element's left edge when aligned", async () => {
			const movingObject = {
				type: "rect",
				left: 98, // within 5px of target left (100)
				top: 200,
				width: 150,
				height: 100,
				scaleX: 1,
				scaleY: 1,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
			};

			const targetObject = {
				type: "rect",
				left: 100,
				top: 50,
				width: 150,
				height: 100,
				scaleX: 1,
				scaleY: 1,
			};

			mockFabricCanvas.getObjects.mockReturnValue([targetObject]);

			render(<FabricCanvas />);

			const movingHandler = mockFabricCanvas.on.mock.calls.find(
				(call: unknown[]) => call[0] === "object:moving",
			)?.[1] as ((e: { target?: typeof movingObject }) => void) | undefined;

			movingHandler?.({ target: movingObject });

			// Should snap left edge to 100
			expect(movingObject.set).toHaveBeenCalledWith("left", 100);
		});

		it("snaps element top edge to canvas top edge when within threshold", async () => {
			// Canvas top: 0
			// Moving object top: 4 (within 5px threshold)
			const movingObject = {
				type: "rect",
				left: 100,
				top: 4,
				width: 150,
				height: 100,
				scaleX: 1,
				scaleY: 1,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
			};

			mockFabricCanvas.getObjects.mockReturnValue([]);

			render(<FabricCanvas />);

			const movingHandler = mockFabricCanvas.on.mock.calls.find(
				(call: unknown[]) => call[0] === "object:moving",
			)?.[1] as ((e: { target?: typeof movingObject }) => void) | undefined;

			movingHandler?.({ target: movingObject });

			// Element should snap to top edge (top = 0)
			expect(movingObject.set).toHaveBeenCalledWith("top", 0);
		});

		it("clears alignment guides when object:modified event fires", async () => {
			render(<FabricCanvas />);

			// First add a guide line
			mockFabricLine.mockClear();
			mockFabricCanvas.add.mockClear();
			mockFabricCanvas.remove.mockClear();

			const movingObject = {
				type: "rect",
				left: 125, // Aligned with canvas center
				top: 100,
				width: 150,
				height: 100,
				scaleX: 1,
				scaleY: 1,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
			};

			mockFabricCanvas.getObjects.mockReturnValue([]);

			// Trigger moving to create guides
			const movingHandler = mockFabricCanvas.on.mock.calls.find(
				(call: unknown[]) => call[0] === "object:moving",
			)?.[1] as ((e: { target?: typeof movingObject }) => void) | undefined;
			movingHandler?.({ target: movingObject });

			// Now trigger modified to clear guides
			const modifiedHandler = mockFabricCanvas.on.mock.calls.find(
				(call: unknown[]) => call[0] === "object:modified",
			)?.[1] as (() => void) | undefined;
			modifiedHandler?.();

			// Guides should be removed from canvas
			expect(mockFabricCanvas.remove).toHaveBeenCalled();
		});

		it("creates guide lines with pink/magenta color", async () => {
			const movingObject = {
				type: "rect",
				left: 125, // center aligned at 200
				top: 100,
				width: 150,
				height: 100,
				scaleX: 1,
				scaleY: 1,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
			};

			mockFabricCanvas.getObjects.mockReturnValue([]);

			render(<FabricCanvas />);

			const movingHandler = mockFabricCanvas.on.mock.calls.find(
				(call: unknown[]) => call[0] === "object:moving",
			)?.[1] as ((e: { target?: typeof movingObject }) => void) | undefined;

			movingHandler?.({ target: movingObject });

			// Line should be created with pink/magenta stroke color
			expect(mockFabricLine).toHaveBeenCalledWith(
				expect.any(Array),
				expect.objectContaining({
					stroke: "#ff0080", // Pink/magenta color as defined in GUIDE_COLOR
				}),
			);
		});

		it("guide lines should not be selectable or evented", async () => {
			const movingObject = {
				type: "rect",
				left: 125,
				top: 100,
				width: 150,
				height: 100,
				scaleX: 1,
				scaleY: 1,
				set: vi.fn().mockReturnThis(),
				setCoords: vi.fn(),
			};

			mockFabricCanvas.getObjects.mockReturnValue([]);

			render(<FabricCanvas />);

			const movingHandler = mockFabricCanvas.on.mock.calls.find(
				(call: unknown[]) => call[0] === "object:moving",
			)?.[1] as ((e: { target?: typeof movingObject }) => void) | undefined;

			movingHandler?.({ target: movingObject });

			// Line should be created with selectable: false and evented: false
			expect(mockFabricLine).toHaveBeenCalledWith(
				expect.any(Array),
				expect.objectContaining({
					selectable: false,
					evented: false,
				}),
			);
		});
	});

	describe("Canvas Height Adjustment (CE-027)", () => {
		it("uses default canvas height of 700px", () => {
			render(<FabricCanvas />);

			const canvasElement = screen.getByTestId("fabric-canvas");
			expect(canvasElement.getAttribute("height")).toBe("700");
		});

		it("uses custom canvas height when provided", () => {
			render(<FabricCanvas canvasHeight={1500} />);

			const canvasElement = screen.getByTestId("fabric-canvas");
			expect(canvasElement.getAttribute("height")).toBe("1500");
		});

		it("updates canvas height when prop changes", () => {
			const { rerender } = render(<FabricCanvas canvasHeight={700} />);

			// Change height
			rerender(<FabricCanvas canvasHeight={2000} />);

			// Verify setHeight was called with new height
			expect(mockFabricCanvas.setHeight).toHaveBeenCalledWith(2000);
		});

		it("requests render after height change", () => {
			const { rerender } = render(<FabricCanvas canvasHeight={700} />);
			mockFabricCanvas.requestRenderAll.mockClear();

			rerender(<FabricCanvas canvasHeight={1400} />);

			expect(mockFabricCanvas.requestRenderAll).toHaveBeenCalled();
		});
	});
});
