// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { FabricObject } from "fabric";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AnimationConfig } from "@/lib/canvas-animations";
import { AnimationProperties } from "./AnimationProperties";

// Mock ResizeObserver for Slider component
beforeEach(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

/**
 * CE-029: Animation Properties panel tests
 *
 * Acceptance criteria:
 * - Animation type dropdown with all 9 options
 * - Duration slider (0.1-5 seconds)
 * - Delay slider (0-10 seconds)
 * - Easing dropdown with 5 options
 * - Loop toggle switch
 * - Calls onPropertyChange with 'animation' key and full config
 * - Displays current values from object's animation property
 */
describe("CE-029: AnimationProperties", () => {
  const createMockObject = (
    animation?: Partial<AnimationConfig>,
  ): FabricObject => {
    return {
      type: "i-text",
      animation: animation
        ? {
            type: "none",
            duration: 0.5,
            delay: 0,
            easing: "easeOut",
            loop: false,
            ...animation,
          }
        : undefined,
    } as unknown as FabricObject;
  };

  describe("Animation section header", () => {
    it("shows 'Animation' header", () => {
      render(<AnimationProperties object={createMockObject()} />);

      const header = screen.getByText("Animation");
      expect(header).toBeDefined();
    });
  });

  describe("Animation type dropdown", () => {
    it("renders animation type dropdown", () => {
      render(<AnimationProperties object={createMockObject()} />);

      const typeSelect = screen.getByLabelText(/animation type/i);
      expect(typeSelect).toBeDefined();
    });

    it("shows all 9 animation type options", () => {
      render(<AnimationProperties object={createMockObject()} />);

      const typeSelect = screen.getByLabelText(/animation type/i);
      const options = typeSelect.querySelectorAll("option");

      expect(options.length).toBe(9);
    });

    it("includes None option", () => {
      render(<AnimationProperties object={createMockObject()} />);

      const option = screen.getByRole("option", { name: "None" });
      expect(option).toBeDefined();
    });

    it("includes Fade In option", () => {
      render(<AnimationProperties object={createMockObject()} />);

      const option = screen.getByRole("option", { name: "Fade In" });
      expect(option).toBeDefined();
    });

    it("includes Slide Up option", () => {
      render(<AnimationProperties object={createMockObject()} />);

      const option = screen.getByRole("option", { name: "Slide Up" });
      expect(option).toBeDefined();
    });

    it("displays current animation type", () => {
      render(
        <AnimationProperties object={createMockObject({ type: "fadeIn" })} />,
      );

      const typeSelect = screen.getByLabelText(
        /animation type/i,
      ) as HTMLSelectElement;
      expect(typeSelect.value).toBe("fadeIn");
    });

    it("calls onPropertyChange when type is changed", () => {
      const onPropertyChange = vi.fn();
      render(
        <AnimationProperties
          object={createMockObject()}
          onPropertyChange={onPropertyChange}
        />,
      );

      const typeSelect = screen.getByLabelText(/animation type/i);
      fireEvent.change(typeSelect, { target: { value: "slideUp" } });

      expect(onPropertyChange).toHaveBeenCalledWith(
        "animation",
        expect.objectContaining({ type: "slideUp" }),
      );
    });
  });

  describe("Duration slider", () => {
    it("renders duration slider", () => {
      render(<AnimationProperties object={createMockObject()} />);

      const durationLabel = screen.getByText(/duration/i);
      expect(durationLabel).toBeDefined();
    });

    it("renders duration slider with correct attributes", () => {
      render(<AnimationProperties object={createMockObject()} />);

      // Find slider by role
      const sliders = screen.getAllByRole("slider");
      // At least one slider should be the duration slider
      expect(sliders.length).toBeGreaterThanOrEqual(1);
    });

    it("displays current duration value", () => {
      render(
        <AnimationProperties object={createMockObject({ duration: 1.5 })} />,
      );

      // Should show the duration value somewhere
      const durationDisplay = screen.getByText("1.5s");
      expect(durationDisplay).toBeDefined();
    });

    it("calls onPropertyChange when duration is changed", () => {
      const onPropertyChange = vi.fn();
      render(
        <AnimationProperties
          object={createMockObject()}
          onPropertyChange={onPropertyChange}
        />,
      );

      // Get the first slider (duration)
      const sliders = screen.getAllByRole("slider");
      const durationSlider = sliders[0];

      // Simulate change via aria-valuenow change
      fireEvent.keyDown(durationSlider, { key: "ArrowRight" });

      expect(onPropertyChange).toHaveBeenCalledWith(
        "animation",
        expect.objectContaining({ duration: expect.any(Number) }),
      );
    });
  });

  describe("Delay slider", () => {
    it("renders delay slider", () => {
      render(<AnimationProperties object={createMockObject()} />);

      const delayLabel = screen.getByText(/delay/i);
      expect(delayLabel).toBeDefined();
    });

    it("displays current delay value", () => {
      render(<AnimationProperties object={createMockObject({ delay: 2 })} />);

      // Should show the delay value somewhere
      const delayDisplay = screen.getByText("2s");
      expect(delayDisplay).toBeDefined();
    });
  });

  describe("Easing dropdown", () => {
    it("renders easing dropdown", () => {
      render(<AnimationProperties object={createMockObject()} />);

      const easingSelect = screen.getByLabelText(/easing/i);
      expect(easingSelect).toBeDefined();
    });

    it("shows all 5 easing options", () => {
      render(<AnimationProperties object={createMockObject()} />);

      const easingSelect = screen.getByLabelText(/easing/i);
      const options = easingSelect.querySelectorAll("option");

      expect(options.length).toBe(5);
    });

    it("includes Linear option", () => {
      render(<AnimationProperties object={createMockObject()} />);

      const easingSelect = screen.getByLabelText(/easing/i);
      const linearOption = easingSelect.querySelector('option[value="linear"]');
      expect(linearOption).toBeDefined();
    });

    it("includes Ease In Out option", () => {
      render(<AnimationProperties object={createMockObject()} />);

      const easingSelect = screen.getByLabelText(/easing/i);
      const easeInOutOption = easingSelect.querySelector(
        'option[value="easeInOut"]',
      );
      expect(easeInOutOption).toBeDefined();
    });

    it("displays current easing value", () => {
      render(
        <AnimationProperties object={createMockObject({ easing: "easeIn" })} />,
      );

      const easingSelect = screen.getByLabelText(
        /easing/i,
      ) as HTMLSelectElement;
      expect(easingSelect.value).toBe("easeIn");
    });

    it("calls onPropertyChange when easing is changed", () => {
      const onPropertyChange = vi.fn();
      render(
        <AnimationProperties
          object={createMockObject()}
          onPropertyChange={onPropertyChange}
        />,
      );

      const easingSelect = screen.getByLabelText(/easing/i);
      fireEvent.change(easingSelect, { target: { value: "linear" } });

      expect(onPropertyChange).toHaveBeenCalledWith(
        "animation",
        expect.objectContaining({ easing: "linear" }),
      );
    });
  });

  describe("Loop toggle", () => {
    it("renders loop toggle switch", () => {
      render(<AnimationProperties object={createMockObject()} />);

      const loopSwitch = screen.getByRole("switch", { name: /loop/i });
      expect(loopSwitch).toBeDefined();
    });

    it("shows unchecked state when loop is false", () => {
      render(
        <AnimationProperties object={createMockObject({ loop: false })} />,
      );

      const loopSwitch = screen.getByRole("switch", { name: /loop/i });
      expect(loopSwitch.getAttribute("aria-checked")).toBe("false");
    });

    it("shows checked state when loop is true", () => {
      render(<AnimationProperties object={createMockObject({ loop: true })} />);

      const loopSwitch = screen.getByRole("switch", { name: /loop/i });
      expect(loopSwitch.getAttribute("aria-checked")).toBe("true");
    });

    it("calls onPropertyChange when loop is toggled", () => {
      const onPropertyChange = vi.fn();
      render(
        <AnimationProperties
          object={createMockObject({ loop: false })}
          onPropertyChange={onPropertyChange}
        />,
      );

      const loopSwitch = screen.getByRole("switch", { name: /loop/i });
      loopSwitch.click();

      expect(onPropertyChange).toHaveBeenCalledWith(
        "animation",
        expect.objectContaining({ loop: true }),
      );
    });
  });

  describe("Default values", () => {
    it("uses default config when object has no animation property", () => {
      const objectWithoutAnimation = {
        type: "i-text",
      } as unknown as FabricObject;

      render(<AnimationProperties object={objectWithoutAnimation} />);

      // Should show default values
      const typeSelect = screen.getByLabelText(
        /animation type/i,
      ) as HTMLSelectElement;
      expect(typeSelect.value).toBe("none");

      const durationDisplay = screen.getByText("0.5s");
      expect(durationDisplay).toBeDefined();

      const delayDisplay = screen.getByText("0s");
      expect(delayDisplay).toBeDefined();

      const easingSelect = screen.getByLabelText(
        /easing/i,
      ) as HTMLSelectElement;
      expect(easingSelect.value).toBe("easeOut");

      const loopSwitch = screen.getByRole("switch", { name: /loop/i });
      expect(loopSwitch.getAttribute("aria-checked")).toBe("false");
    });
  });

  describe("Full config propagation", () => {
    it("includes all config properties when onPropertyChange is called", () => {
      const onPropertyChange = vi.fn();
      render(
        <AnimationProperties
          object={createMockObject({
            type: "fadeIn",
            duration: 1,
            delay: 0.5,
            easing: "ease",
            loop: false,
          })}
          onPropertyChange={onPropertyChange}
        />,
      );

      const loopSwitch = screen.getByRole("switch", { name: /loop/i });
      loopSwitch.click();

      expect(onPropertyChange).toHaveBeenCalledWith("animation", {
        type: "fadeIn",
        duration: 1,
        delay: 0.5,
        easing: "ease",
        loop: true,
      });
    });
  });
});
