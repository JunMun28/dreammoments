import { describe, expect, test } from "vitest";
import { createDocumentStore } from "./store";
import type { CanvasDocument } from "./types";

function makeDocument(): CanvasDocument {
	return {
		formatVersion: "canvas-v2",
		version: "2.0",
		templateId: "test-template",
		canvas: { width: 390, height: 900 },
		designTokens: {
			colors: {
				background: "#fff",
				text: "#222",
			},
			fonts: {
				heading: "serif",
				body: "sans-serif",
			},
			spacing: 8,
		},
		blockOrder: ["heading-1", "text-1"],
		blocksById: {
			"heading-1": {
				id: "heading-1",
				type: "heading",
				position: { x: 24, y: 48 },
				size: { width: 320, height: 48 },
				zIndex: 0,
				content: { text: "Hello", level: 2 },
				style: {},
			},
			"text-1": {
				id: "text-1",
				type: "text",
				position: { x: 24, y: 118 },
				size: { width: 320, height: 36 },
				zIndex: 1,
				content: { text: "Body copy" },
				style: {},
			},
		},
		metadata: {
			createdAt: "2026-02-17T00:00:00.000Z",
			updatedAt: "2026-02-17T00:00:00.000Z",
			templateVersion: "1.0.0",
		},
	};
}

describe("createDocumentStore", () => {
	test("tracks document mutations and supports undo/redo", () => {
		const store = createDocumentStore(makeDocument());

		store.getState().moveBlock("text-1", { x: 84, y: 130 });

		expect(store.getState().document.blocksById["text-1"]?.position).toEqual({
			x: 84,
			y: 130,
		});
		expect(store.temporal.getState().pastStates).toHaveLength(1);

		store.temporal.getState().undo();
		expect(store.getState().document.blocksById["text-1"]?.position).toEqual({
			x: 24,
			y: 118,
		});

		store.temporal.getState().redo();
		expect(store.getState().document.blocksById["text-1"]?.position).toEqual({
			x: 84,
			y: 130,
		});
	});

	test("does not create undo snapshots for interaction-only state", () => {
		const store = createDocumentStore(makeDocument());

		store.getState().selectBlock("heading-1");
		store.getState().setHoveredBlock("heading-1");
		store.getState().setActiveTool("text");
		store.getState().startEditing("heading-1");
		store.getState().stopEditing();

		expect(store.temporal.getState().pastStates).toHaveLength(0);
	});

	test("supports add, reorder, and remove with normalized z-order", () => {
		const store = createDocumentStore(makeDocument());

		store
			.getState()
			.addBlock(
				"divider",
				{ x: 20, y: 180 },
				{ orientation: "horizontal", color: "#999" },
				{ id: "divider-1", size: { width: 340, height: 2 } },
			);

		store.getState().reorderBlocks(["divider-1", "text-1", "heading-1"]);
		expect(store.getState().document.blockOrder).toEqual([
			"divider-1",
			"text-1",
			"heading-1",
		]);
		expect(store.getState().document.blocksById["divider-1"]?.zIndex).toBe(0);
		expect(store.getState().document.blocksById["text-1"]?.zIndex).toBe(1);
		expect(store.getState().document.blocksById["heading-1"]?.zIndex).toBe(2);

		store.getState().removeBlock("heading-1");
		expect(store.getState().document.blockOrder).toEqual([
			"divider-1",
			"text-1",
		]);
		expect(store.getState().document.blocksById["heading-1"]).toBeUndefined();
		expect(store.getState().document.blocksById["divider-1"]?.zIndex).toBe(0);
		expect(store.getState().document.blocksById["text-1"]?.zIndex).toBe(1);
	});
});
