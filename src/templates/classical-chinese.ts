import type { TemplateConfig } from "./types";

export const classicalChineseTemplate: TemplateConfig = {
	id: "classical-chinese",
	name: "Classical Chinese",
	nameZh: "经典中式",
	description:
		"Bold vermillion and obsidian with ink-brush calligraphy, seal stamp reveals, and high-contrast sections.",
	category: "chinese",
	version: "1.0.0",
	aiConfig: {
		defaultTone: "formal",
		culturalContext: "chinese",
	},
	tokens: {
		colors: {
			primary: "#D4380D",
			secondary: "#0C0C0C",
			accent: "#B8860B",
			background: "#F5F0E8",
			text: "#0C0C0C",
			muted: "#6B5E50",
		},
		typography: {
			headingFont: "'Cormorant', 'Noto Serif SC', Georgia, serif",
			bodyFont: "'DM Sans', 'Noto Sans SC', sans-serif",
			accentFont: "'Cormorant', 'Noto Serif SC', serif",
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
			id: "extra",
			type: "extra",
			defaultVisible: true,
			notes:
				"Parents' Honor — family names with honorifics on obsidian background.",
			fields: [
				{
					id: "groomParents.father",
					label: "Groom's father",
					type: "text",
					sample: "张建国",
				},
				{
					id: "groomParents.mother",
					label: "Groom's mother",
					type: "text",
					sample: "李淑芬",
				},
				{
					id: "brideParents.father",
					label: "Bride's father",
					type: "text",
					sample: "王明华",
				},
				{
					id: "brideParents.mother",
					label: "Bride's mother",
					type: "text",
					sample: "陈秀英",
				},
				{
					id: "hostingLine",
					label: "Hosting line",
					type: "textarea",
					sample:
						"谨订于公历二〇二五年六月十五日（农历五月二十），假座新加坡君悦大酒店，敬备喜筵，恭请光临。",
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
			notes:
				"Stacked vertically with seal stamps — deliberate, minimal layout.",
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
			id: "schedule",
			type: "schedule",
			defaultVisible: true,
			notes: "Clean table layout — time on left, event details on right.",
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
				"Compact single-column RSVP form with vermillion buttons on obsidian background.",
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
