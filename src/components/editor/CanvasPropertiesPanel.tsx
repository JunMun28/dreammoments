import type { FabricObject } from "fabric";
import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	FlipHorizontal,
	FlipVertical,
	Replace,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

/**
 * Selection info passed from canvas to properties panel
 */
export interface CanvasSelectionInfo {
	type: string;
	object: FabricObject;
	count?: number; // For multi-selection
}

interface CanvasPropertiesPanelProps {
	selection: CanvasSelectionInfo | null;
	canvasWidth?: number;
	canvasHeight?: number;
	onPropertyChange?: (property: string, value: unknown) => void;
}

/**
 * CE-010: Canvas Properties Panel
 *
 * Displays different property editors based on what's selected on the canvas:
 * - No selection: canvas properties (background color, size)
 * - Text: font, size, color, alignment
 * - Image: replace, flip, opacity, border
 * - Shape: fill, stroke, stroke width
 * - Multi-selection: common properties (opacity)
 */
export function CanvasPropertiesPanel({
	selection,
	canvasWidth = 400,
	canvasHeight = 700,
	onPropertyChange,
}: CanvasPropertiesPanelProps) {
	// No selection - show canvas properties
	if (!selection) {
		return (
			<CanvasProperties
				width={canvasWidth}
				height={canvasHeight}
				onPropertyChange={onPropertyChange}
			/>
		);
	}

	// Multi-selection
	if (selection.type === "activeselection") {
		return (
			<MultiSelectionProperties
				count={selection.count || 2}
				onPropertyChange={onPropertyChange}
			/>
		);
	}

	// Text element
	if (selection.type === "i-text" || selection.type === "text") {
		return (
			<TextProperties
				object={selection.object}
				onPropertyChange={onPropertyChange}
			/>
		);
	}

	// Image element
	if (selection.type === "image") {
		return (
			<ImageProperties
				object={selection.object}
				onPropertyChange={onPropertyChange}
			/>
		);
	}

	// Shape elements (rect, circle, etc.)
	return (
		<ShapeProperties
			object={selection.object}
			onPropertyChange={onPropertyChange}
		/>
	);
}

/**
 * Canvas properties (no selection)
 */
function CanvasProperties({
	width,
	height,
	onPropertyChange,
}: {
	width: number;
	height: number;
	onPropertyChange?: (property: string, value: unknown) => void;
}) {
	return (
		<div className="space-y-4 p-4">
			<h3 className="font-medium text-stone-900">Canvas Properties</h3>

			<div className="space-y-3">
				<div className="space-y-1.5">
					<Label htmlFor="canvas-bg">Background</Label>
					<Input
						id="canvas-bg"
						type="color"
						defaultValue="#ffffff"
						className="h-8 w-full cursor-pointer"
						onChange={(e) =>
							onPropertyChange?.("backgroundColor", e.target.value)
						}
					/>
				</div>

				<div className="space-y-1.5">
					<Label>Dimensions</Label>
					<div className="text-sm text-stone-500">
						{width} × {height}
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Text element properties
 */
function TextProperties({
	object,
	onPropertyChange,
}: {
	object: FabricObject;
	onPropertyChange?: (property: string, value: unknown) => void;
}) {
	const textObj = object as FabricObject & {
		fontFamily?: string;
		fontSize?: number;
		fill?: string;
		textAlign?: string;
	};

	return (
		<div className="space-y-4 p-4">
			<h3 className="font-medium text-stone-900">Text Properties</h3>

			<div className="space-y-3">
				<div className="space-y-1.5">
					<Label htmlFor="font-family">Font Family</Label>
					<select
						id="font-family"
						className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
						defaultValue={textObj.fontFamily || "serif"}
						onChange={(e) => onPropertyChange?.("fontFamily", e.target.value)}
					>
						<option value="serif">Serif</option>
						<option value="sans-serif">Sans Serif</option>
						<option value="monospace">Monospace</option>
						<option value="Playfair Display">Playfair Display</option>
						<option value="Great Vibes">Great Vibes</option>
					</select>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="font-size">Font Size</Label>
					<Input
						id="font-size"
						type="number"
						min={8}
						max={200}
						defaultValue={textObj.fontSize || 24}
						className="h-9"
						onChange={(e) =>
							onPropertyChange?.("fontSize", Number(e.target.value))
						}
					/>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="text-color">Text Color</Label>
					<Input
						id="text-color"
						type="color"
						defaultValue={
							typeof textObj.fill === "string" ? textObj.fill : "#000000"
						}
						className="h-8 w-full cursor-pointer"
						onChange={(e) => onPropertyChange?.("fill", e.target.value)}
					/>
				</div>

				<div className="space-y-1.5">
					<Label id="alignment-label">Alignment</Label>
					<div
						className="flex gap-1"
						role="group"
						aria-labelledby="alignment-label"
					>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={() => onPropertyChange?.("textAlign", "left")}
						>
							<AlignLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={() => onPropertyChange?.("textAlign", "center")}
						>
							<AlignCenter className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={() => onPropertyChange?.("textAlign", "right")}
						>
							<AlignRight className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={() => onPropertyChange?.("textAlign", "justify")}
						>
							<AlignJustify className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Image element properties
 */
function ImageProperties({
	object,
	onPropertyChange,
}: {
	object: FabricObject;
	onPropertyChange?: (property: string, value: unknown) => void;
}) {
	const imgObj = object as FabricObject & {
		opacity?: number;
	};

	return (
		<div className="space-y-4 p-4">
			<h3 className="font-medium text-stone-900">Image Properties</h3>

			<div className="space-y-3">
				<Button
					variant="outline"
					className="w-full"
					onClick={() => onPropertyChange?.("replace", true)}
				>
					<Replace className="mr-2 h-4 w-4" />
					Replace Image
				</Button>

				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="flex-1"
						aria-label="Flip Horizontal"
						onClick={() => onPropertyChange?.("flipX", true)}
					>
						<FlipHorizontal className="mr-1 h-4 w-4" />
						Flip Horizontal
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="flex-1"
						aria-label="Flip Vertical"
						onClick={() => onPropertyChange?.("flipY", true)}
					>
						<FlipVertical className="mr-1 h-4 w-4" />
						Flip Vertical
					</Button>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="img-opacity">Opacity</Label>
					<Slider
						id="img-opacity"
						min={0}
						max={100}
						step={1}
						defaultValue={[Math.round((imgObj.opacity || 1) * 100)]}
						onValueChange={(value) =>
							onPropertyChange?.("opacity", value[0] / 100)
						}
					/>
				</div>
			</div>
		</div>
	);
}

/**
 * Shape element properties (rect, circle, etc.)
 */
function ShapeProperties({
	object,
	onPropertyChange,
}: {
	object: FabricObject;
	onPropertyChange?: (property: string, value: unknown) => void;
}) {
	const shapeObj = object as FabricObject & {
		fill?: string;
		stroke?: string;
		strokeWidth?: number;
	};

	return (
		<div className="space-y-4 p-4">
			<h3 className="font-medium text-stone-900">Shape Properties</h3>

			<div className="space-y-3">
				<div className="space-y-1.5">
					<Label htmlFor="fill-color">Fill Color</Label>
					<Input
						id="fill-color"
						type="color"
						defaultValue={
							typeof shapeObj.fill === "string" ? shapeObj.fill : "#c4a373"
						}
						className="h-8 w-full cursor-pointer"
						onChange={(e) => onPropertyChange?.("fill", e.target.value)}
					/>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="stroke-color">Stroke Color</Label>
					<Input
						id="stroke-color"
						type="color"
						defaultValue={
							typeof shapeObj.stroke === "string" ? shapeObj.stroke : "#8b7355"
						}
						className="h-8 w-full cursor-pointer"
						onChange={(e) => onPropertyChange?.("stroke", e.target.value)}
					/>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="stroke-width">Stroke Width</Label>
					<Input
						id="stroke-width"
						type="number"
						min={0}
						max={20}
						defaultValue={shapeObj.strokeWidth || 2}
						className="h-9"
						onChange={(e) =>
							onPropertyChange?.("strokeWidth", Number(e.target.value))
						}
					/>
				</div>
			</div>
		</div>
	);
}

/**
 * Multi-selection properties (common properties only)
 */
function MultiSelectionProperties({
	count,
	onPropertyChange,
}: {
	count: number;
	onPropertyChange?: (property: string, value: unknown) => void;
}) {
	return (
		<div className="space-y-4 p-4">
			<h3 className="font-medium text-stone-900">Multiple Selected</h3>

			<p className="text-sm text-stone-500">{count} elements selected</p>

			<div className="space-y-3">
				<div className="space-y-1.5">
					<Label htmlFor="multi-opacity">Opacity</Label>
					<Slider
						id="multi-opacity"
						min={0}
						max={100}
						step={1}
						defaultValue={[100]}
						onValueChange={(value) =>
							onPropertyChange?.("opacity", value[0] / 100)
						}
					/>
				</div>
			</div>
		</div>
	);
}
