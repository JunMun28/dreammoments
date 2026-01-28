/**
 * Forest/Natural (森系) Templates
 * Botanical themes, greenery, organic aesthetics
 */

import type { TemplateData } from "../template-data";

/**
 * Default preview data for forest/natural templates
 */
const defaultPreview = {
	partner1Name: "Charlotte",
	partner2Name: "Benjamin",
	weddingDate: new Date("2026-11-20"),
	weddingTime: "15:00",
	venueName: "Capella Singapore",
	venueAddress: "1 The Knolls, Sentosa Island, Singapore 098297",
	scheduleBlocks: [
		{
			id: "fn-1",
			title: "Ceremony",
			time: "15:00",
			description: "Outdoor ceremony in the garden pavilion",
			order: 0,
		},
		{
			id: "fn-2",
			title: "Reception",
			time: "17:00",
			description: "Cocktails amongst the trees",
			order: 1,
		},
		{
			id: "fn-3",
			title: "Dinner",
			time: "19:00",
			description: "Farm-to-table dinner celebration",
			order: 2,
		},
	],
	notes: [
		{
			id: "fn-n1",
			title: "Dress Code",
			description: "Garden party attire, earthy tones welcome",
			order: 0,
		},
		{
			id: "fn-n2",
			title: "Eco-Friendly",
			description: "Please join us in celebrating sustainably",
			order: 1,
		},
	],
};

/**
 * Forest/Natural templates collection
 */
export const forestNaturalTemplates: TemplateData[] = [
	{
		id: "enchanted-forest",
		name: "Enchanted Forest 森系仙境",
		description: "Lush botanical design with forest green tones",
		accentColor: "#8fbc8f",
		backgroundColor: "#1a2e1a",
		fontPairing: "classic-romance",
		themeVariant: "dark",
		heroImageUrl:
			"https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: false,
			borderStyle: "flourish",
		},
		galleryImages: [
			{
				imageUrl:
					"https://images.unsplash.com/photo-1470290378698-263fa7ca60ab?w=800&q=80",
				caption: "In nature's embrace",
				order: 0,
			},
			{
				imageUrl:
					"https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&q=80",
				caption: "Our adventure begins",
				order: 1,
			},
		],
		preview: defaultPreview,
	},
	{
		id: "botanical-bliss",
		name: "Botanical Bliss",
		description: "Elegant eucalyptus and fern motifs on cream",
		accentColor: "#6b8e6b",
		fontPairing: "classic-romance",
		themeVariant: "light",
		heroImageUrl:
			"https://images.unsplash.com/photo-1509610940349-fed01339c27d?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: false,
			borderStyle: "flourish",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Grace",
			partner2Name: "Thomas",
		},
	},
	{
		id: "rustic-romance",
		name: "Rustic Romance",
		description: "Warm earth tones with wildflower accents",
		accentColor: "#d2691e",
		backgroundColor: "#2f2f2f",
		fontPairing: "classic-romance",
		themeVariant: "dark",
		heroImageUrl:
			"https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: false,
			borderStyle: "minimal",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Sophia",
			partner2Name: "Alexander",
		},
	},
];
