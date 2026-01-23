// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CanvasToolSidebar } from "./CanvasToolSidebar";

// Tool list expected for canvas editor
const expectedTools = [
	{ id: "sections", label: "Sections" },
	{ id: "templates", label: "Templates" },
	{ id: "text", label: "Text" },
	{ id: "assets", label: "Assets" },
	{ id: "components", label: "Components" },
	{ id: "settings", label: "Settings" },
];

describe("CanvasToolSidebar", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	describe("CE-005: Tool Sidebar", () => {
		it("renders all 6 tool buttons vertically", () => {
			render(
				<CanvasToolSidebar activeTool="sections" onToolChange={() => {}} />,
			);

			// Verify all 6 tools have accessible buttons
			for (const tool of expectedTools) {
				const btn = screen.getByRole("button", { name: tool.label });
				expect(btn).toBeDefined();
			}
		});

		it("each tool has an icon and accessible label", () => {
			render(
				<CanvasToolSidebar activeTool="sections" onToolChange={() => {}} />,
			);

			// Each button should contain an svg icon
			for (const tool of expectedTools) {
				const btn = screen.getByRole("button", { name: tool.label });
				const icon = btn.querySelector("svg");
				expect(icon).toBeDefined();
				expect(icon).not.toBeNull();
			}
		});

		it("highlights the active tool with bg-stone-100 class", () => {
			render(
				<CanvasToolSidebar activeTool="templates" onToolChange={() => {}} />,
			);

			const templatesBtn = screen.getByRole("button", { name: "Templates" });
			const sectionsBtn = screen.getByRole("button", { name: "Sections" });

			// Active tool should have highlighted styling
			expect(templatesBtn.className).toContain("bg-stone-100");
			expect(sectionsBtn.className).not.toContain("bg-stone-100");
		});

		it("calls onToolChange when a tool is clicked", async () => {
			const user = userEvent.setup();
			const onToolChange = vi.fn();
			render(
				<CanvasToolSidebar activeTool="sections" onToolChange={onToolChange} />,
			);

			const componentsBtn = screen.getByRole("button", { name: "Components" });
			await user.click(componentsBtn);

			expect(onToolChange).toHaveBeenCalledWith("components");
		});

		it("renders tools in correct order: Sections, Templates, Text, Assets, Components, Settings", () => {
			render(
				<CanvasToolSidebar activeTool="sections" onToolChange={() => {}} />,
			);

			const buttons = screen.getAllByRole("button");
			const buttonLabels = buttons.map(
				(btn) => btn.querySelector(".sr-only")?.textContent,
			);

			expect(buttonLabels).toEqual([
				"Sections",
				"Templates",
				"Text",
				"Assets",
				"Components",
				"Settings",
			]);
		});

		it("updates highlight when activeTool prop changes", () => {
			const { rerender } = render(
				<CanvasToolSidebar activeTool="sections" onToolChange={() => {}} />,
			);

			expect(
				screen.getByRole("button", { name: "Sections" }).className,
			).toContain("bg-stone-100");

			rerender(
				<CanvasToolSidebar activeTool="assets" onToolChange={() => {}} />,
			);

			expect(
				screen.getByRole("button", { name: "Sections" }).className,
			).not.toContain("bg-stone-100");
			expect(
				screen.getByRole("button", { name: "Assets" }).className,
			).toContain("bg-stone-100");
		});

		it("clicking different tools calls onToolChange with correct tool id", async () => {
			const user = userEvent.setup();
			const onToolChange = vi.fn();
			render(
				<CanvasToolSidebar activeTool="sections" onToolChange={onToolChange} />,
			);

			// Click each tool and verify the callback
			for (const tool of expectedTools) {
				await user.click(screen.getByRole("button", { name: tool.label }));
				expect(onToolChange).toHaveBeenCalledWith(tool.id);
			}
		});
	});
});
