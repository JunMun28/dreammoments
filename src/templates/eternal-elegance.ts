import type { TemplateConfig } from './types'

export const eternalEleganceTemplate: TemplateConfig = {
	id: 'eternal-elegance',
	name: 'Eternal Elegance',
	nameZh: '恒久典雅',
	description: 'Classic western invitation with restrained luxury.',
	category: 'western',
	version: '1.0.0',
	aiConfig: {
		defaultTone: 'formal',
		culturalContext: 'western',
	},
	tokens: {
		colors: {
			primary: '#1C1C1C',
			secondary: '#C9A962',
			accent: '#FFFFFF',
			background: '#FFFFFF',
			text: '#333333',
			muted: '#6F6F6F',
		},
		typography: {
			headingFont: "'Didot', 'Bodoni MT', 'Cormorant Garamond', serif",
			bodyFont: "'Garamond', 'Cormorant Garamond', serif",
			accentFont: "'Pinyon Script', 'Garamond', serif",
		},
		animations: {
			scrollTriggerOffset: 120,
			defaultDuration: 0.6,
			easing: 'easeOutCubic',
		},
	},
	sections: [
		{
			id: 'hero',
			type: 'hero',
			defaultVisible: true,
			notes: 'Minimal hero with monogram draw.',
			fields: [
				{ id: 'partnerOneName', label: 'Partner one', type: 'text', required: true },
				{ id: 'partnerTwoName', label: 'Partner two', type: 'text', required: true },
				{ id: 'tagline', label: 'Tagline', type: 'text' },
				{ id: 'heroImageUrl', label: 'Hero photo', type: 'image' },
			],
		},
		{
			id: 'announcement',
			type: 'announcement',
			defaultVisible: true,
			notes: 'Classic invitation wording.',
			fields: [
				{ id: 'title', label: 'Title', type: 'text', required: true },
				{ id: 'message', label: 'Message', type: 'textarea' },
			],
		},
		{
			id: 'couple',
			type: 'couple',
			defaultVisible: true,
			notes: 'Elegant portraits.',
			fields: [
				{ id: 'partnerOne.fullName', label: 'Partner one name', type: 'text' },
				{ id: 'partnerTwo.fullName', label: 'Partner two name', type: 'text' },
				{ id: 'partnerOne.bio', label: 'Partner one bio', type: 'textarea' },
				{ id: 'partnerTwo.bio', label: 'Partner two bio', type: 'textarea' },
			],
		},
		{
			id: 'gallery',
			type: 'gallery',
			defaultVisible: true,
			notes: 'Full width slideshow.',
			fields: [{ id: 'photos', label: 'Gallery photos', type: 'list' }],
		},
		{
			id: 'details',
			type: 'details',
			defaultVisible: true,
			notes: 'Schedule + venue combined.',
			fields: [
				{ id: 'scheduleSummary', label: 'Schedule summary', type: 'text' },
				{ id: 'venueSummary', label: 'Venue summary', type: 'text' },
			],
		},
		{
			id: 'rsvp',
			type: 'rsvp',
			defaultVisible: true,
			notes: 'Sophisticated RSVP form.',
			fields: [
				{ id: 'deadline', label: 'RSVP deadline', type: 'date' },
				{ id: 'allowPlusOnes', label: 'Allow plus ones', type: 'toggle' },
				{ id: 'maxPlusOnes', label: 'Max plus ones', type: 'text' },
			],
		},
		{
			id: 'registry',
			type: 'registry',
			defaultVisible: false,
			notes: 'Gift registry block.',
			fields: [{ id: 'note', label: 'Gift preference', type: 'textarea' }],
		},
		{
			id: 'footer',
			type: 'footer',
			defaultVisible: true,
			notes: 'Closing thank you message.',
			fields: [{ id: 'message', label: 'Footer message', type: 'text' }],
		},
	],
}
