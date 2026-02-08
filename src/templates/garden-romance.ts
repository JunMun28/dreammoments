import type { TemplateConfig } from "./types";

export const gardenRomanceTemplate: TemplateConfig = {
	id: "garden-romance",
	name: "Garden Romance",
	nameZh: "花园之誓",
	description: "Bold Chinese red and gold for a cinematic wedding celebration.",
	category: "chinese",
	version: "2.0.0",
	aiConfig: {
		defaultTone: "romantic",
		culturalContext: "chinese",
	},
	tokens: {
		colors: {
			primary: "#C41E3A",
			secondary: "#D4AF37",
			accent: "#8B0000",
			background: "#0D0D0D",
			text: "#FFF8E7",
			muted: "#A09080",
		},
		typography: {
			headingFont: "'Playfair Display', 'Times New Roman', serif",
			bodyFont: "'Inter', sans-serif",
			accentFont: "'Noto Serif SC', 'Songti SC', serif",
		},
		animations: {
			scrollTriggerOffset: 80,
			defaultDuration: 0.8,
			easing: "cubicBezier(0.2, 0.8, 0.2, 1)",
		},
	},
	sections: [
		{
			id: "hero",
			type: "hero",
			defaultVisible: true,
			notes: "Floral frame, blooming hero accents.",
			fields: [
				{
					id: "partnerOneName",
					label: "Partner one",
					type: "text",
					required: true,
				},
				{
					id: "partnerTwoName",
					label: "Partner two",
					type: "text",
					required: true,
				},
				{
					id: "tagline",
					label: "Tagline",
					type: "text",
					aiTaskType: "tagline",
				},
				{ id: "heroImageUrl", label: "Hero photo", type: "image" },
			],
		},
		{
			id: "announcement",
			type: "announcement",
			defaultVisible: true,
			notes: "Elegant invitation copy.",
			fields: [
				{ id: "title", label: "Title", type: "text", required: true },
				{ id: "message", label: "Message", type: "textarea" },
				{ id: "formalText", label: "Chinese text", type: "textarea" },
			],
		},
		{
			id: "story",
			type: "story",
			defaultVisible: true,
			notes: "Illustrated journey timeline.",
			fields: [{ id: "milestones", label: "Story milestones", type: "list" }],
		},
		{
			id: "gallery",
			type: "gallery",
			defaultVisible: true,
			notes: "Botanical framed carousel.",
			fields: [{ id: "photos", label: "Gallery photos", type: "list" }],
		},
		{
			id: "schedule",
			type: "schedule",
			defaultVisible: true,
			notes: "Garden-themed timeline icons.",
			fields: [{ id: "events", label: "Schedule events", type: "list" }],
		},
		{
			id: "venue",
			type: "venue",
			defaultVisible: true,
			notes: "Watercolor map style.",
			fields: [
				{ id: "name", label: "Venue name", type: "text" },
				{ id: "address", label: "Venue address", type: "textarea" },
				{
					id: "coordinates",
					label: "Venue coordinates (lat,lng)",
					type: "text",
				},
			],
		},
		{
			id: "rsvp",
			type: "rsvp",
			defaultVisible: true,
			notes: "Clean minimal RSVP form.",
			fields: [
				{ id: "deadline", label: "RSVP deadline", type: "date" },
				{ id: "allowPlusOnes", label: "Allow plus ones", type: "toggle" },
				{ id: "maxPlusOnes", label: "Max plus ones", type: "text" },
			],
		},
		{
			id: "faq",
			type: "faq",
			defaultVisible: true,
			notes: "Accordion FAQ with leaf icons.",
			fields: [{ id: "items", label: "FAQ items", type: "list" }],
		},
		{
			id: "footer",
			type: "footer",
			defaultVisible: true,
			notes: "Floral footer with thank you message.",
			fields: [{ id: "message", label: "Footer message", type: "text" }],
		},
	],
};
