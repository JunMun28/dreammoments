import type { TemplateConfig } from "./types";

export const classicalChineseTemplate: TemplateConfig = {
	id: "classical-chinese",
	name: "Classical Chinese",
	nameZh: "经典中式",
	description:
		"Traditional red and gold with ink wash transitions and animated Double Happiness reveal.",
	category: "chinese",
	version: "1.0.0",
	aiConfig: {
		defaultTone: "formal",
		culturalContext: "chinese",
	},
	tokens: {
		colors: {
			primary: "#C41E3A",
			secondary: "#1A0F0A",
			accent: "#D4A843",
			background: "#FFF8EF",
			text: "#1A0F0A",
			muted: "#8A7F7A",
		},
		typography: {
			headingFont: "'KaiTi', 'Noto Serif SC', serif",
			bodyFont: "'Songti SC', 'Noto Sans SC', sans-serif",
			accentFont: "'KaiTi', 'Noto Serif SC', serif",
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
				"Animated 囍 reveal with red+gold radial gradient, calligraphy-style couple names.",
			fields: [
				{
					id: "partnerOneName",
					label: "Groom name",
					type: "text",
					sample: "张明辉",
					required: true,
				},
				{
					id: "partnerTwoName",
					label: "Bride name",
					type: "text",
					sample: "王婉仪",
					required: true,
				},
				{
					id: "tagline",
					label: "Tagline",
					type: "text",
					aiTaskType: "tagline",
					sample: "百年好合 · 永结同心",
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
				"Formal bilingual invitation copy with gold blockquote border on ivory.",
			fields: [
				{
					id: "title",
					label: "Title",
					type: "text",
					sample: "谨定于良辰吉日",
					required: true,
				},
				{
					id: "message",
					label: "Invitation message",
					type: "textarea",
					sample: "谨择吉日，诚邀亲友，共证良缘，同贺新禧。",
				},
				{
					id: "formalText",
					label: "Formal text (English)",
					type: "textarea",
					sample:
						"We respectfully invite you to witness and celebrate our union on this auspicious day.",
				},
			],
		},
		{
			id: "couple",
			type: "couple",
			defaultVisible: true,
			notes: "Side-by-side portraits with traditional gold double-line frame.",
			fields: [
				{
					id: "partnerOne.fullName",
					label: "Groom full name",
					type: "text",
					sample: "张明辉",
				},
				{
					id: "partnerTwo.fullName",
					label: "Bride full name",
					type: "text",
					sample: "王婉仪",
				},
				{
					id: "partnerOne.bio",
					label: "Groom bio",
					type: "textarea",
					sample: "温文尔雅，精于书画，志在四方。",
				},
				{
					id: "partnerTwo.bio",
					label: "Bride bio",
					type: "textarea",
					sample: "端庄贤淑，才华横溢，琴棋书画皆通。",
				},
				{
					id: "partnerOne.photoUrl",
					label: "Groom photo",
					type: "image",
				},
				{
					id: "partnerTwo.photoUrl",
					label: "Bride photo",
					type: "image",
				},
			],
		},
		{
			id: "story",
			type: "story",
			defaultVisible: true,
			notes:
				"Staggered timeline with gold line, red dots, traditional styling.",
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
			notes: "Photo gallery with traditional gold frames.",
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
			notes: "Event cards with red left border, time in gold accent.",
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
					sample: "金龙大酒店A栋8F龙凤宴会厅",
				},
				{
					id: "address",
					label: "Venue address",
					type: "textarea",
					sample: "10 Scotts Road, Singapore 228211",
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
				"Full RSVP form on dark lacquer background: name, email, attendance, guests, dietary, message, consent.",
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
			notes: "Digital angpow with AngpowQRCode, gold border card.",
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
			notes: "Bilingual thank you, 囍 motif, social links.",
			fields: [
				{
					id: "message",
					label: "Footer message",
					type: "text",
					sample: "百年好合，永结同心。",
				},
			],
		},
	],
};
