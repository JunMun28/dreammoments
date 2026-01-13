import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";

/**
 * Preset accent color swatches for wedding themes
 */
const PRESET_COLORS = [
	{ name: "Rose Gold", value: "#b76e79" },
	{ name: "Blush", value: "#e8b4b8" },
	{ name: "Sage", value: "#9caf88" },
	{ name: "Dusty Blue", value: "#8fa8c8" },
	{ name: "Champagne", value: "#d4af37" },
	{ name: "Mauve", value: "#915f78" },
	{ name: "Terracotta", value: "#c87d54" },
	{ name: "Navy", value: "#2c3e50" },
] as const;

interface ColorPickerProps {
	/** Current color value (hex format) */
	value?: string;
	/** Callback when color changes */
	onChange?: (color: string) => void;
	/** Label for the color picker */
	label?: string;
	/** Additional CSS classes */
	className?: string;
}

/**
 * Validates a hex color string
 */
function isValidHexColor(color: string): boolean {
	return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
}

/**
 * Normalizes hex color to 6-digit format
 */
function normalizeHexColor(color: string): string {
	if (!color.startsWith("#")) {
		color = `#${color}`;
	}
	// Expand 3-digit to 6-digit
	if (color.length === 4) {
		const r = color[1];
		const g = color[2];
		const b = color[3];
		return `#${r}${r}${g}${g}${b}${b}`;
	}
	return color.toLowerCase();
}

/**
 * ColorPicker component with preset swatches and custom hex input.
 * Used for theme accent color customization.
 */
export function ColorPicker({
	value,
	onChange,
	label = "Accent Color",
	className,
}: ColorPickerProps) {
	const id = useId();
	const [hexInput, setHexInput] = useState(value || "");
	const [inputError, setInputError] = useState(false);

	// Get the normalized current color for comparison
	const normalizedValue = value ? normalizeHexColor(value) : "";

	const handleSwatchClick = (color: string) => {
		setHexInput(color);
		setInputError(false);
		onChange?.(color);
	};

	const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let input = e.target.value;
		setHexInput(input);

		// Add # if missing
		if (input && !input.startsWith("#")) {
			input = `#${input}`;
		}

		if (!input) {
			setInputError(false);
			onChange?.("");
		} else if (isValidHexColor(input)) {
			setInputError(false);
			onChange?.(normalizeHexColor(input));
		} else {
			setInputError(true);
		}
	};

	const handleHexInputBlur = () => {
		// Sync input with value on blur
		if (value) {
			setHexInput(value);
			setInputError(false);
		}
	};

	return (
		<div className={cn("space-y-3", className)}>
			<Label htmlFor={`${id}-hex`}>{label}</Label>

			{/* Preset swatches */}
			<fieldset className="flex flex-wrap gap-2 border-0 p-0">
				<legend className="sr-only">Preset colors</legend>
				{PRESET_COLORS.map((preset) => (
					<button
						key={preset.value}
						type="button"
						title={preset.name}
						onClick={() => handleSwatchClick(preset.value)}
						className={cn(
							"h-8 w-8 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
							normalizedValue === preset.value
								? "border-stone-800 ring-2 ring-stone-400"
								: "border-stone-300",
						)}
						style={{ backgroundColor: preset.value }}
						aria-label={preset.name}
						aria-pressed={normalizedValue === preset.value}
					/>
				))}
			</fieldset>

			{/* Custom hex input */}
			<div className="flex items-center gap-2">
				<div
					className="h-9 w-9 shrink-0 rounded-md border border-stone-300"
					style={{
						backgroundColor: isValidHexColor(hexInput) ? hexInput : "#ffffff",
					}}
					aria-hidden="true"
				/>
				<Input
					id={`${id}-hex`}
					type="text"
					placeholder="#b76e79"
					value={hexInput}
					onChange={handleHexInputChange}
					onBlur={handleHexInputBlur}
					maxLength={7}
					className={cn(
						"font-mono",
						inputError && "border-red-500 focus-visible:border-red-500",
					)}
					aria-invalid={inputError}
					aria-describedby={inputError ? `${id}-error` : undefined}
				/>
			</div>
			{inputError && (
				<p id={`${id}-error`} className="text-sm text-red-500">
					Enter a valid hex color (e.g., #b76e79)
				</p>
			)}
		</div>
	);
}

export { PRESET_COLORS, isValidHexColor, normalizeHexColor };
