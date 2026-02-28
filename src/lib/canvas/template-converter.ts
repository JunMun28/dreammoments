import { buildSampleContent } from "@/data/sample-invitation";
import type { InvitationContent } from "@/lib/types";
import { templates } from "@/templates";
import type { TemplateConfig } from "@/templates/types";
import type { Block, CanvasDocument, DesignTokens } from "./types";

const TEMPLATE_ACCENT_BY_ID: Record<string, string> = {
	"blush-romance": "#D94674",
	"eternal-elegance": "#C9A962",
	"garden-romance": "#3F5F4E",
	"love-at-dusk": "#8A5BFF",
};

const DEFAULT_COLORS = {
	primary: "#1F2937",
	secondary: "#6B7280",
	accent: "#E5E7EB",
	background: "#FFFFFF",
	text: "#111827",
	muted: "#6B7280",
};

/** Perceived luminance (0–1) of a hex color. */
function luminance(hex: string): number {
	const h = hex.replace("#", "");
	const r = Number.parseInt(h.slice(0, 2), 16) / 255;
	const g = Number.parseInt(h.slice(2, 4), 16) / 255;
	const b = Number.parseInt(h.slice(4, 6), 16) / 255;
	return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Text color safe for a white card — dark if template text is too light. */
function cardTextColor(templateText: string): string {
	return luminance(templateText) > 0.6 ? "#1A1A1A" : templateText;
}

const DEFAULT_TYPOGRAPHY = {
	headingFont: '"Playfair Display", serif',
	bodyFont: '"Inter", sans-serif',
	accentFont: '"Dancing Script", cursive',
};

type CanvasTokens = {
	colors: typeof DEFAULT_COLORS;
	typography: typeof DEFAULT_TYPOGRAPHY;
};

function getTemplate(templateId: string): TemplateConfig {
	return (
		templates.find((template) => template.id === templateId) ?? templates[0]
	);
}

function resolveTokens(template: TemplateConfig): CanvasTokens {
	const partial = (template as Partial<TemplateConfig>).tokens;
	return {
		colors: {
			...DEFAULT_COLORS,
			...(partial?.colors ?? {}),
		},
		typography: {
			...DEFAULT_TYPOGRAPHY,
			...(partial?.typography ?? {}),
		},
	};
}

function buildDesignTokens(template: TemplateConfig): DesignTokens {
	const tokens = resolveTokens(template);
	return {
		colors: {
			primary: tokens.colors.primary,
			secondary: tokens.colors.secondary,
			accent: tokens.colors.accent,
			background: tokens.colors.background,
			text: tokens.colors.text,
			muted: tokens.colors.muted,
		},
		fonts: {
			heading: tokens.typography.headingFont,
			body: tokens.typography.bodyFont,
			accent: tokens.typography.accentFont,
		},
		spacing: 8,
	};
}

function safeText(value: unknown, fallback = ""): string {
	return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeContent(
	templateId: string,
	content: InvitationContent,
): InvitationContent {
	const sample = buildSampleContent(templateId);
	const input = content as Partial<InvitationContent>;

	return {
		...sample,
		...input,
		hero: { ...sample.hero, ...(input.hero ?? {}) },
		announcement: { ...sample.announcement, ...(input.announcement ?? {}) },
		story: { ...sample.story, ...(input.story ?? {}) },
		gallery: { ...sample.gallery, ...(input.gallery ?? {}) },
		venue: { ...sample.venue, ...(input.venue ?? {}) },
		rsvp: { ...sample.rsvp, ...(input.rsvp ?? {}) },
		footer: { ...sample.footer, ...(input.footer ?? {}) },
		countdown: { ...sample.countdown, ...(input.countdown ?? {}) },
	};
}

function firstPhoto(content: InvitationContent): string {
	return (
		safeText(content.hero.heroImageUrl) ||
		safeText(content.gallery.photos?.[0]?.url) ||
		"/placeholders/photo-light.svg"
	);
}

function storyHighlight(content: InvitationContent): string {
	const firstMilestone = content.story.milestones?.[0];
	if (!firstMilestone) return "Our story is just beginning.";
	return `${firstMilestone.date} • ${firstMilestone.title}\n${firstMilestone.description}`;
}

function toHeroNames(content: InvitationContent): string {
	return `${content.hero.partnerOneName} & ${content.hero.partnerTwoName}`;
}

function buildBlocks(
	template: TemplateConfig,
	content: InvitationContent,
): Block[] {
	const tokens = resolveTokens(template);
	const normalized = normalizeContent(template.id, content);
	const accent = TEMPLATE_ACCENT_BY_ID[template.id] ?? tokens.colors.secondary;
	const heroNames = toHeroNames(normalized);
	const heroImage = firstPhoto(normalized);
	const primary = tokens.colors.primary;
	const muted = tokens.colors.muted;

	const baseBlocks: Omit<Block, "zIndex">[] = [
		{
			id: "hero-image",
			type: "image",
			position: { x: 24, y: 24 },
			size: { width: 342, height: 208 },
			content: {
				src: heroImage,
				alt: `${heroNames} hero image`,
				objectFit: "cover",
			},
			style: {
				borderRadius: "22px",
				overflow: "hidden",
				border: `1px solid ${tokens.colors.accent}`,
			},
			animation: "fadeIn",
			sectionId: "hero",
			semantic: "hero-image",
		},
		{
			id: "hero-title",
			type: "heading",
			position: { x: 24, y: 250 },
			size: { width: 342, height: 92 },
			content: { text: heroNames, level: 1 },
			style: {
				fontFamily: tokens.typography.headingFont,
				fontSize: "42px",
				lineHeight: "1.05",
				textAlign: "center",
				color: tokens.colors.text,
			},
			animation: "fadeInUp",
			sectionId: "hero",
			semantic: "partner-name",
		},
		{
			id: "hero-tagline",
			type: "text",
			position: { x: 26, y: 352 },
			size: { width: 338, height: 68 },
			content: { text: normalized.hero.tagline },
			style: {
				fontFamily: tokens.typography.accentFont,
				fontSize: "30px",
				lineHeight: "1.1",
				textAlign: "center",
				color: accent,
			},
			animation: "fadeInUp",
			sectionId: "hero",
			semantic: "tagline",
		},
		{
			id: "hero-meta",
			type: "text",
			position: { x: 24, y: 430 },
			size: { width: 342, height: 24 },
			content: { text: `${normalized.hero.date} • ${normalized.venue.name}` },
			style: {
				fontFamily: tokens.typography.bodyFont,
				fontSize: "12px",
				letterSpacing: "0.16em",
				textTransform: "uppercase",
				textAlign: "center",
				color: muted,
			},
			sectionId: "hero",
			semantic: "event-meta",
		},
		{
			id: "divider-main",
			type: "divider",
			position: { x: 79, y: 476 },
			size: { width: 232, height: 2 },
			content: { thickness: 1, orientation: "horizontal", color: primary },
			style: { opacity: "0.4" },
			sectionId: "announcement",
		},
		{
			id: "announcement-title",
			type: "heading",
			position: { x: 24, y: 514 },
			size: { width: 342, height: 46 },
			content: { text: normalized.announcement.title, level: 2 },
			style: {
				fontFamily: tokens.typography.headingFont,
				fontSize: "34px",
				lineHeight: "1.1",
				textAlign: "center",
				color: primary,
			},
			sectionId: "announcement",
		},
		{
			id: "announcement-message",
			type: "text",
			position: { x: 34, y: 574 },
			size: { width: 322, height: 102 },
			content: { text: normalized.announcement.message },
			style: {
				fontFamily: tokens.typography.bodyFont,
				fontSize: "15px",
				lineHeight: "1.68",
				textAlign: "center",
				color: muted,
			},
			sectionId: "announcement",
			semantic: "announcement-copy",
		},
		{
			id: "announcement-formal",
			type: "text",
			position: { x: 34, y: 690 },
			size: { width: 322, height: 74 },
			content: { text: normalized.announcement.formalText },
			style: {
				fontFamily: tokens.typography.bodyFont,
				fontSize: "13px",
				lineHeight: "1.58",
				textAlign: "center",
				color: muted,
			},
			sectionId: "announcement",
		},
		{
			id: "story-highlight",
			type: "timeline",
			position: { x: 24, y: 790 },
			size: { width: 342, height: 130 },
			content: {
				items: normalized.story.milestones,
				summary: storyHighlight(normalized),
			},
			style: {
				fontFamily: tokens.typography.bodyFont,
				fontSize: "14px",
				lineHeight: "1.64",
				color: cardTextColor(tokens.colors.text),
				backgroundColor: "#ffffff",
				borderRadius: "16px",
				padding: "14px",
				border: `1px solid ${tokens.colors.accent}`,
			},
			sectionId: "story",
			semantic: "story-text",
		},
		{
			id: "gallery-strip",
			type: "gallery",
			position: { x: 24, y: 938 },
			size: { width: 342, height: 170 },
			content: {
				photos: normalized.gallery.photos,
			},
			style: {
				borderRadius: "14px",
				overflow: "hidden",
				border: `1px solid ${tokens.colors.accent}`,
			},
			sectionId: "gallery",
			semantic: "gallery",
		},
		{
			id: "countdown-block",
			type: "countdown",
			position: { x: 24, y: 1130 },
			size: { width: 342, height: 92 },
			content: {
				targetDate: normalized.countdown.targetDate || normalized.hero.date,
				label: "Countdown",
			},
			style: {
				backgroundColor: tokens.colors.accent,
				borderRadius: "14px",
				padding: "12px",
				color: primary,
				fontFamily: tokens.typography.headingFont,
				fontSize: "22px",
				textAlign: "center",
			},
			animation: "fadeInUp",
			sectionId: "countdown",
			semantic: "countdown",
		},
		{
			id: "map-block",
			type: "map",
			position: { x: 24, y: 1240 },
			size: { width: 342, height: 120 },
			content: {
				name: normalized.venue.name,
				address: normalized.venue.address,
				coordinates: normalized.venue.coordinates,
			},
			style: {
				backgroundColor: "#ffffff",
				borderRadius: "14px",
				padding: "14px",
				border: `1px solid ${tokens.colors.accent}`,
				color: cardTextColor(tokens.colors.text),
			},
			sectionId: "venue",
			semantic: "venue-map",
		},
		{
			id: "form-block",
			type: "form",
			position: { x: 24, y: 1374 },
			size: { width: 342, height: 142 },
			content: {
				title: "RSVP",
				deadline: normalized.rsvp.deadline,
				allowPlusOnes: normalized.rsvp.allowPlusOnes,
				maxPlusOnes: normalized.rsvp.maxPlusOnes,
				customMessage: normalized.rsvp.customMessage,
			},
			style: {
				backgroundColor: "#ffffff",
				borderRadius: "14px",
				padding: "14px",
				border: `1px solid ${tokens.colors.accent}`,
				color: cardTextColor(tokens.colors.text),
			},
			sectionId: "rsvp",
			semantic: "rsvp-form",
		},
		{
			id: "footer-message",
			type: "text",
			position: { x: 24, y: 1532 },
			size: { width: 342, height: 64 },
			content: { text: normalized.footer.message },
			style: {
				fontFamily: tokens.typography.accentFont,
				fontSize: "28px",
				lineHeight: "1.2",
				textAlign: "center",
				color: accent,
			},
			sectionId: "footer",
			semantic: "footer-message",
		},
	];

	return baseBlocks.map((block, zIndex) => ({
		...block,
		zIndex,
	}));
}

export function convertToCanvasDocument(
	templateId: string,
	content: InvitationContent,
): CanvasDocument {
	const template = getTemplate(templateId);
	const now = new Date().toISOString();
	const blocks = buildBlocks(template, content);

	return {
		formatVersion: "canvas-v2",
		version: "2.0",
		templateId: template.id,
		canvas: {
			width: 390,
			height: 1620,
		},
		blocksById: Object.fromEntries(blocks.map((block) => [block.id, block])),
		blockOrder: blocks.map((block) => block.id),
		designTokens: buildDesignTokens(template),
		metadata: {
			createdAt: now,
			updatedAt: now,
			templateVersion: template.version ?? "1.0",
			migratedFrom: "legacy-content",
			migratedAt: now,
			migrationToolVersion: "canvas-migrator-1",
		},
	};
}

export function convertBlushRomanceToCanvasDocument(
	content: InvitationContent,
): CanvasDocument {
	return convertToCanvasDocument("blush-romance", content);
}

export function convertTemplateToCanvasDocument(
	templateId: string,
	content: InvitationContent,
): CanvasDocument {
	return convertToCanvasDocument(templateId, content);
}
