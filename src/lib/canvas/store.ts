import { type TemporalState, temporal } from "zundo";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import {
	type Block,
	type BlockType,
	type CanvasDocument,
	type CanvasTool,
	createEmptyCanvasDocument,
	type DragState,
	type Position,
	type Size,
} from "./types";

const UNDO_LIMIT = 50;

type TemporalDocumentState = Pick<DocumentState, "document">;

export interface AddBlockOptions {
	id?: string;
	size?: Size;
	style?: Record<string, string>;
	semantic?: string;
	sectionId?: string;
	parentId?: string;
	locked?: boolean;
}

export interface DocumentState {
	document: CanvasDocument;
	selectedBlockIds: string[];
	hoveredBlockId: string | null;
	activeTool: CanvasTool;
	dragState: DragState | null;
	editingBlockId: string | null;
	setDocument: (document: CanvasDocument) => void;
	updateBlock: (blockId: string, patch: Partial<Block>) => void;
	moveBlock: (blockId: string, position: Position) => void;
	resizeBlock: (blockId: string, size: Size) => void;
	addBlock: (
		type: BlockType,
		position: Position,
		content?: Record<string, unknown>,
		options?: AddBlockOptions,
	) => void;
	removeBlock: (blockId: string) => void;
	reorderBlocks: (blockIds: string[]) => void;
	updateContent: (blockId: string, content: Record<string, unknown>) => void;
	restyleBlock: (blockId: string, style: Record<string, string>) => void;
	updateDesignToken: (
		section: "colors" | "fonts",
		key: string,
		value: string,
	) => void;
	setGridSpacing: (spacing: number) => void;
	selectBlock: (blockId: string, additive?: boolean) => void;
	clearSelection: () => void;
	setHoveredBlock: (blockId: string | null) => void;
	setActiveTool: (tool: CanvasTool) => void;
	startDrag: (dragState: DragState) => void;
	endDrag: () => void;
	startEditing: (blockId: string) => void;
	stopEditing: () => void;
}

export type DocumentStore = UseBoundStore<
	StoreApi<DocumentState> & {
		temporal: StoreApi<TemporalState<TemporalDocumentState>>;
	}
>;

function nowIso(): string {
	return new Date().toISOString();
}

function createBlockId(type: BlockType): string {
	const suffix = Math.random().toString(36).slice(2, 8);
	return `${type}-${Date.now().toString(36)}-${suffix}`;
}

function createDefaultSize(type: BlockType): Size {
	if (type === "image") {
		return { width: 280, height: 180 };
	}
	if (type === "heading") {
		return { width: 320, height: 56 };
	}
	if (type === "divider") {
		return { width: 320, height: 2 };
	}
	return { width: 320, height: 44 };
}

function reindexZOrder(document: CanvasDocument): CanvasDocument {
	const nextBlocksById = { ...document.blocksById };
	document.blockOrder.forEach((id, index) => {
		const block = nextBlocksById[id];
		if (!block || block.zIndex === index) return;
		nextBlocksById[id] = {
			...block,
			zIndex: index,
		};
	});
	return {
		...document,
		blocksById: nextBlocksById,
	};
}

function withUpdatedAt(document: CanvasDocument): CanvasDocument {
	return {
		...document,
		metadata: {
			...document.metadata,
			updatedAt: nowIso(),
		},
	};
}

function hasBlock(document: CanvasDocument, blockId: string): boolean {
	return blockId in document.blocksById;
}

export function createDocumentStore(
	initialDocument: CanvasDocument = createEmptyCanvasDocument(),
): DocumentStore {
	return create<DocumentState>()(
		subscribeWithSelector(
			temporal(
				(set, get) => ({
					document: initialDocument,
					selectedBlockIds: [],
					hoveredBlockId: null,
					activeTool: "select",
					dragState: null,
					editingBlockId: null,
					setDocument: (document) => {
						set((state) => ({
							...state,
							document,
							selectedBlockIds: state.selectedBlockIds.filter((id) =>
								hasBlock(document, id),
							),
							hoveredBlockId:
								state.hoveredBlockId && hasBlock(document, state.hoveredBlockId)
									? state.hoveredBlockId
									: null,
							editingBlockId:
								state.editingBlockId && hasBlock(document, state.editingBlockId)
									? state.editingBlockId
									: null,
							dragState: null,
						}));
					},
					updateBlock: (blockId, patch) => {
						set((state) => {
							const current = state.document.blocksById[blockId];
							if (!current) return state;
							const nextBlock: Block = {
								...current,
								...patch,
								content: patch.content
									? { ...current.content, ...patch.content }
									: current.content,
								style: patch.style
									? { ...current.style, ...patch.style }
									: current.style,
							};
							const nextDocument = withUpdatedAt({
								...state.document,
								blocksById: {
									...state.document.blocksById,
									[blockId]: nextBlock,
								},
							});
							return {
								...state,
								document: nextDocument,
							};
						});
					},
					moveBlock: (blockId, position) => {
						get().updateBlock(blockId, { position });
					},
					resizeBlock: (blockId, size) => {
						get().updateBlock(blockId, { size });
					},
					addBlock: (type, position, content = {}, options) => {
						set((state) => {
							const id = options?.id ?? createBlockId(type);
							if (state.document.blocksById[id]) return state;
							const nextBlock: Block = {
								id,
								type,
								position,
								size: options?.size ?? createDefaultSize(type),
								zIndex: state.document.blockOrder.length,
								content,
								style: options?.style ?? {},
								sectionId: options?.sectionId,
								semantic: options?.semantic,
								parentId: options?.parentId,
								locked: options?.locked ?? false,
							};
							const nextDocument = withUpdatedAt(
								reindexZOrder({
									...state.document,
									blocksById: {
										...state.document.blocksById,
										[id]: nextBlock,
									},
									blockOrder: [...state.document.blockOrder, id],
								}),
							);
							return {
								...state,
								document: nextDocument,
							};
						});
					},
					removeBlock: (blockId) => {
						set((state) => {
							if (!state.document.blocksById[blockId]) return state;
							const nextBlocksById: Record<string, Block> = {};
							for (const [id, block] of Object.entries(
								state.document.blocksById,
							)) {
								if (id === blockId) continue;
								const nextChildren = block.children?.filter(
									(childId) => childId !== blockId,
								);
								const nextParentId =
									block.parentId === blockId ? undefined : block.parentId;
								nextBlocksById[id] = {
									...block,
									children: nextChildren?.length ? nextChildren : undefined,
									parentId: nextParentId,
								};
							}
							const nextDocument = withUpdatedAt(
								reindexZOrder({
									...state.document,
									blocksById: nextBlocksById,
									blockOrder: state.document.blockOrder.filter(
										(id) => id !== blockId,
									),
								}),
							);
							return {
								...state,
								document: nextDocument,
								selectedBlockIds: state.selectedBlockIds.filter(
									(id) => id !== blockId,
								),
								hoveredBlockId:
									state.hoveredBlockId === blockId
										? null
										: state.hoveredBlockId,
								editingBlockId:
									state.editingBlockId === blockId
										? null
										: state.editingBlockId,
							};
						});
					},
					reorderBlocks: (blockIds) => {
						set((state) => {
							const validOrder = blockIds.filter((id) =>
								hasBlock(state.document, id),
							);
							const remaining = state.document.blockOrder.filter(
								(id) => !validOrder.includes(id),
							);
							const nextOrder = [...validOrder, ...remaining];
							if (nextOrder.length === 0) return state;
							const nextDocument = withUpdatedAt(
								reindexZOrder({
									...state.document,
									blockOrder: nextOrder,
								}),
							);
							return {
								...state,
								document: nextDocument,
							};
						});
					},
					updateContent: (blockId, content) => {
						get().updateBlock(blockId, { content });
					},
					restyleBlock: (blockId, style) => {
						get().updateBlock(blockId, { style });
					},
					updateDesignToken: (section, key, value) => {
						set((state) => {
							const sectionTokens = state.document.designTokens[section];
							const nextDocument = withUpdatedAt({
								...state.document,
								designTokens: {
									...state.document.designTokens,
									[section]: {
										...sectionTokens,
										[key]: value,
									},
								},
							});
							return {
								...state,
								document: nextDocument,
							};
						});
					},
					setGridSpacing: (spacing) => {
						set((state) => {
							const nextDocument = withUpdatedAt({
								...state.document,
								designTokens: {
									...state.document.designTokens,
									spacing,
								},
							});
							return {
								...state,
								document: nextDocument,
							};
						});
					},
					selectBlock: (blockId, additive = false) => {
						set((state) => {
							if (!hasBlock(state.document, blockId)) return state;
							if (!additive) {
								return {
									...state,
									selectedBlockIds: [blockId],
								};
							}
							if (state.selectedBlockIds.includes(blockId)) {
								return {
									...state,
									selectedBlockIds: state.selectedBlockIds.filter(
										(id) => id !== blockId,
									),
								};
							}
							return {
								...state,
								selectedBlockIds: [...state.selectedBlockIds, blockId],
							};
						});
					},
					clearSelection: () => {
						set((state) => ({
							...state,
							selectedBlockIds: [],
						}));
					},
					setHoveredBlock: (blockId) => {
						set((state) => ({
							...state,
							hoveredBlockId:
								blockId && !hasBlock(state.document, blockId) ? null : blockId,
						}));
					},
					setActiveTool: (tool) => {
						set((state) => ({
							...state,
							activeTool: tool,
						}));
					},
					startDrag: (dragState) => {
						set((state) => ({
							...state,
							dragState,
						}));
					},
					endDrag: () => {
						set((state) => ({
							...state,
							dragState: null,
						}));
					},
					startEditing: (blockId) => {
						set((state) => ({
							...state,
							editingBlockId:
								blockId && hasBlock(state.document, blockId) ? blockId : null,
						}));
					},
					stopEditing: () => {
						set((state) => ({
							...state,
							editingBlockId: null,
						}));
					},
				}),
				{
					partialize: (state) => ({ document: state.document }),
					equality: shallow,
					limit: UNDO_LIMIT,
				},
			),
		),
	);
}

export const useDocumentStore = createDocumentStore();
