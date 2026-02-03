import type { TemplateConfig } from './types'

export const loveAtDuskTemplate: TemplateConfig = {
	id: 'love-at-dusk',
	name: 'Love at Dusk',
	nameZh: '暮色之恋',
	description: 'Romantic Chinese elegance with cinematic scroll pacing.',
	category: 'chinese',
	version: '1.0.0',
	aiConfig: {
		defaultTone: 'romantic',
		culturalContext: 'chinese',
	},
	tokens: {
		colors: {
			primary: '#B30E0E',
			secondary: '#741212',
			accent: '#FFE094',
			background: '#0c0a08',
			text: '#F5F5F5',
			muted: '#B7A38A',
		},
		typography: {
			headingFont: "'Cormorant Garamond', 'Noto Serif SC', serif",
			bodyFont: "'Manrope', 'Noto Serif SC', sans-serif",
			accentFont: "'Noto Serif SC', serif",
		},
		animations: {
			scrollTriggerOffset: 120,
			defaultDuration: 0.7,
			easing: 'easeOutCubic',
		},
	},
	sections: [
		{
			id: 'hero',
			type: 'hero',
			defaultVisible: true,
			notes: 'Sparkle overlay, double happiness, calligraphy headline.',
			fields: [
				{
					id: 'partnerOneName',
					label: 'Groom name',
					type: 'text',
					sample: '满小满',
					required: true,
				},
				{
					id: 'partnerTwoName',
					label: 'Bride name',
					type: 'text',
					sample: '美小美',
					required: true,
				},
				{
					id: 'tagline',
					label: 'Tagline',
					type: 'text',
					sample: 'Two hearts, one beautiful journey',
				},
				{
					id: 'heroImageUrl',
					label: 'Hero photo',
					type: 'image',
				},
			],
		},
		{
			id: 'announcement',
			type: 'announcement',
			defaultVisible: true,
			notes: 'Formal invitation copy, bilingual block.',
			fields: [
				{
					id: 'title',
					label: 'Title',
					type: 'text',
					sample: '我们结婚啦',
					required: true,
				},
				{
					id: 'message',
					label: 'Invitation message',
					type: 'textarea',
					sample:
						'我们怀着喜悦的心情邀请您参加我们的婚礼，见证我们的幸福时刻。',
				},
				{
					id: 'formalText',
					label: 'Formal text',
					type: 'textarea',
				},
			],
		},
		{
			id: 'couple',
			type: 'couple',
			defaultVisible: true,
			notes: 'Side-by-side portraits with callout labels.',
			fields: [
				{
					id: 'partnerOneBio',
					label: 'Groom bio',
					type: 'textarea',
					sample: '温柔踏实，热爱摄影与旅行。',
				},
				{
					id: 'partnerTwoBio',
					label: 'Bride bio',
					type: 'textarea',
					sample: '浪漫细腻，喜欢花艺与烘焙。',
				},
				{
					id: 'partnerOnePhoto',
					label: 'Groom photo',
					type: 'image',
				},
				{
					id: 'partnerTwoPhoto',
					label: 'Bride photo',
					type: 'image',
				},
			],
		},
		{
			id: 'story',
			type: 'story',
			defaultVisible: true,
			notes: 'Love story timeline with poetic copy blocks.',
			fields: [
				{
					id: 'milestones',
					label: 'Story milestones',
					type: 'list',
				},
			],
		},
		{
			id: 'gallery',
			type: 'gallery',
			defaultVisible: true,
			notes: 'Full-bleed photos, soft masks, sparkle overlays.',
			fields: [
				{
					id: 'photos',
					label: 'Gallery photos',
					type: 'list',
				},
			],
		},
		{
			id: 'schedule',
			type: 'schedule',
			defaultVisible: true,
			notes: 'Timeline layout, romantic details.',
			fields: [
				{
					id: 'events',
					label: 'Schedule events',
					type: 'list',
				},
			],
		},
		{
			id: 'venue',
			type: 'venue',
			defaultVisible: true,
			notes: 'Map with Chinese date line, address, and directions.',
			fields: [
				{
					id: 'venueName',
					label: 'Venue name',
					type: 'text',
					sample: '婚贝大酒店A栋9F幸福宴会厅',
				},
				{
					id: 'venueAddress',
					label: 'Venue address',
					type: 'textarea',
					sample: '10 Scotts Road, Singapore 228211',
				},
				{
					id: 'venueCoordinates',
					label: 'Venue coordinates',
					type: 'text',
				},
			],
		},
		{
			id: 'calendar',
			type: 'calendar',
			defaultVisible: true,
			notes: 'Wedding date calendar with heart indicator.',
			fields: [
				{
					id: 'weddingDate',
					label: 'Wedding date',
					type: 'date',
					required: true,
				},
				{
					id: 'lunarDate',
					label: 'Lunar date',
					type: 'text',
				},
				{
					id: 'dayOfWeek',
					label: 'Day of week',
					type: 'text',
				},
			],
		},
		{
			id: 'countdown',
			type: 'countdown',
			defaultVisible: true,
			notes: 'Countdown timer with gold digits.',
			fields: [
				{
					id: 'countdownDate',
					label: 'Countdown date',
					type: 'date',
				},
			],
		},
		{
			id: 'registry',
			type: 'registry',
			defaultVisible: false,
			notes: 'Optional gift registry grid.',
			fields: [
				{
					id: 'giftPreference',
					label: 'Gift preference',
					type: 'textarea',
				},
			],
		},
		{
			id: 'rsvp',
			type: 'rsvp',
			defaultVisible: true,
			notes: 'Minimal RSVP form with name and guest count.',
			fields: [
				{
					id: 'rsvpDeadline',
					label: 'RSVP deadline',
					type: 'date',
				},
				{
					id: 'allowPlusOnes',
					label: 'Allow plus ones',
					type: 'toggle',
				},
			],
		},
		{
			id: 'footer',
			type: 'footer',
			defaultVisible: true,
			notes: 'Thank you and closing line.',
			fields: [
				{
					id: 'thankYouMessage',
					label: 'Footer message',
					type: 'text',
					sample: '期待与您在婚礼相见。',
				},
			],
		},
	],
}
