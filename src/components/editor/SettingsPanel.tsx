import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { EditorMode } from "@/lib/invitation-server";

/** Default canvas height in pixels */
const DEFAULT_CANVAS_HEIGHT = 700;

/** Minimum canvas height in pixels */
const MIN_CANVAS_HEIGHT = 700;

/** Maximum canvas height in pixels */
const MAX_CANVAS_HEIGHT = 20000;

/** Preset canvas heights for quick selection */
const HEIGHT_PRESETS = [700, 1400, 2100, 5000];

export interface SettingsPanelProps {
  /** Current editor mode */
  currentMode: EditorMode;
  /** Callback when mode changes */
  onModeChange?: (mode: EditorMode) => void;
  /** Whether a save operation is in progress */
  isSaving?: boolean;
  /** Whether the last save was successful */
  isSaved?: boolean;
  /** Current canvas height in pixels (canvas mode only) */
  canvasHeight?: number;
  /** Callback when canvas height changes */
  onCanvasHeightChange?: (height: number) => void;
}

/**
 * Settings panel for the canvas editor.
 * Includes Editor Mode toggle (CE-019) with warning dialog for mode switching.
 */
export function SettingsPanel({
  currentMode,
  onModeChange,
  isSaving = false,
  isSaved = false,
  canvasHeight = DEFAULT_CANVAS_HEIGHT,
  onCanvasHeightChange,
}: SettingsPanelProps) {
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const structuredId = useId();
  const canvasId = useId();
  const dialogTitleId = useId();

  const handleModeSelect = (mode: EditorMode) => {
    if (mode === currentMode) return;

    // Switching to canvas mode requires confirmation
    if (mode === "canvas") {
      setShowWarningDialog(true);
    } else {
      // Switching to structured mode is allowed without warning
      onModeChange?.(mode);
    }
  };

  const handleConfirmSwitch = () => {
    setShowWarningDialog(false);
    onModeChange?.("canvas");
  };

  const handleCancelSwitch = () => {
    setShowWarningDialog(false);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-900">Settings</h3>
        {isSaving && (
          <div className="flex items-center gap-1 text-sm text-stone-500">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Saving...</span>
          </div>
        )}
        {isSaved && !isSaving && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <Check className="h-3 w-3" />
            <span>Saved</span>
          </div>
        )}
      </div>

      {/* Editor Mode Section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-stone-700">
          Editor Mode
        </Label>

        <div className="space-y-2">
          {/* Structured Mode Option */}
          <label
            htmlFor={structuredId}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
              currentMode === "structured"
                ? "border-blue-500 bg-blue-50"
                : "border-stone-200 hover:bg-stone-50"
            }`}
          >
            <input
              type="radio"
              id={structuredId}
              name="editor-mode"
              value="structured"
              checked={currentMode === "structured"}
              onChange={() => handleModeSelect("structured")}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-stone-900">Structured</div>
              <div className="text-sm text-stone-500">
                Use predefined sections and form-based editing
              </div>
            </div>
          </label>

          {/* Canvas Mode Option */}
          <label
            htmlFor={canvasId}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
              currentMode === "canvas"
                ? "border-blue-500 bg-blue-50"
                : "border-stone-200 hover:bg-stone-50"
            }`}
          >
            <input
              type="radio"
              id={canvasId}
              name="editor-mode"
              value="canvas"
              checked={currentMode === "canvas"}
              onChange={() => handleModeSelect("canvas")}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-stone-900">Canvas</div>
              <div className="text-sm text-stone-500">
                Full creative control with drag-and-drop canvas
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Canvas Height Section - Only visible in canvas mode */}
      {currentMode === "canvas" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-stone-700">
              Canvas Height
            </Label>
            <span className="text-sm font-medium text-stone-900">
              {canvasHeight}px
            </span>
          </div>

          {/* Height Slider */}
          <input
            type="range"
            min={MIN_CANVAS_HEIGHT}
            max={MAX_CANVAS_HEIGHT}
            value={canvasHeight}
            onChange={(e) => onCanvasHeightChange?.(Number(e.target.value))}
            aria-label="Canvas height"
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-stone-200 accent-blue-600"
          />

          {/* Preset Buttons */}
          <div className="flex gap-2">
            {HEIGHT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onCanvasHeightChange?.(preset)}
                className={`flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                  canvasHeight === preset
                    ? "bg-blue-600 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Warning Dialog */}
      {showWarningDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            role="dialog"
            aria-labelledby={dialogTitleId}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <h4
                id={dialogTitleId}
                className="text-lg font-semibold text-stone-900"
              >
                Switch to Canvas Mode?
              </h4>
            </div>

            <div className="mb-6 space-y-2 text-sm text-stone-600">
              <p>
                <strong className="text-stone-900">
                  This action cannot be undone.
                </strong>
              </p>
              <p>
                Your structured content will be converted to canvas elements.
                Once you switch to Canvas mode, you cannot switch back to
                Structured mode without losing your layout changes.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleCancelSwitch}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleConfirmSwitch}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Switch to Canvas
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
