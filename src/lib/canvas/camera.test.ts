import { describe, expect, test } from "vitest";
import {
	type Camera,
	DEFAULT_CAMERA,
	MAX_ZOOM,
	MIN_ZOOM,
	canvasToScreen,
	fitToViewport,
	panCamera,
	screenToCanvas,
	zoomAtPoint,
} from "./camera";

describe("camera utilities", () => {
	test("screenToCanvas and canvasToScreen are inverses at default camera", () => {
		const point = { x: 100, y: 200 };
		const canvas = screenToCanvas(point, DEFAULT_CAMERA);
		const screen = canvasToScreen(canvas, DEFAULT_CAMERA);
		expect(screen.x).toBeCloseTo(point.x);
		expect(screen.y).toBeCloseTo(point.y);
	});

	test("screenToCanvas accounts for pan and zoom", () => {
		const camera: Camera = { x: 50, y: 100, z: 2 };
		const result = screenToCanvas({ x: 150, y: 300 }, camera);
		expect(result.x).toBeCloseTo(50);
		expect(result.y).toBeCloseTo(100);
	});

	test("zoomAtPoint keeps the target point fixed", () => {
		const camera: Camera = { x: 0, y: 0, z: 1 };
		const target = { x: 200, y: 300 };

		const zoomed = zoomAtPoint(camera, target, 2);

		// The point under cursor in canvas space should be same before and after
		const beforeCanvas = screenToCanvas(target, camera);
		const afterScreen = canvasToScreen(beforeCanvas, zoomed);
		expect(afterScreen.x).toBeCloseTo(target.x);
		expect(afterScreen.y).toBeCloseTo(target.y);
	});

	test("zoomAtPoint clamps to min/max", () => {
		const camera = DEFAULT_CAMERA;
		const point = { x: 0, y: 0 };

		expect(zoomAtPoint(camera, point, 0.1).z).toBe(MIN_ZOOM);
		expect(zoomAtPoint(camera, point, 10).z).toBe(MAX_ZOOM);
	});

	test("panCamera shifts by delta", () => {
		const camera: Camera = { x: 10, y: 20, z: 1.5 };
		const panned = panCamera(camera, -5, 10);
		expect(panned).toEqual({ x: 5, y: 30, z: 1.5 });
	});

	test("fitToViewport centers content", () => {
		const camera = fitToViewport(400, 600, 800, 800, 0);
		// Content should be centered
		expect(camera.z).toBeCloseTo(800 / 600); // Height is constraining
		expect(camera.x).toBeGreaterThan(0); // Centered horizontally
	});
});
