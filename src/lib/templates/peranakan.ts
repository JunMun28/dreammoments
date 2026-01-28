/**
 * Peranakan Templates
 * Turquoise/pink themes, Nyonya motifs, traditional Straits Chinese aesthetics
 * Unique to Singapore/Malaysia Chinese culture
 */

import type { TemplateData } from "../template-data";

/**
 * Default preview data for Peranakan templates
 */
const defaultPreview = {
	partner1Name: "Mei Ling",
	partner2Name: "Boon Keng",
	weddingDate: new Date("2026-08-08"),
	weddingTime: "18:00",
	venueName: "Raffles Hotel Singapore",
	venueAddress: "1 Beach Road, Singapore 189673",
	scheduleBlocks: [
		{
			id: "pk-1",
			title: "Tea Ceremony",
			time: "10:00",
			description: "Traditional Peranakan tea ceremony at bride's home",
			order: 0,
		},
		{
			id: "pk-2",
			title: "Wedding Ceremony",
			time: "18:00",
			description: "Exchange of vows",
			order: 1,
		},
		{
			id: "pk-3",
			title: "Banquet Dinner",
			time: "19:30",
			description: "Traditional Nyonya feast",
			order: 2,
		},
	],
	notes: [
		{
			id: "pk-n1",
			title: "Dress Code",
			description:
				"Formal attire. Peranakan kebaya or batik welcome for ladies!",
			order: 0,
		},
		{
			id: "pk-n2",
			title: "Ang Pow",
			description:
				"Your presence is our greatest gift. A wishing well will be available.",
			order: 1,
		},
	],
};

/**
 * Peranakan templates collection
 */
export const peranakanTemplates: TemplateData[] = [
	{
		id: "nyonya-heritage",
		name: "Nyonya Heritage",
		description:
			"Classic Peranakan turquoise and pink with traditional tile motifs",
		accentColor: "#e91e63",
		backgroundColor: "#00838f",
		fontPairing: "classic-romance",
		themeVariant: "dark",
		heroImageUrl:
			"https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: true,
			borderStyle: "flourish",
		},
		galleryImages: [
			{
				imageUrl:
					"https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
				caption: "Our love story",
				order: 0,
			},
			{
				imageUrl:
					"https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
				caption: "Forever begins",
				order: 1,
			},
		],
		preview: defaultPreview,
	},
	{
		id: "kebaya-rose",
		name: "Kebaya Rose",
		description: "Elegant pink and gold inspired by traditional kebaya",
		accentColor: "#d4af37",
		backgroundColor: "#c2185b",
		fontPairing: "classic-romance",
		themeVariant: "dark",
		heroImageUrl:
			"https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&q=80",
		decorativeElements: {
			sparkles: true,
			doubleHappiness: false,
			borderStyle: "flourish",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Su Lin",
			partner2Name: "Wei Ming",
		},
	},
	{
		id: "straits-jade",
		name: "Straits Jade",
		description: "Jade green with Peranakan porcelain-inspired accents",
		accentColor: "#f8bbd9",
		backgroundColor: "#00695c",
		fontPairing: "oriental-elegance",
		themeVariant: "dark",
		heroImageUrl:
			"https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: true,
			borderStyle: "flourish",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Ai Ling",
			partner2Name: "Cheng Huat",
		},
	},
	{
		id: "batik-bloom",
		name: "Batik Bloom",
		description: "Rich batik-inspired patterns with warm colors",
		accentColor: "#ffb74d",
		backgroundColor: "#5d4037",
		fontPairing: "classic-romance",
		themeVariant: "dark",
		heroImageUrl:
			"https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: false,
			borderStyle: "flourish",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Hui Ying",
			partner2Name: "Jun Wei",
		},
	},
	{
		id: "modern-nyonya",
		name: "Modern Nyonya",
		description: "Contemporary interpretation of Peranakan aesthetics",
		accentColor: "#26c6da",
		backgroundColor: "#212121",
		fontPairing: "modern-sans",
		themeVariant: "dark",
		heroImageUrl:
			"https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: true,
			borderStyle: "geometric",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Yi Shan",
			partner2Name: "Kai Xiang",
		},
	},
	{
		id: "peranakan-pastel",
		name: "Peranakan Pastel",
		description: "Soft pastel palette with delicate Nyonya motifs",
		accentColor: "#80deea",
		fontPairing: "classic-romance",
		themeVariant: "light",
		heroImageUrl:
			"https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200&q=80",
		decorativeElements: {
			sparkles: true,
			doubleHappiness: false,
			borderStyle: "flourish",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Xin Hui",
			partner2Name: "Hong Wei",
		},
	},
];
