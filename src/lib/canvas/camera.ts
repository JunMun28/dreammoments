import type { Position } from "./types";

export interface Camera {
	x: number;
	y: number;
	z: number;
}

export const DEFAULT_CAMERA: Camera = { x: 0, y: 0, z: 1 };

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4;

/** Convert screen coordinates to canvas coordinates */
export function screenToCanvas(
	screenPoint: Position,
	camera: Camera,
): Position {
	return {
		x: (screenPoint.x - camera.x) / camera.z,
		y: (screenPoint.y - camera.y) / camera.z,
	};
}

/** Convert canvas coordinates to screen coordinates */
export function canvasToScreen(
	canvasPoint: Position,
	camera: Camera,
): Position {
	return {
		x: canvasPoint.x * camera.z + camera.x,
		y: canvasPoint.y * camera.z + camera.y,
	};
}

/**
 * Zoom the camera at a specific screen point.
 * The point under the cursor stays fixed after zoom.
 */
export function zoomAtPoint(
	camera: Camera,
	screenPoint: Position,
	nextZoom: number,
): Camera {
	const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
	return {
		x: screenPoint.x - ((screenPoint.x - camera.x) / camera.z) * z,
		y: screenPoint.y - ((screenPoint.y - camera.y) / camera.z) * z,
		z,
	};
}

/** Pan the camera by a screen delta */
export function panCamera(
	camera: Camera,
	deltaX: number,
	deltaY: number,
): Camera {
	return {
		x: camera.x + deltaX,
		y: camera.y + deltaY,
		z: camera.z,
	};
}

/** Reset camera to fit content within a viewport */
export function fitToViewport(
	contentWidth: number,
	contentHeight: number,
	viewportWidth: number,
	viewportHeight: number,
	padding = 40,
): Camera {
	const scaleX = (viewportWidth - padding * 2) / contentWidth;
	const scaleY = (viewportHeight - padding * 2) / contentHeight;
	const z = Math.min(Math.max(Math.min(scaleX, scaleY), MIN_ZOOM), MAX_ZOOM);
	return {
		x: (viewportWidth - contentWidth * z) / 2,
		y: (viewportHeight - contentHeight * z) / 2,
		z,
	};
}
