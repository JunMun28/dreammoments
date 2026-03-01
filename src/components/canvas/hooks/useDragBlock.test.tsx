// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Position } from "@/lib/canvas/types";
import { useDragBlock } from "./useDragBlock";

describe("useDragBlock", () => {
	beforeEach(() => {
		vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
			callback(0);
			return 1;
		});
		vi.stubGlobal("cancelAnimationFrame", vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	function makeEvent(overrides: Record<string, unknown>) {
		return overrides as unknown as React.PointerEvent<HTMLElement>;
	}

	function makePointerDown(overrides: Record<string, unknown> = {}) {
		return makeEvent({
			button: 0,
			pointerId: 1,
			pointerType: "mouse",
			clientX: 100,
			clientY: 100,
			shiftKey: false,
			currentTarget: {
				setPointerCapture: vi.fn(),
			},
			...overrides,
		});
	}

	test("does not start drag when movement is below threshold (3px)", () => {
		const previews: Position[] = [];
		const onStart = vi.fn();

		const { result } = renderHook(() =>
			useDragBlock({
				blockId: "block-1",
				canvasRef: { current: null },
				getSize: () => ({ width: 100, height: 40 }),
				getOrigin: () => ({ x: 20, y: 30 }),
				onPreview: (position) => previews.push(position),
				onCommit: vi.fn(),
				onStart,
				snapPosition: ({ position }) => ({ position, guides: [] }),
			}),
		);

		act(() => {
			result.current.onPointerDown(makePointerDown());
		});

		// Move only 2px — below the 3px threshold
		act(() => {
			result.current.onPointerMove(
				makeEvent({ pointerId: 1, clientX: 102, clientY: 100 }),
			);
		});

		expect(onStart).not.toHaveBeenCalled();
		expect(previews).toHaveLength(0);
	});

	test("defers pointer capture until movement exceeds threshold", () => {
		const setPointerCapture = vi.fn();
		const onStart = vi.fn();

		const { result } = renderHook(() =>
			useDragBlock({
				blockId: "block-1",
				canvasRef: { current: null },
				getSize: () => ({ width: 100, height: 40 }),
				getOrigin: () => ({ x: 20, y: 30 }),
				onPreview: vi.fn(),
				onCommit: vi.fn(),
				onStart,
				snapPosition: ({ position }) => ({ position, guides: [] }),
			}),
		);

		const downEvent = makePointerDown({
			currentTarget: { setPointerCapture },
		});

		act(() => {
			result.current.onPointerDown(downEvent);
		});

		// Not captured on pointerdown for mouse
		expect(setPointerCapture).not.toHaveBeenCalled();

		// Move past threshold
		act(() => {
			result.current.onPointerMove(
				makeEvent({ pointerId: 1, clientX: 104, clientY: 100 }),
			);
		});

		expect(setPointerCapture).toHaveBeenCalledWith(1);
		expect(onStart).toHaveBeenCalledOnce();
	});

	test("touch captures immediately and uses long-press", () => {
		vi.useFakeTimers();
		const setPointerCapture = vi.fn();
		const onStart = vi.fn();

		const { result } = renderHook(() =>
			useDragBlock({
				blockId: "block-1",
				canvasRef: { current: null },
				getSize: () => ({ width: 100, height: 40 }),
				getOrigin: () => ({ x: 20, y: 30 }),
				onPreview: vi.fn(),
				onCommit: vi.fn(),
				onStart,
				snapPosition: ({ position }) => ({ position, guides: [] }),
			}),
		);

		act(() => {
			result.current.onPointerDown(
				makePointerDown({
					pointerType: "touch",
					currentTarget: { setPointerCapture },
				}),
			);
		});

		// Touch captures immediately
		expect(setPointerCapture).toHaveBeenCalledWith(1);
		// But drag is not active until long-press timer fires
		expect(onStart).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(300);
		});

		expect(onStart).toHaveBeenCalledOnce();
		vi.useRealTimers();
	});

	test("keeps pointer delta stable across multiple move events", () => {
		let livePosition: Position = { x: 20, y: 30 };
		const previews: Position[] = [];
		const onCommit = vi.fn();

		const { result } = renderHook(() =>
			useDragBlock({
				blockId: "block-1",
				canvasRef: { current: null },
				getSize: () => ({ width: 100, height: 40 }),
				getOrigin: () => livePosition,
				onPreview: (position) => {
					livePosition = position;
					previews.push(position);
				},
				onCommit,
				snapPosition: ({ position }) => ({
					position,
					guides: [],
				}),
			}),
		);

		act(() => {
			result.current.onPointerDown({
				button: 0,
				pointerId: 1,
				pointerType: "mouse",
				clientX: 100,
				clientY: 100,
				shiftKey: false,
				currentTarget: {
					setPointerCapture: vi.fn(),
				},
			} as unknown as React.PointerEvent<HTMLElement>);
		});

		act(() => {
			result.current.onPointerMove({
				pointerId: 1,
				clientX: 110,
				clientY: 100,
			} as React.PointerEvent<HTMLElement>);
		});

		act(() => {
			result.current.onPointerMove({
				pointerId: 1,
				clientX: 120,
				clientY: 100,
			} as React.PointerEvent<HTMLElement>);
		});

		act(() => {
			result.current.onPointerUp({
				pointerId: 1,
			} as React.PointerEvent<HTMLElement>);
		});

		expect(previews[0]).toEqual({ x: 30, y: 30 });
		expect(previews[1]).toEqual({ x: 40, y: 30 });
		expect(onCommit).toHaveBeenCalledWith({
			position: { x: 40, y: 30 },
			disableSnap: false,
		});
	});
});
