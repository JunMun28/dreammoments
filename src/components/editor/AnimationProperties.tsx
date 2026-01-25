import type { FabricObject } from "fabric";
import { Repeat } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  ANIMATION_TYPES,
  type AnimationConfig,
  DEFAULT_ANIMATION_CONFIG,
  EASING_OPTIONS,
  type AnimationType,
  type EasingType,
} from "@/lib/canvas-animations";

interface AnimationPropertiesProps {
  object: FabricObject;
  onPropertyChange?: (property: string, value: unknown) => void;
}

/**
 * CE-029: Animation Properties panel
 *
 * Allows configuring element animations:
 * - Animation type (fadeIn, slideUp, etc.)
 * - Duration (0.1-5 seconds)
 * - Delay (0-10 seconds)
 * - Easing function
 * - Loop toggle
 */
export function AnimationProperties({
  object,
  onPropertyChange,
}: AnimationPropertiesProps) {
  // Get current animation config from object or use defaults
  const animObj = object as FabricObject & { animation?: AnimationConfig };
  const config: AnimationConfig = animObj.animation || {
    ...DEFAULT_ANIMATION_CONFIG,
  };

  // Update animation config and notify parent
  const updateConfig = (updates: Partial<AnimationConfig>) => {
    const newConfig: AnimationConfig = {
      ...config,
      ...updates,
    };
    onPropertyChange?.("animation", newConfig);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateConfig({ type: e.target.value as AnimationType });
  };

  const handleDurationChange = (value: number[]) => {
    updateConfig({ duration: value[0] });
  };

  const handleDelayChange = (value: number[]) => {
    updateConfig({ delay: value[0] });
  };

  const handleEasingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateConfig({ easing: e.target.value as EasingType });
  };

  const handleLoopChange = (checked: boolean) => {
    updateConfig({ loop: checked });
  };

  return (
    <div className="space-y-4 border-t p-4">
      <h3 className="font-medium text-stone-900">Animation</h3>

      <div className="space-y-3">
        {/* Animation Type */}
        <div className="space-y-1.5">
          <Label htmlFor="animation-type">Animation Type</Label>
          <select
            id="animation-type"
            className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
            value={config.type}
            onChange={handleTypeChange}
          >
            {ANIMATION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div className="space-y-1.5">
          <Label htmlFor="animation-duration">Duration</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="animation-duration"
              min={0.1}
              max={5}
              step={0.1}
              value={[config.duration]}
              onValueChange={handleDurationChange}
              className="flex-1"
            />
            <span className="w-12 text-right text-sm text-stone-500">
              {config.duration}s
            </span>
          </div>
        </div>

        {/* Delay */}
        <div className="space-y-1.5">
          <Label htmlFor="animation-delay">Delay</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="animation-delay"
              min={0}
              max={10}
              step={0.1}
              value={[config.delay]}
              onValueChange={handleDelayChange}
              className="flex-1"
            />
            <span className="w-12 text-right text-sm text-stone-500">
              {config.delay}s
            </span>
          </div>
        </div>

        {/* Easing */}
        <div className="space-y-1.5">
          <Label htmlFor="animation-easing">Easing</Label>
          <select
            id="animation-easing"
            className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
            value={config.easing}
            onChange={handleEasingChange}
          >
            {EASING_OPTIONS.map((easing) => (
              <option key={easing.value} value={easing.value}>
                {easing.label}
              </option>
            ))}
          </select>
        </div>

        {/* Loop Toggle */}
        <div className="flex items-center justify-between">
          <Label
            htmlFor="animation-loop"
            className="flex cursor-pointer items-center gap-2"
          >
            <Repeat className="h-4 w-4 text-stone-500" />
            Loop
          </Label>
          <Switch
            id="animation-loop"
            checked={config.loop}
            onCheckedChange={handleLoopChange}
            aria-label="Loop"
          />
        </div>
      </div>
    </div>
  );
}
