import { cn } from "@/lib/utils";

/**
 * CE-008: Text style definition for adding styled text to canvas
 */
export interface TextStyleDefinition {
	id: string;
	name: string;
	text: string;
	fontFamily: string;
	fontSize: number;
	fontWeight: "normal" | "bold";
	fontStyle: "normal" | "italic";
	fill: string;
	textAlign?: "left" | "center" | "right" | "justify";
	lineHeight?: number;
}

/**
 * Pre-defined text styles for canvas editor (CE-008)
 */
const TEXT_STYLES: TextStyleDefinition[] = [
	{
		id: "heading",
		name: "Heading",
		text: "Heading Text",
		fontFamily: "Playfair Display",
		fontSize: 36,
		fontWeight: "bold",
		fontStyle: "normal",
		fill: "#292524",
		textAlign: "center",
	},
	{
		id: "subheading",
		name: "Subheading",
		text: "Subheading Text",
		fontFamily: "Lora",
		fontSize: 24,
		fontWeight: "normal",
		fontStyle: "normal",
		fill: "#44403c",
		textAlign: "center",
	},
	{
		id: "body",
		name: "Body",
		text: "Body text goes here. Add your content and customize as needed.",
		fontFamily: "serif",
		fontSize: 16,
		fontWeight: "normal",
		fontStyle: "normal",
		fill: "#57534e",
		textAlign: "left",
		lineHeight: 1.6,
	},
	{
		id: "quote",
		name: "Quote",
		text: '"Love is composed of a single soul inhabiting two bodies."',
		fontFamily: "Cormorant Garamond",
		fontSize: 20,
		fontWeight: "normal",
		fontStyle: "italic",
		fill: "#78716c",
		textAlign: "center",
		lineHeight: 1.5,
	},
	{
		id: "caption",
		name: "Caption",
		text: "Caption or small text",
		fontFamily: "sans-serif",
		fontSize: 12,
		fontWeight: "normal",
		fontStyle: "normal",
		fill: "#a8a29e",
		textAlign: "center",
	},
];

/**
 * Map style IDs to Tailwind CSS classes for preview
 */
const STYLE_PREVIEW_CLASSES: Record<string, string> = {
	heading: "text-2xl font-bold font-serif",
	subheading: "text-xl font-serif",
	body: "text-base",
	quote: "text-lg italic font-serif",
	caption: "text-xs text-stone-400",
};

interface TextStylesPanelProps {
	/** Callback when a text style is selected to be added to canvas */
	onAddTextStyle: (style: TextStyleDefinition) => void;
}

/**
 * CE-008: Panel showing pre-styled text options for canvas editor.
 * Clicking a style adds a text element with that styling to the canvas.
 */
export function TextStylesPanel({ onAddTextStyle }: TextStylesPanelProps) {
	return (
		<div className="space-y-4">
			<h3 className="font-medium text-stone-700">Text Styles</h3>
			<p className="text-xs text-stone-500">
				Click a style to add text to canvas
			</p>

			<div className="space-y-2">
				{TEXT_STYLES.map((style) => (
					<button
						key={style.id}
						type="button"
						className="w-full rounded-lg border border-stone-200 bg-white p-3 text-left transition-colors hover:border-stone-300 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
						onClick={() => onAddTextStyle(style)}
						aria-label={style.name}
					>
						<div className="text-xs font-medium text-stone-500 mb-1">
							{style.name}
						</div>
						<div
							data-testid={`style-preview-${style.id}`}
							className={cn(
								"truncate text-stone-700",
								STYLE_PREVIEW_CLASSES[style.id],
							)}
						>
							{style.text}
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
