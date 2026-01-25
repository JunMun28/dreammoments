// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the clipboard hook
const mockHandleCopy = vi.fn();
const mockHandlePaste = vi.fn();
const mockHandleCut = vi.fn();
const mockHandleDuplicate = vi.fn();
const mockHandleDeleteSelected = vi.fn();
const mockHandleSelectAll = vi.fn();

vi.mock("@/hooks/useCanvasClipboard", () => ({
  useCanvasClipboard: vi.fn(() => ({
    handleCopy: mockHandleCopy,
    handlePaste: mockHandlePaste,
    handleCut: mockHandleCut,
    handleDuplicate: mockHandleDuplicate,
    handleDeleteSelected: mockHandleDeleteSelected,
    handleSelectAll: mockHandleSelectAll,
    handleDeselect: vi.fn(),
    handleNudge: vi.fn(),
  })),
}));

import { CanvasContextMenu } from "./CanvasContextMenu";

describe("CanvasContextMenu", () => {
  const mockOnLock = vi.fn();
  const mockOnBringToFront = vi.fn();
  const mockOnSendToBack = vi.fn();
  const mockOnBringForward = vi.fn();
  const mockOnSendBackward = vi.fn();

  const defaultProps = {
    onCopy: mockHandleCopy,
    onPaste: mockHandlePaste,
    onCut: mockHandleCut,
    onDuplicate: mockHandleDuplicate,
    onDelete: mockHandleDeleteSelected,
    onSelectAll: mockHandleSelectAll,
    onLock: mockOnLock,
    onBringToFront: mockOnBringToFront,
    onSendToBack: mockOnSendToBack,
    onBringForward: mockOnBringForward,
    onSendBackward: mockOnSendBackward,
    hasSelection: true,
    isLocked: false,
    hasClipboard: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Context Menu Display", () => {
    it("renders a context menu trigger area", () => {
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      expect(screen.getByTestId("canvas-area")).toBeDefined();
    });

    it("shows context menu on right-click", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByRole("menu")).toBeDefined();
      });
    });

    it("hides context menu when clicking elsewhere", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByRole("menu")).toBeDefined();
      });

      // Click elsewhere to close menu
      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("menu")).toBeNull();
      });
    });
  });

  describe("Menu Items - Selection Actions", () => {
    it("displays Copy menu item with keyboard shortcut", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Copy")).toBeDefined();
        expect(screen.getByText("⌘C")).toBeDefined();
      });
    });

    it("displays Cut menu item with keyboard shortcut", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Cut")).toBeDefined();
        expect(screen.getByText("⌘X")).toBeDefined();
      });
    });

    it("displays Paste menu item with keyboard shortcut", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps} hasClipboard={true}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Paste")).toBeDefined();
        expect(screen.getByText("⌘V")).toBeDefined();
      });
    });

    it("displays Duplicate menu item with keyboard shortcut", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Duplicate")).toBeDefined();
        expect(screen.getByText("⌘D")).toBeDefined();
      });
    });

    it("displays Delete menu item with keyboard shortcut", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Delete")).toBeDefined();
        expect(screen.getByText("⌫")).toBeDefined();
      });
    });

    it("displays Select All menu item with keyboard shortcut", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Select All")).toBeDefined();
        expect(screen.getByText("⌘A")).toBeDefined();
      });
    });
  });

  describe("Menu Items - Lock Action", () => {
    it("displays Lock menu item when element is unlocked", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps} isLocked={false}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Lock")).toBeDefined();
      });
    });

    it("displays Unlock menu item when element is locked", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps} isLocked={true}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Unlock")).toBeDefined();
      });
    });
  });

  describe("Menu Items - Z-Order Actions", () => {
    it("displays Bring to Front menu item", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Bring to Front")).toBeDefined();
      });
    });

    it("displays Send to Back menu item", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Send to Back")).toBeDefined();
      });
    });

    it("displays Bring Forward menu item", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Bring Forward")).toBeDefined();
      });
    });

    it("displays Send Backward menu item", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Send Backward")).toBeDefined();
      });
    });
  });

  describe("Menu Item Actions", () => {
    it("calls onCopy when Copy is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Copy")).toBeDefined();
      });

      await user.click(screen.getByText("Copy"));

      expect(mockHandleCopy).toHaveBeenCalledTimes(1);
    });

    it("calls onCut when Cut is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Cut")).toBeDefined();
      });

      await user.click(screen.getByText("Cut"));

      expect(mockHandleCut).toHaveBeenCalledTimes(1);
    });

    it("calls onPaste when Paste is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps} hasClipboard={true}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Paste")).toBeDefined();
      });

      await user.click(screen.getByText("Paste"));

      expect(mockHandlePaste).toHaveBeenCalledTimes(1);
    });

    it("calls onDuplicate when Duplicate is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Duplicate")).toBeDefined();
      });

      await user.click(screen.getByText("Duplicate"));

      expect(mockHandleDuplicate).toHaveBeenCalledTimes(1);
    });

    it("calls onDelete when Delete is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Delete")).toBeDefined();
      });

      await user.click(screen.getByText("Delete"));

      expect(mockHandleDeleteSelected).toHaveBeenCalledTimes(1);
    });

    it("calls onSelectAll when Select All is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Select All")).toBeDefined();
      });

      await user.click(screen.getByText("Select All"));

      expect(mockHandleSelectAll).toHaveBeenCalledTimes(1);
    });

    it("calls onLock when Lock is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Lock")).toBeDefined();
      });

      await user.click(screen.getByText("Lock"));

      expect(mockOnLock).toHaveBeenCalledTimes(1);
    });

    it("calls onBringToFront when Bring to Front is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Bring to Front")).toBeDefined();
      });

      await user.click(screen.getByText("Bring to Front"));

      expect(mockOnBringToFront).toHaveBeenCalledTimes(1);
    });

    it("calls onSendToBack when Send to Back is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Send to Back")).toBeDefined();
      });

      await user.click(screen.getByText("Send to Back"));

      expect(mockOnSendToBack).toHaveBeenCalledTimes(1);
    });

    it("calls onBringForward when Bring Forward is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Bring Forward")).toBeDefined();
      });

      await user.click(screen.getByText("Bring Forward"));

      expect(mockOnBringForward).toHaveBeenCalledTimes(1);
    });

    it("calls onSendBackward when Send Backward is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        expect(screen.getByText("Send Backward")).toBeDefined();
      });

      await user.click(screen.getByText("Send Backward"));

      expect(mockOnSendBackward).toHaveBeenCalledTimes(1);
    });
  });

  describe("Disabled States", () => {
    it("disables selection-dependent items when no selection", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps} hasSelection={false}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        const copyItem = screen.getByText("Copy").closest("[role='menuitem']");
        // Radix UI uses data-disabled="" (empty string) for disabled items
        expect(copyItem?.hasAttribute("data-disabled")).toBe(true);
      });
    });

    it("disables Paste when clipboard is empty", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps} hasClipboard={false}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        const pasteItem = screen
          .getByText("Paste")
          .closest("[role='menuitem']");
        // Radix UI uses data-disabled="" (empty string) for disabled items
        expect(pasteItem?.hasAttribute("data-disabled")).toBe(true);
      });
    });

    it("enables Paste when clipboard has content", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps} hasClipboard={true}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        const pasteItem = screen
          .getByText("Paste")
          .closest("[role='menuitem']");
        expect(pasteItem?.hasAttribute("data-disabled")).toBe(false);
      });
    });

    it("disables z-order actions when no selection", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps} hasSelection={false}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        const bringToFrontItem = screen
          .getByText("Bring to Front")
          .closest("[role='menuitem']");
        // Radix UI uses data-disabled="" (empty string) for disabled items
        expect(bringToFrontItem?.hasAttribute("data-disabled")).toBe(true);
      });
    });

    it("disables Lock when no selection", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps} hasSelection={false}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        const lockItem = screen.getByText("Lock").closest("[role='menuitem']");
        // Radix UI uses data-disabled="" (empty string) for disabled items
        expect(lockItem?.hasAttribute("data-disabled")).toBe(true);
      });
    });
  });

  describe("Menu Separators", () => {
    it("displays separators between action groups", async () => {
      const user = userEvent.setup();
      render(
        <CanvasContextMenu {...defaultProps}>
          <div data-testid="canvas-area">Canvas Content</div>
        </CanvasContextMenu>,
      );

      const canvasArea = screen.getByTestId("canvas-area");
      await user.pointer({ keys: "[MouseRight]", target: canvasArea });

      await waitFor(() => {
        // Check for separator elements in the menu
        const menu = screen.getByRole("menu");
        const separators = menu.querySelectorAll(
          '[data-slot="context-menu-separator"]',
        );
        // Should have separators between groups: clipboard actions, lock action, z-order actions
        expect(separators.length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});
