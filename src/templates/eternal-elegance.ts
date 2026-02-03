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
			headingFont: "'Cormorant Garamond', serif",
			bodyFont: "'Manrope', sans-serif",
			accentFont: "'Cormorant Garamond', serif",
		},
		animations: {
			scrollTriggerOffset: 120,
			defaultDuration: 0.7,
			easing: 'easeOutCubic',
		},
	},
	sections: [
		{ id: 'hero', type: 'hero', defaultVisible: true, fields: [] },
		{ id: 'announcement', type: 'announcement', defaultVisible: true, fields: [] },
		{ id: 'couple', type: 'couple', defaultVisible: true, fields: [] },
		{ id: 'gallery', type: 'gallery', defaultVisible: true, fields: [] },
		{ id: 'details', type: 'details', defaultVisible: true, fields: [] },
		{ id: 'rsvp', type: 'rsvp', defaultVisible: true, fields: [] },
		{ id: 'registry', type: 'registry', defaultVisible: false, fields: [] },
		{ id: 'footer', type: 'footer', defaultVisible: true, fields: [] },
	],
}
