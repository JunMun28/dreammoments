export type TemplateCategory = 'chinese' | 'garden' | 'western'

export type SectionType =
	| 'hero'
	| 'announcement'
	| 'couple'
	| 'story'
	| 'gallery'
	| 'schedule'
	| 'venue'
	| 'entourage'
	| 'registry'
	| 'rsvp'
	| 'footer'
	| 'calendar'
	| 'countdown'
	| 'details'
	| 'extra'

export interface FieldConfig {
	id: string
	label: string
	type: 'text' | 'textarea' | 'date' | 'time' | 'image' | 'toggle' | 'list'
	sample?: string
	required?: boolean
}

export interface AnimationConfig {
	trigger: 'scroll' | 'inView'
	animation: 'fadeIn' | 'slideUp' | 'slideLeft' | 'scale' | 'custom'
	duration: number
	delay?: number
	stagger?: number
	scrub?: boolean
}

export interface SectionConfig {
	id: string
	type: SectionType
	defaultVisible: boolean
	fields: FieldConfig[]
	animations?: AnimationConfig
	notes?: string
}

export interface DesignTokens {
	colors: {
		primary: string
		secondary: string
		accent: string
		background: string
		text: string
		muted: string
	}
	typography: {
		headingFont: string
		bodyFont: string
		accentFont: string
	}
	animations: {
		scrollTriggerOffset: number
		defaultDuration: number
		easing: string
	}
}

export interface TemplateConfig {
	id: string
	name: string
	nameZh: string
	description: string
	category: TemplateCategory
	sections: SectionConfig[]
	tokens: DesignTokens
	aiConfig: {
		defaultTone: 'formal' | 'casual' | 'romantic'
		culturalContext: 'chinese' | 'western' | 'mixed'
	}
	version: string
}
