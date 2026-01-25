// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutoScroll } from "./useAutoScroll";

describe("useAutoScroll", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Initial State", () => {
    it("returns isPlaying as false initially", () => {
      const { result } = renderHook(() => useAutoScroll());

      expect(result.current.isPlaying).toBe(false);
    });

    it("returns progress as 0 initially", () => {
      const { result } = renderHook(() => useAutoScroll());

      expect(result.current.progress).toBe(0);
    });

    it("uses default duration of 60 seconds", () => {
      const { result } = renderHook(() => useAutoScroll());

      expect(result.current.duration).toBe(60);
    });

    it("uses custom duration when provided", () => {
      const { result } = renderHook(() =>
        useAutoScroll({ initialDuration: 120 }),
      );

      expect(result.current.duration).toBe(120);
    });
  });

  describe("Play/Pause Controls", () => {
    it("sets isPlaying to true when play is called", () => {
      const { result } = renderHook(() => useAutoScroll());

      act(() => {
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);
    });

    it("sets isPlaying to false when pause is called", () => {
      const { result } = renderHook(() => useAutoScroll());

      act(() => {
        result.current.play();
      });

      act(() => {
        result.current.pause();
      });

      expect(result.current.isPlaying).toBe(false);
    });

    it("toggles play state with toggle function", () => {
      const { result } = renderHook(() => useAutoScroll());

      expect(result.current.isPlaying).toBe(false);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isPlaying).toBe(false);
    });

    it("resets progress and stops playing with reset function", () => {
      const { result } = renderHook(() => useAutoScroll());

      act(() => {
        result.current.play();
      });

      // Advance time to build some progress
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.progress).toBe(0);
    });
  });

  describe("Progress Updates", () => {
    it("updates progress while playing", () => {
      const { result } = renderHook(() =>
        useAutoScroll({ initialDuration: 10 }),
      );

      act(() => {
        result.current.play();
      });

      // Advance 5 seconds (50% of 10 second duration)
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Progress should be approximately 50% (0.5)
      expect(result.current.progress).toBeGreaterThan(0.4);
      expect(result.current.progress).toBeLessThan(0.6);
    });

    it("stops at 100% progress and pauses", () => {
      const { result } = renderHook(() =>
        useAutoScroll({ initialDuration: 5 }),
      );

      act(() => {
        result.current.play();
      });

      // Advance past the full duration
      act(() => {
        vi.advanceTimersByTime(6000);
      });

      expect(result.current.progress).toBe(1);
      expect(result.current.isPlaying).toBe(false);
    });

    it("does not update progress when paused", () => {
      const { result } = renderHook(() =>
        useAutoScroll({ initialDuration: 10 }),
      );

      // Start and then pause
      act(() => {
        result.current.play();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      const progressAtPause = result.current.progress;

      act(() => {
        result.current.pause();
      });

      // Advance more time while paused
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.progress).toBe(progressAtPause);
    });
  });

  describe("Duration Control", () => {
    it("allows setting duration", () => {
      const { result } = renderHook(() => useAutoScroll());

      act(() => {
        result.current.setDuration(180);
      });

      expect(result.current.duration).toBe(180);
    });

    it("clamps duration to minimum of 1 second", () => {
      const { result } = renderHook(() => useAutoScroll());

      act(() => {
        result.current.setDuration(0);
      });

      expect(result.current.duration).toBe(1);
    });

    it("clamps duration to maximum of 300 seconds", () => {
      const { result } = renderHook(() => useAutoScroll());

      act(() => {
        result.current.setDuration(500);
      });

      expect(result.current.duration).toBe(300);
    });
  });

  describe("Callback", () => {
    it("calls onProgress callback with current progress", () => {
      const onProgress = vi.fn();
      const { result } = renderHook(() =>
        useAutoScroll({ initialDuration: 10, onProgress }),
      );

      act(() => {
        result.current.play();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onProgress).toHaveBeenCalled();
      expect(onProgress).toHaveBeenCalledWith(expect.any(Number));
    });
  });
});
