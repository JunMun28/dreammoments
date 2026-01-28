import { Paintbrush } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

/**
 * CE-030: Background Panel
 *
 * Panel for setting canvas background:
 * - Solid colors (wedding palette)
 * - Pattern backgrounds (marble, floral, geometric)
 * - Background opacity
 */

/**
 * Wedding color palette - curated colors for wedding invitations
 */
const WEDDING_COLORS = [
	"#FFFFFF",
	"#FFFFF0",
	"#FFF5EE",
	"#FAF0E6", // whites/creams
	"#FFE4E1",
	"#FFC0CB",
	"#FFB6C1", // pinks/blush
	"#FFD700",
	"#C9A227",
	"#D4AF37", // golds
	"#000080",
	"#191970",
	"#2F4F4F", // dark blues
	"#F5F5DC",
	"#E6E6FA",
	"#D8BFD8", // neutrals
];

/**
 * Pattern background definitions
 */
const PATTERNS = [
	{
		id: "marble",
		name: "Marble",
		preview:
			"linear-gradient(45deg, #f5f5f5 25%, #e0e0e0 50%, #f5f5f5 75%, #e8e8e8 100%)",
	},
	{
		id: "floral",
		name: "Floral",
		preview:
			"radial-gradient(circle at 20% 30%, #ffb6c1 2px, transparent 2px), radial-gradient(circle at 80% 70%, #ffb6c1 2px, transparent 2px), linear-gradient(#fff5f5, #fff5f5)",
	},
	{
		id: "geometric",
		name: "Geometric",
		preview:
			"repeating-linear-gradient(45deg, transparent, transparent 10px, #f0f0f0 10px, #f0f0f0 20px)",
	},
];

/**
 * Background value types
 */
export interface BackgroundValue {
	type: "solid" | "pattern" | "none";
	color?: string;
	pattern?: string;
	opacity: number;
}

interface BackgroundPanelProps {
	/** Callback when background changes */
	onBackgroundChange: (value: BackgroundValue) => void;
	/** Current background value */
	currentBackground?: BackgroundValue;
}

/**
 * CE-030: Background panel for canvas background customization.
 * Supports solid colors, patterns, and opacity control.
 */
export function BackgroundPanel({
	onBackgroundChange,
	currentBackground,
}: BackgroundPanelProps) {
	const opacity = currentBackground?.opacity ?? 1;

	const handleColorClick = (color: string) => {
		onBackgroundChange({
			type: "solid",
			color,
			opacity: 1,
		});
	};

	const handlePatternClick = (patternId: string) => {
		onBackgroundChange({
			type: "pattern",
			pattern: patternId,
			opacity: 1,
		});
	};

	const handleOpacityChange = (value: number[]) => {
		if (currentBackground) {
			onBackgroundChange({
				...currentBackground,
				opacity: value[0] / 100,
			});
		}
	};

	const handleClearClick = () => {
		onBackgroundChange({
			type: "none",
			opacity: 0,
		});
	};

	const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onBackgroundChange({
			type: "solid",
			color: e.target.value,
			opacity: 1,
		});
	};

	const isColorSelected = (color: string) =>
		currentBackground?.type === "solid" && currentBackground.color === color;

	const isPatternSelected = (patternId: string) =>
		currentBackground?.type === "pattern" &&
		currentBackground.pattern === patternId;

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Paintbrush className="h-4 w-4 text-stone-500" />
				<h3 className="font-medium text-stone-700">Background</h3>
			</div>
			<p className="text-xs text-stone-500">
				Set canvas background color or pattern
			</p>

			{/* Solid Colors Section */}
			<div className="space-y-2">
				<Label className="text-sm font-medium text-stone-600">
					Solid Colors
				</Label>
				<div className="grid grid-cols-4 gap-2">
					{WEDDING_COLORS.map((color) => (
						<button
							key={color}
							type="button"
							onClick={() => handleColorClick(color)}
							className={`aspect-square w-full rounded-md border-2 transition-all ${
								isColorSelected(color)
									? "ring-2 ring-stone-900 ring-offset-2"
									: "border-stone-200 hover:border-stone-300"
							}`}
							style={{ backgroundColor: color }}
							aria-label={`Color swatch ${color}`}
						/>
					))}
				</div>

				{/* Custom Color Picker */}
				<div className="flex items-center gap-2 pt-1">
					<Label htmlFor="custom-color" className="text-xs text-stone-500">
						Custom Color
					</Label>
					<input
						id="custom-color"
						type="color"
						defaultValue={
							currentBackground?.type === "solid"
								? currentBackground.color
								: "#FFFFFF"
						}
						onChange={handleCustomColorChange}
						className="h-8 w-12 cursor-pointer rounded border border-stone-200"
						aria-label="Custom Color"
					/>
				</div>
			</div>

			{/* Patterns Section */}
			<div className="space-y-2">
				<Label className="text-sm font-medium text-stone-600">Patterns</Label>
				<div className="grid grid-cols-3 gap-2">
					{PATTERNS.map((pattern) => (
						<button
							key={pattern.id}
							type="button"
							onClick={() => handlePatternClick(pattern.id)}
							className={`aspect-square w-full rounded-md border-2 transition-all ${
								isPatternSelected(pattern.id)
									? "ring-2 ring-stone-900 ring-offset-2"
									: "border-stone-200 hover:border-stone-300"
							}`}
							style={{ background: pattern.preview }}
							aria-label={`${pattern.name} pattern`}
						/>
					))}
				</div>
			</div>

			{/* Opacity Control */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label
						htmlFor="bg-opacity"
						className="text-sm font-medium text-stone-600"
					>
						Background Opacity
					</Label>
					<span className="text-sm text-stone-500">
						{Math.round(opacity * 100)}%
					</span>
				</div>
				<Slider
					id="bg-opacity"
					min={0}
					max={100}
					step={1}
					value={[Math.round(opacity * 100)]}
					onValueChange={handleOpacityChange}
					aria-label="Background Opacity"
				/>
			</div>

			{/* Clear/Transparent Button */}
			<button
				type="button"
				onClick={handleClearClick}
				className="w-full rounded-md border-2 border-dashed border-stone-300 py-2 text-sm text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-600"
				aria-label="Clear background (transparent)"
			>
				Transparent / None
			</button>
		</div>
	);
}
