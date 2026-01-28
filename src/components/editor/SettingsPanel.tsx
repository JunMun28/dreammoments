import { Check, Loader2, MoveVertical } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

/** Default canvas height in pixels */
const DEFAULT_CANVAS_HEIGHT = 700;

/** Minimum canvas height in pixels */
const MIN_CANVAS_HEIGHT = 700;

/** Maximum canvas height in pixels */
const MAX_CANVAS_HEIGHT = 20000;

/** Preset canvas heights for quick selection */
const HEIGHT_PRESETS = [700, 1400, 2100, 5000];

/** Default scroll duration in seconds */
const DEFAULT_SCROLL_DURATION = 30;

/** Minimum scroll duration in seconds */
const MIN_SCROLL_DURATION = 1;

/** Maximum scroll duration in seconds */
const MAX_SCROLL_DURATION = 300;

export interface SettingsPanelProps {
  /** Whether a save operation is in progress */
  isSaving?: boolean;
  /** Whether the last save was successful */
  isSaved?: boolean;
  /** Current canvas height in pixels */
  canvasHeight?: number;
  /** Callback when canvas height changes */
  onCanvasHeightChange?: (height: number) => void;
  /** Whether auto-scroll is enabled */
  autoScroll?: boolean;
  /** Callback when auto-scroll is toggled */
  onAutoScrollChange?: (enabled: boolean) => void;
  /** Scroll duration in seconds (1-300) */
  scrollDuration?: number;
  /** Callback when scroll duration changes */
  onScrollDurationChange?: (duration: number) => void;
}

/**
 * Settings panel for the canvas editor.
 * Includes canvas height adjustment and auto-scroll settings.
 */
export function SettingsPanel({
  isSaving = false,
  isSaved = false,
  canvasHeight = DEFAULT_CANVAS_HEIGHT,
  onCanvasHeightChange,
  autoScroll = false,
  onAutoScrollChange,
  scrollDuration = DEFAULT_SCROLL_DURATION,
  onScrollDurationChange,
}: SettingsPanelProps) {
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

      {/* Canvas Height Section */}
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

      {/* Auto-scroll Section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-stone-700">
          Auto Scroll
        </Label>

        {/* Auto-scroll Toggle */}
        <div className="flex items-center justify-between">
          <Label
            htmlFor="auto-scroll-toggle"
            className="flex cursor-pointer items-center gap-2 text-sm text-stone-600"
          >
            <MoveVertical className="h-4 w-4 text-stone-500" />
            Enable auto-scroll
          </Label>
          <Switch
            id="auto-scroll-toggle"
            checked={autoScroll}
            onCheckedChange={(checked) => onAutoScrollChange?.(checked)}
            aria-label="Auto scroll"
          />
        </div>

        {/* Duration Slider - Only visible when auto-scroll is enabled */}
        {autoScroll && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-stone-600">Scroll Duration</Label>
              <span className="text-sm font-medium text-stone-900">
                {scrollDuration}s
              </span>
            </div>
            <input
              type="range"
              min={MIN_SCROLL_DURATION}
              max={MAX_SCROLL_DURATION}
              value={scrollDuration}
              onChange={(e) => onScrollDurationChange?.(Number(e.target.value))}
              aria-label="Scroll duration"
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-stone-200 accent-blue-600"
            />
          </div>
        )}
      </div>
    </div>
  );
}
