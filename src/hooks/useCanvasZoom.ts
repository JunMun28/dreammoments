import type { Canvas } from "fabric";
import { useCallback, useState } from "react";

/**
 * Zoom configuration for CE-002
 */
const ZOOM_MIN = 0.5; // 50%
const ZOOM_MAX = 2.0; // 200%
const ZOOM_STEP = 0.1; // 10% per click
const ZOOM_PRESETS = [0.5, 0.8, 1.0, 1.5, 2.0]; // 50%, 80%, 100%, 150%, 200%

export { ZOOM_MIN, ZOOM_MAX, ZOOM_PRESETS };

/**
 * Hook for managing zoom controls on a Fabric.js canvas.
 * Provides zoom in, zoom out, preset selection, and fit to screen.
 */
export function useCanvasZoom(
	fabricRef: React.MutableRefObject<Canvas | null>,
) {
	const [zoomLevel, setZoomLevel] = useState(1.0);

	/**
	 * Set zoom level on the canvas
	 */
	const setZoom = useCallback(
		(newZoom: number) => {
			if (!fabricRef.current) return;

			// Clamp zoom to valid range
			const clampedZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));

			// Get canvas center point for zoom
			const canvas = fabricRef.current;
			const center = canvas.getCenterPoint();

			// Apply zoom centered on canvas
			canvas.zoomToPoint(center, clampedZoom);
			setZoomLevel(clampedZoom);
			canvas.requestRenderAll();
		},
		[fabricRef],
	);

	/**
	 * Zoom in by one step
	 */
	const handleZoomIn = useCallback(() => {
		setZoom(zoomLevel + ZOOM_STEP);
	}, [zoomLevel, setZoom]);

	/**
	 * Zoom out by one step
	 */
	const handleZoomOut = useCallback(() => {
		setZoom(zoomLevel - ZOOM_STEP);
	}, [zoomLevel, setZoom]);

	/**
	 * Set zoom to a specific preset value
	 */
	const handleZoomPreset = useCallback(
		(preset: number) => {
			setZoom(preset);
		},
		[setZoom],
	);

	/**
	 * Fit canvas to screen (reset to 100% centered view)
	 */
	const handleFitToScreen = useCallback(() => {
		if (!fabricRef.current) return;

		const canvas = fabricRef.current;

		// Reset zoom to 100%
		setZoom(1.0);

		// Reset viewport transform to center
		canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
		canvas.requestRenderAll();
	}, [fabricRef, setZoom]);

	return {
		zoomLevel,
		setZoom,
		handleZoomIn,
		handleZoomOut,
		handleZoomPreset,
		handleFitToScreen,
		isMinZoom: zoomLevel <= ZOOM_MIN,
		isMaxZoom: zoomLevel >= ZOOM_MAX,
	};
}
