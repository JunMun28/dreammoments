import type { TemplateConfig } from "../types";

export const flatDesignTemplate: TemplateConfig = {
	id: "sd-flat-design",
	name: "Natural Grace",
	nameZh: "自然之美",
	description:
		"The aesthetic is **digital-native but print-inspired**: crisp edges, solid blocks of color, and a strict reliance on the",
	category: "garden",
	version: "1.0.0",
	aiConfig: {
		defaultTone: "romantic",
		culturalContext: "chinese",
	},
	tokens: {
		colors: {
			primary: "#3B82F6",
			secondary: "#111827",
			accent: "#10B981",
			background: "#111827",
			text: "#FFFFFF",
			muted: "#888888",
		},
		typography: {
			headingFont: "'Outfit', 'Noto Sans SC', system-ui, sans-serif",
			bodyFont: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
			accentFont: "'Outfit', 'Noto Sans SC', system-ui, sans-serif",
		},
		animations: {
			scrollTriggerOffset: 100,
			defaultDuration: 0.6,
			easing: "easeOutCubic",
		},
	},
	sections: [
		{
			id: "hero",
			type: "hero",
			defaultVisible: true,
			notes: "",
			fields: [
				{
					id: "partnerOneName",
					label: "Partner one name",
					type: "text",
					sample: "Emily",
					required: true,
				},
				{
					id: "partnerTwoName",
					label: "Partner two name",
					type: "text",
					sample: "James",
					required: true,
				},
				{
					id: "tagline",
					label: "Tagline",
					type: "text",
					aiTaskType: "tagline",
					sample: "Where love blooms eternal",
				},
				{ id: "heroImageUrl", label: "Hero photo", type: "image" },
				{
					id: "livingPortrait",
					label: "Living Portrait",
					type: "living-portrait",
				},
			],
		},
		{
			id: "couple",
			type: "couple",
			defaultVisible: true,
			notes: "",
			fields: [
				{
					id: "partnerOne.fullName",
					label: "Partner one full name",
					type: "text",
					sample: "Emily",
				},
				{
					id: "partnerTwo.fullName",
					label: "Partner two full name",
					type: "text",
					sample: "James",
				},
				{
					id: "partnerOne.bio",
					label: "Partner one bio",
					type: "textarea",
					sample:
						"Loves nature walks, watercolour painting, and Sunday brunch.",
				},
				{
					id: "partnerTwo.bio",
					label: "Partner two bio",
					type: "textarea",
					sample: "An adventurer at heart who finds peace in the garden.",
				},
				{
					id: "partnerOne.photoUrl",
					label: "Partner one photo",
					type: "image",
				},
				{
					id: "partnerTwo.photoUrl",
					label: "Partner two photo",
					type: "image",
				},
			],
		},
		{
			id: "story",
			type: "story",
			defaultVisible: true,
			notes: "",
			fields: [{ id: "milestones", label: "Story milestones", type: "list" }],
		},
		{
			id: "gallery",
			type: "gallery",
			defaultVisible: true,
			notes: "",
			fields: [{ id: "photos", label: "Gallery photos", type: "list" }],
		},
		{
			id: "countdown",
			type: "countdown",
			defaultVisible: true,
			notes: "",
			fields: [],
		},
		{
			id: "schedule",
			type: "schedule",
			defaultVisible: true,
			notes: "",
			fields: [{ id: "events", label: "Schedule events", type: "list" }],
		},
		{
			id: "venue",
			type: "venue",
			defaultVisible: true,
			notes: "",
			fields: [
				{
					id: "name",
					label: "Venue name",
					type: "text",
					sample: "The Glasshouse at Botanical Gardens",
				},
				{
					id: "address",
					label: "Venue address",
					type: "textarea",
					sample: "1 Cluny Road, Singapore 259569",
				},
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
			notes: "",
			fields: [
				{ id: "deadline", label: "RSVP deadline", type: "date" },
				{ id: "allowPlusOnes", label: "Allow plus ones", type: "toggle" },
				{ id: "maxPlusOnes", label: "Max plus ones", type: "text" },
			],
		},
		{
			id: "gift",
			type: "gift",
			defaultVisible: false,
			notes: "",
			fields: [
				{ id: "paymentUrl", label: "Payment URL", type: "text" },
				{
					id: "paymentMethod",
					label: "Payment method",
					type: "text",
					sample: "paynow",
				},
				{ id: "recipientName", label: "Recipient name", type: "text" },
			],
		},
		{
			id: "footer",
			type: "footer",
			defaultVisible: true,
			notes: "",
			fields: [
				{
					id: "message",
					label: "Footer message",
					type: "text",
					sample: "Thank you for being part of our story.",
				},
			],
		},
	],
};
