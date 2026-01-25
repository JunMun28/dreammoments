// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPanel } from "./SettingsPanel";

describe("SettingsPanel", () => {
  const defaultProps = {
    currentMode: "structured" as const,
    onModeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("CE-019: Editor Mode UI", () => {
    it("renders editor mode toggle section", () => {
      render(<SettingsPanel {...defaultProps} />);

      expect(screen.getByText("Editor Mode")).toBeDefined();
    });

    it("shows Structured mode option", () => {
      render(<SettingsPanel {...defaultProps} />);

      expect(screen.getByLabelText(/Structured/)).toBeDefined();
    });

    it("shows Canvas mode option", () => {
      render(<SettingsPanel {...defaultProps} />);

      expect(screen.getByLabelText(/Canvas/)).toBeDefined();
    });

    it("displays current mode as structured by default", () => {
      render(<SettingsPanel {...defaultProps} currentMode="structured" />);

      const structuredRadio = screen.getByRole("radio", {
        name: /Structured/,
      }) as HTMLInputElement;
      expect(structuredRadio.checked).toBe(true);
    });

    it("displays current mode as canvas when set", () => {
      render(<SettingsPanel {...defaultProps} currentMode="canvas" />);

      const canvasRadio = screen.getByRole("radio", {
        name: /Canvas/,
      }) as HTMLInputElement;
      expect(canvasRadio.checked).toBe(true);
    });

    it("shows warning dialog when switching to canvas mode", async () => {
      render(<SettingsPanel {...defaultProps} currentMode="structured" />);

      const canvasRadio = screen.getByRole("radio", { name: /Canvas/ });
      fireEvent.click(canvasRadio);

      // Warning dialog should appear
      const dialogTitle = await screen.findByText(/Switch to Canvas Mode/);
      expect(dialogTitle).toBeDefined();
      expect(screen.getByText(/This action cannot be undone/)).toBeDefined();
    });

    it("calls onModeChange when confirmed in warning dialog", async () => {
      const onModeChange = vi.fn();
      render(
        <SettingsPanel
          {...defaultProps}
          currentMode="structured"
          onModeChange={onModeChange}
        />,
      );

      // Click canvas mode
      const canvasRadio = screen.getByRole("radio", { name: /Canvas/ });
      fireEvent.click(canvasRadio);

      // Confirm in dialog
      const confirmButton = await screen.findByRole("button", {
        name: /Switch to Canvas/,
      });
      fireEvent.click(confirmButton);

      expect(onModeChange).toHaveBeenCalledWith("canvas");
    });

    it("does not call onModeChange when dialog is cancelled", async () => {
      const onModeChange = vi.fn();
      render(
        <SettingsPanel
          {...defaultProps}
          currentMode="structured"
          onModeChange={onModeChange}
        />,
      );

      // Click canvas mode
      const canvasRadio = screen.getByRole("radio", { name: /Canvas/ });
      fireEvent.click(canvasRadio);

      // Cancel dialog
      const cancelButton = await screen.findByRole("button", {
        name: /Cancel/,
      });
      fireEvent.click(cancelButton);

      expect(onModeChange).not.toHaveBeenCalled();
    });

    it("allows switching from canvas to structured without warning", () => {
      const onModeChange = vi.fn();
      render(
        <SettingsPanel
          {...defaultProps}
          currentMode="canvas"
          onModeChange={onModeChange}
        />,
      );

      const structuredRadio = screen.getByRole("radio", {
        name: /Structured/,
      });
      fireEvent.click(structuredRadio);

      // No dialog should appear, mode changes directly
      expect(onModeChange).toHaveBeenCalledWith("structured");
    });

    it("shows mode descriptions", () => {
      render(<SettingsPanel {...defaultProps} />);

      expect(
        screen.getByText(/Use predefined sections and form-based editing/),
      ).toBeDefined();
      expect(
        screen.getByText(/Full creative control with drag-and-drop canvas/),
      ).toBeDefined();
    });

    it("shows saving indicator when isSaving is true", () => {
      render(<SettingsPanel {...defaultProps} isSaving={true} />);

      expect(screen.getByText(/Saving/)).toBeDefined();
    });

    it("shows saved indicator when isSaved is true", () => {
      render(<SettingsPanel {...defaultProps} isSaved={true} />);

      expect(screen.getByText(/Saved/)).toBeDefined();
    });
  });

  describe("CE-027: Canvas Height Adjustment", () => {
    it("renders canvas height section when in canvas mode", () => {
      render(<SettingsPanel {...defaultProps} currentMode="canvas" />);

      expect(screen.getByText("Canvas Height")).toBeDefined();
    });

    it("does not show canvas height section in structured mode", () => {
      render(<SettingsPanel {...defaultProps} currentMode="structured" />);

      expect(screen.queryByText("Canvas Height")).toBeNull();
    });

    it("displays current canvas height value", () => {
      render(
        <SettingsPanel
          {...defaultProps}
          currentMode="canvas"
          canvasHeight={1500}
        />,
      );

      expect(screen.getByText("1500px")).toBeDefined();
    });

    it("displays default height of 700px when not specified", () => {
      render(<SettingsPanel {...defaultProps} currentMode="canvas" />);

      expect(screen.getByText("700px")).toBeDefined();
    });

    it("renders height slider with correct min/max", () => {
      render(<SettingsPanel {...defaultProps} currentMode="canvas" />);

      const slider = screen.getByRole("slider", { name: /canvas height/i });
      expect(slider).toBeDefined();
      expect(slider.getAttribute("min")).toBe("700");
      expect(slider.getAttribute("max")).toBe("20000");
    });

    it("calls onCanvasHeightChange when slider is changed", () => {
      const onCanvasHeightChange = vi.fn();
      render(
        <SettingsPanel
          {...defaultProps}
          currentMode="canvas"
          canvasHeight={700}
          onCanvasHeightChange={onCanvasHeightChange}
        />,
      );

      const slider = screen.getByRole("slider", { name: /canvas height/i });
      fireEvent.change(slider, { target: { value: "1000" } });

      expect(onCanvasHeightChange).toHaveBeenCalledWith(1000);
    });

    it("shows preset height buttons", () => {
      render(<SettingsPanel {...defaultProps} currentMode="canvas" />);

      expect(screen.getByRole("button", { name: "700" })).toBeDefined();
      expect(screen.getByRole("button", { name: "1400" })).toBeDefined();
      expect(screen.getByRole("button", { name: "2100" })).toBeDefined();
      expect(screen.getByRole("button", { name: "5000" })).toBeDefined();
    });

    it("calls onCanvasHeightChange when preset button is clicked", () => {
      const onCanvasHeightChange = vi.fn();
      render(
        <SettingsPanel
          {...defaultProps}
          currentMode="canvas"
          canvasHeight={700}
          onCanvasHeightChange={onCanvasHeightChange}
        />,
      );

      const presetButton = screen.getByRole("button", { name: "2100" });
      fireEvent.click(presetButton);

      expect(onCanvasHeightChange).toHaveBeenCalledWith(2100);
    });

    it("highlights current preset button", () => {
      render(
        <SettingsPanel
          {...defaultProps}
          currentMode="canvas"
          canvasHeight={1400}
        />,
      );

      const presetButton = screen.getByRole("button", { name: "1400" });
      expect(presetButton.className).toContain("bg-blue");
    });
  });
});
