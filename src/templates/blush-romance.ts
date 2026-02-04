import type { TemplateConfig } from './types'

export const blushRomanceTemplate: TemplateConfig = {
	id: 'blush-romance',
	name: 'Blush Romance',
	nameZh: '胭脂之恋',
	description: 'Soft blush tones with romantic botanical pacing.',
	category: 'garden',
	version: '1.0.0',
	aiConfig: {
		defaultTone: 'romantic',
		culturalContext: 'mixed',
	},
	tokens: {
		colors: {
			primary: '#7F1D1D',
			secondary: '#D94674',
			accent: '#FFF1F2',
			background: '#FFF6F8',
			text: '#1A0F14',
			muted: '#6F5561',
		},
		typography: {
			headingFont: "'Cormorant Garamond', serif",
			bodyFont: "'Lato', 'Manrope', sans-serif",
			accentFont: "'Sacramento', 'Cormorant Garamond', serif",
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
			notes: 'Blush frame, romantic botanical accents.',
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
			notes: 'Elegant invitation copy.',
			fields: [
				{ id: 'title', label: 'Title', type: 'text', required: true },
				{ id: 'message', label: 'Message', type: 'textarea' },
				{ id: 'formalText', label: 'Chinese text', type: 'textarea' },
			],
		},
		{
			id: 'story',
			type: 'story',
			defaultVisible: true,
			notes: 'Illustrated journey timeline.',
			fields: [{ id: 'milestones', label: 'Story milestones', type: 'list' }],
		},
		{
			id: 'gallery',
			type: 'gallery',
			defaultVisible: true,
			notes: 'Botanical framed carousel.',
			fields: [{ id: 'photos', label: 'Gallery photos', type: 'list' }],
		},
		{
			id: 'schedule',
			type: 'schedule',
			defaultVisible: true,
			notes: 'Romantic timeline icons.',
			fields: [{ id: 'events', label: 'Schedule events', type: 'list' }],
		},
		{
			id: 'venue',
			type: 'venue',
			defaultVisible: true,
			notes: 'Soft rose map style.',
			fields: [
				{ id: 'name', label: 'Venue name', type: 'text' },
				{ id: 'address', label: 'Venue address', type: 'textarea' },
				{ id: 'coordinates', label: 'Venue coordinates (lat,lng)', type: 'text' },
			],
		},
		{
			id: 'rsvp',
			type: 'rsvp',
			defaultVisible: true,
			notes: 'Clean minimal RSVP form.',
			fields: [
				{ id: 'deadline', label: 'RSVP deadline', type: 'date' },
				{ id: 'allowPlusOnes', label: 'Allow plus ones', type: 'toggle' },
				{ id: 'maxPlusOnes', label: 'Max plus ones', type: 'text' },
			],
		},
		{
			id: 'faq',
			type: 'faq',
			defaultVisible: true,
			notes: 'Accordion FAQ with rose icons.',
			fields: [{ id: 'items', label: 'FAQ items', type: 'list' }],
		},
		{
			id: 'footer',
			type: 'footer',
			defaultVisible: true,
			notes: 'Soft blush footer with thank you message.',
			fields: [{ id: 'message', label: 'Footer message', type: 'text' }],
		},
	],
}
