import { useCallback, useRef } from "react";
import type { Position, Size } from "@/lib/canvas/types";
import type { GuideLine } from "./useSnapGuides";

export interface DragCommitPayload {
	position: Position;
	disableSnap: boolean;
}

export interface UseDragBlockParams {
	blockId: string;
	canvasRef: React.RefObject<HTMLElement | null>;
	getSize: () => Size;
	getOrigin: () => Position;
	onPreview: (position: Position, guides: GuideLine[]) => void;
	onCommit: (payload: DragCommitPayload) => void;
	onStart?: () => void;
	onEnd?: () => void;
	snapPosition: (params: {
		position: Position;
		size: Size;
		disableSnap: boolean;
	}) => { position: Position; guides: GuideLine[] };
	disabled?: boolean;
}

const MOBILE_LONG_PRESS_MS = 300;
const MOVE_CANCEL_THRESHOLD = 8;

export function useDragBlock({
	canvasRef,
	getSize,
	getOrigin,
	onPreview,
	onCommit,
	onStart,
	onEnd,
	snapPosition,
	disabled,
}: UseDragBlockParams) {
	const rafRef = useRef<number | null>(null);
	const activePointerIdRef = useRef<number | null>(null);
	const startPointerRef = useRef<Position | null>(null);
	const startOriginRef = useRef<Position | null>(null);
	const activeRef = useRef(false);
	const disableSnapRef = useRef(false);
	const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const touchPendingRef = useRef(false);

	const clearRaf = useCallback(() => {
		if (rafRef.current != null) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
	}, []);

	const clearLongPress = useCallback(() => {
		if (longPressTimerRef.current) {
			clearTimeout(longPressTimerRef.current);
			longPressTimerRef.current = null;
		}
		touchPendingRef.current = false;
	}, []);

	const setDraggingActive = useCallback(() => {
		activeRef.current = true;
		onStart?.();
	}, [onStart]);

	const onPointerDown = useCallback(
		(event: React.PointerEvent<HTMLElement>) => {
			if (disabled) return;
			if (event.button !== 0) return;

			const target = event.currentTarget;
			target.setPointerCapture(event.pointerId);
			activePointerIdRef.current = event.pointerId;
			startPointerRef.current = {
				x: event.clientX,
				y: event.clientY,
			};
			startOriginRef.current = getOrigin();
			disableSnapRef.current = event.shiftKey;

			if (event.pointerType === "touch") {
				touchPendingRef.current = true;
				longPressTimerRef.current = setTimeout(() => {
					setDraggingActive();
					touchPendingRef.current = false;
				}, MOBILE_LONG_PRESS_MS);
			} else {
				setDraggingActive();
			}
		},
		[disabled, getOrigin, setDraggingActive],
	);

	const onPointerMove = useCallback(
		(event: React.PointerEvent<HTMLElement>) => {
			if (disabled) return;
			if (event.pointerId !== activePointerIdRef.current) return;
			const startPointer = startPointerRef.current;
			if (!startPointer) return;

			const deltaX = event.clientX - startPointer.x;
			const deltaY = event.clientY - startPointer.y;

			if (touchPendingRef.current) {
				if (
					Math.abs(deltaX) > MOVE_CANCEL_THRESHOLD ||
					Math.abs(deltaY) > MOVE_CANCEL_THRESHOLD
				) {
					clearLongPress();
				}
				return;
			}

			if (!activeRef.current) return;

			const origin = startOriginRef.current;
			if (!origin) return;
			const size = getSize();
			const previewRaw = {
				x: origin.x + deltaX,
				y: origin.y + deltaY,
			};
			const snap = snapPosition({
				position: previewRaw,
				size,
				disableSnap: disableSnapRef.current,
			});

			clearRaf();
			rafRef.current = requestAnimationFrame(() => {
				onPreview(snap.position, snap.guides);
			});

			const canvas = canvasRef.current;
			if (canvas) {
				const rect = canvas.getBoundingClientRect();
				const edgeThreshold = 40;
				const maxStep = 12;
				if (event.clientY - rect.top < edgeThreshold) {
					canvas.scrollTop -= maxStep;
				} else if (rect.bottom - event.clientY < edgeThreshold) {
					canvas.scrollTop += maxStep;
				}
			}
		},
		[
			canvasRef,
			clearLongPress,
			clearRaf,
			disabled,
			getSize,
			onPreview,
			snapPosition,
		],
	);

	const finishDrag = useCallback(() => {
		clearLongPress();
		clearRaf();
		if (activeRef.current) {
			const origin = getOrigin();
			const size = getSize();
			const snap = snapPosition({
				position: origin,
				size,
				disableSnap: disableSnapRef.current,
			});
			onCommit({
				position: snap.position,
				disableSnap: disableSnapRef.current,
			});
			onEnd?.();
		}
		activeRef.current = false;
		activePointerIdRef.current = null;
		startPointerRef.current = null;
		startOriginRef.current = null;
		disableSnapRef.current = false;
	}, [
		clearLongPress,
		clearRaf,
		getOrigin,
		getSize,
		onCommit,
		onEnd,
		snapPosition,
	]);

	const onPointerUp = useCallback(
		(event: React.PointerEvent<HTMLElement>) => {
			if (event.pointerId !== activePointerIdRef.current) return;
			finishDrag();
		},
		[finishDrag],
	);

	const onPointerCancel = useCallback(
		(event: React.PointerEvent<HTMLElement>) => {
			if (event.pointerId !== activePointerIdRef.current) return;
			finishDrag();
		},
		[finishDrag],
	);

	return {
		onPointerDown,
		onPointerMove,
		onPointerUp,
		onPointerCancel,
		isDragging: activeRef,
	};
}
