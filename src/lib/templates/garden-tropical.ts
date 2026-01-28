/**
 * Garden/Tropical Templates
 * Orchids, frangipani, tropical flowers native to Singapore/Malaysia
 */

import type { TemplateData } from "../template-data";

/**
 * Default preview data for garden/tropical templates
 */
const defaultPreview = {
	partner1Name: "Jasmine",
	partner2Name: "Ryan",
	weddingDate: new Date("2026-05-15"),
	weddingTime: "17:00",
	venueName: "Gardens by the Bay",
	venueAddress: "18 Marina Gardens Drive, Singapore 018953",
	scheduleBlocks: [
		{
			id: "gt-1",
			title: "Garden Ceremony",
			time: "17:00",
			description: "Exchange of vows under the supertrees",
			order: 0,
		},
		{
			id: "gt-2",
			title: "Sunset Cocktails",
			time: "18:30",
			description: "Drinks and canapes by the waterfront",
			order: 1,
		},
		{
			id: "gt-3",
			title: "Dinner Reception",
			time: "19:30",
			description: "Celebration dinner in the Flower Dome",
			order: 2,
		},
	],
	notes: [
		{
			id: "gt-n1",
			title: "Dress Code",
			description: "Garden party / Smart casual. Florals encouraged!",
			order: 0,
		},
		{
			id: "gt-n2",
			title: "Getting There",
			description: "MRT to Bayfront station, 10 min walk to venue",
			order: 1,
		},
	],
};

/**
 * Garden/Tropical templates collection
 */
export const gardenTropicalTemplates: TemplateData[] = [
	{
		id: "orchid-elegance",
		name: "Orchid Elegance",
		description: "Singapore's national flower in soft purple and white",
		accentColor: "#9c27b0",
		fontPairing: "classic-romance",
		themeVariant: "light",
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
				caption: "Among the blooms",
				order: 0,
			},
			{
				imageUrl:
					"https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&q=80",
				caption: "Our garden of love",
				order: 1,
			},
		],
		preview: defaultPreview,
	},
	{
		id: "frangipani-dreams",
		name: "Frangipani Dreams",
		description: "Creamy white frangipani with warm gold accents",
		accentColor: "#ffc107",
		fontPairing: "classic-romance",
		themeVariant: "light",
		heroImageUrl:
			"https://images.unsplash.com/photo-1509610940349-fed01339c27d?w=1200&q=80",
		decorativeElements: {
			sparkles: true,
			doubleHappiness: false,
			borderStyle: "flourish",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Lily",
			partner2Name: "Marcus",
		},
	},
	{
		id: "tropical-paradise",
		name: "Tropical Paradise",
		description: "Vibrant hibiscus and palm leaves on dark green",
		accentColor: "#ff5722",
		backgroundColor: "#1b5e20",
		fontPairing: "modern-sans",
		themeVariant: "dark",
		heroImageUrl:
			"https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: false,
			borderStyle: "flourish",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Michelle",
			partner2Name: "Kelvin",
		},
	},
	{
		id: "monstera-modern",
		name: "Monstera Modern",
		description: "Contemporary tropical leaves in black and green",
		accentColor: "#4caf50",
		backgroundColor: "#212121",
		fontPairing: "modern-sans",
		themeVariant: "dark",
		heroImageUrl:
			"https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: false,
			borderStyle: "geometric",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Natalie",
			partner2Name: "Jonathan",
		},
	},
	{
		id: "lotus-serenity",
		name: "Lotus Serenity",
		description: "Peaceful lotus blooms in soft pink and green",
		accentColor: "#e91e63",
		fontPairing: "oriental-elegance",
		themeVariant: "light",
		heroImageUrl:
			"https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: true,
			borderStyle: "flourish",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Lotus",
			partner2Name: "Wei Liang",
		},
	},
	{
		id: "bougainvillea-sunset",
		name: "Bougainvillea Sunset",
		description: "Vibrant magenta bougainvillea with sunset gradient",
		accentColor: "#e91e63",
		backgroundColor: "#4a148c",
		fontPairing: "classic-romance",
		themeVariant: "dark",
		heroImageUrl:
			"https://images.unsplash.com/photo-1493106819501-66d381c466f1?w=1200&q=80",
		decorativeElements: {
			sparkles: true,
			doubleHappiness: false,
			borderStyle: "flourish",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Grace",
			partner2Name: "Timothy",
		},
	},
];
