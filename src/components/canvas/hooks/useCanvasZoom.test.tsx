// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useCanvasZoom } from "./useCanvasZoom";

describe("useCanvasZoom", () => {
	test("initial camera is default (0,0,1)", () => {
		const { result } = renderHook(() => useCanvasZoom());
		expect(result.current.camera).toEqual({ x: 0, y: 0, z: 1 });
	});

	test("zoomTo changes zoom level", () => {
		const { result } = renderHook(() => useCanvasZoom());
		act(() => {
			result.current.zoomTo(2);
		});
		expect(result.current.camera.z).toBe(2);
	});

	test("resetZoom returns to default", () => {
		const { result } = renderHook(() => useCanvasZoom());
		act(() => {
			result.current.zoomTo(2);
		});
		act(() => {
			result.current.resetZoom();
		});
		expect(result.current.camera).toEqual({ x: 0, y: 0, z: 1 });
	});

	test("pan updates camera position", () => {
		const { result } = renderHook(() => useCanvasZoom());
		act(() => {
			result.current.startPan(100, 100);
		});
		act(() => {
			result.current.updatePan(120, 110);
		});
		act(() => {
			result.current.endPan();
		});
		expect(result.current.camera.x).toBe(20);
		expect(result.current.camera.y).toBe(10);
		expect(result.current.camera.z).toBe(1);
	});

	test("fitContent adjusts camera to fit viewport", () => {
		const { result } = renderHook(() => useCanvasZoom());
		act(() => {
			result.current.fitContent(400, 800, 800, 600);
		});
		// Should zoom to fit
		expect(result.current.camera.z).toBeLessThan(1);
		expect(result.current.camera.z).toBeGreaterThan(0);
	});
});
