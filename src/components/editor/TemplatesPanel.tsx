import { useId } from "react";

/**
 * CE-006: Templates gallery panel for canvas editor
 * Shows a grid of pre-made templates that can be previewed and applied to canvas.
 */

/**
 * Template element that will be loaded onto canvas
 */
export interface TemplateElement {
	type: "text" | "rect" | "image";
	left: number;
	top: number;
	width?: number;
	height?: number;
	// Text-specific
	text?: string;
	fontFamily?: string;
	fontSize?: number;
	fontWeight?: "normal" | "bold";
	fontStyle?: "normal" | "italic";
	fill?: string;
	textAlign?: "left" | "center" | "right" | "justify";
	// Rect-specific
	rx?: number;
	ry?: number;
	stroke?: string;
	strokeWidth?: number;
}

/**
 * Template definition with canvas elements
 */
export interface TemplateDefinition {
	id: string;
	name: string;
	description: string;
	previewColor: string;
	accentColor: string;
	elements: TemplateElement[];
}

/**
 * Pre-defined wedding invitation templates
 */
const TEMPLATES: TemplateDefinition[] = [
	{
		id: "elegant",
		name: "Elegant",
		description: "Classic serif typography with gold accents",
		previewColor: "#f5f0e6",
		accentColor: "#c9a227",
		elements: [
			{
				type: "rect",
				left: 0,
				top: 0,
				width: 400,
				height: 700,
				fill: "#f5f0e6",
			},
			{
				type: "text",
				left: 200,
				top: 150,
				text: "Sarah & Michael",
				fontFamily: "Playfair Display",
				fontSize: 32,
				fontWeight: "bold",
				fontStyle: "normal",
				fill: "#292524",
				textAlign: "center",
			},
			{
				type: "text",
				left: 200,
				top: 220,
				text: "REQUEST THE PLEASURE OF YOUR COMPANY",
				fontFamily: "serif",
				fontSize: 12,
				fontWeight: "normal",
				fontStyle: "normal",
				fill: "#c9a227",
				textAlign: "center",
			},
			{
				type: "text",
				left: 200,
				top: 300,
				text: "Saturday, June 15th, 2025",
				fontFamily: "Lora",
				fontSize: 18,
				fontWeight: "normal",
				fontStyle: "normal",
				fill: "#44403c",
				textAlign: "center",
			},
			{
				type: "rect",
				left: 150,
				top: 260,
				width: 100,
				height: 2,
				fill: "#c9a227",
			},
		],
	},
	{
		id: "modern",
		name: "Modern",
		description: "Clean sans-serif with bold geometric shapes",
		previewColor: "#ffffff",
		accentColor: "#1a1a1a",
		elements: [
			{
				type: "rect",
				left: 0,
				top: 0,
				width: 400,
				height: 700,
				fill: "#ffffff",
			},
			{
				type: "text",
				left: 200,
				top: 180,
				text: "EMMA + JAMES",
				fontFamily: "sans-serif",
				fontSize: 28,
				fontWeight: "bold",
				fontStyle: "normal",
				fill: "#1a1a1a",
				textAlign: "center",
			},
			{
				type: "text",
				left: 200,
				top: 250,
				text: "06.15.2025",
				fontFamily: "sans-serif",
				fontSize: 24,
				fontWeight: "normal",
				fontStyle: "normal",
				fill: "#666666",
				textAlign: "center",
			},
			{
				type: "rect",
				left: 50,
				top: 100,
				width: 300,
				height: 300,
				fill: "transparent",
				stroke: "#1a1a1a",
				strokeWidth: 2,
			},
		],
	},
	{
		id: "rustic",
		name: "Rustic",
		description: "Warm earth tones with handwritten accents",
		previewColor: "#faf6f0",
		accentColor: "#8b5a2b",
		elements: [
			{
				type: "rect",
				left: 0,
				top: 0,
				width: 400,
				height: 700,
				fill: "#faf6f0",
			},
			{
				type: "text",
				left: 200,
				top: 160,
				text: "Together with their families",
				fontFamily: "Cormorant Garamond",
				fontSize: 14,
				fontWeight: "normal",
				fontStyle: "italic",
				fill: "#8b5a2b",
				textAlign: "center",
			},
			{
				type: "text",
				left: 200,
				top: 220,
				text: "Olivia & Ethan",
				fontFamily: "Dancing Script",
				fontSize: 36,
				fontWeight: "normal",
				fontStyle: "normal",
				fill: "#5c4033",
				textAlign: "center",
			},
			{
				type: "text",
				left: 200,
				top: 300,
				text: "invite you to celebrate their wedding",
				fontFamily: "Lora",
				fontSize: 14,
				fontWeight: "normal",
				fontStyle: "normal",
				fill: "#78716c",
				textAlign: "center",
			},
		],
	},
	{
		id: "minimal",
		name: "Minimal",
		description: "Simple elegance with plenty of white space",
		previewColor: "#ffffff",
		accentColor: "#9ca3af",
		elements: [
			{
				type: "rect",
				left: 0,
				top: 0,
				width: 400,
				height: 700,
				fill: "#ffffff",
			},
			{
				type: "text",
				left: 200,
				top: 280,
				text: "Ava",
				fontFamily: "serif",
				fontSize: 42,
				fontWeight: "normal",
				fontStyle: "normal",
				fill: "#292524",
				textAlign: "center",
			},
			{
				type: "text",
				left: 200,
				top: 340,
				text: "&",
				fontFamily: "serif",
				fontSize: 24,
				fontWeight: "normal",
				fontStyle: "italic",
				fill: "#9ca3af",
				textAlign: "center",
			},
			{
				type: "text",
				left: 200,
				top: 380,
				text: "Noah",
				fontFamily: "serif",
				fontSize: 42,
				fontWeight: "normal",
				fontStyle: "normal",
				fill: "#292524",
				textAlign: "center",
			},
		],
	},
	{
		id: "floral",
		name: "Floral",
		description: "Romantic blush tones with botanical styling",
		previewColor: "#fff5f5",
		accentColor: "#db7093",
		elements: [
			{
				type: "rect",
				left: 0,
				top: 0,
				width: 400,
				height: 700,
				fill: "#fff5f5",
			},
			{
				type: "text",
				left: 200,
				top: 200,
				text: "Sophie & William",
				fontFamily: "Great Vibes",
				fontSize: 34,
				fontWeight: "normal",
				fontStyle: "normal",
				fill: "#db7093",
				textAlign: "center",
			},
			{
				type: "text",
				left: 200,
				top: 270,
				text: "are getting married!",
				fontFamily: "Lora",
				fontSize: 16,
				fontWeight: "normal",
				fontStyle: "italic",
				fill: "#78716c",
				textAlign: "center",
			},
			{
				type: "rect",
				left: 100,
				top: 320,
				width: 200,
				height: 1,
				fill: "#db7093",
			},
			{
				type: "text",
				left: 200,
				top: 350,
				text: "June Fifteenth",
				fontFamily: "Cormorant Garamond",
				fontSize: 20,
				fontWeight: "normal",
				fontStyle: "normal",
				fill: "#292524",
				textAlign: "center",
			},
		],
	},
];

interface TemplatesPanelProps {
	/** Callback when a template is selected for preview */
	onSelectTemplate: (template: TemplateDefinition | null) => void;
	/** Callback when Apply button is clicked */
	onApplyTemplate: (template: TemplateDefinition) => void;
	/** Currently selected template ID (shows preview dialog) */
	selectedTemplateId?: string | null;
}

/**
 * CE-006: Templates panel showing grid of wedding invitation templates.
 * Clicking a template shows a preview dialog with Apply button.
 */
export function TemplatesPanel({
	onSelectTemplate,
	onApplyTemplate,
	selectedTemplateId,
}: TemplatesPanelProps) {
	const dialogTitleId = useId();
	const selectedTemplate = selectedTemplateId
		? TEMPLATES.find((t) => t.id === selectedTemplateId)
		: null;

	return (
		<div className="space-y-4">
			<h3 className="font-medium text-stone-700">Templates</h3>
			<p className="text-xs text-stone-500">
				Click a template to preview and apply
			</p>

			{/* Template Grid */}
			<div className="grid grid-cols-2 gap-3">
				{TEMPLATES.map((template) => (
					<button
						key={template.id}
						type="button"
						className="group overflow-hidden rounded-lg border border-stone-200 bg-white transition-all hover:border-stone-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
						onClick={() => onSelectTemplate(template)}
						aria-label={`${template.name} template`}
					>
						{/* Thumbnail Preview */}
						<div
							data-testid={`template-thumbnail-${template.id}`}
							className="aspect-[4/5] w-full"
							style={{ backgroundColor: template.previewColor }}
						>
							{/* Simplified preview with accent color */}
							<div className="flex h-full flex-col items-center justify-center p-2">
								<div
									className="mb-2 h-0.5 w-8"
									style={{ backgroundColor: template.accentColor }}
								/>
								<div
									className="text-xs font-medium"
									style={{ color: template.accentColor }}
								>
									Aa
								</div>
								<div
									className="mt-2 h-0.5 w-8"
									style={{ backgroundColor: template.accentColor }}
								/>
							</div>
						</div>
						{/* Template Name */}
						<div className="p-2">
							<div className="text-sm font-medium text-stone-700">
								{template.name}
							</div>
						</div>
					</button>
				))}
			</div>

			{/* Preview Dialog */}
			{selectedTemplate && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
					role="dialog"
					aria-modal="true"
					aria-labelledby={dialogTitleId}
				>
					<div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
						{/* Dialog Header */}
						<div className="border-b p-4">
							<h2 id={dialogTitleId} className="text-lg font-medium">
								Preview
							</h2>
						</div>

						{/* Template Preview */}
						<div className="p-4">
							<div
								className="mx-auto aspect-[4/5] w-48 overflow-hidden rounded border"
								style={{ backgroundColor: selectedTemplate.previewColor }}
							>
								<div className="flex h-full flex-col items-center justify-center p-4">
									<div className="text-center">
										<div
											className="text-lg font-bold"
											style={{ color: selectedTemplate.accentColor }}
										>
											{selectedTemplate.name}
										</div>
										<div className="mt-1 text-xs text-stone-500">
											{selectedTemplate.description}
										</div>
									</div>
								</div>
							</div>
							<p className="mt-3 text-center text-sm text-stone-500">
								{selectedTemplate.elements.length} elements
							</p>
						</div>

						{/* Dialog Actions */}
						<div className="flex justify-end gap-2 border-t p-4">
							<button
								type="button"
								className="rounded-md px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
								onClick={() => onSelectTemplate(null)}
							>
								Cancel
							</button>
							<button
								type="button"
								className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
								onClick={() => onApplyTemplate(selectedTemplate)}
							>
								Apply
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
