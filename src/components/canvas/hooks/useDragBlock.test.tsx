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
