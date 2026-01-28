/**
 * Template definitions with sample wedding data for preview
 * Curated for Singapore/Malaysia Chinese weddings
 */

import type { Note, ScheduleBlock } from "@/contexts/InvitationBuilderContext";
import { chineseTraditionalTemplates } from "./templates/chinese-traditional";
import { forestNaturalTemplates } from "./templates/forest-natural";
import { gardenTropicalTemplates } from "./templates/garden-tropical";
import { modernMinimalTemplates } from "./templates/modern-minimal";
import { peranakanTemplates } from "./templates/peranakan";
import { westernClassicTemplates } from "./templates/western-classic";

/**
 * Template category for filtering
 * Categories tailored for SG/MY Chinese wedding market
 */
export type TemplateCategory =
	| "chinese-traditional"
	| "modern-minimal"
	| "forest-natural"
	| "peranakan"
	| "western-classic"
	| "garden-tropical"
	| "all";

/**
 * Decorative element settings for templates with special effects
 */
export interface DecorativeElements {
	sparkles?: boolean;
	doubleHappiness?: boolean;
	borderStyle?: "flourish" | "geometric" | "minimal" | "none";
}

/**
 * Gallery image for template preview
 */
export interface TemplateGalleryImage {
	imageUrl: string;
	caption?: string;
	order: number;
}

export interface TemplateData {
	id: string;
	name: string;
	description: string;
	accentColor: string;
	fontPairing: string;
	/** Category for filtering */
	category?: TemplateCategory;
	/** Hero image URL for templates with cover photos */
	heroImageUrl?: string;
	/** Gallery images for templates with photo galleries */
	galleryImages?: TemplateGalleryImage[];
	/** Theme variant - light or dark background */
	themeVariant?: "light" | "dark";
	/** Background color for dark themes */
	backgroundColor?: string;
	/** Decorative elements like sparkles, symbols, borders */
	decorativeElements?: DecorativeElements;
	preview: {
		partner1Name: string;
		partner2Name: string;
		weddingDate: Date;
		weddingTime: string;
		venueName: string;
		venueAddress: string;
		scheduleBlocks: ScheduleBlock[];
		notes: Note[];
	};
}

/**
 * Add category to imported templates
 */
const categorizedChineseTemplates = chineseTraditionalTemplates.map((t) => ({
	...t,
	category: "chinese-traditional" as TemplateCategory,
}));

const categorizedModernTemplates = modernMinimalTemplates.map((t) => ({
	...t,
	category: "modern-minimal" as TemplateCategory,
}));

const categorizedForestTemplates = forestNaturalTemplates.map((t) => ({
	...t,
	category: "forest-natural" as TemplateCategory,
}));

const categorizedPeranakanTemplates = peranakanTemplates.map((t) => ({
	...t,
	category: "peranakan" as TemplateCategory,
}));

const categorizedWesternTemplates = westernClassicTemplates.map((t) => ({
	...t,
	category: "western-classic" as TemplateCategory,
}));

const categorizedGardenTropicalTemplates = gardenTropicalTemplates.map((t) => ({
	...t,
	category: "garden-tropical" as TemplateCategory,
}));

/**
 * All templates combined from category files
 */
export const templates: TemplateData[] = [
	...categorizedChineseTemplates,
	...categorizedPeranakanTemplates,
	...categorizedWesternTemplates,
	...categorizedGardenTropicalTemplates,
	...categorizedModernTemplates,
	...categorizedForestTemplates,
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): TemplateData | undefined {
	return templates.find((t) => t.id === id);
}

/**
 * Get all available templates
 */
export function getAllTemplates(): TemplateData[] {
	return templates;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
	category: TemplateCategory,
): TemplateData[] {
	if (category === "all") {
		return templates;
	}
	return templates.filter((t) => t.category === category);
}

/**
 * Get all available categories with display names
 * Tailored for SG/MY Chinese wedding market
 */
export const categoryDisplayNames: Record<TemplateCategory, string> = {
	all: "All Templates",
	"chinese-traditional": "Chinese Traditional 中国风",
	peranakan: "Peranakan / Nyonya 娘惹风",
	"western-classic": "Western Classic",
	"garden-tropical": "Garden / Tropical",
	"modern-minimal": "Modern Minimalist",
	"forest-natural": "Forest / Natural 森系",
};

/**
 * Get categories for display (excludes 'all')
 */
export function getCategories(): TemplateCategory[] {
	return [
		"chinese-traditional",
		"peranakan",
		"western-classic",
		"garden-tropical",
		"modern-minimal",
		"forest-natural",
	];
}
