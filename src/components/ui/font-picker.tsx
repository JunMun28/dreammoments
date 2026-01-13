import { useEffect, useId, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";

/**
 * Font pairing preset for wedding invitations.
 * Each pairing has a heading font and a body font from Google Fonts.
 */
export interface FontPairing {
	/** Unique identifier for the font pairing */
	id: string;
	/** Display name for the pairing */
	name: string;
	/** Google Font family name for headings */
	headingFont: string;
	/** Google Font family name for body text */
	bodyFont: string;
	/** Description of the style */
	description: string;
}

/**
 * Curated font pairings for wedding invitations.
 * Uses Google Fonts that are freely available and wedding-appropriate.
 */
export const FONT_PAIRINGS: FontPairing[] = [
	{
		id: "classic",
		name: "Classic Elegance",
		headingFont: "Playfair Display",
		bodyFont: "Lato",
		description: "Timeless serif with clean sans-serif",
	},
	{
		id: "modern-romantic",
		name: "Modern Romantic",
		headingFont: "Cormorant Garamond",
		bodyFont: "Montserrat",
		description: "Refined serif with geometric sans",
	},
	{
		id: "whimsical",
		name: "Whimsical Script",
		headingFont: "Dancing Script",
		bodyFont: "Poppins",
		description: "Playful script with friendly sans",
	},
	{
		id: "elegant-minimal",
		name: "Elegant Minimal",
		headingFont: "Cinzel",
		bodyFont: "Raleway",
		description: "Regal capitals with refined sans",
	},
	{
		id: "rustic-charm",
		name: "Rustic Charm",
		headingFont: "Josefin Slab",
		bodyFont: "Open Sans",
		description: "Warm slab serif with neutral sans",
	},
];

/**
 * Default font pairing ID when none is selected
 */
export const DEFAULT_FONT_PAIRING_ID = "classic";

/**
 * Gets a font pairing by ID, returns default if not found
 */
export function getFontPairingById(id?: string): FontPairing {
	const pairing = FONT_PAIRINGS.find((p) => p.id === id);
	return pairing ?? FONT_PAIRINGS[0];
}

/**
 * Generates a Google Fonts URL for the given font families
 */
export function getGoogleFontsUrl(fonts: string[]): string {
	if (fonts.length === 0) return "";
	const families = fonts.map(
		(f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`,
	);
	return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

interface FontPickerProps {
	/** Current font pairing ID */
	value?: string;
	/** Callback when font pairing changes */
	onChange?: (pairingId: string) => void;
	/** Label for the font picker */
	label?: string;
	/** Additional CSS classes */
	className?: string;
}

/**
 * FontPicker component for selecting wedding invitation font pairings.
 * Loads Google Fonts dynamically when a pairing is selected.
 */
export function FontPicker({
	value,
	onChange,
	label = "Font Style",
	className,
}: FontPickerProps) {
	const id = useId();
	const selectedPairing = getFontPairingById(value);

	// Build Google Fonts URL for all font pairings (for preview in dropdown)
	const allFontsUrl = useMemo(() => {
		const allFonts = FONT_PAIRINGS.flatMap((p) => [p.headingFont, p.bodyFont]);
		// Deduplicate fonts
		const uniqueFonts = [...new Set(allFonts)];
		return getGoogleFontsUrl(uniqueFonts);
	}, []);

	// Load Google Fonts stylesheet
	useEffect(() => {
		if (!allFontsUrl) return;

		// Check if link already exists
		const existingLink = document.querySelector(`link[href="${allFontsUrl}"]`);
		if (existingLink) return;

		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = allFontsUrl;
		link.dataset.fontPicker = "true";
		document.head.appendChild(link);

		return () => {
			// Don't remove on unmount - fonts may still be needed by preview
		};
	}, [allFontsUrl]);

	const handleValueChange = (pairingId: string) => {
		onChange?.(pairingId);
	};

	return (
		<div className={cn("space-y-3", className)}>
			<Label htmlFor={id}>{label}</Label>

			<Select
				value={value || DEFAULT_FONT_PAIRING_ID}
				onValueChange={handleValueChange}
			>
				<SelectTrigger id={id} className="w-full">
					<SelectValue placeholder="Select font style" />
				</SelectTrigger>
				<SelectContent>
					{FONT_PAIRINGS.map((pairing) => (
						<SelectItem key={pairing.id} value={pairing.id}>
							<div className="flex flex-col gap-0.5 py-1">
								<span
									className="text-base font-medium"
									style={{ fontFamily: `"${pairing.headingFont}", serif` }}
								>
									{pairing.name}
								</span>
								<span
									className="text-xs text-muted-foreground"
									style={{ fontFamily: `"${pairing.bodyFont}", sans-serif` }}
								>
									{pairing.description}
								</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{/* Preview section */}
			<div className="rounded-md border border-stone-200 bg-stone-50/50 p-4">
				<p className="mb-1 text-xs uppercase tracking-widest text-stone-500">
					Preview
				</p>
				<p
					className="mb-2 text-xl font-medium text-stone-800"
					style={{ fontFamily: `"${selectedPairing.headingFont}", serif` }}
				>
					Sarah & Michael
				</p>
				<p
					className="text-sm text-stone-600"
					style={{ fontFamily: `"${selectedPairing.bodyFont}", sans-serif` }}
				>
					Together with their families, request the pleasure of your company at
					the celebration of their wedding.
				</p>
			</div>
		</div>
	);
}
