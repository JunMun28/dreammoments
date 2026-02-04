import type { InvitationContent } from '../lib/types'

export const baseSampleContent: InvitationContent = {
	hero: {
		partnerOneName: 'Sarah',
		partnerTwoName: 'Michael',
		tagline: 'Two hearts, one beautiful journey',
		date: '2025-06-15',
		heroImageUrl: '',
	},
	announcement: {
		title: "We're Getting Married!",
		message:
			'Together with our families, we invite you to celebrate our wedding.',
		formalText: '诚挚邀请您见证我们的幸福时刻。',
	},
	couple: {
		partnerOne: {
			fullName: 'Sarah Lim',
			bio: 'Warm-hearted, loves travel and photography.',
			photoUrl: '',
		},
		partnerTwo: {
			fullName: 'Michael Tan',
			bio: 'Steady and thoughtful, always chasing sunsets.',
			photoUrl: '',
		},
	},
	story: {
		milestones: [
			{
				date: '2018',
				title: 'How we met',
				description: 'A rainy campus afternoon turned into forever.',
			},
			{
				date: '2020',
				title: 'Falling in love',
				description: 'We traveled, cooked, and built a home together.',
			},
			{
				date: '2024',
				title: 'The proposal',
				description: 'Under the stars, we said yes to forever.',
			},
		],
	},
	gallery: {
		photos: [
			{ url: '', caption: 'Sunset vows' },
			{ url: '', caption: 'Garden strolls' },
			{ url: '', caption: 'Together always' },
		],
	},
	schedule: {
		events: [
			{ time: '3:00 PM', title: 'Guest Arrival', description: 'Welcome drinks' },
			{ time: '3:30 PM', title: 'Ceremony', description: 'Exchange of vows' },
			{ time: '4:30 PM', title: 'Photo Session', description: 'Group photos' },
			{ time: '6:00 PM', title: 'Dinner Reception', description: 'Dinner and celebrations' },
			{ time: '9:00 PM', title: 'After Party', description: 'Dancing and festivities' },
		],
	},
	venue: {
		name: 'Grand Hyatt Singapore',
		address: '10 Scotts Road, Singapore 228211',
		coordinates: { lat: 1.3055, lng: 103.8318 },
		directions: 'Enter via the main lobby, Level 1.',
		parkingInfo: 'Complimentary valet parking available.',
	},
	entourage: {
		members: [
			{ role: 'Best Man', name: 'Jian Hao' },
			{ role: 'Maid of Honor', name: 'Wei Ling' },
			{ role: 'Parents', name: 'Mr & Mrs Tan' },
		],
	},
	registry: {
		title: 'Gift Registry',
		note: 'Your presence is enough. If you wish, a small gift is welcome.',
	},
	rsvp: {
		deadline: '2025-05-20',
		allowPlusOnes: true,
		maxPlusOnes: 2,
		dietaryOptions: ['No restrictions', 'Vegetarian', 'Halal', 'No pork'],
		customMessage: 'Please reply by 20 May 2025.',
	},
	faq: {
		items: [
			{
				question: 'What should I wear?',
				answer: 'Smart casual. Please avoid white.',
			},
			{
				question: 'Can I bring a plus one?',
				answer: 'Please RSVP for your allocated seats only.',
			},
			{
				question: 'Is there parking?',
				answer: 'Complimentary valet parking is available.',
			},
		],
	},
	footer: {
		message: 'Thank you for celebrating with us.',
		socialLinks: { instagram: '@dreammoments', hashtag: '#SarahMichael' },
	},
	details: {
		scheduleSummary: 'Ceremony at 3:30 PM · Dinner at 6:00 PM',
		venueSummary: 'Grand Hyatt Singapore · Ballroom Level 2',
	},
	calendar: {
		dateLabel: '15 Jun 2025',
		message: '好久不见 · 婚礼见',
	},
	countdown: {
		targetDate: '2025-06-15T15:30:00+08:00',
	},
}

export function buildSampleContent(templateId: string): InvitationContent {
	const base = structuredClone(baseSampleContent)
	if (templateId === 'love-at-dusk') {
		base.hero.tagline = '暮色里相遇，星光里相守'
		base.announcement.title = '我们结婚啦'
		base.announcement.formalText = '诚挚邀请您参加我们的婚礼。'
		base.footer.message = '期待与您在婚礼相见。'
	}
	if (templateId === 'blush-romance') {
		base.hero.tagline = 'Soft blush tones for a timeless promise.'
		base.announcement.title = 'Blush Romance'
		base.footer.message = 'With love, in gentle blush.'
	}
	if (templateId === 'garden-romance') {
		base.hero.tagline = 'A garden vow, a lifetime promise.'
		base.announcement.title = 'Garden Romance'
		base.footer.message = 'Meet us under the florals.'
	}
	if (templateId === 'eternal-elegance') {
		base.hero.tagline = 'Forever begins in elegant simplicity.'
		base.announcement.title = 'Eternal Elegance'
		base.footer.message = 'With love and gratitude.'
	}
	return base
}
