/**
 * Western Classic Templates
 * White/blush, florals, elegant Western style
 * For SG/MY Chinese couples who prefer Western aesthetics
 */

import type { TemplateData } from "../template-data";

/**
 * Default preview data for Western classic templates
 */
const defaultPreview = {
	partner1Name: "Rachel",
	partner2Name: "David",
	weddingDate: new Date("2026-06-20"),
	weddingTime: "16:00",
	venueName: "Marina Bay Sands",
	venueAddress: "10 Bayfront Avenue, Singapore 018956",
	scheduleBlocks: [
		{
			id: "wc-1",
			title: "Ceremony",
			time: "16:00",
			description: "Exchange of vows in the grand ballroom",
			order: 0,
		},
		{
			id: "wc-2",
			title: "Cocktail Reception",
			time: "17:30",
			description: "Champagne and canapes on the terrace",
			order: 1,
		},
		{
			id: "wc-3",
			title: "Dinner & Dancing",
			time: "19:00",
			description: "Five-course dinner followed by dancing",
			order: 2,
		},
	],
	notes: [
		{
			id: "wc-n1",
			title: "Dress Code",
			description: "Black tie / Formal attire",
			order: 0,
		},
		{
			id: "wc-n2",
			title: "Registry",
			description:
				"Your presence is our greatest gift. A wishing well will be available.",
			order: 1,
		},
	],
};

/**
 * Western Classic templates collection
 */
export const westernClassicTemplates: TemplateData[] = [
	{
		id: "timeless-elegance",
		name: "Timeless Elegance",
		description: "Classic white with gold foil accents and script typography",
		accentColor: "#c9a227",
		fontPairing: "classic-romance",
		themeVariant: "light",
		heroImageUrl:
			"https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: false,
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
		id: "blush-romance",
		name: "Blush Romance",
		description: "Soft blush pink with rose gold accents",
		accentColor: "#b76e79",
		fontPairing: "classic-romance",
		themeVariant: "light",
		heroImageUrl:
			"https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&q=80",
		decorativeElements: {
			sparkles: true,
			doubleHappiness: false,
			borderStyle: "flourish",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Amanda",
			partner2Name: "Justin",
		},
	},
	{
		id: "garden-party",
		name: "Garden Party",
		description: "Floral watercolor design with sage green accents",
		accentColor: "#87a878",
		fontPairing: "classic-romance",
		themeVariant: "light",
		heroImageUrl:
			"https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: false,
			borderStyle: "flourish",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Emily",
			partner2Name: "Andrew",
		},
	},
	{
		id: "midnight-glamour",
		name: "Midnight Glamour",
		description: "Sophisticated navy blue with silver accents",
		accentColor: "#c0c0c0",
		backgroundColor: "#1a2744",
		fontPairing: "classic-romance",
		themeVariant: "dark",
		heroImageUrl:
			"https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80",
		decorativeElements: {
			sparkles: true,
			doubleHappiness: false,
			borderStyle: "geometric",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Victoria",
			partner2Name: "Christopher",
		},
	},
	{
		id: "rustic-chic",
		name: "Rustic Chic",
		description: "Warm neutral tones with kraft paper aesthetic",
		accentColor: "#a67c52",
		fontPairing: "classic-romance",
		themeVariant: "light",
		heroImageUrl:
			"https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: false,
			borderStyle: "minimal",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Jessica",
			partner2Name: "Brandon",
		},
	},
	{
		id: "art-deco",
		name: "Art Deco",
		description: "Glamorous 1920s inspired geometric design",
		accentColor: "#d4af37",
		backgroundColor: "#1a1a2e",
		fontPairing: "modern-sans",
		themeVariant: "dark",
		heroImageUrl:
			"https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80",
		decorativeElements: {
			sparkles: false,
			doubleHappiness: false,
			borderStyle: "geometric",
		},
		preview: {
			...defaultPreview,
			partner1Name: "Sophia",
			partner2Name: "Nicholas",
		},
	},
];
