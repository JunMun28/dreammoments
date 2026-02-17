import { z } from "zod";
import type { CanvasDocument } from "./types";

const PositionSchema = z.object({
	x: z.number(),
	y: z.number(),
});

const SizeSchema = z.object({
	width: z.number().positive(),
	height: z.number().positive(),
});

const BlockSchema = z.object({
	id: z.string().min(1),
	type: z.enum([
		"text",
		"image",
		"heading",
		"divider",
		"map",
		"gallery",
		"timeline",
		"form",
		"countdown",
		"group",
		"decorative",
	]),
	position: PositionSchema,
	size: SizeSchema,
	zIndex: z.number().int().nonnegative(),
	content: z.record(z.string(), z.unknown()),
	style: z.record(z.string(), z.string()),
	animation: z
		.enum([
			"fadeInUp",
			"fadeIn",
			"slideFromLeft",
			"slideFromRight",
			"scaleIn",
			"parallax",
			"none",
		])
		.optional(),
	constraints: z
		.object({
			minWidth: z.number().optional(),
			maxWidth: z.number().optional(),
			minHeight: z.number().optional(),
			maxHeight: z.number().optional(),
			aspectRatio: z.number().optional(),
			snapToGrid: z.boolean().optional(),
		})
		.optional(),
	children: z.array(z.string()).optional(),
	parentId: z.string().optional(),
	semantic: z.string().optional(),
	sectionId: z.string().optional(),
	locked: z.boolean().optional(),
});

export const CanvasDocumentSchema = z.object({
	formatVersion: z.literal("canvas-v2").optional().default("canvas-v2"),
	version: z.literal("2.0"),
	templateId: z.string().min(1),
	canvas: SizeSchema,
	blocksById: z.record(z.string(), BlockSchema),
	blockOrder: z.array(z.string()),
	designTokens: z.object({
		colors: z.record(z.string(), z.string()),
		fonts: z.record(z.string(), z.string()),
		spacing: z.number().positive(),
	}),
	metadata: z.object({
		createdAt: z.string().min(1),
		updatedAt: z.string().min(1),
		templateVersion: z.string().min(1),
		migratedFrom: z.string().optional(),
		migratedAt: z.string().optional(),
		migrationToolVersion: z.string().optional(),
		legacy: z.record(z.string(), z.unknown()).optional(),
	}),
});

export function parseCanvasDocument(
	value: unknown,
): { ok: true; data: CanvasDocument } | { ok: false; issues: string[] } {
	const parsed = CanvasDocumentSchema.safeParse(value);
	if (parsed.success) {
		return { ok: true, data: parsed.data as CanvasDocument };
	}
	return {
		ok: false,
		issues: parsed.error.issues.map((issue) => issue.message),
	};
}
