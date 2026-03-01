import type { InvitationContent } from "../lib/types";

export const baseSampleContent: InvitationContent = {
	hero: {
		partnerOneName: "Sarah",
		partnerTwoName: "Michael",
		tagline: "Two hearts, one beautiful journey",
		date: "2025-06-15",
		heroImageUrl: "",
	},
	announcement: {
		title: "We're Getting Married!",
		message:
			"Together with our families, we invite you to celebrate our wedding.",
		formalText: "诚挚邀请您见证我们的幸福时刻。",
	},
	couple: {
		partnerOne: {
			fullName: "Sarah Lim",
			bio: "Warm-hearted, loves travel and photography.",
			photoUrl: "",
		},
		partnerTwo: {
			fullName: "Michael Tan",
			bio: "Steady and thoughtful, always chasing sunsets.",
			photoUrl: "",
		},
	},
	story: {
		milestones: [
			{
				date: "2018",
				title: "How we met",
				description: "A rainy campus afternoon turned into forever.",
			},
			{
				date: "2020",
				title: "Falling in love",
				description: "We traveled, cooked, and built a home together.",
			},
			{
				date: "2024",
				title: "The proposal",
				description: "Under the stars, we said yes to forever.",
			},
		],
	},
	gallery: {
		photos: [
			{
				url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=900&fit=crop",
				caption: "Sunset vows",
			},
			{
				url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=900&h=600&fit=crop",
				caption: "Garden strolls",
			},
			{
				url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&h=600&fit=crop",
				caption: "Together always",
			},
		],
	},
	schedule: {
		events: [
			{
				time: "3:00 PM",
				title: "Guest Arrival",
				description: "Welcome drinks",
			},
			{ time: "3:30 PM", title: "Ceremony", description: "Exchange of vows" },
			{ time: "4:30 PM", title: "Photo Session", description: "Group photos" },
			{
				time: "6:00 PM",
				title: "Dinner Reception",
				description: "Dinner and celebrations",
			},
			{
				time: "9:00 PM",
				title: "After Party",
				description: "Dancing and festivities",
			},
		],
	},
	venue: {
		name: "Grand Hyatt Singapore",
		address: "10 Scotts Road, Singapore 228211",
		coordinates: { lat: 1.3055, lng: 103.8318 },
		directions: "Enter via the main lobby, Level 1.",
		parkingInfo: "Complimentary valet parking available.",
	},
	entourage: {
		members: [
			{ role: "Best Man", name: "Jian Hao" },
			{ role: "Maid of Honor", name: "Wei Ling" },
			{ role: "Parents", name: "Mr & Mrs Tan" },
		],
	},
	registry: {
		title: "Gift Registry",
		note: "Your presence is enough. If you wish, a small gift is welcome.",
	},
	rsvp: {
		deadline: "2025-05-20",
		allowPlusOnes: true,
		maxPlusOnes: 2,
		dietaryOptions: ["No restrictions", "Vegetarian", "Halal", "No pork"],
		customMessage: "Please reply by 20 May 2025.",
	},
	faq: {
		items: [
			{
				question: "What should I wear?",
				answer: "Smart casual. Please avoid white.",
			},
			{
				question: "Can I bring a plus one?",
				answer: "Please RSVP for your allocated seats only.",
			},
			{
				question: "Is there parking?",
				answer: "Complimentary valet parking is available.",
			},
		],
	},
	footer: {
		message: "Thank you for celebrating with us.",
		socialLinks: { instagram: "@dreammoments", hashtag: "#SarahMichael" },
	},
	details: {
		scheduleSummary: "Ceremony at 3:30 PM · Dinner at 6:00 PM",
		venueSummary: "Grand Hyatt Singapore · Ballroom Level 2",
	},
	calendar: {
		dateLabel: "15 Jun 2025",
		message: "好久不见 · 婚礼见",
	},
	countdown: {
		targetDate: "2025-06-15T15:30:00+08:00",
	},
};

export function buildSampleContent(templateId: string): InvitationContent {
	const base = structuredClone(baseSampleContent);
	if (templateId === "double-happiness") {
		base.hero.tagline = "囍临门 · 永结同心";
		base.hero.partnerOneName = "王小明";
		base.hero.partnerTwoName = "李小红";
		base.announcement.title = "我们结婚啦";
		base.announcement.message =
			"亲爱的家人朋友们，我们诚挚地邀请您来参加我们的婚礼。";
		base.announcement.formalText =
			"Dear Family & Friends, we cordially invite you to celebrate our union.";
		base.footer.message =
			"感谢您的祝福，期待与您在婚礼相见。\nThank you for your blessings. We look forward to celebrating with you.";
	}
	return base;
}
