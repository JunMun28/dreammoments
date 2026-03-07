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
				url: "/photos/hero-couple.jpg",
				caption: "Sunset vows",
			},
			{
				url: "/photos/garden-portrait.jpg",
				caption: "Garden strolls",
			},
			{
				url: "/photos/couple-close.jpg",
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
		base.hero.tagline = "始于初见，止于终老";
		base.hero.partnerOneName = "陈嘉伟";
		base.hero.partnerTwoName = "林诗琪";
		base.hero.heroImageUrl = "/photos/hero-couple.jpg";
		base.announcement.title = "我们结婚啦";
		base.announcement.message =
			"兜兜转转，我们终于走到了这一天。\n从相遇到相知，从心动到坚定，每一步都是命运最好的安排。\n诚邀生命中重要的你，来见证这场双向奔赴的圆满。\n好久不见，婚礼见。";
		base.announcement.formalText =
			"Together with our families, we joyfully invite you to share in our happiness as we exchange wedding vows.";
		base.couple.partnerOne = {
			fullName: "陈嘉伟",
			bio: "温柔踏实，热爱摄影与旅行。\n喜欢用镜头记录每一个心动瞬间。",
			photoUrl: "/photos/groom-portrait.jpg",
		};
		base.couple.partnerTwo = {
			fullName: "林诗琪",
			bio: "浪漫细腻，喜欢花艺与烘焙。\n相信每一天都值得用心经营。",
			photoUrl: "/photos/bride-portrait.jpg",
		};
		base.couple.contactPhone = "60123456789";
		base.story.milestones = [
			{
				date: "2020",
				title: "相遇 · First Meeting",
				description:
					"总有些惊奇的际遇，比方说当我遇见你。\n那年秋天的咖啡馆，一场偶然，一个微笑，从此心里多了一个人。",
				photoUrl: "/photos/candid-laugh.jpg",
			},
			{
				date: "2022",
				title: "相恋 · Falling in Love",
				description:
					"和你在一起就是最好的日子。\n三餐四季，柴米油盐，平凡的日常因为有你而闪闪发光。",
				photoUrl: "/photos/couple-walking.jpg",
			},
			{
				date: "2024",
				title: "相守 · The Promise",
				description:
					"人生其实只要两次幸运就好，一次遇见你，一次是走到底。\n以岁月为证，以白首为期。",
				photoUrl: "/photos/ceremony-moment.jpg",
			},
			{
				date: "2025",
				title: "永远 · Forever Begins",
				description:
					"遇见你是故事的开始，走到底是人间的欢喜。\n往后余生，四季与你。",
				photoUrl: "/photos/couple-sunset.jpg",
			},
		];
		base.gallery.photos = [
			{ url: "/photos/hero-couple.jpg", caption: "执手偕老" },
			{ url: "/photos/couple-walking.jpg", caption: "并肩同行" },
			{ url: "/photos/candid-laugh.jpg", caption: "怦然心动" },
			{ url: "/photos/garden-portrait.jpg", caption: "花前月下" },
			{ url: "/photos/couple-sunset.jpg", caption: "余晖相伴" },
			{ url: "/photos/reception-toast.jpg", caption: "举杯同庆" },
		];
		base.schedule.events = [
			{
				time: "5:00 PM",
				title: "迎宾签到",
				description: "Welcome & Registration",
			},
			{
				time: "5:30 PM",
				title: "证婚仪式",
				description: "Wedding Ceremony",
			},
			{
				time: "6:00 PM",
				title: "合影留念",
				description: "Group Photos",
			},
			{
				time: "7:00 PM",
				title: "婚宴晚席",
				description: "Wedding Banquet",
			},
			{
				time: "9:30 PM",
				title: "答谢派对",
				description: "After Party",
			},
		];
		base.footer.message =
			"往后余生，四季与你。\nFor the rest of our lives, every season with you.";
		base.footer.socialLinks = {
			instagram: "@dreammoments",
			hashtag: "#嘉伟诗琪大婚",
		};
	}
	if (templateId === "classical-chinese") {
		base.hero.partnerOneName = "张明辉";
		base.hero.partnerTwoName = "王婉仪";
		base.hero.tagline = "百年好合 · 永结同心";
		base.hero.heroImageUrl = "/photos/hero-couple.jpg";
		base.announcement.title = "谨定于良辰吉日";
		base.announcement.message =
			"谨择吉日，诚邀亲友，共证良缘，同贺新禧。\n愿得一心人，白首不相离。\n恭请光临，共襄盛举。";
		base.announcement.formalText =
			"We respectfully invite you to witness and celebrate our union on this auspicious day.";
		base.couple.partnerOne = {
			fullName: "张明辉",
			bio: "温文尔雅，精于书画，志在四方。\n以诗书为伴，以山水为友。",
			photoUrl: "/photos/groom-portrait.jpg",
		};
		base.couple.partnerTwo = {
			fullName: "王婉仪",
			bio: "端庄贤淑，才华横溢，琴棋书画皆通。\n以花为媒，以茶会友。",
			photoUrl: "/photos/bride-portrait.jpg",
		};
		base.couple.contactPhone = "60123456789";
		base.story.milestones = [
			{
				date: "2019",
				title: "初遇 · First Encounter",
				description:
					"月下花前初相见，一顾倾城再顾倾国。\n缘分天定，那年春日的茶会上，目光交汇的瞬间，便已心动。",
				photoUrl: "/photos/candid-laugh.jpg",
			},
			{
				date: "2021",
				title: "情深 · Growing Bond",
				description:
					"执子之手，共赏四季风华。\n琴瑟和鸣，诗书唱和，日子平淡却温馨如画。",
				photoUrl: "/photos/couple-walking.jpg",
			},
			{
				date: "2024",
				title: "盟誓 · The Vow",
				description:
					"愿得一心人，白首不相离。\n以天地为证，以日月为鉴，许下一生一世的承诺。",
				photoUrl: "/photos/ceremony-moment.jpg",
			},
			{
				date: "2025",
				title: "佳期 · The Day",
				description: "龙凤呈祥，百年好合。\n良辰吉日，共结连理，开启永恒篇章。",
				photoUrl: "/photos/couple-sunset.jpg",
			},
		];
		base.gallery.photos = [
			{ url: "/photos/hero-couple.jpg", caption: "琴瑟和鸣" },
			{ url: "/photos/couple-walking.jpg", caption: "执手偕行" },
			{ url: "/photos/candid-laugh.jpg", caption: "相视而笑" },
			{ url: "/photos/garden-portrait.jpg", caption: "花好月圆" },
			{ url: "/photos/couple-sunset.jpg", caption: "夕阳相伴" },
			{ url: "/photos/reception-toast.jpg", caption: "举杯同庆" },
		];
		base.schedule.events = [
			{
				time: "5:00 PM",
				title: "迎宾入席",
				description: "Welcome & Seating",
			},
			{
				time: "5:30 PM",
				title: "证婚大典",
				description: "Wedding Ceremony",
			},
			{
				time: "6:00 PM",
				title: "合影留念",
				description: "Group Photos",
			},
			{
				time: "7:00 PM",
				title: "喜宴开席",
				description: "Wedding Banquet",
			},
			{
				time: "9:30 PM",
				title: "答谢宾客",
				description: "Thank You & After Party",
			},
		];
		base.footer.message =
			"百年好合，永结同心。\nA hundred years of harmony, hearts forever entwined.";
		base.footer.socialLinks = {
			instagram: "@dreammoments",
			hashtag: "#明辉婉仪喜结良缘",
		};
	}
	if (templateId === "romantic-cinematic") {
		base.hero.partnerOneName = "Wei Jun";
		base.hero.partnerTwoName = "Mei Ling";
		base.hero.tagline = "A love story written in the stars";
		base.hero.heroImageUrl = "/photos/hero-couple.jpg";
		base.announcement.title = "We're Getting Married";
		base.announcement.message =
			"Together with our families, we joyfully invite you to share in our happiness as we exchange wedding vows.\nYour presence would mean the world to us on this special day.";
		base.announcement.formalText =
			"诚挚邀请您见证我们的幸福时刻。\n愿与您共同分享这份喜悦与感动。";
		base.couple.partnerOne = {
			fullName: "Wei Jun",
			bio: "Steady and thoughtful, always chasing sunsets.\nA dreamer who believes in forever.",
			photoUrl: "/photos/groom-portrait.jpg",
		};
		base.couple.partnerTwo = {
			fullName: "Mei Ling",
			bio: "Warm-hearted, loves travel and photography.\nFinds beauty in every little moment.",
			photoUrl: "/photos/bride-portrait.jpg",
		};
		base.couple.contactPhone = "60123456789";
		base.story.milestones = [
			{
				date: "2019",
				title: "First Glance \u00B7 \u521D\u89C1",
				description:
					"A chance encounter at a rooftop cafe.\nOne smile, and the world stood still.",
				photoUrl: "/photos/candid-laugh.jpg",
			},
			{
				date: "2021",
				title: "Falling Deep \u00B7 \u76F8\u604B",
				description:
					"Late-night conversations, sunrise hikes, and a love that grew with every shared moment.",
				photoUrl: "/photos/couple-walking.jpg",
			},
			{
				date: "2024",
				title: "The Promise \u00B7 \u627F\u8BFA",
				description:
					"Under a canopy of stars, he asked. She said yes.\nForever begins now.",
				photoUrl: "/photos/ceremony-moment.jpg",
			},
			{
				date: "2025",
				title: "Forever After \u00B7 \u6C38\u8FDC",
				description:
					"Every love story is beautiful, but ours is our favourite.\n\u5F80\u540E\u4F59\u751F\uFF0C\u56DB\u5B63\u4E0E\u4F60\u3002",
				photoUrl: "/photos/couple-sunset.jpg",
			},
		];
		base.gallery.photos = [
			{ url: "/photos/hero-couple.jpg", caption: "Together always" },
			{ url: "/photos/couple-walking.jpg", caption: "Side by side" },
			{ url: "/photos/candid-laugh.jpg", caption: "Pure joy" },
			{ url: "/photos/garden-portrait.jpg", caption: "Golden hour" },
			{ url: "/photos/couple-sunset.jpg", caption: "Into the sunset" },
			{ url: "/photos/reception-toast.jpg", caption: "Cheers to love" },
		];
		base.schedule.events = [
			{
				time: "5:00 PM",
				title: "Guest Arrival",
				description: "Welcome & Registration",
			},
			{
				time: "5:30 PM",
				title: "Wedding Ceremony",
				description: "Exchange of Vows",
			},
			{
				time: "6:00 PM",
				title: "Group Photos",
				description: "Capture the memories",
			},
			{
				time: "7:00 PM",
				title: "Wedding Banquet",
				description: "Dinner & Celebrations",
			},
			{
				time: "9:30 PM",
				title: "After Party",
				description: "Dancing & Festivities",
			},
		];
		base.footer.message =
			"Thank you for celebrating with us.\n\u611F\u8C22\u60A8\u7684\u795D\u798F\uFF0C\u671F\u5F85\u4E0E\u60A8\u5728\u5A5A\u793C\u76F8\u89C1\u3002";
		base.footer.socialLinks = {
			instagram: "@dreammoments",
			hashtag: "#WeiJunMeiLing",
		};
	}
	if (templateId === "botanical-garden") {
		base.hero.partnerOneName = "Emily";
		base.hero.partnerTwoName = "James";
		base.hero.tagline = "Where love blooms eternal";
		base.hero.heroImageUrl = "/photos/hero-couple.jpg";
		base.announcement.title = "You're Invited";
		base.announcement.message =
			"Together with our families, we joyfully invite you to celebrate our union in a garden of love and laughter.";
		base.announcement.formalText =
			"诚挚邀请您来见证我们的幸福时刻，与我们共同庆祝爱的花开。";
		base.couple.partnerOne = {
			fullName: "Emily Chen",
			bio: "Loves nature walks, watercolour painting, and Sunday brunch.\nBelieves every garden tells a story.",
			photoUrl: "/photos/groom-portrait.jpg",
		};
		base.couple.partnerTwo = {
			fullName: "James Wong",
			bio: "An adventurer at heart who finds peace in the garden.\nAlways chasing the next sunrise.",
			photoUrl: "/photos/bride-portrait.jpg",
		};
		base.story.milestones = [
			{
				date: "2019",
				title: "First Meeting",
				description:
					"A chance encounter at the botanical gardens turned a Sunday stroll into the beginning of forever.",
			},
			{
				date: "2021",
				title: "Growing Together",
				description:
					"Through seasons and adventures, our love took root and blossomed into something beautiful.",
			},
			{
				date: "2024",
				title: "The Proposal",
				description:
					"Under a canopy of wisteria, surrounded by the scent of jasmine, he asked and she said yes.",
			},
		];
		base.footer.message =
			"Thank you for being part of our story.\nLove grows where you plant it.";
		base.footer.socialLinks = {
			instagram: "@dreammoments",
			hashtag: "#EmilyAndJames",
		};
	}
	return base;
}
