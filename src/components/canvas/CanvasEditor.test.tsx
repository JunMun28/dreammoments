// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { publishInvitationFn } from "@/api/invitations";
import type { CanvasDocument } from "@/lib/canvas/types";
import { createEmptyCanvasDocument } from "@/lib/canvas/types";
import { CanvasEditor } from "./CanvasEditor";

function clearStorageFallback(storage: unknown) {
	const target = storage as {
		clear?: () => void;
		removeItem?: (key: string) => void;
		key?: (index: number) => string | null;
		length?: number;
	};
	if (typeof target.clear === "function") {
		target.clear();
		return;
	}
	if (
		typeof target.removeItem === "function" &&
		typeof target.key === "function" &&
		typeof target.length === "number"
	) {
		for (let index = target.length - 1; index >= 0; index -= 1) {
			const key = target.key(index);
			if (!key) continue;
			target.removeItem(key);
		}
	}
}

vi.mock("@/api/invitations", async () => {
	const actual =
		await vi.importActual<typeof import("@/api/invitations")>(
			"@/api/invitations",
		);
	return {
		...actual,
		publishInvitationFn: vi.fn(),
		updateInvitationFn: vi.fn(async () => ({})),
	};
});

function buildDocument(): CanvasDocument {
	const document = createEmptyCanvasDocument("test-template");
	document.canvas.height = 420;
	document.blocksById = {
		"text-1": {
			id: "text-1",
			type: "text",
			position: { x: 20, y: 20 },
			size: { width: 240, height: 60 },
			zIndex: 0,
			content: { text: "Welcome to our day" },
			style: { fontSize: "20px", color: "#222222" },
			semantic: "announcement-copy",
		},
		"heading-1": {
			id: "heading-1",
			type: "heading",
			position: { x: 20, y: 110 },
			size: { width: 240, height: 56 },
			zIndex: 1,
			content: { text: "Alice & Bob", level: 1 },
			style: { fontSize: "34px", color: "#111111" },
			semantic: "partner-name",
		},
		"image-1": {
			id: "image-1",
			type: "image",
			position: { x: 20, y: 184 },
			size: { width: 220, height: 120 },
			zIndex: 2,
			content: {
				src: "https://images.example/photo.jpg",
				alt: "Couple portrait",
			},
			style: {},
			semantic: "gallery-image",
			sectionId: "gallery",
		},
	};
	document.blockOrder = ["text-1", "heading-1", "image-1"];
	return document;
}

describe("CanvasEditor", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		clearStorageFallback(window.localStorage);
		Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
			configurable: true,
			value: vi.fn(),
		});
		Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
			configurable: true,
			value: vi.fn(),
		});
		if (typeof window.matchMedia !== "function") {
			Object.defineProperty(window, "matchMedia", {
				configurable: true,
				value: vi.fn().mockImplementation((query: string) => ({
					matches: false,
					media: query,
					onchange: null,
					addListener: vi.fn(),
					removeListener: vi.fn(),
					addEventListener: vi.fn(),
					removeEventListener: vi.fn(),
					dispatchEvent: vi.fn(),
				})),
			});
		}
	});

	test("supports shift multi-select", () => {
		render(
			<CanvasEditor
				invitationId="inv-1"
				title="Editor Test"
				initialDocument={buildDocument()}
				previewSlug="test-slug"
			/>,
		);

		const buttons = screen.getAllByRole("button", {
			name: /Canvas block/i,
		});
		fireEvent.click(buttons[0]);
		fireEvent.click(buttons[1], { shiftKey: true });

		expect(screen.getAllByRole("button", { name: "AI" }).length).toBe(2);
	});

	test("inline edit commits text on blur", () => {
		const { container } = render(
			<CanvasEditor
				invitationId="inv-2"
				title="Editor Test"
				initialDocument={buildDocument()}
				previewSlug="test-slug"
			/>,
		);

		const firstBlock = container.querySelector(
			'[data-canvas-block-id="text-1"]',
		) as HTMLElement;
		fireEvent.doubleClick(firstBlock);

		const textbox = container.querySelector(
			'[contenteditable="true"]',
		) as HTMLElement;
		expect(textbox).toBeTruthy();
		fireEvent.input(textbox, {
			currentTarget: { textContent: "Updated welcome text" },
			target: { textContent: "Updated welcome text" },
		});
		fireEvent.blur(textbox);

		expect(screen.getByText("Updated welcome text")).toBeTruthy();
	});

	test("AI action previews first then applies", () => {
		render(
			<CanvasEditor
				invitationId="inv-3"
				title="Editor Test"
				initialDocument={buildDocument()}
				previewSlug="test-slug"
			/>,
		);

		const firstBlock = screen.getAllByRole("button", {
			name: /Canvas block/i,
		})[0];
		fireEvent.click(firstBlock);
		fireEvent.click(screen.getByRole("button", { name: "AI" }));

		expect(screen.getByText("AI suggestions")).toBeTruthy();
		const rewriteButton = screen.getByRole("button", { name: /Rewrite/i });
		fireEvent.click(rewriteButton);

		expect(screen.getAllByText("Welcome to our day").length).toBeGreaterThan(0);
		fireEvent.click(screen.getByRole("button", { name: "Apply" }));
		expect(screen.getAllByText("Welcome to our day ✨").length).toBeGreaterThan(
			0,
		);
	});

	test("property editor can change text and font size", () => {
		const { container } = render(
			<CanvasEditor
				invitationId="inv-4"
				title="Editor Test"
				initialDocument={buildDocument()}
				previewSlug="test-slug"
			/>,
		);

		const firstBlock = screen.getAllByRole("button", {
			name: /Canvas block/i,
		})[0];
		fireEvent.click(firstBlock);

		const textField = screen.getByLabelText("Block text content");
		fireEvent.change(textField, {
			target: { value: "Fresh copy" },
		});

		const fontInput = screen.getByLabelText("Font size");
		fireEvent.change(fontInput, {
			target: { value: "28" },
		});

		expect(screen.getAllByText("Fresh copy").length).toBeGreaterThan(0);
		const blockNode = container.querySelector(
			'[data-canvas-block-id="text-1"]',
		) as HTMLElement;
		expect(blockNode.style.fontSize).toBe("28px");
	});

	test("shows image controls in inspector when image selected", () => {
		render(
			<CanvasEditor
				invitationId="inv-image-1"
				title="Editor Test"
				initialDocument={buildDocument()}
				previewSlug="test-slug"
			/>,
		);

		const blocks = screen.getAllByRole("button", {
			name: /Canvas block/i,
		});
		fireEvent.click(blocks[2]);

		expect(screen.getByLabelText("Image URL")).toBeTruthy();
		expect(screen.getByLabelText("Image alt text")).toBeTruthy();
	});

	test("shows empty inspector state when no selection", () => {
		render(
			<CanvasEditor
				invitationId="inv-empty-1"
				title="Editor Test"
				initialDocument={buildDocument()}
				previewSlug="test-slug"
			/>,
		);

		const firstBlock = screen.getAllByRole("button", {
			name: /Canvas block/i,
		})[0];
		fireEvent.click(firstBlock);
		expect(screen.getByLabelText("Block text content")).toBeTruthy();

		fireEvent.click(screen.getByRole("region", { name: "Invitation canvas" }));
		expect(screen.getByText("Document")).toBeTruthy();
	});

	test("multi-select shows shared controls only", () => {
		render(
			<CanvasEditor
				invitationId="inv-bulk-1"
				title="Editor Test"
				initialDocument={buildDocument()}
				previewSlug="test-slug"
			/>,
		);

		const blocks = screen.getAllByRole("button", {
			name: /Canvas block/i,
		});
		fireEvent.click(blocks[0]);
		fireEvent.click(blocks[1], { shiftKey: true });

		expect(screen.getByText("Shared controls only")).toBeTruthy();
		expect(screen.queryByLabelText("Block text content")).toBeNull();
		expect(screen.getByRole("button", { name: /Delete all/i })).toBeTruthy();
	});

	test("resizes block through resize handle pointer events", () => {
		const { container } = render(
			<CanvasEditor
				invitationId="inv-6"
				title="Editor Test"
				initialDocument={buildDocument()}
				previewSlug="test-slug"
			/>,
		);

		const blockNode = container.querySelector(
			'[data-canvas-block-id="text-1"]',
		) as HTMLElement;
		fireEvent.click(blockNode);

		const resizeHandle = screen.getByRole("button", { name: "Resize block" });
		fireEvent.pointerDown(resizeHandle, {
			button: 0,
			pointerId: 7,
			clientX: 100,
			clientY: 100,
		});
		fireEvent.pointerMove(resizeHandle, {
			pointerId: 7,
			clientX: 140,
			clientY: 130,
		});
		fireEvent.pointerUp(resizeHandle, {
			pointerId: 7,
			clientX: 140,
			clientY: 130,
		});

		const resizedNode = container.querySelector(
			'[data-canvas-block-id="text-1"]',
		) as HTMLElement;
		expect(resizedNode.style.width).toBe("280px");
		expect(resizedNode.style.height).toBe("90px");
	});

	test("publishes with server API when auth token exists", async () => {
		vi.mocked(publishInvitationFn).mockResolvedValue({
			slug: "server-slug",
			status: "published",
			publishedAt: "2026-02-17T08:00:00.000Z",
			templateVersion: "v2",
		} as Awaited<ReturnType<typeof publishInvitationFn>>);

		render(
			<CanvasEditor
				invitationId="inv-7"
				title="Editor Test"
				initialDocument={buildDocument()}
				previewSlug="test-slug"
				token="token-123"
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Publish invitation" }));

		await waitFor(() =>
			expect(vi.mocked(publishInvitationFn)).toHaveBeenCalledWith({
				data: { invitationId: "inv-7", token: "token-123" },
			}),
		);
	});

	test("keeps local edits when initialDocument prop refreshes for same invitation", () => {
		const { rerender } = render(
			<CanvasEditor
				invitationId="inv-8"
				title="Editor Test"
				initialDocument={buildDocument()}
				previewSlug="test-slug"
			/>,
		);

		const firstBlock = screen.getAllByRole("button", {
			name: /Canvas block/i,
		})[0];
		fireEvent.click(firstBlock);
		fireEvent.change(screen.getByLabelText("Block text content"), {
			target: { value: "Persisted text change" },
		});
		expect(screen.getAllByText("Persisted text change").length).toBeGreaterThan(
			0,
		);

		rerender(
			<CanvasEditor
				invitationId="inv-8"
				title="Editor Test"
				initialDocument={buildDocument()}
				previewSlug="test-slug"
			/>,
		);

		expect(screen.getAllByText("Persisted text change").length).toBeGreaterThan(
			0,
		);
	});
});
