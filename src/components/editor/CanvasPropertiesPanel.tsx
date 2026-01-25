import type { FabricObject } from "fabric";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  FlipHorizontal,
  FlipVertical,
  Italic,
  Link,
  Replace,
  RotateCw,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { AnimationProperties } from "./AnimationProperties";

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
      <>
        <TextProperties
          object={selection.object}
          onPropertyChange={onPropertyChange}
        />
        <TransformProperties
          object={selection.object}
          onPropertyChange={onPropertyChange}
        />
        <AnimationProperties
          object={selection.object}
          onPropertyChange={onPropertyChange}
        />
      </>
    );
  }

  // Image element
  if (selection.type === "image") {
    return (
      <>
        <ImageProperties
          object={selection.object}
          onPropertyChange={onPropertyChange}
        />
        <TransformProperties
          object={selection.object}
          onPropertyChange={onPropertyChange}
        />
        <AnimationProperties
          object={selection.object}
          onPropertyChange={onPropertyChange}
        />
      </>
    );
  }

  // Shape elements (rect, circle, etc.)
  return (
    <>
      <ShapeProperties
        object={selection.object}
        onPropertyChange={onPropertyChange}
      />
      <TransformProperties
        object={selection.object}
        onPropertyChange={onPropertyChange}
      />
      <AnimationProperties
        object={selection.object}
        onPropertyChange={onPropertyChange}
      />
    </>
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
 * CE-011: Text element properties editor
 *
 * Features:
 * - Font family picker with Google Fonts options
 * - Font size input (8-200px)
 * - Font weight toggle (normal/bold)
 * - Font style toggle (normal/italic)
 * - Text color picker
 * - Text alignment buttons (left, center, right, justify)
 * - Line height slider
 * - Letter spacing slider
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
    fontWeight?: string | number;
    fontStyle?: string;
    lineHeight?: number;
    charSpacing?: number;
  };

  const isBold = textObj.fontWeight === "bold" || textObj.fontWeight === 700;
  const isItalic = textObj.fontStyle === "italic";

  const handleBoldToggle = () => {
    onPropertyChange?.("fontWeight", isBold ? "normal" : "bold");
  };

  const handleItalicToggle = () => {
    onPropertyChange?.("fontStyle", isItalic ? "normal" : "italic");
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="font-medium text-stone-900">Text Properties</h3>

      <div className="space-y-3">
        {/* Font Family */}
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
            <option value="Lora">Lora</option>
            <option value="Cormorant Garamond">Cormorant Garamond</option>
            <option value="Dancing Script">Dancing Script</option>
          </select>
        </div>

        {/* Font Size */}
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

        {/* Font Style Controls (Bold/Italic) */}
        <div className="space-y-1.5">
          <Label id="style-label">Style</Label>
          <div
            className="flex gap-1"
            role="group"
            aria-labelledby="style-label"
          >
            <Button
              variant={isBold ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={handleBoldToggle}
              aria-label="Bold"
              aria-pressed={isBold}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={isItalic ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={handleItalicToggle}
              aria-label="Italic"
              aria-pressed={isItalic}
            >
              <Italic className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Text Color */}
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

        {/* Text Alignment */}
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

        {/* Line Height */}
        <div className="space-y-1.5">
          <Label htmlFor="line-height">Line Height</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="line-height"
              min={0.5}
              max={3}
              step={0.1}
              defaultValue={[textObj.lineHeight || 1.2]}
              onValueChange={(value) =>
                onPropertyChange?.("lineHeight", value[0])
              }
              className="flex-1"
            />
            <span className="w-10 text-right text-sm text-stone-500">
              {(textObj.lineHeight || 1.2).toFixed(1)}
            </span>
          </div>
        </div>

        {/* Letter Spacing */}
        <div className="space-y-1.5">
          <Label htmlFor="letter-spacing">Letter Spacing</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="letter-spacing"
              min={-100}
              max={500}
              step={10}
              defaultValue={[textObj.charSpacing || 0]}
              onValueChange={(value) =>
                onPropertyChange?.("charSpacing", value[0])
              }
              className="flex-1"
            />
            <span className="w-10 text-right text-sm text-stone-500">
              {textObj.charSpacing || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * CE-012: Image element properties editor
 *
 * Features:
 * - Replace image button opens file picker
 * - Horizontal flip button
 * - Vertical flip button
 * - Opacity slider (0-100%)
 * - Border width input
 * - Border color picker
 * - Border radius slider
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
    strokeWidth?: number;
    stroke?: string;
    rx?: number;
    ry?: number;
  };

  const borderRadius = imgObj.rx || 0;

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

        {/* Border Width */}
        <div className="space-y-1.5">
          <Label htmlFor="border-width">Border Width</Label>
          <Input
            id="border-width"
            type="number"
            min={0}
            max={20}
            value={imgObj.strokeWidth || 0}
            className="h-9"
            onChange={(e) =>
              onPropertyChange?.("strokeWidth", Number(e.target.value))
            }
          />
        </div>

        {/* Border Color */}
        <div className="space-y-1.5">
          <Label htmlFor="border-color">Border Color</Label>
          <Input
            id="border-color"
            type="color"
            value={
              typeof imgObj.stroke === "string" ? imgObj.stroke : "#000000"
            }
            className="h-8 w-full cursor-pointer"
            onChange={(e) => onPropertyChange?.("stroke", e.target.value)}
          />
        </div>

        {/* Border Radius */}
        <div className="space-y-1.5">
          <Label htmlFor="border-radius">Border Radius</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="border-radius"
              min={0}
              max={100}
              step={1}
              defaultValue={[borderRadius]}
              onValueChange={(value) => {
                // Set both rx and ry for rounded corners
                onPropertyChange?.("rx", value[0]);
                onPropertyChange?.("ry", value[0]);
              }}
              className="flex-1"
            />
            <span className="w-12 text-right text-sm text-stone-500">
              {borderRadius}px
            </span>
          </div>
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

/**
 * CE-013: Position/Transform properties editor for all elements
 *
 * Features:
 * - X position input (pixels from left)
 * - Y position input (pixels from top)
 * - Width input
 * - Height input
 * - Rotation input (degrees)
 * - Lock aspect ratio toggle
 * - Changes sync bidirectionally with canvas
 */
function TransformProperties({
  object,
  onPropertyChange,
}: {
  object: FabricObject;
  onPropertyChange?: (property: string, value: unknown) => void;
}) {
  const [lockAspectRatio, setLockAspectRatio] = useState(false);

  const transformObj = object as FabricObject & {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
    angle?: number;
  };

  // Calculate actual dimensions accounting for scale
  const actualWidth = Math.round(
    (transformObj.width || 0) * (transformObj.scaleX || 1),
  );
  const actualHeight = Math.round(
    (transformObj.height || 0) * (transformObj.scaleY || 1),
  );
  const xPosition = Math.round(transformObj.left || 0);
  const yPosition = Math.round(transformObj.top || 0);
  const rotation = Math.round(transformObj.angle || 0);

  // Calculate base dimensions (without scale) for scale calculations
  const baseWidth = transformObj.width || 1;
  const baseHeight = transformObj.height || 1;

  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    onPropertyChange?.("left", value);
  };

  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    onPropertyChange?.("top", value);
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = Number(e.target.value);
    const newScaleX = newWidth / baseWidth;
    onPropertyChange?.("scaleX", newScaleX);

    // If lock aspect ratio is enabled, also update scaleY
    if (lockAspectRatio) {
      onPropertyChange?.("scaleY", newScaleX);
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = Number(e.target.value);
    const newScaleY = newHeight / baseHeight;
    onPropertyChange?.("scaleY", newScaleY);

    // If lock aspect ratio is enabled, also update scaleX
    if (lockAspectRatio) {
      onPropertyChange?.("scaleX", newScaleY);
    }
  };

  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    onPropertyChange?.("angle", value);
  };

  return (
    <div className="space-y-4 border-t p-4">
      <h3 className="font-medium text-stone-900">Transform</h3>

      <div className="space-y-3">
        {/* Position (X, Y) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="transform-x">X</Label>
            <Input
              id="transform-x"
              type="number"
              value={xPosition}
              className="h-9"
              onChange={handleXChange}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transform-y">Y</Label>
            <Input
              id="transform-y"
              type="number"
              value={yPosition}
              className="h-9"
              onChange={handleYChange}
            />
          </div>
        </div>

        {/* Size (Width, Height) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="transform-width">Width</Label>
            <Input
              id="transform-width"
              type="number"
              min={1}
              value={actualWidth}
              className="h-9"
              onChange={handleWidthChange}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transform-height">Height</Label>
            <Input
              id="transform-height"
              type="number"
              min={1}
              value={actualHeight}
              className="h-9"
              onChange={handleHeightChange}
            />
          </div>
        </div>

        {/* Lock Aspect Ratio */}
        <div className="flex items-center justify-between">
          <Label
            htmlFor="lock-aspect-ratio"
            className="flex cursor-pointer items-center gap-2"
          >
            <Link className="h-4 w-4 text-stone-500" />
            Lock aspect ratio
          </Label>
          <Switch
            id="lock-aspect-ratio"
            checked={lockAspectRatio}
            onCheckedChange={setLockAspectRatio}
            aria-label="Lock aspect ratio"
          />
        </div>

        {/* Rotation */}
        <div className="space-y-1.5">
          <Label
            htmlFor="transform-rotation"
            className="flex items-center gap-2"
          >
            <RotateCw className="h-4 w-4 text-stone-500" />
            Rotation
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="transform-rotation"
              type="number"
              min={-360}
              max={360}
              value={rotation}
              className="h-9 flex-1"
              onChange={handleRotationChange}
            />
            <span className="text-sm text-stone-500">°</span>
          </div>
        </div>
      </div>
    </div>
  );
}
