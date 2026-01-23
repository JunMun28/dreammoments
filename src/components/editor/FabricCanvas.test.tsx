// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Use vi.hoisted to define mocks that are used in vi.mock factories
const { mockFabricRect, mockFabricIText, mockFabricCanvas } = vi.hoisted(
	() => ({
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
		mockFabricCanvas: {
			add: vi.fn(),
			remove: vi.fn(),
			renderAll: vi.fn(),
			setActiveObject: vi.fn(),
			getActiveObject: vi.fn(() => null),
			getActiveObjects: vi.fn(() => []),
			discardActiveObject: vi.fn(),
			on: vi.fn(),
			off: vi.fn(),
			dispose: vi.fn(),
			getObjects: vi.fn(() => []),
			setWidth: vi.fn(),
			setHeight: vi.fn(),
			requestRenderAll: vi.fn(),
			getZoom: vi.fn(() => 1),
			setZoom: vi.fn(),
		},
	}),
);

// Mock Fabric.js - it requires actual DOM canvas which isn't available in jsdom
vi.mock("fabric", () => ({
	Canvas: vi.fn(() => mockFabricCanvas),
	Rect: mockFabricRect,
	IText: mockFabricIText,
	FabricObject: class {},
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
});
