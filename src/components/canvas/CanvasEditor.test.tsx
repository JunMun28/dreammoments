// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { publishInvitationFn } from "@/api/invitations";
import type { CanvasDocument } from "@/lib/canvas/types";
import { createEmptyCanvasDocument } from "@/lib/canvas/types";
import { publishInvitation, updateInvitation } from "@/lib/data";
import { CanvasEditor } from "./CanvasEditor";

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

vi.mock("@/lib/data", async () => {
	const actual =
		await vi.importActual<typeof import("@/lib/data")>("@/lib/data");
	return {
		...actual,
		publishInvitation: vi.fn(),
		updateInvitation: vi.fn(),
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
	};
	document.blockOrder = ["text-1", "heading-1"];
	return document;
}

describe("CanvasEditor", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		window.localStorage.clear();
		Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
			configurable: true,
			value: vi.fn(),
		});
		Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
			configurable: true,
			value: vi.fn(),
		});
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

		expect(screen.getAllByRole("button", { name: "AI actions" }).length).toBe(
			2,
		);
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
		fireEvent.click(screen.getByRole("button", { name: "AI actions" }));

		expect(screen.getByText("AI suggestions")).toBeTruthy();
		const rewriteButton = screen.getByRole("button", { name: /Rewrite/i });
		fireEvent.click(rewriteButton);

		expect(screen.getByText("Welcome to our day")).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Apply" }));
		expect(screen.getByText("Welcome to our day ✨")).toBeTruthy();
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

		expect(screen.getByText("Fresh copy")).toBeTruthy();
		const blockNode = container.querySelector(
			'[data-canvas-block-id="text-1"]',
		) as HTMLElement;
		expect(blockNode.style.fontSize).toBe("28px");
	});

	test("updates grid spacing from toolbar control", () => {
		render(
			<CanvasEditor
				invitationId="inv-5"
				title="Editor Test"
				initialDocument={buildDocument()}
				previewSlug="test-slug"
			/>,
		);

		const spacingInput = screen.getByLabelText(
			"Snap grid size",
		) as HTMLInputElement;
		fireEvent.change(spacingInput, { target: { value: "12" } });

		expect(spacingInput.value).toBe("12");
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
		window.localStorage.setItem("dm-auth-token", "token-123");

		render(
			<CanvasEditor
				invitationId="inv-7"
				title="Editor Test"
				initialDocument={buildDocument()}
				previewSlug="test-slug"
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Publish invitation" }));

		await waitFor(() =>
			expect(vi.mocked(publishInvitationFn)).toHaveBeenCalledWith({
				data: { invitationId: "inv-7", token: "token-123" },
			}),
		);
		expect(vi.mocked(publishInvitation)).not.toHaveBeenCalled();
		expect(vi.mocked(updateInvitation)).toHaveBeenCalledWith(
			"inv-7",
			expect.objectContaining({
				status: "published",
				slug: "server-slug",
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
		expect(screen.getByText("Persisted text change")).toBeTruthy();

		rerender(
			<CanvasEditor
				invitationId="inv-8"
				title="Editor Test"
				initialDocument={buildDocument()}
				previewSlug="test-slug"
			/>,
		);

		expect(screen.getByText("Persisted text change")).toBeTruthy();
	});
});
