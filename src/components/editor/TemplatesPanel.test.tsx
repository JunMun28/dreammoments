// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TemplatesPanel, type TemplateDefinition } from "./TemplatesPanel";

/**
 * CE-006: Templates gallery panel for canvas editor
 *
 * Acceptance criteria:
 * - Templates panel shows grid of template thumbnails
 * - Each template has preview image and name
 * - Clicking template shows preview dialog
 * - Apply button loads template elements onto canvas
 * - At least 5 starter templates available (elegant, modern, rustic, minimal, floral)
 */
describe("TemplatesPanel (CE-006)", () => {
  const mockOnSelectTemplate = vi.fn();
  const mockOnApplyTemplate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("grid rendering", () => {
    it("renders grid of template thumbnails", () => {
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
        />,
      );

      // Should show at least 5 templates
      const templateCards = screen.getAllByRole("button", {
        name: /template/i,
      });
      expect(templateCards.length).toBeGreaterThanOrEqual(5);
    });

    it("displays preview image and name for each template", () => {
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
        />,
      );

      // Check for all required template names
      expect(screen.getByText("Elegant")).toBeDefined();
      expect(screen.getByText("Modern")).toBeDefined();
      expect(screen.getByText("Rustic")).toBeDefined();
      expect(screen.getByText("Minimal")).toBeDefined();
      expect(screen.getByText("Floral")).toBeDefined();
    });

    it("shows template thumbnails with preview colors", () => {
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
        />,
      );

      // Each template should have a thumbnail preview area
      const thumbnails = screen.getAllByTestId(/template-thumbnail/);
      expect(thumbnails.length).toBeGreaterThanOrEqual(5);
    });

    it("shows panel title and instructions", () => {
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
        />,
      );

      expect(screen.getByText("Templates")).toBeDefined();
      expect(
        screen.getByText(/Click a template to preview and apply/i),
      ).toBeDefined();
    });
  });

  describe("template selection", () => {
    it("calls onSelectTemplate when clicking a template", async () => {
      const user = userEvent.setup();
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
        />,
      );

      const elegantTemplate = screen.getByRole("button", {
        name: /Elegant template/i,
      });
      await user.click(elegantTemplate);

      expect(mockOnSelectTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "elegant",
          name: "Elegant",
        }),
      );
    });

    it("calls onSelectTemplate with template object containing elements", async () => {
      const user = userEvent.setup();
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
        />,
      );

      const modernTemplate = screen.getByRole("button", {
        name: /Modern template/i,
      });
      await user.click(modernTemplate);

      const selectedTemplate = mockOnSelectTemplate.mock
        .calls[0][0] as TemplateDefinition;
      expect(selectedTemplate.elements).toBeDefined();
      expect(selectedTemplate.elements.length).toBeGreaterThan(0);
    });
  });

  describe("preview dialog", () => {
    it("opens preview dialog when template is selected", () => {
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
          selectedTemplateId="elegant"
        />,
      );

      // Dialog should be visible
      expect(screen.getByRole("dialog")).toBeDefined();
      expect(screen.getByText("Preview")).toBeDefined();
    });

    it("shows template name in preview dialog", () => {
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
          selectedTemplateId="modern"
        />,
      );

      const dialog = screen.getByRole("dialog");
      expect(within(dialog).getByText("Modern")).toBeDefined();
    });

    it("shows Apply button in preview dialog", () => {
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
          selectedTemplateId="elegant"
        />,
      );

      const dialog = screen.getByRole("dialog");
      expect(
        within(dialog).getByRole("button", { name: /Apply/i }),
      ).toBeDefined();
    });

    it("shows Cancel button to close preview dialog", () => {
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
          selectedTemplateId="elegant"
        />,
      );

      const dialog = screen.getByRole("dialog");
      expect(
        within(dialog).getByRole("button", { name: /Cancel/i }),
      ).toBeDefined();
    });

    it("calls onSelectTemplate with null when Cancel is clicked", async () => {
      const user = userEvent.setup();
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
          selectedTemplateId="elegant"
        />,
      );

      const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
      await user.click(cancelBtn);

      expect(mockOnSelectTemplate).toHaveBeenCalledWith(null);
    });

    it("shows element count in preview", () => {
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
          selectedTemplateId="elegant"
        />,
      );

      expect(screen.getByText(/elements/i)).toBeDefined();
    });
  });

  describe("apply template", () => {
    it("calls onApplyTemplate when Apply button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
          selectedTemplateId="rustic"
        />,
      );

      const applyBtn = screen.getByRole("button", { name: /Apply/i });
      await user.click(applyBtn);

      expect(mockOnApplyTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "rustic",
          name: "Rustic",
          elements: expect.arrayContaining([
            expect.objectContaining({ type: expect.any(String) }),
          ]),
        }),
      );
    });

    it("includes template elements array for canvas loading", async () => {
      const user = userEvent.setup();
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
          selectedTemplateId="elegant"
        />,
      );

      const applyBtn = screen.getByRole("button", { name: /Apply/i });
      await user.click(applyBtn);

      const appliedTemplate = mockOnApplyTemplate.mock
        .calls[0][0] as TemplateDefinition;
      expect(appliedTemplate.elements).toBeDefined();
      expect(Array.isArray(appliedTemplate.elements)).toBe(true);
      expect(appliedTemplate.elements.length).toBeGreaterThan(0);
    });
  });

  describe("template content", () => {
    it("each template has at least 2 canvas elements", async () => {
      const user = userEvent.setup();
      const templateIds = ["elegant", "modern", "rustic", "minimal", "floral"];

      for (const templateId of templateIds) {
        mockOnApplyTemplate.mockClear();

        const { unmount } = render(
          <TemplatesPanel
            onSelectTemplate={mockOnSelectTemplate}
            onApplyTemplate={mockOnApplyTemplate}
            selectedTemplateId={templateId}
          />,
        );

        const applyBtn = screen.getByRole("button", { name: /Apply/i });
        await user.click(applyBtn);

        const appliedTemplate = mockOnApplyTemplate.mock
          .calls[0][0] as TemplateDefinition;
        expect(appliedTemplate.elements.length).toBeGreaterThanOrEqual(2);

        unmount();
      }
    });

    it("templates include text elements with styling", async () => {
      const user = userEvent.setup();
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
          selectedTemplateId="elegant"
        />,
      );

      const applyBtn = screen.getByRole("button", { name: /Apply/i });
      await user.click(applyBtn);

      const appliedTemplate = mockOnApplyTemplate.mock
        .calls[0][0] as TemplateDefinition;
      const textElements = appliedTemplate.elements.filter(
        (el) => el.type === "text",
      );
      expect(textElements.length).toBeGreaterThan(0);
      expect(textElements[0]).toHaveProperty("fontFamily");
      expect(textElements[0]).toHaveProperty("fill");
    });

    it("templates include positioning (left, top)", async () => {
      const user = userEvent.setup();
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
          selectedTemplateId="minimal"
        />,
      );

      const applyBtn = screen.getByRole("button", { name: /Apply/i });
      await user.click(applyBtn);

      const appliedTemplate = mockOnApplyTemplate.mock
        .calls[0][0] as TemplateDefinition;
      for (const element of appliedTemplate.elements) {
        expect(element).toHaveProperty("left");
        expect(element).toHaveProperty("top");
        expect(typeof element.left).toBe("number");
        expect(typeof element.top).toBe("number");
      }
    });
  });

  describe("accessibility", () => {
    it("template buttons have accessible labels", () => {
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
        />,
      );

      expect(
        screen.getByRole("button", { name: /Elegant template/i }),
      ).toBeDefined();
      expect(
        screen.getByRole("button", { name: /Modern template/i }),
      ).toBeDefined();
      expect(
        screen.getByRole("button", { name: /Rustic template/i }),
      ).toBeDefined();
      expect(
        screen.getByRole("button", { name: /Minimal template/i }),
      ).toBeDefined();
      expect(
        screen.getByRole("button", { name: /Floral template/i }),
      ).toBeDefined();
    });

    it("preview dialog has aria-modal attribute", () => {
      render(
        <TemplatesPanel
          onSelectTemplate={mockOnSelectTemplate}
          onApplyTemplate={mockOnApplyTemplate}
          selectedTemplateId="elegant"
        />,
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog.getAttribute("aria-modal")).toBe("true");
    });
  });
});
