import type { TemplateConfig } from "./types";

export const neoBrutalismTemplate: TemplateConfig = {
	id: "neo-brutalism",
	name: "Bold Love",
	nameZh: "大胆之爱",
	description:
		"Playful neo-brutalist design with warm coral, hard shadows, thick borders, and sticker-card aesthetics.",
	category: "modern",
	version: "1.0.0",
	aiConfig: {
		defaultTone: "romantic",
		culturalContext: "chinese",
	},
	tokens: {
		colors: {
			primary: "#FF6B6B",
			secondary: "#1A1A1A",
			accent: "#FFE500",
			background: "#FFF5E6",
			text: "#1A1A1A",
			muted: "#666666",
		},
		typography: {
			headingFont: "'Space Grotesk', 'Noto Sans SC', system-ui, sans-serif",
			bodyFont: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
			accentFont: "'Space Grotesk', 'Noto Sans SC', sans-serif",
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
			notes:
				"Grid-pattern background, oversized Space Grotesk names, hard-shadow title card, coral accent badge, snappy reveal.",
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
			id: "couple",
			type: "couple",
			defaultVisible: true,
			notes:
				"Side-by-side sticker cards with thick borders, hard shadows, and slight rotations on portrait frames.",
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
				"Thick timeline line with bold coral dots, milestone sticker cards with alternating slight rotations.",
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
			notes:
				"Scattered sticker-style photos with thick borders, hard shadows, and random rotations on hover-lift.",
			fields: [
				{
					id: "photos",
					label: "Gallery photos",
					type: "list",
				},
			],
		},
		{
			id: "extra",
			type: "extra",
			defaultVisible: true,
			notes:
				"Dress code section with neo-brutal cards, square color swatches with hard shadows, and bold tip badges.",
			fields: [
				{
					id: "guidelines",
					label: "Dress code guidelines",
					type: "textarea",
					sample: "Garden semi-formal. Think flowy fabrics and earthy tones.",
				},
				{
					id: "doColors",
					label: "Recommended colours",
					type: "list",
				},
				{
					id: "dontColors",
					label: "Colours to avoid",
					type: "list",
				},
				{
					id: "tips",
					label: "Styling tips",
					type: "list",
				},
			],
		},
		{
			id: "countdown",
			type: "countdown",
			defaultVisible: true,
			notes:
				"Countdown digits in individual bordered boxes with hard shadows, bold separators.",
			fields: [],
		},
		{
			id: "schedule",
			type: "schedule",
			defaultVisible: true,
			notes:
				"Event cards with coral left border, thick outlines, hard shadows, hover-lift interaction.",
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
			notes:
				"Venue name in bold type, address in a bordered card, map with thick frame and hard shadow.",
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
			notes:
				"Full RSVP form with thick-bordered inputs, coral focus shadows, and neo-brutal submit button with press-down effect.",
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
			notes:
				"Digital angpow with AngpowQRCode in a bold bordered card, yellow accent background.",
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
			notes:
				"Bold thank-you text with thick coral divider and dark section background.",
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
