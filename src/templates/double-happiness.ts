import type { TemplateConfig } from "./types";

export const doubleHappinessTemplate: TemplateConfig = {
	id: "double-happiness",
	name: "Double Happiness",
	nameZh: "囍临门",
	description:
		"Modern luxury champagne & espresso wedding invitation with bilingual content, photo gallery, and digital angpow.",
	category: "chinese",
	version: "1.0.0",
	aiConfig: {
		defaultTone: "romantic",
		culturalContext: "chinese",
	},
	tokens: {
		colors: {
			primary: "#E8764B",
			secondary: "#0A1628",
			accent: "#C9A96E",
			background: "#FAF7F2",
			text: "#0A1628",
			muted: "#64748B",
		},
		typography: {
			headingFont: "'Cinzel', 'Noto Serif SC', Georgia, serif",
			bodyFont: "'Josefin Sans', 'Noto Sans SC', sans-serif",
			accentFont: "'Cinzel', 'Noto Serif SC', serif",
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
				"Full-bleed photo, dark overlay, 囍 watermark, couple names, date, lunar date.",
			fields: [
				{
					id: "partnerOneName",
					label: "Groom name",
					type: "text",
					sample: "王小明",
					required: true,
				},
				{
					id: "partnerTwoName",
					label: "Bride name",
					type: "text",
					sample: "李小红",
					required: true,
				},
				{
					id: "tagline",
					label: "Tagline",
					type: "text",
					aiTaskType: "tagline",
					sample: "始于初见，止于终老",
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
			notes: "Bilingual formal invitation copy with gold blockquote border.",
			fields: [
				{
					id: "title",
					label: "Title",
					type: "text",
					sample: "我们结婚啦",
					required: true,
				},
				{
					id: "message",
					label: "Invitation message",
					type: "textarea",
					sample: "亲爱的家人朋友们，我们诚挚地邀请您来参加我们的婚礼。",
				},
				{
					id: "formalText",
					label: "Formal text (English)",
					type: "textarea",
					sample:
						"Dear Family & Friends, we cordially invite you to celebrate our union.",
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
					label: "Groom full name",
					type: "text",
					sample: "王小明",
				},
				{
					id: "partnerTwo.fullName",
					label: "Bride full name",
					type: "text",
					sample: "李小红",
				},
				{
					id: "partnerOne.bio",
					label: "Groom bio",
					type: "textarea",
					sample: "温柔踏实，热爱摄影与旅行。",
				},
				{
					id: "partnerTwo.bio",
					label: "Bride bio",
					type: "textarea",
					sample: "浪漫细腻，喜欢花艺与烘焙。",
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
			notes: "Staggered timeline with gold line, red dots, circular photos.",
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
			notes: "2-column grid, featured photo at top, white frames.",
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
					sample: "婚贝大酒店A栋9F幸福宴会厅",
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
					sample: "感谢您的祝福，期待与您在婚礼相见。",
				},
			],
		},
	],
};
