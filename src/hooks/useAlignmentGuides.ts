import {
	type ActiveSelection,
	type Canvas,
	type FabricObject,
	Line,
} from "fabric";
import { useCallback, useRef } from "react";

/**
 * CE-024: Alignment guide configuration
 */
const ALIGNMENT_THRESHOLD = 5; // Pixels within which to show alignment guides
const GUIDE_COLOR = "#ff0080"; // Pink/magenta color for guides
const GUIDE_STROKE_WIDTH = 1;

interface UseAlignmentGuidesOptions {
	canvasWidth: number;
	canvasHeight: number;
}

/**
 * Hook for managing alignment guides on a Fabric.js canvas.
 * Shows alignment guides when objects are moved near canvas edges,
 * canvas center, or other objects. Also handles snapping.
 */
export function useAlignmentGuides(
	fabricRef: React.MutableRefObject<Canvas | null>,
	options: UseAlignmentGuidesOptions,
) {
	const { canvasWidth, canvasHeight } = options;

	// CE-024: Alignment guide refs
	const verticalGuideRef = useRef<Line | null>(null);
	const horizontalGuideRef = useRef<Line | null>(null);
	const centerVerticalGuideRef = useRef<Line | null>(null);
	const centerHorizontalGuideRef = useRef<Line | null>(null);

	/**
	 * Create alignment guide line
	 */
	const createGuideLine = useCallback(
		(points: [number, number, number, number]): Line => {
			return new Line(points, {
				stroke: GUIDE_COLOR,
				strokeWidth: GUIDE_STROKE_WIDTH,
				selectable: false,
				evented: false,
				strokeDashArray: [5, 5],
				excludeFromExport: true,
			});
		},
		[],
	);

	/**
	 * Clear all alignment guides from canvas
	 */
	const clearAlignmentGuides = useCallback(() => {
		const canvas = fabricRef.current;
		if (!canvas) return;

		if (verticalGuideRef.current) {
			canvas.remove(verticalGuideRef.current);
			verticalGuideRef.current = null;
		}
		if (horizontalGuideRef.current) {
			canvas.remove(horizontalGuideRef.current);
			horizontalGuideRef.current = null;
		}
		if (centerVerticalGuideRef.current) {
			canvas.remove(centerVerticalGuideRef.current);
			centerVerticalGuideRef.current = null;
		}
		if (centerHorizontalGuideRef.current) {
			canvas.remove(centerHorizontalGuideRef.current);
			centerHorizontalGuideRef.current = null;
		}
	}, [fabricRef]);

	/**
	 * Check and show alignment guides during object movement.
	 * Also snaps element to alignment position when within threshold.
	 */
	const checkAlignmentGuides = useCallback(
		(movingObject: FabricObject) => {
			const canvas = fabricRef.current;
			if (!canvas) return;

			// Clear existing guides first
			clearAlignmentGuides();

			// Get object dimensions in canvas coordinates
			const movingWidth =
				(movingObject.width || 0) * (movingObject.scaleX || 1);
			const movingHeight =
				(movingObject.height || 0) * (movingObject.scaleY || 1);
			const movingLeft = movingObject.left || 0;
			const movingTop = movingObject.top || 0;
			const movingRight = movingLeft + movingWidth;
			const movingBottom = movingTop + movingHeight;
			const movingCenterX = movingLeft + movingWidth / 2;
			const movingCenterY = movingTop + movingHeight / 2;

			const canvasCenterX = canvasWidth / 2;
			const canvasCenterY = canvasHeight / 2;

			let showVerticalGuide = false;
			let showHorizontalGuide = false;
			let verticalGuideX = 0;
			let horizontalGuideY = 0;

			// Track snap positions
			let snapLeft: number | null = null;
			let snapTop: number | null = null;

			// Check alignment with canvas edges
			if (Math.abs(movingLeft - 0) < ALIGNMENT_THRESHOLD) {
				showVerticalGuide = true;
				verticalGuideX = 0;
				snapLeft = 0;
			}
			if (Math.abs(movingRight - canvasWidth) < ALIGNMENT_THRESHOLD) {
				showVerticalGuide = true;
				verticalGuideX = canvasWidth;
				snapLeft = canvasWidth - movingWidth;
			}
			if (Math.abs(movingTop - 0) < ALIGNMENT_THRESHOLD) {
				showHorizontalGuide = true;
				horizontalGuideY = 0;
				snapTop = 0;
			}
			if (Math.abs(movingBottom - canvasHeight) < ALIGNMENT_THRESHOLD) {
				showHorizontalGuide = true;
				horizontalGuideY = canvasHeight;
				snapTop = canvasHeight - movingHeight;
			}

			// Check alignment with canvas center
			if (Math.abs(movingCenterX - canvasCenterX) < ALIGNMENT_THRESHOLD) {
				showVerticalGuide = true;
				verticalGuideX = canvasCenterX;
				snapLeft = canvasCenterX - movingWidth / 2;
			}
			if (Math.abs(movingCenterY - canvasCenterY) < ALIGNMENT_THRESHOLD) {
				showHorizontalGuide = true;
				horizontalGuideY = canvasCenterY;
				snapTop = canvasCenterY - movingHeight / 2;
			}

			// Check alignment with other objects
			const objects = canvas.getObjects();
			for (const obj of objects) {
				// Skip the moving object itself and guide lines
				if (
					obj === movingObject ||
					obj === verticalGuideRef.current ||
					obj === horizontalGuideRef.current ||
					obj === centerVerticalGuideRef.current ||
					obj === centerHorizontalGuideRef.current
				)
					continue;

				// Skip if object is part of the active selection
				if (movingObject.type === "activeselection") {
					const selection = movingObject as ActiveSelection;
					if (selection.getObjects().includes(obj)) continue;
				}

				// Get target object dimensions
				const targetWidth = (obj.width || 0) * (obj.scaleX || 1);
				const targetHeight = (obj.height || 0) * (obj.scaleY || 1);
				const targetLeft = obj.left || 0;
				const targetTop = obj.top || 0;
				const targetRight = targetLeft + targetWidth;
				const targetBottom = targetTop + targetHeight;
				const targetCenterX = targetLeft + targetWidth / 2;
				const targetCenterY = targetTop + targetHeight / 2;

				// Check vertical alignments (X positions)
				if (Math.abs(movingLeft - targetLeft) < ALIGNMENT_THRESHOLD) {
					showVerticalGuide = true;
					verticalGuideX = targetLeft;
					snapLeft = targetLeft;
				}
				if (Math.abs(movingRight - targetRight) < ALIGNMENT_THRESHOLD) {
					showVerticalGuide = true;
					verticalGuideX = targetRight;
					snapLeft = targetRight - movingWidth;
				}
				if (Math.abs(movingLeft - targetRight) < ALIGNMENT_THRESHOLD) {
					showVerticalGuide = true;
					verticalGuideX = targetRight;
					snapLeft = targetRight;
				}
				if (Math.abs(movingRight - targetLeft) < ALIGNMENT_THRESHOLD) {
					showVerticalGuide = true;
					verticalGuideX = targetLeft;
					snapLeft = targetLeft - movingWidth;
				}
				if (Math.abs(movingCenterX - targetCenterX) < ALIGNMENT_THRESHOLD) {
					showVerticalGuide = true;
					verticalGuideX = targetCenterX;
					snapLeft = targetCenterX - movingWidth / 2;
				}

				// Check horizontal alignments (Y positions)
				if (Math.abs(movingTop - targetTop) < ALIGNMENT_THRESHOLD) {
					showHorizontalGuide = true;
					horizontalGuideY = targetTop;
					snapTop = targetTop;
				}
				if (Math.abs(movingBottom - targetBottom) < ALIGNMENT_THRESHOLD) {
					showHorizontalGuide = true;
					horizontalGuideY = targetBottom;
					snapTop = targetBottom - movingHeight;
				}
				if (Math.abs(movingTop - targetBottom) < ALIGNMENT_THRESHOLD) {
					showHorizontalGuide = true;
					horizontalGuideY = targetBottom;
					snapTop = targetBottom;
				}
				if (Math.abs(movingBottom - targetTop) < ALIGNMENT_THRESHOLD) {
					showHorizontalGuide = true;
					horizontalGuideY = targetTop;
					snapTop = targetTop - movingHeight;
				}
				if (Math.abs(movingCenterY - targetCenterY) < ALIGNMENT_THRESHOLD) {
					showHorizontalGuide = true;
					horizontalGuideY = targetCenterY;
					snapTop = targetCenterY - movingHeight / 2;
				}
			}

			// Apply snap positions
			if (snapLeft !== null) {
				movingObject.set("left", snapLeft);
			}
			if (snapTop !== null) {
				movingObject.set("top", snapTop);
			}
			if (snapLeft !== null || snapTop !== null) {
				movingObject.setCoords();
			}

			// Create and show vertical guide
			if (showVerticalGuide) {
				const guide = createGuideLine([
					verticalGuideX,
					0,
					verticalGuideX,
					canvasHeight,
				]);
				verticalGuideRef.current = guide;
				canvas.add(guide);
				canvas.bringObjectToFront(guide);
			}

			// Create and show horizontal guide
			if (showHorizontalGuide) {
				const guide = createGuideLine([
					0,
					horizontalGuideY,
					canvasWidth,
					horizontalGuideY,
				]);
				horizontalGuideRef.current = guide;
				canvas.add(guide);
				canvas.bringObjectToFront(guide);
			}

			canvas.requestRenderAll();
		},
		[
			fabricRef,
			canvasWidth,
			canvasHeight,
			clearAlignmentGuides,
			createGuideLine,
		],
	);

	/**
	 * Handler for object:moving events
	 */
	const handleObjectMoving = useCallback(
		(e: { target?: FabricObject }) => {
			if (e.target) {
				checkAlignmentGuides(e.target);
			}
		},
		[checkAlignmentGuides],
	);

	/**
	 * Handler for object:modified events
	 */
	const handleObjectModified = useCallback(() => {
		clearAlignmentGuides();
	}, [clearAlignmentGuides]);

	return {
		checkAlignmentGuides,
		clearAlignmentGuides,
		handleObjectMoving,
		handleObjectModified,
	};
}
