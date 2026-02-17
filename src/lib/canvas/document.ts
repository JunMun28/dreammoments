import { buildSampleContent } from "@/data/sample-invitation";
import type { InvitationContent } from "@/lib/types";
import { parseCanvasDocument } from "./schema";
import type { Block, CanvasDocument } from "./types";

export interface InvitationSummary {
	title: string;
	slugBase: string;
	date: string;
	tagline: string;
}

function toText(value: unknown): string {
	return typeof value === "string" ? value : "";
}

function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function findBlockBySemantic(
	document: CanvasDocument,
	semantic: string,
): Block | undefined {
	return document.blockOrder
		.map((id) => document.blocksById[id])
		.find((block) => block?.semantic === semantic);
}

function findTextBlock(document: CanvasDocument): Block | undefined {
	return document.blockOrder
		.map((id) => document.blocksById[id])
		.find(
			(block) => block && (block.type === "text" || block.type === "heading"),
		);
}

export function isCanvasDocument(value: unknown): value is CanvasDocument {
	if (!value || typeof value !== "object") return false;
	if (!("version" in value)) return false;
	return (value as { version?: unknown }).version === "2.0";
}

export function asCanvasDocument(value: unknown): CanvasDocument | null {
	const parsed = parseCanvasDocument(value);
	return parsed.ok ? parsed.data : null;
}

export function summarizeCanvasDocument(
	document: CanvasDocument,
): InvitationSummary {
	const partner = findBlockBySemantic(document, "partner-name");
	const tagline = findBlockBySemantic(document, "tagline");
	const meta = findBlockBySemantic(document, "event-meta");
	const firstText = findTextBlock(document);
	const partnerText = toText(partner?.content.text);
	const title =
		partnerText || toText(firstText?.content.text) || "Wedding Invitation";
	const date = toText(meta?.content.text).split("•")[0]?.trim() || "";
	const taglineText = toText(tagline?.content.text);
	const slugBase = slugify(
		title.includes("&") ? title.replace("&", "-and-") : title,
	);
	return {
		title,
		slugBase: slugBase || "wedding-invitation",
		date,
		tagline: taglineText,
	};
}

export function summarizeInvitationContent(
	content: unknown,
): InvitationSummary {
	if (isCanvasDocument(content)) {
		return summarizeCanvasDocument(content);
	}

	const legacy = content as Partial<InvitationContent>;
	const partnerOne = legacy.hero?.partnerOneName?.trim() || "Partner One";
	const partnerTwo = legacy.hero?.partnerTwoName?.trim() || "Partner Two";
	const title = `${partnerOne} & ${partnerTwo}`;
	const slugBase =
		slugify(`${partnerOne}-${partnerTwo}`) || "wedding-invitation";
	return {
		title,
		slugBase,
		date: legacy.hero?.date ?? "",
		tagline: legacy.hero?.tagline ?? "",
	};
}

export function toLegacyInvitationContent(
	content: unknown,
	templateId: string,
): InvitationContent {
	if (!isCanvasDocument(content)) {
		return content as InvitationContent;
	}

	const base = buildSampleContent(templateId);
	const summary = summarizeCanvasDocument(content);
	base.hero.partnerOneName =
		summary.title.split("&")[0]?.trim() || "Partner One";
	base.hero.partnerTwoName =
		summary.title.split("&")[1]?.trim() || "Partner Two";
	base.hero.tagline = summary.tagline || base.hero.tagline;
	base.hero.date = summary.date || base.hero.date;
	return base;
}
