import { describe, expect, it } from "vitest";
import {
  ANIMATION_TYPES,
  type AnimationConfig,
  DEFAULT_ANIMATION_CONFIG,
  EASING_OPTIONS,
  getAnimationCSS,
} from "./canvas-animations";

/**
 * CE-029: Canvas Element Animations tests
 *
 * Test animation type definitions and CSS keyframe generators
 */
describe("CE-029: canvas-animations", () => {
  describe("ANIMATION_TYPES", () => {
    it("should export animation types with labels", () => {
      expect(ANIMATION_TYPES).toBeDefined();
      expect(Array.isArray(ANIMATION_TYPES)).toBe(true);
      expect(ANIMATION_TYPES.length).toBeGreaterThan(0);
    });

    it("should include 'none' animation type", () => {
      const noneType = ANIMATION_TYPES.find((t) => t.value === "none");
      expect(noneType).toBeDefined();
      expect(noneType?.label).toBe("None");
    });

    it("should include 'fadeIn' animation type", () => {
      const fadeInType = ANIMATION_TYPES.find((t) => t.value === "fadeIn");
      expect(fadeInType).toBeDefined();
      expect(fadeInType?.label).toBe("Fade In");
    });

    it("should include 'slideUp' animation type", () => {
      const slideUpType = ANIMATION_TYPES.find((t) => t.value === "slideUp");
      expect(slideUpType).toBeDefined();
      expect(slideUpType?.label).toBe("Slide Up");
    });

    it("should include 'slideDown' animation type", () => {
      const slideDownType = ANIMATION_TYPES.find(
        (t) => t.value === "slideDown",
      );
      expect(slideDownType).toBeDefined();
      expect(slideDownType?.label).toBe("Slide Down");
    });

    it("should include 'slideLeft' animation type", () => {
      const slideLeftType = ANIMATION_TYPES.find(
        (t) => t.value === "slideLeft",
      );
      expect(slideLeftType).toBeDefined();
      expect(slideLeftType?.label).toBe("Slide Left");
    });

    it("should include 'slideRight' animation type", () => {
      const slideRightType = ANIMATION_TYPES.find(
        (t) => t.value === "slideRight",
      );
      expect(slideRightType).toBeDefined();
      expect(slideRightType?.label).toBe("Slide Right");
    });

    it("should include 'zoomIn' animation type", () => {
      const zoomInType = ANIMATION_TYPES.find((t) => t.value === "zoomIn");
      expect(zoomInType).toBeDefined();
      expect(zoomInType?.label).toBe("Zoom In");
    });

    it("should include 'bounce' animation type", () => {
      const bounceType = ANIMATION_TYPES.find((t) => t.value === "bounce");
      expect(bounceType).toBeDefined();
      expect(bounceType?.label).toBe("Bounce");
    });

    it("should include 'rotate' animation type", () => {
      const rotateType = ANIMATION_TYPES.find((t) => t.value === "rotate");
      expect(rotateType).toBeDefined();
      expect(rotateType?.label).toBe("Rotate");
    });

    it("should have unique values for all animation types", () => {
      const values = ANIMATION_TYPES.map((t) => t.value);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe("EASING_OPTIONS", () => {
    it("should export easing options with labels", () => {
      expect(EASING_OPTIONS).toBeDefined();
      expect(Array.isArray(EASING_OPTIONS)).toBe(true);
      expect(EASING_OPTIONS.length).toBeGreaterThan(0);
    });

    it("should include 'linear' easing", () => {
      const linear = EASING_OPTIONS.find((e) => e.value === "linear");
      expect(linear).toBeDefined();
      expect(linear?.label).toBe("Linear");
    });

    it("should include 'ease' easing", () => {
      const ease = EASING_OPTIONS.find((e) => e.value === "ease");
      expect(ease).toBeDefined();
      expect(ease?.label).toBe("Ease");
    });

    it("should include 'easeIn' easing", () => {
      const easeIn = EASING_OPTIONS.find((e) => e.value === "easeIn");
      expect(easeIn).toBeDefined();
      expect(easeIn?.label).toBe("Ease In");
    });

    it("should include 'easeOut' easing", () => {
      const easeOut = EASING_OPTIONS.find((e) => e.value === "easeOut");
      expect(easeOut).toBeDefined();
      expect(easeOut?.label).toBe("Ease Out");
    });

    it("should include 'easeInOut' easing", () => {
      const easeInOut = EASING_OPTIONS.find((e) => e.value === "easeInOut");
      expect(easeInOut).toBeDefined();
      expect(easeInOut?.label).toBe("Ease In Out");
    });

    it("should have unique values for all easing options", () => {
      const values = EASING_OPTIONS.map((e) => e.value);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe("DEFAULT_ANIMATION_CONFIG", () => {
    it("should have default type of 'none'", () => {
      expect(DEFAULT_ANIMATION_CONFIG.type).toBe("none");
    });

    it("should have default duration of 0.5 seconds", () => {
      expect(DEFAULT_ANIMATION_CONFIG.duration).toBe(0.5);
    });

    it("should have default delay of 0 seconds", () => {
      expect(DEFAULT_ANIMATION_CONFIG.delay).toBe(0);
    });

    it("should have default easing of 'easeOut'", () => {
      expect(DEFAULT_ANIMATION_CONFIG.easing).toBe("easeOut");
    });

    it("should have default loop of false", () => {
      expect(DEFAULT_ANIMATION_CONFIG.loop).toBe(false);
    });

    it("should be a valid AnimationConfig", () => {
      const config: AnimationConfig = DEFAULT_ANIMATION_CONFIG;
      expect(config.type).toBeDefined();
      expect(config.duration).toBeDefined();
      expect(config.delay).toBeDefined();
      expect(config.easing).toBeDefined();
      expect(config.loop).toBeDefined();
    });
  });

  describe("getAnimationCSS", () => {
    it("should return empty string for 'none' animation", () => {
      const config: AnimationConfig = {
        type: "none",
        duration: 1,
        delay: 0,
        easing: "ease",
        loop: false,
      };
      const css = getAnimationCSS(config);
      expect(css).toBe("");
    });

    it("should generate valid CSS for fadeIn animation", () => {
      const config: AnimationConfig = {
        type: "fadeIn",
        duration: 1,
        delay: 0,
        easing: "ease",
        loop: false,
      };
      const css = getAnimationCSS(config);
      expect(css).toContain("animation:");
      expect(css).toContain("fadeIn");
      expect(css).toContain("1s");
    });

    it("should include delay in CSS when specified", () => {
      const config: AnimationConfig = {
        type: "fadeIn",
        duration: 1,
        delay: 0.5,
        easing: "ease",
        loop: false,
      };
      const css = getAnimationCSS(config);
      expect(css).toContain("0.5s");
    });

    it("should include easing function in CSS", () => {
      const config: AnimationConfig = {
        type: "slideUp",
        duration: 1,
        delay: 0,
        easing: "easeInOut",
        loop: false,
      };
      const css = getAnimationCSS(config);
      expect(css).toContain("ease-in-out");
    });

    it("should add infinite iteration for loop animations", () => {
      const config: AnimationConfig = {
        type: "bounce",
        duration: 1,
        delay: 0,
        easing: "ease",
        loop: true,
      };
      const css = getAnimationCSS(config);
      expect(css).toContain("infinite");
    });

    it("should generate CSS for slideUp animation", () => {
      const config: AnimationConfig = {
        type: "slideUp",
        duration: 0.5,
        delay: 0,
        easing: "easeOut",
        loop: false,
      };
      const css = getAnimationCSS(config);
      expect(css).toContain("slideUp");
    });

    it("should generate CSS for slideDown animation", () => {
      const config: AnimationConfig = {
        type: "slideDown",
        duration: 0.5,
        delay: 0,
        easing: "easeOut",
        loop: false,
      };
      const css = getAnimationCSS(config);
      expect(css).toContain("slideDown");
    });

    it("should generate CSS for slideLeft animation", () => {
      const config: AnimationConfig = {
        type: "slideLeft",
        duration: 0.5,
        delay: 0,
        easing: "easeOut",
        loop: false,
      };
      const css = getAnimationCSS(config);
      expect(css).toContain("slideLeft");
    });

    it("should generate CSS for slideRight animation", () => {
      const config: AnimationConfig = {
        type: "slideRight",
        duration: 0.5,
        delay: 0,
        easing: "easeOut",
        loop: false,
      };
      const css = getAnimationCSS(config);
      expect(css).toContain("slideRight");
    });

    it("should generate CSS for zoomIn animation", () => {
      const config: AnimationConfig = {
        type: "zoomIn",
        duration: 0.5,
        delay: 0,
        easing: "easeOut",
        loop: false,
      };
      const css = getAnimationCSS(config);
      expect(css).toContain("zoomIn");
    });

    it("should generate CSS for bounce animation", () => {
      const config: AnimationConfig = {
        type: "bounce",
        duration: 0.5,
        delay: 0,
        easing: "easeOut",
        loop: false,
      };
      const css = getAnimationCSS(config);
      expect(css).toContain("bounce");
    });

    it("should generate CSS for rotate animation", () => {
      const config: AnimationConfig = {
        type: "rotate",
        duration: 0.5,
        delay: 0,
        easing: "linear",
        loop: false,
      };
      const css = getAnimationCSS(config);
      expect(css).toContain("rotate");
    });

    it("should convert easing values to CSS timing functions", () => {
      const testCases: Array<{
        easing: AnimationConfig["easing"];
        expected: string;
      }> = [
        { easing: "linear", expected: "linear" },
        { easing: "ease", expected: "ease" },
        { easing: "easeIn", expected: "ease-in" },
        { easing: "easeOut", expected: "ease-out" },
        { easing: "easeInOut", expected: "ease-in-out" },
      ];

      for (const { easing, expected } of testCases) {
        const config: AnimationConfig = {
          type: "fadeIn",
          duration: 1,
          delay: 0,
          easing,
          loop: false,
        };
        const css = getAnimationCSS(config);
        expect(css).toContain(expected);
      }
    });
  });
});
