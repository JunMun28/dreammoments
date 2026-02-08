export type TemplateCategory = "chinese" | "garden" | "western";

/** Human-readable display names for section IDs */
export const sectionDisplayNames: Record<string, string> = {
	hero: "Welcome",
	couple: "Couple",
	story: "Our Story",
	gallery: "Gallery",
	schedule: "Schedule",
	venue: "Venue",
	rsvp: "RSVP",
	faq: "FAQ",
	footer: "Footer",
	announcement: "Announcement",
	entourage: "Entourage",
	registry: "Registry",
	calendar: "Calendar",
	countdown: "Countdown",
	details: "Details",
	extra: "Extra",
};

/** Get a human-readable label for a section ID */
export function getSectionLabel(sectionId: string): string {
	return (
		sectionDisplayNames[sectionId] ??
		sectionId.replace(/^\w/, (c) => c.toUpperCase())
	);
}

export type SectionType =
	| "hero"
	| "announcement"
	| "couple"
	| "story"
	| "gallery"
	| "schedule"
	| "venue"
	| "entourage"
	| "registry"
	| "rsvp"
	| "footer"
	| "calendar"
	| "countdown"
	| "details"
	| "extra";

/** When set, an AI rewrite (magic) button is shown next to this field. */
export type FieldAiTaskType =
	| "tagline"
	| "story"
	| "schedule"
	| "faq"
	| "style"
	| "translate";

export interface FieldConfig {
	id: string;
	label: string;
	type: "text" | "textarea" | "date" | "time" | "image" | "toggle" | "list";
	sample?: string;
	required?: boolean;
	/** If set, show an AI magic button to rewrite this field's content. */
	aiTaskType?: FieldAiTaskType;
}

export interface AnimationConfig {
	trigger: "scroll" | "inView";
	animation: "fadeIn" | "slideUp" | "slideLeft" | "scale" | "custom";
	duration: number;
	delay?: number;
	stagger?: number;
	scrub?: boolean;
}

export interface SectionConfig {
	id: string;
	type: SectionType;
	defaultVisible: boolean;
	fields: FieldConfig[];
	animations?: AnimationConfig;
	notes?: string;
}

export interface DesignTokens {
	colors: {
		primary: string;
		secondary: string;
		accent: string;
		background: string;
		text: string;
		muted: string;
	};
	typography: {
		headingFont: string;
		bodyFont: string;
		accentFont: string;
	};
	animations: {
		scrollTriggerOffset: number;
		defaultDuration: number;
		easing: string;
	};
}

export interface TemplateConfig {
	id: string;
	name: string;
	nameZh: string;
	description: string;
	category: TemplateCategory;
	sections: SectionConfig[];
	tokens: DesignTokens;
	aiConfig: {
		defaultTone: "formal" | "casual" | "romantic";
		culturalContext: "chinese" | "western" | "mixed";
	};
	version: string;
}
