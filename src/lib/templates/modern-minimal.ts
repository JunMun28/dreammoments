/**
 * Modern Minimalist Templates
 * Clean typography, geometric accents, contemporary design
 */

import type { TemplateData } from "../template-data";

/**
 * Default preview data for modern minimalist templates
 */
const defaultPreview = {
	partner1Name: "Sarah",
	partner2Name: "Michael",
	weddingDate: new Date("2026-09-15"),
	weddingTime: "16:00",
	venueName: "The Fullerton Hotel",
	venueAddress: "1 Fullerton Square, Singapore 049178",
	scheduleBlocks: [
		{
			id: "mm-1",
			title: "Ceremony",
			time: "16:00",
			description: "Exchange of vows in the garden",
			order: 0,
		},
		{
			id: "mm-2",
			title: "Cocktail Hour",
			time: "17:00",
			description: "Drinks and canapés by the poolside",
			order: 1,
		},
		{
			id: "mm-3",
			title: "Dinner Reception",
			time: "19:00",
			description: "Celebration dinner and dancing",
			order: 2,
		},
	],
	notes: [
		{
			id: "mm-n1",
			title: "Dress Code",
			description: "Cocktail attire",
			order: 0,
		},
		{
			id: "mm-n2",
			title: "Parking",
			description: "Complimentary valet parking available",
			order: 1,
		},
	],
};

/**
 * Modern Minimalist templates collection
 */
export const modernMinimalTemplates: TemplateData[] = [
	{
		id: "clean-slate",
		name: "Clean Slate",
		description: "Minimalist white design with elegant typography",
		accentColor: "#2c3e50",
		fontPairing: "modern-sans",
		themeVariant: "light",
		heroImageUrl:
			"https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: false,
			borderStyle: "minimal",
		},
		preview: defaultPreview,
	},
	{
		id: "geometric-elegance",
		name: "Geometric Elegance",
		description: "Modern geometric patterns with gold accents",
		accentColor: "#b8860b",
		fontPairing: "modern-sans",
		themeVariant: "light",
		heroImageUrl:
			"https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: false,
			borderStyle: "geometric",
		},
		preview: { ...defaultPreview, partner1Name: "Emma", partner2Name: "James" },
	},
	{
		id: "midnight-modern",
		name: "Midnight Modern",
		description: "Sophisticated dark theme with metallic accents",
		accentColor: "#c0c0c0",
		backgroundColor: "#1a1a2e",
		fontPairing: "modern-sans",
		themeVariant: "dark",
		heroImageUrl:
			"https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: false,
			borderStyle: "geometric",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Olivia",
			partner2Name: "William",
		},
	},
	{
		id: "blush-contemporary",
		name: "Blush Contemporary",
		description: "Soft blush tones with modern serif typography",
		accentColor: "#d4a5a5",
		fontPairing: "classic-romance",
		themeVariant: "light",
		heroImageUrl:
			"https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: false,
			borderStyle: "minimal",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Isabella",
			partner2Name: "Daniel",
		},
	},
];
