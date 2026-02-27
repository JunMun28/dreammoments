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
/** Movement threshold before acquiring pointer capture (allows dblclick synthesis) */
const DRAG_START_THRESHOLD = 3;

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
	/** Element to capture on after drag threshold (deferred from pointerdown) */
	const captureTargetRef = useRef<HTMLElement | null>(null);
	/** Whether we have acquired pointer capture */
	const capturedRef = useRef(false);

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

			captureTargetRef.current = event.currentTarget;
			capturedRef.current = false;
			activePointerIdRef.current = event.pointerId;
			startPointerRef.current = {
				x: event.clientX,
				y: event.clientY,
			};
			startOriginRef.current = getOrigin();
			disableSnapRef.current = event.shiftKey;

			if (event.pointerType === "touch") {
				// Touch: capture immediately, use long-press to activate drag
				event.currentTarget.setPointerCapture(event.pointerId);
				capturedRef.current = true;
				touchPendingRef.current = true;
				longPressTimerRef.current = setTimeout(() => {
					setDraggingActive();
					touchPendingRef.current = false;
				}, MOBILE_LONG_PRESS_MS);
			}
			// Mouse/pen: defer capture until DRAG_START_THRESHOLD movement.
			// This allows the browser to synthesize dblclick events for
			// quick click-click sequences (needed for inline text editing).
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

			// Touch: cancel long-press if moved too far
			if (touchPendingRef.current) {
				if (
					Math.abs(deltaX) > MOVE_CANCEL_THRESHOLD ||
					Math.abs(deltaY) > MOVE_CANCEL_THRESHOLD
				) {
					clearLongPress();
				}
				return;
			}

			// Mouse/pen: acquire capture after movement threshold
			if (!capturedRef.current && captureTargetRef.current) {
				if (
					Math.abs(deltaX) >= DRAG_START_THRESHOLD ||
					Math.abs(deltaY) >= DRAG_START_THRESHOLD
				) {
					captureTargetRef.current.setPointerCapture(event.pointerId);
					capturedRef.current = true;
					setDraggingActive();
				} else {
					return; // Below threshold, don't start drag yet
				}
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
			setDraggingActive,
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
		captureTargetRef.current = null;
		capturedRef.current = false;
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
