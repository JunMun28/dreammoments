import type { TemplateConfig } from "../types";

export const grungeCollageMotionTemplate: TemplateConfig = {
	id: "sd-grunge-collage-motion",
	name: "Warm Embrace",
	nameZh: "温暖拥抱",
	description: "Design Style: Grunge Collage Motion Graphics\\",
	category: "modern",
	version: "1.0.0",
	aiConfig: {
		defaultTone: "romantic",
		culturalContext: "chinese",
	},
	tokens: {
		colors: {
			primary: "#DC143C",
			secondary: "#1A1A1A",
			accent: "#C5A945",
			background: "#F0EAD6",
			text: "#1A1A1A",
			muted: "#8A7F7A",
		},
		typography: {
			headingFont: "'Oswald', 'Noto Sans SC', system-ui, sans-serif",
			bodyFont: "'Roboto Mono', 'Noto Sans SC', system-ui, sans-serif",
			accentFont: "'Oswald', 'Noto Sans SC', system-ui, sans-serif",
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
