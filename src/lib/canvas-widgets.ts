import { type FabricObject, Group, IText, Rect } from "fabric";
import type { WidgetDefinition } from "@/components/editor/ComponentsPanel";

/**
 * Common Fabric.js object styling for widgets
 */
const WIDGET_STYLING = {
	cornerColor: "#3b82f6",
	cornerStrokeColor: "#1d4ed8",
	cornerSize: 10,
	transparentCorners: false,
	borderColor: "#3b82f6",
};

/**
 * Creates the background rect for a widget
 */
function createWidgetBackground(width: number, height: number): Rect {
	return new Rect({
		width,
		height,
		fill: "#f5f5f4", // stone-100
		stroke: "#d6d3d1", // stone-300
		strokeWidth: 1,
		rx: 8,
		ry: 8,
	});
}

/**
 * Creates the widget type label
 */
function createWidgetLabel(name: string, width: number): IText {
	return new IText(name, {
		fontSize: 14,
		fontFamily: "sans-serif",
		fontWeight: "bold",
		fill: "#57534e", // stone-600
		left: width / 2,
		top: 12,
		originX: "center",
	});
}

/**
 * Creates countdown timer widget content (CE-020)
 */
function createCountdownContent(): FabricObject[] {
	const items: { value: string; label: string; left: number }[] = [
		{ value: "00", label: "Days", left: 40 },
		{ value: "00", label: "Hours", left: 100 },
		{ value: "00", label: "Mins", left: 165 },
		{ value: "00", label: "Secs", left: 225 },
	];

	const elements: FabricObject[] = [];

	for (const item of items) {
		elements.push(
			new IText(item.value, {
				fontSize: 32,
				fontFamily: "sans-serif",
				fontWeight: "bold",
				fill: "#292524",
				left: item.left,
				top: 45,
			}),
		);
		elements.push(
			new IText(item.label, {
				fontSize: 10,
				fontFamily: "sans-serif",
				fill: "#78716c",
				left: item.left,
				top: 80,
			}),
		);
	}

	return elements;
}

/**
 * Creates venue map widget content (CE-021)
 */
function createMapContent(width: number, height: number): FabricObject[] {
	return [
		new Rect({
			width: width - 20,
			height: height - 60,
			fill: "#e7e5e4",
			left: 10,
			top: 40,
			rx: 4,
			ry: 4,
		}),
		new IText("\u{1F4CD}", {
			// 📍
			fontSize: 24,
			left: width / 2,
			top: height / 2,
			originX: "center",
			originY: "center",
		}),
		new IText("Enter venue address", {
			fontSize: 11,
			fontFamily: "sans-serif",
			fill: "#a8a29e",
			left: width / 2,
			top: height - 25,
			originX: "center",
		}),
	];
}

/**
 * Creates RSVP form widget content (CE-022)
 */
function createRsvpContent(width: number): FabricObject[] {
	return [
		// Name field
		new Rect({
			width: width - 40,
			height: 32,
			fill: "#ffffff",
			stroke: "#d6d3d1",
			strokeWidth: 1,
			left: 20,
			top: 45,
			rx: 4,
			ry: 4,
		}),
		new IText("Name", {
			fontSize: 10,
			fontFamily: "sans-serif",
			fill: "#78716c",
			left: 25,
			top: 52,
		}),
		// Email field
		new Rect({
			width: width - 40,
			height: 32,
			fill: "#ffffff",
			stroke: "#d6d3d1",
			strokeWidth: 1,
			left: 20,
			top: 90,
			rx: 4,
			ry: 4,
		}),
		new IText("Email", {
			fontSize: 10,
			fontFamily: "sans-serif",
			fill: "#78716c",
			left: 25,
			top: 97,
		}),
		// Attending question
		new IText("Will you attend?", {
			fontSize: 12,
			fontFamily: "sans-serif",
			fill: "#57534e",
			left: 20,
			top: 135,
		}),
		// Yes button
		new Rect({
			width: 60,
			height: 28,
			fill: "#c4a373",
			left: 20,
			top: 155,
			rx: 4,
			ry: 4,
		}),
		new IText("Yes", {
			fontSize: 12,
			fontFamily: "sans-serif",
			fill: "#ffffff",
			left: 40,
			top: 162,
		}),
		// No button
		new Rect({
			width: 60,
			height: 28,
			fill: "#e7e5e4",
			left: 90,
			top: 155,
			rx: 4,
			ry: 4,
		}),
		new IText("No", {
			fontSize: 12,
			fontFamily: "sans-serif",
			fill: "#57534e",
			left: 112,
			top: 162,
		}),
		// Submit button
		new Rect({
			width: width - 40,
			height: 36,
			fill: "#292524",
			left: 20,
			top: 200,
			rx: 4,
			ry: 4,
		}),
		new IText("Submit RSVP", {
			fontSize: 14,
			fontFamily: "sans-serif",
			fill: "#ffffff",
			left: width / 2,
			top: 212,
			originX: "center",
		}),
	];
}

/**
 * Creates photo gallery widget content (CE-023)
 */
function createGalleryContent(width: number, height: number): FabricObject[] {
	const elements: FabricObject[] = [];
	const gridSize = 3;
	const cellSize = (width - 40) / gridSize;

	for (let row = 0; row < 2; row++) {
		for (let col = 0; col < gridSize; col++) {
			elements.push(
				new Rect({
					width: cellSize - 5,
					height: cellSize - 5,
					fill: "#e7e5e4",
					left: 20 + col * cellSize,
					top: 45 + row * cellSize,
					rx: 4,
					ry: 4,
				}),
			);
			elements.push(
				new IText("\u{1F5BC}", {
					// 🖼
					fontSize: 20,
					left: 20 + col * cellSize + (cellSize - 5) / 2,
					top: 45 + row * cellSize + (cellSize - 5) / 2,
					originX: "center",
					originY: "center",
				}),
			);
		}
	}

	elements.push(
		new IText("Click to add photos", {
			fontSize: 11,
			fontFamily: "sans-serif",
			fill: "#a8a29e",
			left: width / 2,
			top: height - 25,
			originX: "center",
		}),
	);

	return elements;
}

/**
 * Creates schedule timeline widget content
 */
function createScheduleContent(): FabricObject[] {
	const scheduleItems = [
		{ time: "3:00 PM", event: "Ceremony", top: 50 },
		{ time: "4:00 PM", event: "Cocktails", top: 75 },
		{ time: "5:30 PM", event: "Reception", top: 100 },
		{ time: "8:00 PM", event: "Dancing", top: 125 },
	];

	const elements: FabricObject[] = [
		// Timeline line
		new Rect({
			width: 2,
			height: 100,
			fill: "#c4a373",
			left: 10,
			top: 50,
		}),
	];

	for (const item of scheduleItems) {
		elements.push(
			new IText(`${item.time} - ${item.event}`, {
				fontSize: 12,
				fontFamily: "sans-serif",
				fill: "#57534e",
				left: 20,
				top: item.top,
			}),
		);
	}

	return elements;
}

/**
 * Gets widget content elements based on widget type
 */
function getWidgetContent(
	type: string,
	width: number,
	height: number,
): FabricObject[] {
	switch (type) {
		case "countdown":
			return createCountdownContent();
		case "map":
			return createMapContent(width, height);
		case "rsvp":
			return createRsvpContent(width);
		case "gallery":
			return createGalleryContent(width, height);
		case "schedule":
			return createScheduleContent();
		default:
			return [];
	}
}

/**
 * Creates a complete widget group from a widget definition.
 * Returns a Fabric.js Group with proper styling and metadata.
 */
export function createWidgetGroup(widget: WidgetDefinition): Group {
	const { defaultWidth, defaultHeight, type, name, id } = widget;

	// Create background and label
	const bgRect = createWidgetBackground(defaultWidth, defaultHeight);
	const typeLabel = createWidgetLabel(name, defaultWidth);

	// Get widget-specific content
	const contentElements = getWidgetContent(type, defaultWidth, defaultHeight);

	// Create the group with all elements
	const group = new Group([bgRect, typeLabel, ...contentElements], {
		left: 50,
		top: 100,
		...WIDGET_STYLING,
	});

	// Store widget metadata on the group
	(group as FabricObject & { widgetType?: string }).widgetType = type;
	(group as FabricObject & { widgetId?: string }).widgetId = id;

	return group;
}

/**
 * Creates a basic rectangle element for the canvas
 */
export function createRectangle(): Rect {
	return new Rect({
		left: 100,
		top: 100,
		width: 150,
		height: 100,
		fill: "#c4a373",
		stroke: "#8b7355",
		strokeWidth: 2,
		...WIDGET_STYLING,
	});
}

/**
 * Creates a basic text element for the canvas
 */
export function createTextElement(text = "Sample Text"): IText {
	return new IText(text, {
		left: 100,
		top: 100,
		fontSize: 24,
		fontFamily: "serif",
		fill: "#292524",
		...WIDGET_STYLING,
	});
}

/**
 * Creates a styled text element from a text style definition
 */
export function createStyledText(style: {
	text: string;
	fontSize: number;
	fontFamily: string;
	fontWeight?: string | number;
	fontStyle?: string;
	fill: string;
	textAlign?: string;
	lineHeight?: number;
}): IText {
	return new IText(style.text, {
		left: 100,
		top: 100,
		fontSize: style.fontSize,
		fontFamily: style.fontFamily,
		fontWeight: style.fontWeight,
		fontStyle: style.fontStyle,
		fill: style.fill,
		textAlign: style.textAlign || "left",
		lineHeight: style.lineHeight || 1.2,
		...WIDGET_STYLING,
	});
}
