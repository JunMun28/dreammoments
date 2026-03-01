import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { publishInvitationFn } from "@/api/invitations";
import { createDocumentStore } from "@/lib/canvas/store";
import type { Block, CanvasDocument, Position, Size } from "@/lib/canvas/types";
import { publishInvitation, updateInvitation } from "@/lib/data";
import { cn } from "@/lib/utils";
import { AiContextPopover } from "./AiContextPopover";
import { AlignmentGuides } from "./AlignmentGuides";
import { BlockInspectorSidebar } from "./BlockInspectorSidebar";
import { BlockRenderer } from "./BlockRenderer";
import { BlockToolbar } from "./BlockToolbar";
import { CanvasListView } from "./CanvasListView";
import { buildCanvasSections, CanvasSectionRail } from "./CanvasSectionRail";
import { CanvasToolbar } from "./CanvasToolbar";
import { CanvasZoomControls } from "./CanvasZoomControls";
import { useCanvasAutoSave } from "./hooks/useCanvasAutoSave";
import { useCanvasKeyboard } from "./hooks/useCanvasKeyboard";
import { useCanvasZoom } from "./hooks/useCanvasZoom";
import { useDragBlock } from "./hooks/useDragBlock";
import { useResizeBlock } from "./hooks/useResizeBlock";
import { type GuideLine, useSnapGuides } from "./hooks/useSnapGuides";
import { InlineTextEditor } from "./InlineTextEditor";
import { MobileCanvasFab, MobileCanvasSheet } from "./MobileCanvasSheet";
import { SelectionOverlay } from "./SelectionOverlay";

const TOKEN_KEY = "dm-auth-token";

type PositionMap = Record<string, Position>;
type SizeMap = Record<string, Size>;

function nextBlockPosition(orderLength: number): Position {
	const row = orderLength % 6;
	return {
		x: 24,
		y: 80 + row * 72,
	};
}

function copyBlock(block: Block, newId: string): Block {
	return {
		...block,
		id: newId,
		position: {
			x: block.position.x + 10,
			y: block.position.y + 10,
		},
	};
}

function makeCloneId(blockId: string): string {
	return `${blockId}-copy-${Date.now().toString(36).slice(-4)}`;
}

function resolveAnimationStyle(
	animation: Block["animation"] | undefined,
	enabled: boolean,
): React.CSSProperties {
	if (!enabled || !animation || animation === "none") return {};
	if (animation === "fadeInUp") {
		return { animation: "dm-canvas-fade-in-up 520ms ease both" };
	}
	if (animation === "fadeIn") {
		return { animation: "dm-canvas-fade-in 480ms ease both" };
	}
	if (animation === "slideFromLeft") {
		return { animation: "dm-canvas-slide-left 520ms ease both" };
	}
	if (animation === "slideFromRight") {
		return { animation: "dm-canvas-slide-right 520ms ease both" };
	}
	if (animation === "scaleIn") {
		return { animation: "dm-canvas-scale-in 480ms ease both" };
	}
	if (animation === "parallax") {
		return { animation: "dm-canvas-parallax 2600ms ease-in-out infinite" };
	}
	return {};
}

function CanvasBlockNode({
	block,
	canvasRef,
	selected,
	previewPosition,
	previewSize,
	onSelect,
	onDoubleClick,
	onDelete,
	onDuplicate,
	onLockToggle,
	onBringToFront,
	onSendToBack,
	onAiClick,
	onMoveCommit,
	onResizeCommit,
	onPreviewMove,
	onPreviewResize,
	onClearGuides,
	snapPosition,
	showAi,
	onAiApply,
	onAiClose,
	editing,
	onInlineCommit,
	onInlineCancel,
	animationsEnabled,
}: {
	block: Block;
	canvasRef: React.RefObject<HTMLDivElement | null>;
	selected: boolean;
	previewPosition?: Position;
	previewSize?: Size;
	onSelect: (additive: boolean) => void;
	onDoubleClick: () => void;
	onDelete: () => void;
	onDuplicate: () => void;
	onLockToggle: () => void;
	onBringToFront: () => void;
	onSendToBack: () => void;
	onAiClick: () => void;
	onMoveCommit: (position: Position) => void;
	onResizeCommit: (size: Size) => void;
	onPreviewMove: (position: Position, guides: GuideLine[]) => void;
	onPreviewResize: (size: Size) => void;
	onClearGuides: () => void;
	snapPosition: (params: {
		position: Position;
		size: Size;
		disableSnap: boolean;
	}) => { position: Position; guides: GuideLine[] };
	showAi: boolean;
	onAiApply: (patch: Partial<Block>) => void;
	onAiClose: () => void;
	editing: boolean;
	onInlineCommit: (text: string) => void;
	onInlineCancel: () => void;
	animationsEnabled: boolean;
}) {
	const position = previewPosition ?? block.position;
	const size = previewSize ?? block.size;
	const livePositionRef = useRef(position);
	const liveSizeRef = useRef(size);

	useEffect(() => {
		livePositionRef.current = position;
	}, [position]);
	useEffect(() => {
		liveSizeRef.current = size;
	}, [size]);

	const drag = useDragBlock({
		blockId: block.id,
		canvasRef,
		getOrigin: () => livePositionRef.current,
		getSize: () => liveSizeRef.current,
		snapPosition,
		onPreview: (nextPosition, guides) => {
			livePositionRef.current = nextPosition;
			onPreviewMove(nextPosition, guides);
		},
		onCommit: ({ position: nextPosition }) => {
			onMoveCommit(nextPosition);
			onClearGuides();
		},
	});

	const resize = useResizeBlock({
		getSize: () => liveSizeRef.current,
		onPreview: (nextSize) => {
			liveSizeRef.current = nextSize;
			onPreviewResize(nextSize);
		},
		onCommit: (nextSize) => {
			onResizeCommit(nextSize);
		},
	});

	return (
		<div
			className={cn(
				"absolute rounded-[inherit] transition-shadow",
				selected ? "z-30 shadow-[0_0_0_2px_rgba(196,114,127,0.25)]" : "z-10",
				block.locked ? "opacity-80" : "cursor-move",
			)}
			style={{
				width: size.width,
				height: size.height,
				transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
				willChange: selected ? "transform" : "auto",
				contain: "layout style",
				...block.style,
				...resolveAnimationStyle(block.animation, animationsEnabled),
			}}
			data-canvas-block-id={block.id}
			data-canvas-block-type={block.type}
			role="button"
			aria-label={`Canvas block ${block.type}`}
			tabIndex={0}
			onClick={(event) => onSelect(event.shiftKey)}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onSelect(event.shiftKey);
				}
			}}
			onDoubleClick={onDoubleClick}
			onPointerDown={drag.onPointerDown}
			onPointerMove={drag.onPointerMove}
			onPointerUp={drag.onPointerUp}
			onPointerCancel={drag.onPointerCancel}
		>
			<BlockRenderer block={block} />
			{editing ? (
				<InlineTextEditor
					block={block}
					singleLine={block.type === "heading"}
					onCommit={onInlineCommit}
					onCancel={onInlineCancel}
				/>
			) : null}
			{selected ? (
				<>
					<SelectionOverlay
						onResizePointerDown={resize.onPointerDown}
						onResizePointerMove={resize.onPointerMove}
						onResizePointerUp={resize.onPointerUp}
						onResizePointerCancel={resize.onPointerCancel}
					/>
					<BlockToolbar
						locked={Boolean(block.locked)}
						onDelete={onDelete}
						onDuplicate={onDuplicate}
						onLockToggle={onLockToggle}
						onBringToFront={onBringToFront}
						onSendToBack={onSendToBack}
						onAiClick={onAiClick}
					/>
					{showAi ? (
						<AiContextPopover
							block={block}
							onApply={(patch) => onAiApply(patch)}
							onClose={onAiClose}
						/>
					) : null}
				</>
			) : null}
		</div>
	);
}

export function CanvasEditor({
	invitationId,
	title,
	initialDocument,
	previewSlug,
}: {
	invitationId: string;
	title: string;
	initialDocument: CanvasDocument;
	previewSlug: string;
}) {
	const canvasRef = useRef<HTMLDivElement | null>(null);
	const storeRef = useRef<ReturnType<typeof createDocumentStore> | null>(null);
	const storeInvitationIdRef = useRef<string | null>(null);
	if (!storeRef.current || storeInvitationIdRef.current !== invitationId) {
		storeRef.current = createDocumentStore(initialDocument);
		storeInvitationIdRef.current = invitationId;
	}
	const store = storeRef.current;
	const document = store((state) => state.document);
	const selectedBlockIds = store((state) => state.selectedBlockIds);
	const editingBlockId = store((state) => state.editingBlockId);
	const { calculateSnap } = useSnapGuides({
		grid: document.designTokens.spacing || 8,
	});
	const [guides, setGuides] = useState<GuideLine[]>([]);
	const [previewPositions, setPreviewPositions] = useState<PositionMap>({});
	const [previewSizes, setPreviewSizes] = useState<SizeMap>({});
	const [showListView, setShowListView] = useState(false);
	const [aiBlockId, setAiBlockId] = useState<string | null>(null);
	const [animationsEnabled, setAnimationsEnabled] = useState(() => {
		if (
			typeof window === "undefined" ||
			typeof window.matchMedia !== "function"
		)
			return true;
		return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	});
	const [activeSectionId, setActiveSectionId] = useState<string>("");
	const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
	const initialRenderRef = useRef(true);
	const zoom = useCanvasZoom();
	const save = useCanvasAutoSave({ invitationId, document });
	const documentUpdatedAt = document.metadata.updatedAt;

	const blocks = useMemo(
		() =>
			document.blockOrder.map((id) => document.blocksById[id]).filter(Boolean),
		[document],
	);
	const selectedBlocks = useMemo(
		() =>
			selectedBlockIds
				.map((blockId) => document.blocksById[blockId])
				.filter(Boolean),
		[selectedBlockIds, document],
	);
	const sections = useMemo(() => buildCanvasSections(document), [document]);

	useEffect(() => {
		void documentUpdatedAt;
		if (initialRenderRef.current) {
			initialRenderRef.current = false;
			return;
		}
		save.markDirty();
	}, [documentUpdatedAt, save]);

	useEffect(() => {
		if (sections.length === 0) {
			if (activeSectionId !== "") setActiveSectionId("");
			return;
		}
		if (sections.some((section) => section.id === activeSectionId)) return;
		setActiveSectionId(sections[0]?.id ?? "");
	}, [sections, activeSectionId]);

	useEffect(() => {
		const firstSelected = selectedBlocks[0];
		if (!firstSelected) return;
		const section = sections.find(
			(item) =>
				item.blockId === firstSelected.id ||
				item.id === firstSelected.sectionId ||
				firstSelected.semantic?.startsWith(`${item.id}-`),
		);
		if (!section) return;
		if (section.id === activeSectionId) return;
		setActiveSectionId(section.id);
	}, [selectedBlocks, sections, activeSectionId]);

	useEffect(() => {
		const el = canvasRef.current;
		if (!el) return;
		const handler = zoom.handleWheel;
		el.addEventListener("wheel", handler, { passive: false });
		return () => el.removeEventListener("wheel", handler);
	}, [zoom.handleWheel]);

	// Warn before leaving with unsaved changes
	useEffect(() => {
		if (save.status !== "unsaved" && save.status !== "saving") return;
		const handler = (e: BeforeUnloadEvent) => {
			e.preventDefault();
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [save.status]);

	const handleZoomIn = useCallback(
		() => zoom.zoomTo(zoom.camera.z * 1.25),
		[zoom],
	);
	const handleZoomOut = useCallback(
		() => zoom.zoomTo(zoom.camera.z / 1.25),
		[zoom],
	);
	const handleZoomReset = useCallback(() => zoom.resetZoom(), [zoom]);
	const handleZoomFit = useCallback(() => {
		const el = canvasRef.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		zoom.fitContent(
			document.canvas.width,
			document.canvas.height,
			rect.width,
			rect.height,
		);
	}, [zoom, document.canvas.width, document.canvas.height]);

	const getPosition = (blockId: string): Position | null =>
		store.getState().document.blocksById[blockId]?.position ?? null;

	const moveBlock = (blockId: string, position: Position) => {
		store.getState().moveBlock(blockId, position);
		setPreviewPositions((prev) => {
			if (!(blockId in prev)) return prev;
			const next = { ...prev };
			delete next[blockId];
			return next;
		});
	};

	const resizeBlock = (blockId: string, size: Size) => {
		store.getState().resizeBlock(blockId, size);
		setPreviewSizes((prev) => {
			if (!(blockId in prev)) return prev;
			const next = { ...prev };
			delete next[blockId];
			return next;
		});
	};

	useCanvasKeyboard({
		selectedBlockIds,
		getPosition,
		onMove: moveBlock,
		onDelete: (blockId) => store.getState().removeBlock(blockId),
		onUndo: () => store.temporal.getState().undo(),
		onRedo: () => store.temporal.getState().redo(),
		onEscape: () => {
			store.getState().clearSelection();
			store.getState().stopEditing();
			setAiBlockId(null);
		},
		onSelectAll: () => {
			const ids = store.getState().document.blockOrder;
			if (ids.length === 0) return;
			store.setState((state) => ({
				...state,
				selectedBlockIds: ids,
			}));
		},
	});

	const canUndo = store.temporal.getState().pastStates.length > 0;
	const canRedo = store.temporal.getState().futureStates.length > 0;

	const handleAddBlock = (type: Block["type"]) => {
		const position = nextBlockPosition(document.blockOrder.length);
		const content =
			type === "text"
				? { text: "New text block" }
				: type === "heading"
					? { text: "New heading", level: 2 }
					: type === "image"
						? { src: "", alt: "Image block" }
						: type === "decorative"
							? { color: document.designTokens.colors.primary || "#e8a098" }
							: {};
		store.getState().addBlock(type, position, content);
	};

	const handlePublish = () => {
		void (async () => {
			const token = (() => {
				if (typeof window === "undefined") return null;
				const storage = window.localStorage as
					| {
							getItem?: (key: string) => string | null;
					  }
					| Record<string, unknown>;
				if (
					storage &&
					typeof (storage as { getItem?: unknown }).getItem === "function"
				) {
					return (
						(storage as { getItem: (key: string) => string | null }).getItem(
							TOKEN_KEY,
						) ?? null
					);
				}
				const fallback = (storage as Record<string, unknown>)[TOKEN_KEY];
				return typeof fallback === "string" ? fallback : null;
			})();
			if (!token) {
				publishInvitation(invitationId);
				return;
			}

			try {
				const result = await publishInvitationFn({
					data: { invitationId, token },
				});
				if (result && typeof result === "object" && "error" in result) {
					publishInvitation(invitationId);
					return;
				}

				const published =
					result && typeof result === "object"
						? (result as {
								slug?: string;
								publishedAt?: string;
								templateVersion?: string;
								templateSnapshot?: Record<string, unknown>;
							})
						: null;
				const patch: {
					status: "published";
					slug?: string;
					publishedAt?: string;
					templateVersion?: string;
					templateSnapshot?: Record<string, unknown>;
				} = {
					status: "published",
				};
				if (published?.slug) patch.slug = published.slug;
				if (published?.publishedAt) patch.publishedAt = published.publishedAt;
				if (published?.templateVersion) {
					patch.templateVersion = published.templateVersion;
				}
				if (published?.templateSnapshot) {
					patch.templateSnapshot = published.templateSnapshot;
				}
				updateInvitation(invitationId, patch);
			} catch {
				publishInvitation(invitationId);
			}
		})();
	};

	const applyAiPatch = (blockId: string, patch: Partial<Block>) => {
		store.getState().updateBlock(blockId, patch);
		setAiBlockId(null);
	};

	const updateTextContent = (blockId: string, text: string) => {
		const block = store.getState().document.blocksById[blockId];
		if (!block) return;
		store.getState().updateContent(blockId, {
			...block.content,
			text,
		});
		store.getState().stopEditing();
	};

	const duplicateBlock = (blockId: string) => {
		const block = store.getState().document.blocksById[blockId];
		if (!block) return;
		const clone = copyBlock(block, makeCloneId(block.id));
		store.getState().addBlock(clone.type, clone.position, clone.content, {
			id: clone.id,
			size: clone.size,
			style: clone.style,
			semantic: clone.semantic,
			sectionId: clone.sectionId,
			parentId: clone.parentId,
			locked: clone.locked,
		});
	};

	const updateBlockContentPatch = (
		blockId: string,
		contentPatch: Record<string, unknown>,
	) => {
		const current = store.getState().document.blocksById[blockId];
		if (!current) return;
		store.getState().updateContent(blockId, {
			...current.content,
			...contentPatch,
		});
	};

	const toggleBlockLock = (blockId: string) => {
		const block = store.getState().document.blocksById[blockId];
		if (!block) return;
		store.getState().updateBlock(block.id, { locked: !block.locked });
	};

	const handleSectionSelect = (section: { id: string; blockId: string }) => {
		setActiveSectionId(section.id);
		store.getState().selectBlock(section.blockId);
		setAiBlockId(null);
		const canvas = canvasRef.current;
		if (!canvas) return;
		const target = canvas.querySelector<HTMLElement>(
			`[data-canvas-block-id="${section.blockId}"]`,
		);
		if (!target) return;
		target.scrollIntoView({ block: "center", behavior: "smooth" });
	};

	return (
		<div className="min-h-screen bg-[color:var(--dm-bg)]">
			<CanvasToolbar
				title={title}
				canUndo={canUndo}
				canRedo={canRedo}
				onUndo={() => store.temporal.getState().undo()}
				onRedo={() => store.temporal.getState().redo()}
				saveStatus={save.status}
				onAddBlock={handleAddBlock}
				onToggleListView={() => setShowListView((prev) => !prev)}
				listView={showListView}
				animationsEnabled={animationsEnabled}
				onToggleAnimations={() => setAnimationsEnabled((prev) => !prev)}
				onPreview={() => window.open(`/invite/${previewSlug}`, "_blank")}
				onPublish={handlePublish}
			/>

			<div className="mx-auto w-full max-w-[1440px] px-2 pb-24 pt-2 lg:grid lg:grid-cols-[190px_minmax(0,1fr)_360px] lg:gap-2 lg:pb-2">
				<aside className="hidden rounded-lg border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] lg:block">
					<div className="border-b border-[color:var(--dm-border)] px-3 py-2">
						<p className="text-[11px] font-medium text-[color:var(--dm-ink-muted)]">
							Sections
						</p>
					</div>
					<CanvasSectionRail
						sections={sections}
						activeSectionId={activeSectionId}
						onSectionSelect={handleSectionSelect}
					/>
				</aside>

				<div className="min-w-0">
					{showListView ? (
						<CanvasListView
							document={document}
							selectedBlockIds={selectedBlockIds}
							onSelect={(blockId) => store.getState().selectBlock(blockId)}
						/>
					) : (
						<div className="flex justify-center rounded-lg dm-canvas-grid">
							<div
								ref={canvasRef}
								className="relative h-[calc(100svh-120px)] overflow-auto bg-[color:var(--dm-surface)]"
								role="region"
								aria-label="Invitation canvas"
								style={{
									width: document.canvas.width,
									backgroundColor:
										document.designTokens.colors.background ||
										"var(--dm-surface)",
								}}
								onClick={(event) => {
									if (event.target === event.currentTarget) {
										store.getState().clearSelection();
										setAiBlockId(null);
										store.getState().stopEditing();
									}
								}}
								onKeyDown={(event) => {
									if (event.key === "Escape") {
										store.getState().clearSelection();
										setAiBlockId(null);
										store.getState().stopEditing();
									}
								}}
							>
								<div
									style={{
										transform: `translate(${zoom.camera.x}px, ${zoom.camera.y}px) scale(${zoom.camera.z})`,
										transformOrigin: "0 0",
										width: document.canvas.width,
										minHeight: document.canvas.height,
									}}
								>
									{blocks.map((block) => (
										<CanvasBlockNode
											key={block.id}
											block={block}
											canvasRef={canvasRef}
											selected={selectedBlockIds.includes(block.id)}
											previewPosition={previewPositions[block.id]}
											previewSize={previewSizes[block.id]}
											onSelect={(additive) =>
												store.getState().selectBlock(block.id, additive)
											}
											onDoubleClick={() => {
												if (block.type === "text" || block.type === "heading") {
													store.getState().startEditing(block.id);
												}
											}}
											onDelete={() => store.getState().removeBlock(block.id)}
											onDuplicate={() => duplicateBlock(block.id)}
											onLockToggle={() => toggleBlockLock(block.id)}
											onBringToFront={() => {
												const order = [...store.getState().document.blockOrder];
												const index = order.indexOf(block.id);
												if (index < 0 || index === order.length - 1) return;
												order.splice(index, 1);
												order.push(block.id);
												store.getState().reorderBlocks(order);
											}}
											onSendToBack={() => {
												const order = [...store.getState().document.blockOrder];
												const index = order.indexOf(block.id);
												if (index <= 0) return;
												order.splice(index, 1);
												order.unshift(block.id);
												store.getState().reorderBlocks(order);
											}}
											onAiClick={() =>
												setAiBlockId((current) =>
													current === block.id ? null : block.id,
												)
											}
											onMoveCommit={(position) => moveBlock(block.id, position)}
											onResizeCommit={(size) => resizeBlock(block.id, size)}
											onPreviewMove={(position, nextGuides) => {
												setPreviewPositions((prev) => ({
													...prev,
													[block.id]: position,
												}));
												setGuides(nextGuides);
											}}
											onPreviewResize={(size) =>
												setPreviewSizes((prev) => ({
													...prev,
													[block.id]: size,
												}))
											}
											onClearGuides={() => setGuides([])}
											snapPosition={({ position, size, disableSnap }) =>
												calculateSnap({
													position,
													size,
													activeBlockId: block.id,
													blocks,
													disableSnap,
												})
											}
											showAi={aiBlockId === block.id}
											onAiApply={(patch) => applyAiPatch(block.id, patch)}
											onAiClose={() => setAiBlockId(null)}
											editing={editingBlockId === block.id}
											onInlineCommit={(text) =>
												updateTextContent(block.id, text)
											}
											onInlineCancel={() => store.getState().stopEditing()}
											animationsEnabled={animationsEnabled}
										/>
									))}
									<AlignmentGuides
										guides={guides}
										canvasWidth={document.canvas.width}
										canvasHeight={document.canvas.height}
									/>
								</div>
							</div>
						</div>
					)}
				</div>

				<aside
					className="hidden overflow-hidden rounded-lg border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] lg:block"
					role="group"
					aria-label="Element inspector"
				>
					<div className="border-b border-[color:var(--dm-border)] px-4 py-3">
						<p className="text-[11px] font-medium text-[color:var(--dm-ink-muted)]">
							Element inspector
						</p>
					</div>
					<BlockInspectorSidebar
						selectedBlocks={selectedBlocks}
						onUpdateContent={updateBlockContentPatch}
						onRestyle={(blockId, stylePatch) =>
							store.getState().restyleBlock(blockId, stylePatch)
						}
						onMove={moveBlock}
						onResize={resizeBlock}
						onDelete={(blockId) => store.getState().removeBlock(blockId)}
						onDuplicate={duplicateBlock}
						onToggleLock={toggleBlockLock}
						onBulkDelete={(blockIds) => {
							for (const blockId of blockIds) {
								store.getState().removeBlock(blockId);
							}
						}}
						onBulkLock={(blockIds, locked) => {
							for (const blockId of blockIds) {
								store.getState().updateBlock(blockId, { locked });
							}
						}}
						onBulkRestyle={(blockIds, stylePatch) => {
							for (const blockId of blockIds) {
								store.getState().restyleBlock(blockId, stylePatch);
							}
						}}
						designTokens={document.designTokens}
						onDesignTokenChange={(section, key, value) => {
							store.getState().updateDesignToken(section, key, value);
							if (section === "fonts") {
								const latest = store.getState().document;
								for (const blockId of latest.blockOrder) {
									const block = latest.blocksById[blockId];
									if (!block) continue;
									if (key === "heading" && block.type === "heading") {
										store
											.getState()
											.restyleBlock(block.id, { fontFamily: value });
									}
									if (
										key === "body" &&
										(block.type === "text" ||
											block.type === "timeline" ||
											block.type === "map" ||
											block.type === "form")
									) {
										store
											.getState()
											.restyleBlock(block.id, { fontFamily: value });
									}
								}
							}
						}}
						onSpacingChange={(spacing) =>
							store.getState().setGridSpacing(spacing)
						}
					/>
				</aside>
			</div>

			<CanvasZoomControls
				camera={zoom.camera}
				onZoomIn={handleZoomIn}
				onZoomOut={handleZoomOut}
				onReset={handleZoomReset}
				onFit={handleZoomFit}
			/>

			<MobileCanvasFab onClick={() => setMobileSheetOpen(true)} />
			<MobileCanvasSheet
				open={mobileSheetOpen}
				onClose={() => setMobileSheetOpen(false)}
				selectedBlocks={selectedBlocks}
				onAddBlock={handleAddBlock}
				onUpdateContent={updateBlockContentPatch}
				onRestyle={(blockId, stylePatch) =>
					store.getState().restyleBlock(blockId, stylePatch)
				}
				onMove={moveBlock}
				onResize={resizeBlock}
				onDelete={(blockId) => store.getState().removeBlock(blockId)}
				onDuplicate={duplicateBlock}
				onToggleLock={toggleBlockLock}
				onBulkDelete={(blockIds) => {
					for (const blockId of blockIds) {
						store.getState().removeBlock(blockId);
					}
				}}
				onBulkLock={(blockIds, locked) => {
					for (const blockId of blockIds) {
						store.getState().updateBlock(blockId, { locked });
					}
				}}
				onBulkRestyle={(blockIds, stylePatch) => {
					for (const blockId of blockIds) {
						store.getState().restyleBlock(blockId, stylePatch);
					}
				}}
				designTokens={document.designTokens}
				onDesignTokenChange={(section: "colors" | "fonts", key, value) => {
					store.getState().updateDesignToken(section, key, value);
				}}
				onSpacingChange={(spacing) => store.getState().setGridSpacing(spacing)}
			/>
		</div>
	);
}
