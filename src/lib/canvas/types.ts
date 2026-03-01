import type { CSSProperties } from "react";

export type CanvasDocumentVersion = "2.0";

export type BlockType =
	| "text"
	| "image"
	| "heading"
	| "divider"
	| "map"
	| "gallery"
	| "timeline"
	| "form"
	| "countdown"
	| "group"
	| "decorative";

export type AnimationType =
	| "fadeInUp"
	| "fadeIn"
	| "slideFromLeft"
	| "slideFromRight"
	| "scaleIn"
	| "parallax"
	| "none";

export type CanvasTool = "select" | "text" | "image" | "pan";

export interface Position {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

export interface CanvasBounds extends Size {}

export interface BlockConstraints {
	minWidth?: number;
	maxWidth?: number;
	minHeight?: number;
	maxHeight?: number;
	aspectRatio?: number;
	snapToGrid?: boolean;
}

export interface DesignTokens {
	colors: Record<string, string>;
	fonts: Record<string, string>;
	spacing: number;
}

export interface Block {
	id: string;
	type: BlockType;
	position: Position;
	size: Size;
	zIndex: number;
	content: Record<string, unknown>;
	style: Record<string, string>;
	animation?: AnimationType;
	constraints?: BlockConstraints;
	children?: string[];
	parentId?: string;
	semantic?: string;
	sectionId?: string;
	locked?: boolean;
}

export interface DragState {
	pointerId: number;
	blockIds: string[];
	startPointer: Position;
	originPositions: Record<string, Position>;
}

export interface CanvasDocumentMetadata {
	createdAt: string;
	updatedAt: string;
	templateVersion: string;
	migratedFrom?: string;
	migratedAt?: string;
	migrationToolVersion?: string;
	legacy?: Record<string, unknown>;
}

export interface CanvasDocument {
	formatVersion: "canvas-v2";
	version: CanvasDocumentVersion;
	templateId: string;
	canvas: CanvasBounds;
	blocksById: Record<string, Block>;
	blockOrder: string[];
	designTokens: DesignTokens;
	metadata: CanvasDocumentMetadata;
}

/** Cast a block's string→string style record to React CSSProperties. */
export function toCssProperties(style: Record<string, string>): CSSProperties {
	const next: CSSProperties = {};
	for (const [key, value] of Object.entries(style)) {
		(next as Record<string, unknown>)[key] = value;
	}
	return next;
}

export function createEmptyCanvasDocument(
	templateId = "custom",
	templateVersion = "1.0.0",
): CanvasDocument {
	const now = new Date().toISOString();
	return {
		formatVersion: "canvas-v2",
		version: "2.0",
		templateId,
		canvas: {
			width: 390,
			height: 844,
		},
		blocksById: {},
		blockOrder: [],
		designTokens: {
			colors: {
				background: "#ffffff",
				text: "#111111",
			},
			fonts: {
				heading: "serif",
				body: "sans-serif",
			},
			spacing: 8,
		},
		metadata: {
			createdAt: now,
			updatedAt: now,
			templateVersion,
		},
	};
}
