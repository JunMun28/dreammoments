import { useCallback, useRef, useState } from "react";
import {
	type Camera,
	DEFAULT_CAMERA,
	fitToViewport,
	panCamera,
	zoomAtPoint,
} from "@/lib/canvas/camera";

export function useCanvasZoom() {
	const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);
	const isPanningRef = useRef(false);
	const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

	const zoomTo = useCallback(
		(level: number) => {
			setCamera((prev) => zoomAtPoint(prev, { x: 0, y: 0 }, level));
		},
		[],
	);

	const zoomAtScreenPoint = useCallback(
		(screenX: number, screenY: number, nextZoom: number) => {
			setCamera((prev) =>
				zoomAtPoint(prev, { x: screenX, y: screenY }, nextZoom),
			);
		},
		[],
	);

	const handleWheel = useCallback(
		(event: WheelEvent) => {
			// Cmd/Ctrl + scroll = zoom
			if (event.metaKey || event.ctrlKey) {
				event.preventDefault();
				const zoomFactor = event.deltaY > 0 ? 0.95 : 1.05;
				setCamera((prev) =>
					zoomAtPoint(
						prev,
						{ x: event.clientX, y: event.clientY },
						prev.z * zoomFactor,
					),
				);
			}
		},
		[],
	);

	const startPan = useCallback((clientX: number, clientY: number) => {
		isPanningRef.current = true;
		lastPointerRef.current = { x: clientX, y: clientY };
	}, []);

	const updatePan = useCallback((clientX: number, clientY: number) => {
		if (!isPanningRef.current || !lastPointerRef.current) return;
		const deltaX = clientX - lastPointerRef.current.x;
		const deltaY = clientY - lastPointerRef.current.y;
		lastPointerRef.current = { x: clientX, y: clientY };
		setCamera((prev) => panCamera(prev, deltaX, deltaY));
	}, []);

	const endPan = useCallback(() => {
		isPanningRef.current = false;
		lastPointerRef.current = null;
	}, []);

	const resetZoom = useCallback(() => {
		setCamera(DEFAULT_CAMERA);
	}, []);

	const fitContent = useCallback(
		(
			contentWidth: number,
			contentHeight: number,
			viewportWidth: number,
			viewportHeight: number,
		) => {
			setCamera(
				fitToViewport(
					contentWidth,
					contentHeight,
					viewportWidth,
					viewportHeight,
				),
			);
		},
		[],
	);

	return {
		camera,
		zoomTo,
		zoomAtScreenPoint,
		handleWheel,
		startPan,
		updatePan,
		endPan,
		resetZoom,
		fitContent,
		isPanning: isPanningRef,
	};
}
