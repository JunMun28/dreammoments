// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPanel } from "./SettingsPanel";

describe("SettingsPanel", () => {
  const defaultProps = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("CE-027: Canvas Height Adjustment", () => {
    it("renders canvas height section", () => {
      render(<SettingsPanel {...defaultProps} />);

      expect(screen.getByText("Canvas Height")).toBeDefined();
    });

    it("displays current canvas height value", () => {
      render(<SettingsPanel {...defaultProps} canvasHeight={1500} />);

      expect(screen.getByText("1500px")).toBeDefined();
    });

    it("displays default height of 700px when not specified", () => {
      render(<SettingsPanel {...defaultProps} />);

      expect(screen.getByText("700px")).toBeDefined();
    });

    it("renders height slider with correct min/max", () => {
      render(<SettingsPanel {...defaultProps} />);

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
          canvasHeight={700}
          onCanvasHeightChange={onCanvasHeightChange}
        />,
      );

      const slider = screen.getByRole("slider", { name: /canvas height/i });
      fireEvent.change(slider, { target: { value: "1000" } });

      expect(onCanvasHeightChange).toHaveBeenCalledWith(1000);
    });

    it("shows preset height buttons", () => {
      render(<SettingsPanel {...defaultProps} />);

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
          canvasHeight={700}
          onCanvasHeightChange={onCanvasHeightChange}
        />,
      );

      const presetButton = screen.getByRole("button", { name: "2100" });
      fireEvent.click(presetButton);

      expect(onCanvasHeightChange).toHaveBeenCalledWith(2100);
    });

    it("highlights current preset button", () => {
      render(<SettingsPanel {...defaultProps} canvasHeight={1400} />);

      const presetButton = screen.getByRole("button", { name: "1400" });
      expect(presetButton.className).toContain("bg-blue");
    });
  });

  describe("Save indicators", () => {
    it("shows saving indicator when isSaving is true", () => {
      render(<SettingsPanel {...defaultProps} isSaving={true} />);

      expect(screen.getByText(/Saving/)).toBeDefined();
    });

    it("shows saved indicator when isSaved is true", () => {
      render(<SettingsPanel {...defaultProps} isSaved={true} />);

      expect(screen.getByText(/Saved/)).toBeDefined();
    });
  });

  describe("Auto-scroll settings", () => {
    it("shows auto-scroll section", () => {
      render(<SettingsPanel {...defaultProps} />);

      expect(screen.getByText("Auto Scroll")).toBeDefined();
    });

    it("renders auto-scroll toggle", () => {
      render(<SettingsPanel {...defaultProps} />);

      const toggle = screen.getByRole("switch", { name: /auto scroll/i });
      expect(toggle).toBeDefined();
    });

    it("auto-scroll toggle is unchecked by default", () => {
      render(<SettingsPanel {...defaultProps} />);

      const toggle = screen.getByRole("switch", { name: /auto scroll/i });
      expect(toggle.getAttribute("aria-checked")).toBe("false");
    });

    it("auto-scroll toggle is checked when autoScroll is true", () => {
      render(<SettingsPanel {...defaultProps} autoScroll={true} />);

      const toggle = screen.getByRole("switch", { name: /auto scroll/i });
      expect(toggle.getAttribute("aria-checked")).toBe("true");
    });

    it("calls onAutoScrollChange when toggle is clicked", () => {
      const onAutoScrollChange = vi.fn();
      render(
        <SettingsPanel
          {...defaultProps}
          onAutoScrollChange={onAutoScrollChange}
        />,
      );

      const toggle = screen.getByRole("switch", { name: /auto scroll/i });
      fireEvent.click(toggle);

      expect(onAutoScrollChange).toHaveBeenCalledWith(true);
    });

    it("shows duration slider when auto-scroll is enabled", () => {
      render(<SettingsPanel {...defaultProps} autoScroll={true} />);

      expect(screen.getByText("Scroll Duration")).toBeDefined();
      const slider = screen.getByRole("slider", { name: /scroll duration/i });
      expect(slider).toBeDefined();
    });

    it("does not show duration slider when auto-scroll is disabled", () => {
      render(<SettingsPanel {...defaultProps} autoScroll={false} />);

      expect(screen.queryByText("Scroll Duration")).toBeNull();
    });

    it("displays current scroll duration value", () => {
      render(
        <SettingsPanel
          {...defaultProps}
          autoScroll={true}
          scrollDuration={60}
        />,
      );

      expect(screen.getByText("60s")).toBeDefined();
    });

    it("uses default scroll duration of 30s", () => {
      render(<SettingsPanel {...defaultProps} autoScroll={true} />);

      expect(screen.getByText("30s")).toBeDefined();
    });

    it("calls onScrollDurationChange when slider is changed", () => {
      const onScrollDurationChange = vi.fn();
      render(
        <SettingsPanel
          {...defaultProps}
          autoScroll={true}
          onScrollDurationChange={onScrollDurationChange}
        />,
      );

      const slider = screen.getByRole("slider", { name: /scroll duration/i });
      fireEvent.change(slider, { target: { value: "120" } });

      expect(onScrollDurationChange).toHaveBeenCalledWith(120);
    });

    it("slider has min=1 and max=300", () => {
      render(<SettingsPanel {...defaultProps} autoScroll={true} />);

      const slider = screen.getByRole("slider", { name: /scroll duration/i });
      expect(slider.getAttribute("min")).toBe("1");
      expect(slider.getAttribute("max")).toBe("300");
    });
  });
});
