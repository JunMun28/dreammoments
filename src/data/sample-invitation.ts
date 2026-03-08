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
		base.hero.partnerOneName = "俊明";
		base.hero.partnerTwoName = "诗婷";
		base.hero.heroImageUrl = "/photos/hero-couple.jpg";
		base.announcement.title = "我们结婚啦";
		base.announcement.message =
			"兜兜转转，我们终于走到了这一天。\n从相遇到相知，从心动到坚定，每一步都是命运最好的安排。\n诚邀生命中重要的你，来见证这场双向奔赴的圆满。\n好久不见，婚礼见。";
		base.announcement.formalText =
			"Together with our families, we joyfully invite you to share in our happiness as we exchange wedding vows.";
		base.couple.partnerOne = {
			fullName: "俊明",
			bio: "温柔踏实，热爱摄影与旅行。\n喜欢用镜头记录每一个心动瞬间。",
			photoUrl: "/photos/groom-portrait.jpg",
		};
		base.couple.partnerTwo = {
			fullName: "诗婷",
			bio: "浪漫细腻，喜欢花艺与烘焙。\n相信每一天都值得用心经营。",
			photoUrl: "/photos/bride-portrait.jpg",
		};
		base.couple.contactPhone = "60123456789";
		base.story.milestones = [
			{
				date: "2020",
				title: "相遇 · First Meeting",
				description:
					"那年秋天的鸡尾酒吧开幕夜，一杯Old Fashioned，一段爵士乐，从此心里多了一个人。",
				photoUrl: "/photos/candid-laugh.jpg",
			},
			{
				date: "2022",
				title: "相恋 · Falling in Love",
				description:
					"从Art Deco建筑巡礼到深夜爵士酒吧，每一次约会都是一场精心策划的冒险。",
				photoUrl: "/photos/couple-walking.jpg",
			},
			{
				date: "2024",
				title: "相守 · The Promise",
				description: "在我们最爱的那家酒吧，萨克斯风响起的瞬间，他单膝跪下。",
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
		base.weddingParty = {
			groomsmen: [
				{ name: "张伟豪", role: "Best Man" },
				{ name: "李建国", role: "Groomsman" },
				{ name: "王志强", role: "Groomsman" },
			],
			bridesmaids: [
				{ name: "陈美玲", role: "Maid of Honor" },
				{ name: "黄雅琳", role: "Bridesmaid" },
				{ name: "刘诗雨", role: "Bridesmaid" },
			],
		};
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
			hashtag: "#俊明诗婷大婚",
		};
	}
	if (templateId === "classical-chinese") {
		base.hero.partnerOneName = "文杰";
		base.hero.partnerTwoName = "雅琴";
		base.hero.tagline = "百年好合 · 永结同心";
		base.hero.heroImageUrl = "/photos/hero-couple.jpg";
		base.announcement.title = "谨定于良辰吉日";
		base.announcement.message =
			"谨择吉日，诚邀亲友，共证良缘，同贺新禧。\n愿得一心人，白首不相离。\n恭请光临，共襄盛举。";
		base.announcement.formalText =
			"We respectfully invite you to witness and celebrate our union on this auspicious day.";
		base.couple.partnerOne = {
			fullName: "文杰",
			bio: "温文尔雅，精于书画，志在四方。\n以诗书为伴，以山水为友。",
			photoUrl: "/photos/groom-portrait.jpg",
		};
		base.couple.partnerTwo = {
			fullName: "雅琴",
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
		];
		base.gallery.photos = [];
		base.parentsHonor = {
			groomParents: { father: "张建国", mother: "李淑芬" },
			brideParents: { father: "王明华", mother: "陈秀英" },
			hostingLine:
				"谨订于公历二〇二五年六月十五日（农历五月二十），假座新加坡君悦大酒店，敬备喜筵，恭请光临。",
		};
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
			hashtag: "#文杰雅琴喜结良缘",
		};
	}
	if (templateId === "romantic-cinematic") {
		base.hero.partnerOneName = "Zhi Hao";
		base.hero.partnerTwoName = "Mei Lin";
		base.hero.tagline = "A love story written in the stars";
		base.hero.heroImageUrl = "/photos/hero-couple.jpg";
		base.announcement.title = "We're Getting Married";
		base.announcement.message =
			"Like the best films, our love story began with a chance encounter and grew into something extraordinary.\nWe invite you to the next chapter.";
		base.announcement.formalText =
			"诚挚邀请您见证我们的幸福时刻。\n愿与您共同分享这份喜悦与感动。";
		base.couple.partnerOne = {
			fullName: "Tan Zhi Hao",
			bio: "A filmmaker at heart who found his leading lady.\nBelieves every sunset deserves an audience.",
			photoUrl: "/photos/groom-portrait.jpg",
		};
		base.couple.partnerTwo = {
			fullName: "Wong Mei Lin",
			bio: "Warm-hearted storyteller, chaser of golden hour.\nFinds poetry in the everyday.",
			photoUrl: "/photos/bride-portrait.jpg",
		};
		base.couple.contactPhone = "60123456789";
		base.story.milestones = [
			{
				date: "2019",
				title: "First Glance · 初见",
				description:
					"A film festival in George Town. Two strangers reaching for the same Wong Kar-wai poster. One smile, and the credits rolled on everything before.",
				photoUrl: "/photos/candid-laugh.jpg",
			},
			{
				date: "2021",
				title: "Falling Deep · 相恋",
				description:
					"Rooftop cinema dates, 3AM conversations about Chungking Express, and a love that developed like film — slowly, beautifully, in the dark.",
				photoUrl: "/photos/couple-walking.jpg",
			},
			{
				date: "2024",
				title: "The Promise · 承诺",
				description:
					"A Taipei sunrise, a vintage ring, and the only question that ever mattered. She said yes before he finished asking.",
				photoUrl: "/photos/ceremony-moment.jpg",
			},
			{
				date: "2025",
				title: "Forever After · 永远",
				description:
					"Every love story is beautiful, but ours is our favourite.\n往后余生，四季与你。",
				photoUrl: "/photos/couple-sunset.jpg",
			},
		];
		base.loveLetter = {
			from: "Zhi Hao",
			message:
				"Mei Lin,\n\nI used to think the best stories were on screen. Then I met you, and realised ours was the one I'd been waiting to tell.\n\nYou are my favourite scene, my best take, my forever reel.\n\nSee you at the altar.\n\n— Z.H.",
		};
		base.highlightsReel = {
			photos: [
				{ url: "/photos/candid-laugh.jpg", caption: "The way she laughs" },
				{ url: "/photos/couple-walking.jpg", caption: "Sunday strolls" },
				{
					url: "/photos/ceremony-moment.jpg",
					caption: "That golden hour",
				},
				{
					url: "/photos/couple-sunset.jpg",
					caption: "Our favourite ending",
				},
			],
		};
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
			"Thank you for celebrating with us.\n感谢您的祝福，期待与您在婚礼相见。";
		base.footer.socialLinks = {
			instagram: "@dreammoments",
			hashtag: "#ZhiHaoMeiLin",
		};
	}
	if (templateId === "botanical-garden") {
		base.hero.partnerOneName = "Wei Lun";
		base.hero.partnerTwoName = "Mei Xin";
		base.hero.tagline = "Where love blooms eternal";
		base.hero.heroImageUrl = "/photos/hero-couple.jpg";
		base.announcement.title = "You're Invited";
		base.announcement.message =
			"Together with our families, we joyfully invite you to celebrate our union in a garden of love and laughter.";
		base.announcement.formalText =
			"诚挚邀请您来见证我们的幸福时刻，与我们共同庆祝爱的花开。";
		base.couple.partnerOne = {
			fullName: "Lim Wei Lun",
			bio: "Weekend hiker, weekday engineer.\nBelieves the best views are earned, not given.",
			photoUrl: "/photos/groom-portrait.jpg",
		};
		base.couple.partnerTwo = {
			fullName: "Chen Mei Xin",
			bio: "Botanical garden volunteer, watercolour painter.\nFinds magic in morning dew and wildflowers.",
			photoUrl: "/photos/bride-portrait.jpg",
		};
		base.couple.contactPhone = "60123456789";
		base.story.milestones = [
			{
				date: "2019",
				title: "First Meeting",
				description:
					"A Saturday morning volunteer shift at the botanical gardens. She was sketching orchids. He was lost looking for the herb garden. Neither left alone.",
			},
			{
				date: "2021",
				title: "Growing Together",
				description:
					"Waterfall hikes, farmers' market Sundays, and a balcony garden that somehow survived two moves. Our love took root.",
			},
			{
				date: "2024",
				title: "The Proposal",
				description:
					"A sunrise hike to our favourite hilltop. The mist cleared, the valley glowed gold, and he asked the only question that mattered.",
			},
		];
		base.dressCode = {
			guidelines: "Garden semi-formal. Think flowy fabrics and earthy tones.",
			doColors: ["Sage green", "Dusty rose", "Terracotta", "Cream", "Lavender"],
			dontColors: ["White", "Black", "Bright red"],
			tips: [
				"Wear comfortable shoes — the ceremony is on grass",
				"Bring a light layer for the evening breeze",
				"Hats and fascinators welcome",
			],
		};
		base.schedule.events = [
			{
				time: "4:00 PM",
				title: "Garden Welcome",
				description: "Drinks under the pergola",
			},
			{
				time: "4:30 PM",
				title: "Garden Ceremony",
				description: "Exchange of vows",
			},
			{
				time: "5:30 PM",
				title: "Golden Hour Photos",
				description: "Capture the light",
			},
			{
				time: "6:30 PM",
				title: "Garden Dinner",
				description: "Farm-to-table feast",
			},
			{
				time: "9:00 PM",
				title: "Sparkler Send-Off",
				description: "Light the way home",
			},
		];
		base.footer.message =
			"Thank you for being part of our story.\nLove grows where you plant it.";
		base.footer.socialLinks = {
			instagram: "@dreammoments",
			hashtag: "#WeiLunMeiXin",
		};
	}
	return base;
}
