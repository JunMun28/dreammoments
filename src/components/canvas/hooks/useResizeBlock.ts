import { useCallback, useRef } from "react";
import type { Size } from "@/lib/canvas/types";

export interface UseResizeBlockParams {
	getSize: () => Size;
	onPreview: (size: Size) => void;
	onCommit: (size: Size) => void;
	minWidth?: number;
	minHeight?: number;
}

export function useResizeBlock({
	getSize,
	onPreview,
	onCommit,
	minWidth = 24,
	minHeight = 24,
}: UseResizeBlockParams) {
	const startPointerRef = useRef<{ x: number; y: number } | null>(null);
	const startSizeRef = useRef<Size | null>(null);
	const activePointerIdRef = useRef<number | null>(null);
	const previewSizeRef = useRef<Size | null>(null);

	const onPointerDown = useCallback(
		(event: React.PointerEvent<HTMLElement>) => {
			if (event.button !== 0) return;
			event.stopPropagation();
			const target = event.currentTarget;
			target.setPointerCapture(event.pointerId);
			activePointerIdRef.current = event.pointerId;
			startPointerRef.current = { x: event.clientX, y: event.clientY };
			startSizeRef.current = getSize();
			previewSizeRef.current = getSize();
		},
		[getSize],
	);

	const onPointerMove = useCallback(
		(event: React.PointerEvent<HTMLElement>) => {
			if (event.pointerId !== activePointerIdRef.current) return;
			const startPointer = startPointerRef.current;
			const startSize = startSizeRef.current;
			if (!startPointer || !startSize) return;

			const nextSize: Size = {
				width: Math.max(
					minWidth,
					startSize.width + (event.clientX - startPointer.x),
				),
				height: Math.max(
					minHeight,
					startSize.height + (event.clientY - startPointer.y),
				),
			};
			previewSizeRef.current = nextSize;
			onPreview(nextSize);
		},
		[minHeight, minWidth, onPreview],
	);

	const finishResize = useCallback(() => {
		if (previewSizeRef.current) {
			onCommit(previewSizeRef.current);
		}
		activePointerIdRef.current = null;
		startPointerRef.current = null;
		startSizeRef.current = null;
		previewSizeRef.current = null;
	}, [onCommit]);

	const onPointerUp = useCallback(
		(event: React.PointerEvent<HTMLElement>) => {
			if (event.pointerId !== activePointerIdRef.current) return;
			event.stopPropagation();
			finishResize();
		},
		[finishResize],
	);

	const onPointerCancel = useCallback(
		(event: React.PointerEvent<HTMLElement>) => {
			if (event.pointerId !== activePointerIdRef.current) return;
			event.stopPropagation();
			finishResize();
		},
		[finishResize],
	);

	return {
		onPointerDown,
		onPointerMove,
		onPointerUp,
		onPointerCancel,
	};
}
