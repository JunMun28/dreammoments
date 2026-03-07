import type { TemplateConfig } from "./types";

export const botanicalGardenTemplate: TemplateConfig = {
	id: "botanical-garden",
	name: "Botanical Garden",
	nameZh: "花园物语",
	description:
		"Fresh forest green and warm gold with botanical illustrations and organic reveals.",
	category: "garden",
	version: "1.0.0",
	aiConfig: {
		defaultTone: "romantic",
		culturalContext: "chinese",
	},
	tokens: {
		colors: {
			primary: "#3D5A3E",
			secondary: "#2C3E2C",
			accent: "#D4A880",
			background: "#F7F5F0",
			text: "#2C3E2C",
			muted: "#8A7F7A",
		},
		typography: {
			headingFont: "'Cormorant Garamond', 'Noto Serif SC', Georgia, serif",
			bodyFont: "'Inter', 'Noto Sans SC', sans-serif",
			accentFont: "'Cormorant Garamond', 'Noto Serif SC', Georgia, serif",
		},
		animations: {
			scrollTriggerOffset: 100,
			defaultDuration: 0.9,
			easing: "easeOutCubic",
		},
	},
	sections: [
		{
			id: "hero",
			type: "hero",
			defaultVisible: true,
			notes:
				"Centered names in Cormorant Garamond, green gradient overlay, leaf SVG border decoration.",
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
				{
					id: "heroImageUrl",
					label: "Hero photo",
					type: "image",
				},
				{
					id: "livingPortrait",
					label: "Living Portrait",
					type: "living-portrait",
				},
			],
		},
		{
			id: "announcement",
			type: "announcement",
			defaultVisible: true,
			notes: "Bilingual formal invitation copy with botanical accents.",
			fields: [
				{
					id: "title",
					label: "Title",
					type: "text",
					sample: "You're Invited",
					required: true,
				},
				{
					id: "message",
					label: "Invitation message",
					type: "textarea",
					sample:
						"Together with our families, we joyfully invite you to celebrate our union.",
				},
				{
					id: "formalText",
					label: "Formal text (Chinese)",
					type: "textarea",
					sample: "诚挚邀请您来见证我们的幸福时刻。",
				},
			],
		},
		{
			id: "couple",
			type: "couple",
			defaultVisible: true,
			notes: "Side-by-side portraits with botanical photo frames.",
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
			notes:
				"Staggered timeline with green line, gold dots, botanical card styling.",
			fields: [
				{
					id: "milestones",
					label: "Story milestones",
					type: "list",
				},
			],
		},
		{
			id: "gallery",
			type: "gallery",
			defaultVisible: true,
			notes: "Swiper gallery with botanical photo frames.",
			fields: [
				{
					id: "photos",
					label: "Gallery photos",
					type: "list",
				},
			],
		},
		{
			id: "countdown",
			type: "countdown",
			defaultVisible: true,
			notes: "Countdown timer using CountdownWidget.",
			fields: [],
		},
		{
			id: "schedule",
			type: "schedule",
			defaultVisible: true,
			notes: "Event cards with green left border, gold time accent.",
			fields: [
				{
					id: "events",
					label: "Schedule events",
					type: "list",
				},
			],
		},
		{
			id: "venue",
			type: "venue",
			defaultVisible: true,
			notes: "Venue name, address, Google Maps link, parking info.",
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
			notes: "Full RSVP form with dietary select and WhatsApp fallback.",
			fields: [
				{
					id: "deadline",
					label: "RSVP deadline",
					type: "date",
				},
				{
					id: "allowPlusOnes",
					label: "Allow plus ones",
					type: "toggle",
				},
				{
					id: "maxPlusOnes",
					label: "Max plus ones",
					type: "text",
				},
			],
		},
		{
			id: "gift",
			type: "gift",
			defaultVisible: false,
			notes: "Digital angpow with AngpowQRCode.",
			fields: [
				{
					id: "paymentUrl",
					label: "Payment URL",
					type: "text",
				},
				{
					id: "paymentMethod",
					label: "Payment method",
					type: "text",
					sample: "paynow",
				},
				{
					id: "recipientName",
					label: "Recipient name",
					type: "text",
				},
			],
		},
		{
			id: "footer",
			type: "footer",
			defaultVisible: true,
			notes: "Bilingual thank you with leaf motif.",
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
