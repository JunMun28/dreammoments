/**
 * Template definitions with sample wedding data for preview
 */

import type { Note, ScheduleBlock } from "@/contexts/InvitationBuilderContext";

export interface TemplateData {
	id: string;
	name: string;
	description: string;
	accentColor: string;
	fontPairing: string;
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
 * Curated template definitions with sample wedding data
 */
export const templates: TemplateData[] = [
	{
		id: "classic-elegance",
		name: "Classic Elegance",
		description: "Timeless serif typography with delicate flourishes",
		accentColor: "#b76e79",
		fontPairing: "classic",
		preview: {
			partner1Name: "Sarah",
			partner2Name: "Michael",
			weddingDate: new Date("2026-06-15"),
			weddingTime: "16:00",
			venueName: "The Grand Ballroom",
			venueAddress: "123 Elegant Avenue, New York, NY 10001",
			scheduleBlocks: [
				{
					id: "ce-1",
					title: "Ceremony",
					time: "16:00",
					description: "Join us as we exchange vows",
					order: 0,
				},
				{
					id: "ce-2",
					title: "Cocktail Hour",
					time: "17:00",
					description: "Garden terrace",
					order: 1,
				},
				{
					id: "ce-3",
					title: "Reception",
					time: "18:00",
					description: "Dinner, dancing, and celebration",
					order: 2,
				},
			],
			notes: [
				{
					id: "ce-n1",
					title: "Dress Code",
					description: "Black tie optional",
					order: 0,
				},
				{
					id: "ce-n2",
					title: "Adults Only",
					description: "We kindly request an adult-only celebration",
					order: 1,
				},
			],
		},
	},
	{
		id: "modern-romance",
		name: "Modern Romance",
		description: "Clean lines meet romantic script accents",
		accentColor: "#8b9f82",
		fontPairing: "modern-romantic",
		preview: {
			partner1Name: "Emily",
			partner2Name: "James",
			weddingDate: new Date("2026-09-21"),
			weddingTime: "14:30",
			venueName: "Riverside Gardens",
			venueAddress: "456 Garden Lane, Brooklyn, NY 11201",
			scheduleBlocks: [
				{
					id: "mr-1",
					title: "Welcome Gathering",
					time: "14:30",
					description: "Light refreshments in the rose garden",
					order: 0,
				},
				{
					id: "mr-2",
					title: "Ceremony",
					time: "15:00",
					description: "Under the willow tree",
					order: 1,
				},
				{
					id: "mr-3",
					title: "Dinner & Dancing",
					time: "17:00",
					description: "Celebration continues indoors",
					order: 2,
				},
			],
			notes: [
				{
					id: "mr-n1",
					title: "Garden Attire",
					description: "Smart casual, comfortable shoes recommended",
					order: 0,
				},
				{
					id: "mr-n2",
					title: "Photography",
					description:
						"An unplugged ceremony - please enjoy the moment with us",
					order: 1,
				},
			],
		},
	},
	{
		id: "garden-whimsy",
		name: "Garden Whimsy",
		description: "Playful script with botanical touches",
		accentColor: "#9aadbf",
		fontPairing: "whimsical",
		preview: {
			partner1Name: "Olivia",
			partner2Name: "Daniel",
			weddingDate: new Date("2026-05-08"),
			weddingTime: "11:00",
			venueName: "Wildflower Estate",
			venueAddress: "789 Meadow Road, Hudson Valley, NY 12534",
			scheduleBlocks: [
				{
					id: "gw-1",
					title: "Brunch Reception",
					time: "11:00",
					description: "Mimosas and mingling",
					order: 0,
				},
				{
					id: "gw-2",
					title: "Garden Ceremony",
					time: "12:00",
					description: "In the wildflower meadow",
					order: 1,
				},
				{
					id: "gw-3",
					title: "Luncheon",
					time: "13:00",
					description: "Farm-to-table feast",
					order: 2,
				},
				{
					id: "gw-4",
					title: "Lawn Games",
					time: "15:00",
					description: "Croquet, bocce, and merriment",
					order: 3,
				},
			],
			notes: [
				{
					id: "gw-n1",
					title: "Outdoor Event",
					description:
						"Please dress for the weather - ceremony will be outside",
					order: 0,
				},
				{
					id: "gw-n2",
					title: "Kids Welcome",
					description: "Children's activities provided during cocktails",
					order: 1,
				},
			],
		},
	},
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
