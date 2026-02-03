import type { TemplateConfig } from './types'

export const gardenRomanceTemplate: TemplateConfig = {
	id: 'garden-romance',
	name: 'Garden Romance',
	nameZh: '花园之誓',
	description: 'Natural, light, outdoor elegance.',
	category: 'garden',
	version: '1.0.0',
	aiConfig: {
		defaultTone: 'romantic',
		culturalContext: 'mixed',
	},
	tokens: {
		colors: {
			primary: '#2D5A3D',
			secondary: '#E8B4B8',
			accent: '#FDF8F5',
			background: '#FDF8F5',
			text: '#2C2C2C',
			muted: '#7A726D',
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
		{ id: 'story', type: 'story', defaultVisible: true, fields: [] },
		{ id: 'gallery', type: 'gallery', defaultVisible: true, fields: [] },
		{ id: 'schedule', type: 'schedule', defaultVisible: true, fields: [] },
		{ id: 'venue', type: 'venue', defaultVisible: true, fields: [] },
		{ id: 'rsvp', type: 'rsvp', defaultVisible: true, fields: [] },
		{ id: 'footer', type: 'footer', defaultVisible: true, fields: [] },
	],
}
