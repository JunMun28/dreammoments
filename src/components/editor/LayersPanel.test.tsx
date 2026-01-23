// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { type LayerInfo, LayersPanel } from "./LayersPanel";

// Mock Fabric.js
vi.mock("fabric", () => ({
	Canvas: vi.fn(),
	Rect: vi.fn(),
	IText: vi.fn(),
}));

describe("LayersPanel (CE-014)", () => {
	const mockLayers: LayerInfo[] = [
		{
			id: "layer-3",
			type: "i-text",
			name: "Sample Text",
			visible: true,
			locked: false,
		},
		{
			id: "layer-2",
			type: "image",
			name: "Image",
			visible: true,
			locked: false,
		},
		{
			id: "layer-1",
			type: "rect",
			name: "Rectangle",
			visible: false,
			locked: true,
		},
	];

	it("renders panel title", () => {
		render(
			<LayersPanel
				layers={[]}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
			/>,
		);

		expect(screen.getByText("Layers")).toBeDefined();
	});

	it("shows empty state when no layers", () => {
		render(
			<LayersPanel
				layers={[]}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
			/>,
		);

		expect(screen.getByText("No layers")).toBeDefined();
	});

	it("lists all elements by z-index (top to bottom)", () => {
		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
			/>,
		);

		// Get layer rows by testId - they are ordered top (highest z-index) to bottom
		const layer1 = screen.getByTestId("layer-row-layer-3");
		const layer2 = screen.getByTestId("layer-row-layer-2");
		const layer3 = screen.getByTestId("layer-row-layer-1");

		// Verify text content - top layer first (layer-3), bottom layer last (layer-1)
		expect(layer1.textContent).toContain("Sample Text");
		expect(layer2.textContent).toContain("Image");
		expect(layer3.textContent).toContain("Rectangle");

		// Verify DOM order (first in DOM = top of panel = highest z-index)
		const allLayerRows = [
			screen.getByTestId("layer-row-layer-3"),
			screen.getByTestId("layer-row-layer-2"),
			screen.getByTestId("layer-row-layer-1"),
		];
		const parent = layer1.parentElement;
		if (parent) {
			const children = Array.from(parent.children);
			// First child should be layer-3 (top z-index)
			expect(children[0]).toBe(allLayerRows[0]);
			// Second child should be layer-2
			expect(children[1]).toBe(allLayerRows[1]);
			// Third child should be layer-1 (bottom z-index)
			expect(children[2]).toBe(allLayerRows[2]);
		}
	});

	it("shows element type icon for each layer", () => {
		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
			/>,
		);

		// Text icon for text element
		expect(screen.getByTestId("layer-icon-layer-3")).toBeDefined();
		// Image icon for image element
		expect(screen.getByTestId("layer-icon-layer-2")).toBeDefined();
		// Rectangle icon for rect element
		expect(screen.getByTestId("layer-icon-layer-1")).toBeDefined();
	});

	it("shows element name/preview for each layer", () => {
		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
			/>,
		);

		expect(screen.getByText("Sample Text")).toBeDefined();
		expect(screen.getByText("Image")).toBeDefined();
		expect(screen.getByText("Rectangle")).toBeDefined();
	});

	it("highlights selected layer", () => {
		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId="layer-2"
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
			/>,
		);

		const selectedRow = screen.getByTestId("layer-row-layer-2");
		expect(selectedRow.className).toContain("bg-blue-50");
	});

	it("calls onLayerSelect when clicking layer row", async () => {
		const user = userEvent.setup();
		const onLayerSelect = vi.fn();

		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={onLayerSelect}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
			/>,
		);

		await user.click(screen.getByTestId("layer-row-layer-2"));
		expect(onLayerSelect).toHaveBeenCalledWith("layer-2");
	});

	it("toggles visibility when clicking eye icon", async () => {
		const user = userEvent.setup();
		const onToggleVisibility = vi.fn();

		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={onToggleVisibility}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
			/>,
		);

		// Click eye icon for visible layer
		await user.click(screen.getByTestId("visibility-toggle-layer-3"));
		expect(onToggleVisibility).toHaveBeenCalledWith("layer-3");
	});

	it("shows correct visibility icon state", () => {
		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
			/>,
		);

		// Visible layer should show Eye icon
		const visibleIcon = screen.getByTestId("visibility-toggle-layer-3");
		expect(visibleIcon.getAttribute("aria-label")).toBe("Hide layer");

		// Hidden layer should show EyeOff icon
		const hiddenIcon = screen.getByTestId("visibility-toggle-layer-1");
		expect(hiddenIcon.getAttribute("aria-label")).toBe("Show layer");
	});

	it("toggles lock when clicking lock icon", async () => {
		const user = userEvent.setup();
		const onToggleLock = vi.fn();

		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={onToggleLock}
				onReorderLayers={vi.fn()}
			/>,
		);

		// Click lock icon for unlocked layer
		await user.click(screen.getByTestId("lock-toggle-layer-3"));
		expect(onToggleLock).toHaveBeenCalledWith("layer-3");
	});

	it("shows correct lock icon state", () => {
		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
			/>,
		);

		// Unlocked layer should show Unlock icon
		const unlockedIcon = screen.getByTestId("lock-toggle-layer-3");
		expect(unlockedIcon.getAttribute("aria-label")).toBe("Lock layer");

		// Locked layer should show Lock icon
		const lockedIcon = screen.getByTestId("lock-toggle-layer-1");
		expect(lockedIcon.getAttribute("aria-label")).toBe("Unlock layer");
	});

	it("has draggable attribute on layer rows", () => {
		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
			/>,
		);

		// Get layer rows by testId
		const layerRow1 = screen.getByTestId("layer-row-layer-1");
		const layerRow2 = screen.getByTestId("layer-row-layer-2");
		const layerRow3 = screen.getByTestId("layer-row-layer-3");

		expect(layerRow1.getAttribute("draggable")).toBe("true");
		expect(layerRow2.getAttribute("draggable")).toBe("true");
		expect(layerRow3.getAttribute("draggable")).toBe("true");
	});

	it("handles drag start and sets data transfer", () => {
		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
			/>,
		);

		const layerRow = screen.getByTestId("layer-row-layer-3");
		const mockDataTransfer = {
			setData: vi.fn(),
			effectAllowed: "",
		};

		fireEvent.dragStart(layerRow, { dataTransfer: mockDataTransfer });

		expect(mockDataTransfer.setData).toHaveBeenCalledWith(
			"text/plain",
			"layer-3",
		);
	});

	it("handles drop and calls onReorderLayers", () => {
		const onReorderLayers = vi.fn();

		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={onReorderLayers}
			/>,
		);

		const targetRow = screen.getByTestId("layer-row-layer-2");
		const mockDataTransfer = {
			getData: vi.fn().mockReturnValue("layer-1"),
		};

		fireEvent.drop(targetRow, { dataTransfer: mockDataTransfer });

		// layer-1 dragged to layer-2 position
		expect(onReorderLayers).toHaveBeenCalledWith("layer-1", 1);
	});

	it("shows context menu on right-click", async () => {
		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
				onBringToFront={vi.fn()}
				onSendToBack={vi.fn()}
				onBringForward={vi.fn()}
				onSendBackward={vi.fn()}
			/>,
		);

		const layerRow = screen.getByTestId("layer-row-layer-2");
		fireEvent.contextMenu(layerRow);

		// Context menu items should be visible
		expect(screen.getByText("Bring to Front")).toBeDefined();
		expect(screen.getByText("Send to Back")).toBeDefined();
		expect(screen.getByText("Bring Forward")).toBeDefined();
		expect(screen.getByText("Send Backward")).toBeDefined();
	});

	it("calls onBringToFront from context menu", async () => {
		const user = userEvent.setup();
		const onBringToFront = vi.fn();

		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
				onBringToFront={onBringToFront}
				onSendToBack={vi.fn()}
				onBringForward={vi.fn()}
				onSendBackward={vi.fn()}
			/>,
		);

		// Right-click on layer row to open context menu
		const layerRow = screen.getByTestId("layer-row-layer-2");
		fireEvent.contextMenu(layerRow);

		// Click "Bring to Front"
		await user.click(screen.getByText("Bring to Front"));
		expect(onBringToFront).toHaveBeenCalledWith("layer-2");
	});

	it("calls onSendToBack from context menu", async () => {
		const user = userEvent.setup();
		const onSendToBack = vi.fn();

		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
				onBringToFront={vi.fn()}
				onSendToBack={onSendToBack}
				onBringForward={vi.fn()}
				onSendBackward={vi.fn()}
			/>,
		);

		const layerRow = screen.getByTestId("layer-row-layer-2");
		fireEvent.contextMenu(layerRow);

		await user.click(screen.getByText("Send to Back"));
		expect(onSendToBack).toHaveBeenCalledWith("layer-2");
	});

	it("calls onBringForward from context menu", async () => {
		const user = userEvent.setup();
		const onBringForward = vi.fn();

		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
				onBringToFront={vi.fn()}
				onSendToBack={vi.fn()}
				onBringForward={onBringForward}
				onSendBackward={vi.fn()}
			/>,
		);

		const layerRow = screen.getByTestId("layer-row-layer-2");
		fireEvent.contextMenu(layerRow);

		await user.click(screen.getByText("Bring Forward"));
		expect(onBringForward).toHaveBeenCalledWith("layer-2");
	});

	it("calls onSendBackward from context menu", async () => {
		const user = userEvent.setup();
		const onSendBackward = vi.fn();

		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
				onBringToFront={vi.fn()}
				onSendToBack={vi.fn()}
				onBringForward={vi.fn()}
				onSendBackward={onSendBackward}
			/>,
		);

		const layerRow = screen.getByTestId("layer-row-layer-2");
		fireEvent.contextMenu(layerRow);

		await user.click(screen.getByText("Send Backward"));
		expect(onSendBackward).toHaveBeenCalledWith("layer-2");
	});

	it("dims hidden layers visually", () => {
		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
			/>,
		);

		// Hidden layer should have reduced opacity
		const hiddenRow = screen.getByTestId("layer-row-layer-1");
		expect(hiddenRow.className).toContain("opacity-50");
	});

	it("shows lock indicator on locked layers", () => {
		render(
			<LayersPanel
				layers={mockLayers}
				selectedLayerId={null}
				onLayerSelect={vi.fn()}
				onToggleVisibility={vi.fn()}
				onToggleLock={vi.fn()}
				onReorderLayers={vi.fn()}
			/>,
		);

		// Locked layer should show filled lock icon
		const lockedIcon = screen.getByTestId("lock-toggle-layer-1");
		expect(lockedIcon.getAttribute("data-locked")).toBe("true");
	});
});
