import type { TemplateConfig } from "./types";

export const romanticCinematicTemplate: TemplateConfig = {
	id: "romantic-cinematic",
	name: "Romantic Cinematic",
	nameZh: "浪漫光影",
	description:
		"Moody rosewood & deep aubergine with cinematic curtain reveals and starlight particles.",
	category: "chinese",
	version: "1.0.0",
	aiConfig: {
		defaultTone: "romantic",
		culturalContext: "chinese",
	},
	tokens: {
		colors: {
			primary: "#C2566B",
			secondary: "#1A1225",
			accent: "#DDD5E9",
			background: "#F8F5F0",
			text: "#1A1225",
			muted: "#7A6E85",
		},
		typography: {
			headingFont: "'Bodoni Moda', 'Noto Serif SC', Georgia, serif",
			bodyFont: "'Jost', 'Noto Sans SC', sans-serif",
			accentFont: "'Bodoni Moda', 'Noto Serif SC', serif",
		},
		animations: {
			scrollTriggerOffset: 100,
			defaultDuration: 0.8,
			easing: "easeOutCubic",
		},
	},
	sections: [
		{
			id: "hero",
			type: "hero",
			defaultVisible: true,
			notes:
				"Full-bleed photo, film-grain overlay, curtain clipPath reveal, oversized Bodoni Moda names, gradient to aubergine.",
			fields: [
				{
					id: "partnerOneName",
					label: "Partner one name",
					type: "text",
					sample: "Wei Jun",
					required: true,
				},
				{
					id: "partnerTwoName",
					label: "Partner two name",
					type: "text",
					sample: "Mei Ling",
					required: true,
				},
				{
					id: "tagline",
					label: "Tagline",
					type: "text",
					aiTaskType: "tagline",
					sample: "A love story written in the stars",
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
			notes:
				"Bilingual formal invitation copy with rosewood blockquote border.",
			fields: [
				{
					id: "title",
					label: "Title",
					type: "text",
					sample: "We're Getting Married",
					required: true,
				},
				{
					id: "message",
					label: "Invitation message",
					type: "textarea",
					sample:
						"Together with our families, we joyfully invite you to share in our happiness as we exchange wedding vows.",
				},
				{
					id: "formalText",
					label: "Formal text (Chinese)",
					type: "textarea",
					sample: "诚挚邀请您见证我们的幸福时刻。",
				},
			],
		},
		{
			id: "couple",
			type: "couple",
			defaultVisible: true,
			notes: "Side-by-side portraits with bilingual labels.",
			fields: [
				{
					id: "partnerOne.fullName",
					label: "Partner one full name",
					type: "text",
					sample: "Wei Jun",
				},
				{
					id: "partnerTwo.fullName",
					label: "Partner two full name",
					type: "text",
					sample: "Mei Ling",
				},
				{
					id: "partnerOne.bio",
					label: "Partner one bio",
					type: "textarea",
					sample: "Steady and thoughtful, always chasing sunsets.",
				},
				{
					id: "partnerTwo.bio",
					label: "Partner two bio",
					type: "textarea",
					sample: "Warm-hearted, loves travel and photography.",
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
			notes: "Staggered timeline with rosewood line, frosted lavender dots.",
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
			notes: "Swiper gallery with film-strip borders.",
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
			notes: "Countdown timer using CountdownWidget, reads from hero.date.",
			fields: [],
		},
		{
			id: "schedule",
			type: "schedule",
			defaultVisible: true,
			notes:
				"Event cards with rosewood left border, time in frosted lavender accent.",
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
					sample: "The Majestic Hotel Kuala Lumpur",
				},
				{
					id: "address",
					label: "Venue address",
					type: "textarea",
					sample: "5 Jalan Sultan Hishamuddin, 50000 Kuala Lumpur",
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
				"Full RSVP form: name, email, attendance, guests, dietary, message, consent.",
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
			notes: "Digital angpow with AngpowQRCode, rosewood border card.",
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
					sample: "tng",
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
			notes: "Bilingual thank you, heart motif, social links.",
			fields: [
				{
					id: "message",
					label: "Footer message",
					type: "text",
					sample:
						"Thank you for celebrating with us.\n感谢您的祝福，期待与您在婚礼相见。",
				},
			],
		},
	],
};
