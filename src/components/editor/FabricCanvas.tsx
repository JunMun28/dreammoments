import {
  ActiveSelection,
  Canvas,
  type FabricObject,
  Group,
  IText,
  Line,
  Rect,
} from "fabric";
import type { WidgetDefinition } from "./ComponentsPanel";
import {
  AlertCircle,
  Check,
  Download,
  Loader2,
  Maximize,
  Minus,
  Plus,
  Redo2,
  Square,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CanvasSelectionInfo } from "./CanvasPropertiesPanel";
import { ExportDialog } from "./ExportDialog";
import type { LayerInfo } from "./LayersPanel";
import type { TextStyleDefinition } from "./TextStylesPanel";

/**
 * Default canvas dimensions (matches mobile-first invitation layout)
 */
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 700;

/**
 * Zoom configuration for CE-002
 */
const ZOOM_MIN = 0.5; // 50%
const ZOOM_MAX = 2.0; // 200%
const ZOOM_STEP = 0.1; // 10% per click
const ZOOM_PRESETS = [0.5, 0.8, 1.0, 1.5, 2.0]; // 50%, 80%, 100%, 150%, 200%

/**
 * History configuration for CE-003 (undo/redo)
 */
const HISTORY_MAX_SIZE = 50;

/**
 * CE-016: Save status for auto-save indicator
 */
export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * CE-024: Alignment guide configuration
 */
const ALIGNMENT_THRESHOLD = 5; // Pixels within which to show alignment guides
const GUIDE_COLOR = "#ff0080"; // Pink/magenta color for guides
const GUIDE_STROKE_WIDTH = 1;

/**
 * CE-016: Debounce delay for auto-save (1 second)
 */
const AUTO_SAVE_DEBOUNCE_MS = 1000;

/**
 * Simple debounce utility function
 */
function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number,
): { (...args: Parameters<T>): void; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };

  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFn;
}

/**
 * CE-011: Property update request from properties panel
 */
export interface PropertyUpdate {
  property: string;
  value: unknown;
}

/**
 * CE-014: Layer operation types
 */
export interface LayerOperation {
  type:
    | "select"
    | "toggleVisibility"
    | "toggleLock"
    | "reorder"
    | "bringToFront"
    | "sendToBack"
    | "bringForward"
    | "sendBackward";
  layerId: string;
  /** For reorder operation: new index position */
  newIndex?: number;
}

interface FabricCanvasProps {
  /** Callback when canvas selection changes (CE-010) */
  onSelectionChange?: (selection: CanvasSelectionInfo | null) => void;
  /** CE-016: Initial canvas data to restore on mount */
  initialCanvasData?: string | null;
  /** CE-016: Callback when canvas changes (for auto-save) */
  onCanvasChange?: (canvasJson: string) => Promise<void>;
  /** CE-011: Property update to apply to selected object */
  pendingPropertyUpdate?: PropertyUpdate | null;
  /** CE-011: Callback when property update is applied */
  onPropertyUpdateApplied?: () => void;
  /** CE-008: Text style to add to canvas */
  pendingAddTextStyle?: TextStyleDefinition | null;
  /** CE-008: Callback when text style is added */
  onTextStyleAdded?: () => void;
  /** CE-014: Callback when layers change */
  onLayersChange?: (layers: LayerInfo[]) => void;
  /** CE-014: Pending layer operation to apply */
  pendingLayerOperation?: LayerOperation | null;
  /** CE-014: Callback when layer operation is applied */
  onLayerOperationApplied?: () => void;
  /** CE-020-023: Widget to add to canvas */
  pendingAddWidget?: WidgetDefinition | null;
  /** CE-020-023: Callback when widget is added */
  onWidgetAdded?: () => void;
}

/**
 * FabricCanvas component for canvas-based invitation editing.
 * Implements CE-001 requirements:
 * - Fabric.js canvas with basic element rendering
 * - Drag, resize, and rotate capabilities
 * - Selection with transform handles
 */
export function FabricCanvas({
  onSelectionChange,
  initialCanvasData,
  onCanvasChange,
  pendingPropertyUpdate,
  onPropertyUpdateApplied,
  pendingAddTextStyle,
  onTextStyleAdded,
  onLayersChange,
  pendingLayerOperation,
  onLayerOperationApplied,
  pendingAddWidget,
  onWidgetAdded,
}: FabricCanvasProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(
    null,
  );
  const [zoomLevel, setZoomLevel] = useState(1.0); // CE-002: Zoom state

  // CE-003: History state for undo/redo
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isRestoringRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // CE-004: Clipboard for copy/paste operations
  const clipboardRef = useRef<FabricObject | null>(null);

  // CE-016: Save status for auto-save indicator
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // CE-014: Counter to trigger layer updates
  const [layerUpdateCounter, setLayerUpdateCounter] = useState(0);

  // CE-018: Export dialog state
  const [showExportDialog, setShowExportDialog] = useState(false);

  // CE-024: Alignment guide refs
  const verticalGuideRef = useRef<Line | null>(null);
  const horizontalGuideRef = useRef<Line | null>(null);
  const centerVerticalGuideRef = useRef<Line | null>(null);
  const centerHorizontalGuideRef = useRef<Line | null>(null);

  /**
   * CE-014: Generate layer info from canvas objects
   * Returns layers ordered by z-index (highest/front first)
   */
  const generateLayers = useCallback((): LayerInfo[] => {
    if (!fabricRef.current) return [];

    const canvas = fabricRef.current;
    const objects = canvas.getObjects();

    // Reverse to show highest z-index first
    return [...objects].reverse().map((obj, index) => {
      // Generate a unique ID based on object or use index
      const objId =
        (obj as FabricObject & { layerId?: string }).layerId ||
        `layer-${objects.length - 1 - index}`;

      // Get display name based on object type
      let name = "Object";
      if (obj.type === "i-text" || obj.type === "text") {
        const textObj = obj as IText;
        name = textObj.text?.slice(0, 20) || "Text";
        if (textObj.text && textObj.text.length > 20) name += "...";
      } else if (obj.type === "rect") {
        name = "Rectangle";
      } else if (obj.type === "image") {
        name = "Image";
      } else if (obj.type) {
        name = obj.type.charAt(0).toUpperCase() + obj.type.slice(1);
      }

      return {
        id: objId,
        type: obj.type || "object",
        name,
        visible: obj.visible !== false,
        locked: obj.selectable === false || obj.evented === false,
      };
    });
  }, []);

  // CE-014: Report layers when canvas changes
  useEffect(() => {
    if (onLayersChange && fabricRef.current) {
      const layers = generateLayers();
      onLayersChange(layers);
    }
  }, [onLayersChange, generateLayers, layerUpdateCounter, selectedObject]);

  /**
   * CE-024: Create alignment guide line
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
   * CE-024: Clear all alignment guides from canvas
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
  }, []);

  /**
   * CE-024: Check and show alignment guides during object movement
   */
  const checkAlignmentGuides = useCallback(
    (movingObject: FabricObject) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      // Clear existing guides first
      clearAlignmentGuides();

      // Get object dimensions in canvas coordinates (not viewport/screen coords)
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

      const canvasCenterX = CANVAS_WIDTH / 2;
      const canvasCenterY = CANVAS_HEIGHT / 2;

      let showVerticalGuide = false;
      let showHorizontalGuide = false;
      let verticalGuideX = 0;
      let horizontalGuideY = 0;

      // Check alignment with canvas center
      if (Math.abs(movingCenterX - canvasCenterX) < ALIGNMENT_THRESHOLD) {
        showVerticalGuide = true;
        verticalGuideX = canvasCenterX;
      }
      if (Math.abs(movingCenterY - canvasCenterY) < ALIGNMENT_THRESHOLD) {
        showHorizontalGuide = true;
        horizontalGuideY = canvasCenterY;
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

        // Get target object dimensions in canvas coordinates
        const targetWidth = (obj.width || 0) * (obj.scaleX || 1);
        const targetHeight = (obj.height || 0) * (obj.scaleY || 1);
        const targetLeft = obj.left || 0;
        const targetTop = obj.top || 0;
        const targetRight = targetLeft + targetWidth;
        const targetBottom = targetTop + targetHeight;
        const targetCenterX = targetLeft + targetWidth / 2;
        const targetCenterY = targetTop + targetHeight / 2;

        // Check vertical alignments (X positions)
        // Left edge to left edge
        if (Math.abs(movingLeft - targetLeft) < ALIGNMENT_THRESHOLD) {
          showVerticalGuide = true;
          verticalGuideX = targetLeft;
        }
        // Right edge to right edge
        if (Math.abs(movingRight - targetRight) < ALIGNMENT_THRESHOLD) {
          showVerticalGuide = true;
          verticalGuideX = targetRight;
        }
        // Left edge to right edge
        if (Math.abs(movingLeft - targetRight) < ALIGNMENT_THRESHOLD) {
          showVerticalGuide = true;
          verticalGuideX = targetRight;
        }
        // Right edge to left edge
        if (Math.abs(movingRight - targetLeft) < ALIGNMENT_THRESHOLD) {
          showVerticalGuide = true;
          verticalGuideX = targetLeft;
        }
        // Center to center (vertical)
        if (Math.abs(movingCenterX - targetCenterX) < ALIGNMENT_THRESHOLD) {
          showVerticalGuide = true;
          verticalGuideX = targetCenterX;
        }

        // Check horizontal alignments (Y positions)
        // Top edge to top edge
        if (Math.abs(movingTop - targetTop) < ALIGNMENT_THRESHOLD) {
          showHorizontalGuide = true;
          horizontalGuideY = targetTop;
        }
        // Bottom edge to bottom edge
        if (Math.abs(movingBottom - targetBottom) < ALIGNMENT_THRESHOLD) {
          showHorizontalGuide = true;
          horizontalGuideY = targetBottom;
        }
        // Top edge to bottom edge
        if (Math.abs(movingTop - targetBottom) < ALIGNMENT_THRESHOLD) {
          showHorizontalGuide = true;
          horizontalGuideY = targetBottom;
        }
        // Bottom edge to top edge
        if (Math.abs(movingBottom - targetTop) < ALIGNMENT_THRESHOLD) {
          showHorizontalGuide = true;
          horizontalGuideY = targetTop;
        }
        // Center to center (horizontal)
        if (Math.abs(movingCenterY - targetCenterY) < ALIGNMENT_THRESHOLD) {
          showHorizontalGuide = true;
          horizontalGuideY = targetCenterY;
        }
      }

      // Create and show vertical guide
      if (showVerticalGuide) {
        const guide = createGuideLine([
          verticalGuideX,
          0,
          verticalGuideX,
          CANVAS_HEIGHT,
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
          CANVAS_WIDTH,
          horizontalGuideY,
        ]);
        horizontalGuideRef.current = guide;
        canvas.add(guide);
        canvas.bringObjectToFront(guide);
      }

      canvas.requestRenderAll();
    },
    [clearAlignmentGuides, createGuideLine],
  );

  // CE-016: Debounced auto-save function
  const debouncedSave = useMemo(() => {
    if (!onCanvasChange) return null;

    return debounce(async (canvasJson: string) => {
      setSaveStatus("saving");
      try {
        await onCanvasChange(canvasJson);
        setSaveStatus("saved");
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Failed to save canvas:", error);
        setSaveStatus("error");
        // Keep error visible for 5 seconds
        setTimeout(() => setSaveStatus("idle"), 5000);
      }
    }, AUTO_SAVE_DEBOUNCE_MS);
  }, [onCanvasChange]);

  // CE-016: Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave?.cancel();
    };
  }, [debouncedSave]);

  /**
   * CE-003: Save current canvas state to history
   * CE-016: Also triggers debounced auto-save
   */
  const saveHistoryState = useCallback(() => {
    if (!fabricRef.current || isRestoringRef.current) return;

    const json = JSON.stringify(fabricRef.current.toJSON());
    const history = historyRef.current;
    const index = historyIndexRef.current;

    // Remove any redo states (states after current index)
    if (index < history.length - 1) {
      history.splice(index + 1);
    }

    // Add new state
    history.push(json);

    // Limit history size
    if (history.length > HISTORY_MAX_SIZE) {
      history.shift();
    } else {
      historyIndexRef.current = history.length - 1;
    }

    // Update button states
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);

    // CE-016: Trigger debounced auto-save
    debouncedSave?.(json);
  }, [debouncedSave]);

  // CE-014: Handle layer operations
  useEffect(() => {
    if (!pendingLayerOperation || !fabricRef.current) return;

    const canvas = fabricRef.current;
    const objects = canvas.getObjects();
    const { type, layerId, newIndex } = pendingLayerOperation;

    // Find object by layerId (reverse index since layers are shown top-first)
    const layerIndex = parseInt(layerId.replace("layer-", ""), 10);
    const objectIndex = layerIndex;
    const obj = objects[objectIndex];

    if (!obj && type !== "reorder") {
      onLayerOperationApplied?.();
      return;
    }

    switch (type) {
      case "select":
        if (obj) {
          canvas.setActiveObject(obj);
          canvas.requestRenderAll();
        }
        break;

      case "toggleVisibility":
        if (obj) {
          obj.visible = !obj.visible;
          canvas.requestRenderAll();
          setLayerUpdateCounter((c) => c + 1);
        }
        break;

      case "toggleLock":
        if (obj) {
          const isLocked = obj.selectable === false;
          obj.selectable = isLocked;
          obj.evented = isLocked;
          if (isLocked) {
            // Unlocking - also make movable
            obj.lockMovementX = false;
            obj.lockMovementY = false;
          } else {
            // Locking - prevent all interactions
            obj.lockMovementX = true;
            obj.lockMovementY = true;
          }
          canvas.requestRenderAll();
          setLayerUpdateCounter((c) => c + 1);
        }
        break;

      case "bringToFront":
        if (obj) {
          canvas.bringObjectToFront(obj);
          canvas.requestRenderAll();
          setLayerUpdateCounter((c) => c + 1);
          saveHistoryState();
        }
        break;

      case "sendToBack":
        if (obj) {
          canvas.sendObjectToBack(obj);
          canvas.requestRenderAll();
          setLayerUpdateCounter((c) => c + 1);
          saveHistoryState();
        }
        break;

      case "bringForward":
        if (obj) {
          canvas.bringObjectForward(obj);
          canvas.requestRenderAll();
          setLayerUpdateCounter((c) => c + 1);
          saveHistoryState();
        }
        break;

      case "sendBackward":
        if (obj) {
          canvas.sendObjectBackwards(obj);
          canvas.requestRenderAll();
          setLayerUpdateCounter((c) => c + 1);
          saveHistoryState();
        }
        break;

      case "reorder":
        if (newIndex !== undefined) {
          // Find the object to move
          const sourceIndex = layerIndex;
          const sourceObj = objects[sourceIndex];
          if (sourceObj) {
            // Convert UI index (top-first) to canvas index (bottom-first)
            const targetCanvasIndex = objects.length - 1 - newIndex;
            // Use remove and insert approach since moveTo doesn't exist
            canvas.remove(sourceObj);
            const updatedObjects = canvas.getObjects();
            // Insert at the correct position
            const insertIndex = Math.min(
              targetCanvasIndex,
              updatedObjects.length,
            );
            canvas.insertAt(insertIndex, sourceObj);
            canvas.requestRenderAll();
            setLayerUpdateCounter((c) => c + 1);
            saveHistoryState();
          }
        }
        break;
    }

    onLayerOperationApplied?.();
  }, [pendingLayerOperation, onLayerOperationApplied, saveHistoryState]);

  // Initialize Fabric.js canvas on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create Fabric.js canvas instance
    const fabricCanvas = new Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: "#ffffff",
      selection: true,
      preserveObjectStacking: true,
    });

    // Store reference for cleanup and operations
    fabricRef.current = fabricCanvas;

    // Selection event handlers
    const handleSelectionCreated = () => {
      const active = fabricCanvas.getActiveObject();
      setSelectedObject(active || null);
    };

    const handleSelectionUpdated = () => {
      const active = fabricCanvas.getActiveObject();
      setSelectedObject(active || null);
    };

    const handleSelectionCleared = () => {
      setSelectedObject(null);
    };

    // Register selection events
    fabricCanvas.on("selection:created", handleSelectionCreated);
    fabricCanvas.on("selection:updated", handleSelectionUpdated);
    fabricCanvas.on("selection:cleared", handleSelectionCleared);

    // Cleanup on unmount
    return () => {
      fabricCanvas.off("selection:created", handleSelectionCreated);
      fabricCanvas.off("selection:updated", handleSelectionUpdated);
      fabricCanvas.off("selection:cleared", handleSelectionCleared);
      fabricCanvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // CE-024: Set up alignment guide event handlers
  useEffect(() => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;

    // Show alignment guides during object movement
    const handleObjectMoving = (e: { target?: FabricObject }) => {
      if (e.target) {
        checkAlignmentGuides(e.target);
      }
    };

    // Clear guides when movement ends
    const handleObjectModified = () => {
      clearAlignmentGuides();
    };

    // Clear guides when mouse is released
    const handleMouseUp = () => {
      clearAlignmentGuides();
    };

    canvas.on("object:moving", handleObjectMoving);
    canvas.on("object:modified", handleObjectModified);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("object:moving", handleObjectMoving);
      canvas.off("object:modified", handleObjectModified);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [checkAlignmentGuides, clearAlignmentGuides]);

  // CE-016: Restore initial canvas data on mount
  useEffect(() => {
    if (!fabricRef.current || !initialCanvasData) return;

    isRestoringRef.current = true;
    const canvas = fabricRef.current;

    canvas.loadFromJSON(JSON.parse(initialCanvasData)).then(() => {
      canvas.requestRenderAll();
      isRestoringRef.current = false;
      // Clear history and save restored state as initial
      historyRef.current = [];
      historyIndexRef.current = -1;
      saveHistoryState();
    });
  }, [initialCanvasData, saveHistoryState]);

  // CE-010: Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      if (selectedObject) {
        const info: CanvasSelectionInfo = {
          type: selectedObject.type || "object",
          object: selectedObject,
        };
        // Add count for multi-selection
        if (selectedObject.type === "activeselection") {
          const selection = selectedObject as ActiveSelection;
          info.count = selection.getObjects().length;
        }
        onSelectionChange(info);
      } else {
        onSelectionChange(null);
      }
    }
  }, [selectedObject, onSelectionChange]);

  // CE-011: Apply property updates from properties panel
  useEffect(() => {
    if (!pendingPropertyUpdate || !fabricRef.current) return;

    const canvas = fabricRef.current;
    const active = canvas.getActiveObject();

    if (!active) {
      onPropertyUpdateApplied?.();
      return;
    }

    const { property, value } = pendingPropertyUpdate;

    // Handle toggle properties for image (flipX, flipY)
    if (property === "flipX" || property === "flipY") {
      const currentValue = active.get(property as keyof typeof active);
      active.set(property as keyof typeof active, !currentValue);
    } else {
      // Standard property update
      active.set(property as keyof typeof active, value);
    }

    active.setCoords();
    canvas.requestRenderAll();
    saveHistoryState();
    onPropertyUpdateApplied?.();
  }, [pendingPropertyUpdate, onPropertyUpdateApplied, saveHistoryState]);

  // CE-008: Add styled text element from TextStylesPanel
  useEffect(() => {
    if (!pendingAddTextStyle || !fabricRef.current) return;

    const canvas = fabricRef.current;
    const style = pendingAddTextStyle;

    // Create text element with styling from TextStyleDefinition
    const text = new IText(style.text, {
      left: 100,
      top: 100,
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      fill: style.fill,
      textAlign: style.textAlign || "left",
      lineHeight: style.lineHeight || 1.2,
      cornerColor: "#3b82f6",
      cornerStrokeColor: "#1d4ed8",
      cornerSize: 10,
      transparentCorners: false,
      borderColor: "#3b82f6",
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
    onTextStyleAdded?.();
  }, [pendingAddTextStyle, onTextStyleAdded]);

  // CE-020-023: Add widget to canvas
  useEffect(() => {
    if (!pendingAddWidget || !fabricRef.current) return;

    const canvas = fabricRef.current;
    const widget = pendingAddWidget;

    // Create widget as a Fabric.js Group with visual representation
    const createWidgetGroup = async () => {
      const { defaultWidth, defaultHeight, type, name } = widget;

      // Create background rect for the widget
      const bgRect = new Rect({
        width: defaultWidth,
        height: defaultHeight,
        fill: "#f5f5f4", // stone-100
        stroke: "#d6d3d1", // stone-300
        strokeWidth: 1,
        rx: 8,
        ry: 8,
      });

      // Create widget type label
      const typeLabel = new IText(name, {
        fontSize: 14,
        fontFamily: "sans-serif",
        fontWeight: "bold",
        fill: "#57534e", // stone-600
        left: defaultWidth / 2,
        top: 12,
        originX: "center",
      });

      // Create widget-specific content based on type
      let contentElements: FabricObject[] = [];

      if (type === "countdown") {
        // CE-020: Countdown Timer placeholder
        const daysText = new IText("00", {
          fontSize: 32,
          fontFamily: "sans-serif",
          fontWeight: "bold",
          fill: "#292524",
          left: 40,
          top: 45,
        });
        const daysLabel = new IText("Days", {
          fontSize: 10,
          fontFamily: "sans-serif",
          fill: "#78716c",
          left: 40,
          top: 80,
        });
        const hoursText = new IText("00", {
          fontSize: 32,
          fontFamily: "sans-serif",
          fontWeight: "bold",
          fill: "#292524",
          left: 100,
          top: 45,
        });
        const hoursLabel = new IText("Hours", {
          fontSize: 10,
          fontFamily: "sans-serif",
          fill: "#78716c",
          left: 100,
          top: 80,
        });
        const minsText = new IText("00", {
          fontSize: 32,
          fontFamily: "sans-serif",
          fontWeight: "bold",
          fill: "#292524",
          left: 165,
          top: 45,
        });
        const minsLabel = new IText("Mins", {
          fontSize: 10,
          fontFamily: "sans-serif",
          fill: "#78716c",
          left: 165,
          top: 80,
        });
        const secsText = new IText("00", {
          fontSize: 32,
          fontFamily: "sans-serif",
          fontWeight: "bold",
          fill: "#292524",
          left: 225,
          top: 45,
        });
        const secsLabel = new IText("Secs", {
          fontSize: 10,
          fontFamily: "sans-serif",
          fill: "#78716c",
          left: 225,
          top: 80,
        });
        contentElements = [
          daysText,
          daysLabel,
          hoursText,
          hoursLabel,
          minsText,
          minsLabel,
          secsText,
          secsLabel,
        ];
      } else if (type === "map") {
        // CE-021: Venue Map placeholder
        const mapPlaceholder = new Rect({
          width: defaultWidth - 20,
          height: defaultHeight - 60,
          fill: "#e7e5e4",
          left: 10,
          top: 40,
          rx: 4,
          ry: 4,
        });
        const pinIcon = new IText("📍", {
          fontSize: 24,
          left: defaultWidth / 2,
          top: defaultHeight / 2,
          originX: "center",
          originY: "center",
        });
        const addressText = new IText("Enter venue address", {
          fontSize: 11,
          fontFamily: "sans-serif",
          fill: "#a8a29e",
          left: defaultWidth / 2,
          top: defaultHeight - 25,
          originX: "center",
        });
        contentElements = [mapPlaceholder, pinIcon, addressText];
      } else if (type === "rsvp") {
        // CE-022: RSVP Form placeholder
        const nameField = new Rect({
          width: defaultWidth - 40,
          height: 32,
          fill: "#ffffff",
          stroke: "#d6d3d1",
          strokeWidth: 1,
          left: 20,
          top: 45,
          rx: 4,
          ry: 4,
        });
        const nameLabel = new IText("Name", {
          fontSize: 10,
          fontFamily: "sans-serif",
          fill: "#78716c",
          left: 25,
          top: 52,
        });
        const emailField = new Rect({
          width: defaultWidth - 40,
          height: 32,
          fill: "#ffffff",
          stroke: "#d6d3d1",
          strokeWidth: 1,
          left: 20,
          top: 90,
          rx: 4,
          ry: 4,
        });
        const emailLabel = new IText("Email", {
          fontSize: 10,
          fontFamily: "sans-serif",
          fill: "#78716c",
          left: 25,
          top: 97,
        });
        const attendingLabel = new IText("Will you attend?", {
          fontSize: 12,
          fontFamily: "sans-serif",
          fill: "#57534e",
          left: 20,
          top: 135,
        });
        const yesBtn = new Rect({
          width: 60,
          height: 28,
          fill: "#c4a373",
          left: 20,
          top: 155,
          rx: 4,
          ry: 4,
        });
        const yesBtnText = new IText("Yes", {
          fontSize: 12,
          fontFamily: "sans-serif",
          fill: "#ffffff",
          left: 40,
          top: 162,
        });
        const noBtn = new Rect({
          width: 60,
          height: 28,
          fill: "#e7e5e4",
          left: 90,
          top: 155,
          rx: 4,
          ry: 4,
        });
        const noBtnText = new IText("No", {
          fontSize: 12,
          fontFamily: "sans-serif",
          fill: "#57534e",
          left: 112,
          top: 162,
        });
        const submitBtn = new Rect({
          width: defaultWidth - 40,
          height: 36,
          fill: "#292524",
          left: 20,
          top: 200,
          rx: 4,
          ry: 4,
        });
        const submitText = new IText("Submit RSVP", {
          fontSize: 14,
          fontFamily: "sans-serif",
          fill: "#ffffff",
          left: defaultWidth / 2,
          top: 212,
          originX: "center",
        });
        contentElements = [
          nameField,
          nameLabel,
          emailField,
          emailLabel,
          attendingLabel,
          yesBtn,
          yesBtnText,
          noBtn,
          noBtnText,
          submitBtn,
          submitText,
        ];
      } else if (type === "gallery") {
        // CE-023: Photo Gallery placeholder
        const gridSize = 3;
        const cellSize = (defaultWidth - 40) / gridSize;
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < gridSize; col++) {
            const cell = new Rect({
              width: cellSize - 5,
              height: cellSize - 5,
              fill: "#e7e5e4",
              left: 20 + col * cellSize,
              top: 45 + row * cellSize,
              rx: 4,
              ry: 4,
            });
            const icon = new IText("🖼", {
              fontSize: 20,
              left: 20 + col * cellSize + (cellSize - 5) / 2,
              top: 45 + row * cellSize + (cellSize - 5) / 2,
              originX: "center",
              originY: "center",
            });
            contentElements.push(cell, icon);
          }
        }
        const addPhotosText = new IText("Click to add photos", {
          fontSize: 11,
          fontFamily: "sans-serif",
          fill: "#a8a29e",
          left: defaultWidth / 2,
          top: defaultHeight - 25,
          originX: "center",
        });
        contentElements.push(addPhotosText);
      } else if (type === "schedule") {
        // Schedule Timeline placeholder
        const item1 = new IText("3:00 PM - Ceremony", {
          fontSize: 12,
          fontFamily: "sans-serif",
          fill: "#57534e",
          left: 20,
          top: 50,
        });
        const item2 = new IText("4:00 PM - Cocktails", {
          fontSize: 12,
          fontFamily: "sans-serif",
          fill: "#57534e",
          left: 20,
          top: 75,
        });
        const item3 = new IText("5:30 PM - Reception", {
          fontSize: 12,
          fontFamily: "sans-serif",
          fill: "#57534e",
          left: 20,
          top: 100,
        });
        const item4 = new IText("8:00 PM - Dancing", {
          fontSize: 12,
          fontFamily: "sans-serif",
          fill: "#57534e",
          left: 20,
          top: 125,
        });
        // Timeline line
        const timeline = new Rect({
          width: 2,
          height: 100,
          fill: "#c4a373",
          left: 10,
          top: 50,
        });
        contentElements = [timeline, item1, item2, item3, item4];
      }

      // Create the group with all elements
      const group = new Group([bgRect, typeLabel, ...contentElements], {
        left: 50,
        top: 100,
        cornerColor: "#3b82f6",
        cornerStrokeColor: "#1d4ed8",
        cornerSize: 10,
        transparentCorners: false,
        borderColor: "#3b82f6",
      });

      // Store widget metadata on the group
      (group as FabricObject & { widgetType?: string }).widgetType = type;
      (group as FabricObject & { widgetId?: string }).widgetId = widget.id;

      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.requestRenderAll();
      onWidgetAdded?.();
    };

    createWidgetGroup();
  }, [pendingAddWidget, onWidgetAdded]);

  // CE-003: Set up history tracking for canvas changes
  useEffect(() => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;

    // Save initial state
    saveHistoryState();

    // Track all object modifications for history
    const onObjectModified = () => saveHistoryState();
    const onObjectAdded = () => saveHistoryState();
    const onObjectRemoved = () => saveHistoryState();

    canvas.on("object:modified", onObjectModified);
    canvas.on("object:added", onObjectAdded);
    canvas.on("object:removed", onObjectRemoved);

    return () => {
      canvas.off("object:modified", onObjectModified);
      canvas.off("object:added", onObjectAdded);
      canvas.off("object:removed", onObjectRemoved);
    };
  }, [saveHistoryState]);

  /**
   * Add a rectangle element to the canvas
   */
  const handleAddRectangle = useCallback(() => {
    if (!fabricRef.current) return;

    const rect = new Rect({
      left: 100,
      top: 100,
      width: 150,
      height: 100,
      fill: "#c4a373",
      stroke: "#8b7355",
      strokeWidth: 2,
      cornerColor: "#3b82f6",
      cornerStrokeColor: "#1d4ed8",
      cornerSize: 10,
      transparentCorners: false,
      borderColor: "#3b82f6",
    });

    fabricRef.current.add(rect);
    fabricRef.current.setActiveObject(rect);
    fabricRef.current.requestRenderAll();
  }, []);

  /**
   * Add a text element to the canvas
   */
  const handleAddText = useCallback(() => {
    if (!fabricRef.current) return;

    const text = new IText("Sample Text", {
      left: 100,
      top: 100,
      fontSize: 24,
      fontFamily: "serif",
      fill: "#292524",
      cornerColor: "#3b82f6",
      cornerStrokeColor: "#1d4ed8",
      cornerSize: 10,
      transparentCorners: false,
      borderColor: "#3b82f6",
    });

    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.requestRenderAll();
  }, []);

  /**
   * Delete the currently selected object(s)
   * CE-025: Handles both single selection and multi-selection (ActiveSelection)
   */
  const handleDeleteSelected = useCallback(() => {
    if (!fabricRef.current) return;

    const active = fabricRef.current.getActiveObject();
    if (!active) return;

    // CE-025: Handle multi-selection (ActiveSelection)
    if (active instanceof ActiveSelection) {
      // Get all objects in the selection
      const objectsToRemove = active.getObjects();
      // Discard selection first
      fabricRef.current.discardActiveObject();
      // Remove each object from the canvas
      for (const obj of objectsToRemove) {
        fabricRef.current.remove(obj);
      }
    } else {
      // Single object selection
      fabricRef.current.remove(active);
      fabricRef.current.discardActiveObject();
    }

    fabricRef.current.requestRenderAll();
    setSelectedObject(null);
  }, []);

  /**
   * CE-003: Undo last canvas operation
   */
  const handleUndo = useCallback(() => {
    if (!fabricRef.current || historyIndexRef.current <= 0) return;

    isRestoringRef.current = true;
    historyIndexRef.current -= 1;

    const canvas = fabricRef.current;
    const state = historyRef.current[historyIndexRef.current];

    canvas.loadFromJSON(JSON.parse(state)).then(() => {
      canvas.requestRenderAll();
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      isRestoringRef.current = false;
    });
  }, []);

  /**
   * CE-003: Redo previously undone operation
   */
  const handleRedo = useCallback(() => {
    if (
      !fabricRef.current ||
      historyIndexRef.current >= historyRef.current.length - 1
    )
      return;

    isRestoringRef.current = true;
    historyIndexRef.current += 1;

    const canvas = fabricRef.current;
    const state = historyRef.current[historyIndexRef.current];

    canvas.loadFromJSON(JSON.parse(state)).then(() => {
      canvas.requestRenderAll();
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      isRestoringRef.current = false;
    });
  }, []);

  /**
   * CE-004: Copy selected element(s) to clipboard
   */
  const handleCopy = useCallback(() => {
    if (!fabricRef.current) return;

    const active = fabricRef.current.getActiveObject();
    if (!active) return;

    // Clone the object for clipboard storage
    active.clone().then((cloned: FabricObject) => {
      clipboardRef.current = cloned;
    });
  }, []);

  /**
   * CE-004: Paste element(s) from clipboard with offset
   */
  const handlePaste = useCallback(() => {
    if (!fabricRef.current || !clipboardRef.current) return;

    const canvas = fabricRef.current;

    clipboardRef.current.clone().then((cloned: FabricObject) => {
      canvas.discardActiveObject();

      // Offset pasted element by 10px
      cloned.set({
        left: (cloned.left || 0) + 10,
        top: (cloned.top || 0) + 10,
        evented: true,
      });

      // Handle ActiveSelection (multi-select) vs single object
      if (cloned.type === "activeselection") {
        // If it's a group of objects, add each one
        const activeSelection = cloned as ActiveSelection;
        activeSelection.canvas = canvas;
        activeSelection.forEachObject((obj: FabricObject) => {
          canvas.add(obj);
        });
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }

      // Update clipboard offset for next paste
      clipboardRef.current?.set({
        left: (clipboardRef.current.left || 0) + 10,
        top: (clipboardRef.current.top || 0) + 10,
      });

      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    });
  }, []);

  /**
   * CE-004: Cut selected element(s) - copy then delete
   */
  const handleCut = useCallback(() => {
    handleCopy();
    // Small delay to ensure copy completes before delete
    setTimeout(() => {
      handleDeleteSelected();
    }, 10);
  }, [handleCopy, handleDeleteSelected]);

  /**
   * CE-004: Duplicate selected element(s) - copy then paste
   */
  const handleDuplicate = useCallback(() => {
    if (!fabricRef.current) return;

    const active = fabricRef.current.getActiveObject();
    if (!active) return;

    const canvas = fabricRef.current;

    active.clone().then((cloned: FabricObject) => {
      canvas.discardActiveObject();

      // Offset duplicated element by 10px
      cloned.set({
        left: (cloned.left || 0) + 10,
        top: (cloned.top || 0) + 10,
        evented: true,
      });

      if (cloned.type === "activeselection") {
        const activeSelection = cloned as ActiveSelection;
        activeSelection.canvas = canvas;
        activeSelection.forEachObject((obj: FabricObject) => {
          canvas.add(obj);
        });
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }

      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    });
  }, []);

  /**
   * CE-004: Select all elements on canvas
   */
  const handleSelectAll = useCallback(() => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;
    const objects = canvas.getObjects();

    if (objects.length === 0) return;

    if (objects.length === 1) {
      canvas.setActiveObject(objects[0]);
    } else {
      const selection = new ActiveSelection(objects, { canvas });
      canvas.setActiveObject(selection);
    }
    canvas.requestRenderAll();
  }, []);

  /**
   * CE-004: Deselect all elements
   */
  const handleDeselect = useCallback(() => {
    if (!fabricRef.current) return;

    fabricRef.current.discardActiveObject();
    fabricRef.current.requestRenderAll();
    setSelectedObject(null);
  }, []);

  /**
   * CE-004: Nudge selected element by pixels
   */
  const handleNudge = useCallback(
    (direction: "up" | "down" | "left" | "right", amount: number) => {
      if (!fabricRef.current) return;

      const active = fabricRef.current.getActiveObject();
      if (!active) return;

      switch (direction) {
        case "up":
          active.set("top", (active.top || 0) - amount);
          break;
        case "down":
          active.set("top", (active.top || 0) + amount);
          break;
        case "left":
          active.set("left", (active.left || 0) - amount);
          break;
        case "right":
          active.set("left", (active.left || 0) + amount);
          break;
      }

      active.setCoords();
      fabricRef.current.requestRenderAll();
      saveHistoryState();
    },
    [saveHistoryState],
  );

  // CE-003 & CE-004: Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea or editing text on canvas
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Check if currently editing text in canvas
      const activeObj = fabricRef.current?.getActiveObject();
      if (activeObj && activeObj.type === "i-text") {
        const itext = activeObj as IText;
        if (itext.isEditing) {
          return; // Let text editing handle the keypress
        }
      }

      const hasModifier = e.ctrlKey || e.metaKey;

      // Ctrl+Z or Cmd+Z for undo
      if (hasModifier && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Shift+Z or Cmd+Shift+Z for redo
      else if (hasModifier && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl+Y or Cmd+Y for redo (alternative)
      else if (hasModifier && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
      // CE-004: Ctrl+C or Cmd+C for copy
      else if (hasModifier && e.key === "c") {
        e.preventDefault();
        handleCopy();
      }
      // CE-004: Ctrl+V or Cmd+V for paste
      else if (hasModifier && e.key === "v") {
        e.preventDefault();
        handlePaste();
      }
      // CE-004: Ctrl+X or Cmd+X for cut
      else if (hasModifier && e.key === "x") {
        e.preventDefault();
        handleCut();
      }
      // CE-004: Ctrl+D or Cmd+D for duplicate
      else if (hasModifier && e.key === "d") {
        e.preventDefault();
        handleDuplicate();
      }
      // CE-004: Ctrl+A or Cmd+A for select all
      else if (hasModifier && e.key === "a") {
        e.preventDefault();
        handleSelectAll();
      }
      // CE-004: Delete or Backspace to remove selected element(s)
      else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        handleDeleteSelected();
      }
      // CE-004: Escape to deselect
      else if (e.key === "Escape") {
        e.preventDefault();
        handleDeselect();
      }
      // CE-004: Arrow keys for nudging
      else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleNudge("up", e.shiftKey ? 10 : 1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNudge("down", e.shiftKey ? 10 : 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleNudge("left", e.shiftKey ? 10 : 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNudge("right", e.shiftKey ? 10 : 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleCopy,
    handlePaste,
    handleCut,
    handleDuplicate,
    handleSelectAll,
    handleDeleteSelected,
    handleDeselect,
    handleNudge,
  ]);

  /**
   * Get selection info text based on selected object type
   */
  const getSelectionInfoText = () => {
    if (!selectedObject) return "Nothing selected";

    const type = selectedObject.type;
    if (type === "rect") return "Rectangle selected";
    if (type === "i-text") return "Text selected";
    return `${type} selected`;
  };

  /**
   * CE-002: Set zoom level on the canvas
   */
  const setZoom = useCallback((newZoom: number) => {
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
  }, []);

  /**
   * CE-002: Zoom in by one step
   */
  const handleZoomIn = useCallback(() => {
    setZoom(zoomLevel + ZOOM_STEP);
  }, [zoomLevel, setZoom]);

  /**
   * CE-002: Zoom out by one step
   */
  const handleZoomOut = useCallback(() => {
    setZoom(zoomLevel - ZOOM_STEP);
  }, [zoomLevel, setZoom]);

  /**
   * CE-002: Set zoom to a specific preset value
   */
  const handleZoomPreset = useCallback(
    (preset: number) => {
      setZoom(preset);
    },
    [setZoom],
  );

  /**
   * CE-002: Fit canvas to screen (reset to 100% centered view)
   */
  const handleFitToScreen = useCallback(() => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;

    // Reset zoom to 100%
    setZoom(1.0);

    // Reset viewport transform to center
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.requestRenderAll();
  }, [setZoom]);

  return (
    <div className="relative flex h-full flex-col bg-stone-200">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b bg-white p-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddRectangle}
          className="gap-2"
        >
          <Square className="h-4 w-4" />
          Add Rectangle
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddText}
          className="gap-2"
        >
          <Type className="h-4 w-4" />
          Add Text
        </Button>

        <div className="mx-2 h-6 w-px bg-stone-200" />

        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteSelected}
          disabled={!selectedObject}
          className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:text-stone-400"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>

        <div className="mx-2 h-6 w-px bg-stone-200" />

        {/* CE-003: Undo/Redo controls */}
        <div className="flex items-center gap-1" data-testid="history-controls">
          <Button
            variant="outline"
            size="icon"
            onClick={handleUndo}
            disabled={!canUndo}
            className="h-8 w-8"
            aria-label="Undo (Ctrl+Z)"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRedo}
            disabled={!canRedo}
            className="h-8 w-8"
            aria-label="Redo (Ctrl+Shift+Z)"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mx-2 h-6 w-px bg-stone-200" />

        {/* CE-002: Zoom controls */}
        <div className="flex items-center gap-1" data-testid="zoom-controls">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoomLevel <= ZOOM_MIN}
            className="h-8 w-8"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="min-w-[60px] font-mono"
                data-testid="zoom-level"
              >
                {Math.round(zoomLevel * 100)}%
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {ZOOM_PRESETS.map((preset) => (
                <DropdownMenuItem
                  key={preset}
                  onClick={() => handleZoomPreset(preset)}
                  className={zoomLevel === preset ? "bg-stone-100" : ""}
                >
                  {Math.round(preset * 100)}%
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoomLevel >= ZOOM_MAX}
            className="h-8 w-8"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleFitToScreen}
            className="h-8 w-8"
            aria-label="Fit to screen"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>

        {/* CE-016: Save status indicator */}
        {onCanvasChange && saveStatus !== "idle" && (
          <div
            data-testid="save-status"
            className="flex items-center gap-1 text-sm"
          >
            {saveStatus === "saving" && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-stone-500" />
                <span className="text-stone-500">Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Saved</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600">Error</span>
              </>
            )}
          </div>
        )}

        {/* CE-018: Export button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExportDialog(true)}
          className="ml-auto gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>

        {/* Selection info */}
        <div data-testid="selection-info" className="text-sm text-stone-500">
          {getSelectionInfoText()}
        </div>
      </div>

      {/* Canvas viewport */}
      <div className="flex flex-1 items-center justify-center overflow-auto p-8">
        <div className="rounded-lg bg-white shadow-2xl">
          <canvas
            ref={canvasRef}
            data-testid="fabric-canvas"
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          />
        </div>
      </div>

      {/* CE-018: Export dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        canvasRef={fabricRef}
      />
    </div>
  );
}
