import { renderHook } from "@testing-library/react";
import { act } from "react";
import { describe, expect, test, vi } from "vitest";
import { useFocusTrap } from "../components/editor/hooks/useFocusTrap";
import { useMediaQuery } from "../components/editor/hooks/useMediaQuery";

describe("useMediaQuery", () => {
	test("returns false when window is undefined", () => {
		// Save original window
		const originalWindow = globalThis.window;
		// @ts-expect-error - intentionally removing window for test
		globalThis.window = undefined;

		const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
		expect(result.current).toBe(false);

		globalThis.window = originalWindow;
	});

	test("returns initial match state", () => {
		// Mock matchMedia
		const matchMediaMock = vi.fn().mockReturnValue({
			matches: true,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		});
		window.matchMedia = matchMediaMock;

		const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
		expect(result.current).toBe(true);
	});
});

describe("useFocusTrap", () => {
	test("does nothing when ref is null", () => {
		const { result } = renderHook(() => useFocusTrap({ current: null }, true));
		// Should not throw
		expect(result.current).toBeUndefined();
	});

	test("does nothing when not active", () => {
		const container = document.createElement("div");
		const input = document.createElement("input");
		container.appendChild(input);

		const { result } = renderHook(() =>
			useFocusTrap({ current: container }, false),
		);
		expect(result.current).toBeUndefined();
	});
});

// Mock test for utility hook behaviors
describe("hook utilities", () => {
	test("useMediaQuery cleans up on unmount", () => {
		const removeEventListenerMock = vi.fn();
		const addEventListenerMock = vi.fn();

		window.matchMedia = vi.fn().mockReturnValue({
			matches: false,
			addEventListener: addEventListenerMock,
			removeEventListener: removeEventListenerMock,
		});

		const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));
		unmount();

		expect(removeEventListenerMock).toHaveBeenCalled();
	});
});
