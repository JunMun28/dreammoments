import { useState } from "react";
import type {
	AnimationType,
	Block,
	DesignTokens,
	Position,
	Size,
} from "@/lib/canvas/types";
import { ActionsRow } from "./inspector/ActionsRow";
import { ContentSection } from "./inspector/ContentSection";
import { DesignTokensPanel } from "./inspector/DesignTokensPanel";
import {
	InspectorField,
	InspectorSection,
	NumberInput,
} from "./inspector/InspectorSection";
import { LayoutSection } from "./inspector/LayoutSection";
import { LivingPortraitSection } from "./inspector/LivingPortraitSection";

function coerceNumber(value: string, fallback: number): number {
	const parsed = Number(value);
	if (Number.isNaN(parsed)) return fallback;
	return parsed;
}

function sharedStyleValue(blocks: Block[], key: string): string {
	if (blocks.length === 0) return "";
	const base = blocks[0]?.style[key] ?? "";
	for (const block of blocks) {
		if ((block.style[key] ?? "") !== base) return "";
	}
	return base;
}

function BulkInspector({
	blocks,
	onBulkDelete,
	onBulkLock,
	onBulkRestyle,
}: {
	blocks: Block[];
	onBulkDelete: (blockIds: string[]) => void;
	onBulkLock: (blockIds: string[], locked: boolean) => void;
	onBulkRestyle: (blockIds: string[], style: Record<string, string>) => void;
}) {
	const ids = blocks.map((block) => block.id);
	const rawOpacity = sharedStyleValue(blocks, "opacity");
	const [opacity, setOpacity] = useState(() => {
		const parsed = Number(rawOpacity);
		return Number.isNaN(parsed) ? "" : String(parsed);
	});
	const rawFontSize = sharedStyleValue(blocks, "fontSize");
	const [fontSize, setFontSize] = useState(() =>
		rawFontSize.endsWith("px") ? rawFontSize.replace("px", "") : "",
	);

	const allLocked = blocks.every((block) => block.locked);
	const anyTextLike = blocks.some(
		(block) => block.type === "text" || block.type === "heading",
	);

	return (
		<div>
			<div className="px-3 py-3">
				<p className="text-xs font-semibold text-[color:var(--dm-ink)]">
					{blocks.length} blocks selected
				</p>
				<p className="text-[11px] text-[color:var(--dm-ink-muted)]">
					Shared controls only
				</p>
			</div>

			<InspectorSection title="Style">
				<InspectorField label="Opacity">
					<NumberInput
						ariaLabel="Shared opacity"
						value={opacity}
						min={0}
						max={1}
						onChange={(next) => {
							setOpacity(next);
							const value = coerceNumber(next, 1);
							onBulkRestyle(ids, {
								opacity: String(Math.max(0, Math.min(1, value))),
							});
						}}
					/>
				</InspectorField>
				{anyTextLike && (
					<InspectorField label="Font size">
						<NumberInput
							ariaLabel="Shared font size"
							value={fontSize}
							min={10}
							max={120}
							suffix="px"
							onChange={(next) => {
								setFontSize(next);
								const value = Math.max(10, coerceNumber(next, 16));
								onBulkRestyle(ids, { fontSize: `${value}px` });
							}}
						/>
					</InspectorField>
				)}
			</InspectorSection>

			<InspectorSection title="Actions">
				<div className="grid grid-cols-2 gap-2">
					<button
						type="button"
						onClick={() => onBulkLock(ids, !allLocked)}
						className="rounded-lg border border-[color:var(--dm-border)] px-3 py-2 text-[11px] font-medium text-[color:var(--dm-ink)] hover:bg-[color:var(--dm-surface-muted)]"
					>
						{allLocked ? "Unlock all" : "Lock all"}
					</button>
					<button
						type="button"
						onClick={() => onBulkDelete(ids)}
						className="rounded-lg border border-red-300 px-3 py-2 text-[11px] font-medium text-red-500 hover:bg-red-50"
					>
						Delete all
					</button>
				</div>
			</InspectorSection>
		</div>
	);
}

function isHeroImageBlock(block: Block): boolean {
	return (
		block.type === "image" &&
		(block.semantic === "hero-image" || block.sectionId === "hero")
	);
}

function SingleInspector({
	block,
	onUpdateContent,
	onRestyle,
	onMove,
	onResize,
	onDelete,
	onDuplicate,
	onToggleLock,
	onUpdateAnimation,
	invitationId,
}: {
	block: Block;
	onUpdateContent: (contentPatch: Record<string, unknown>) => void;
	onRestyle: (stylePatch: Record<string, string>) => void;
	onMove: (position: Position) => void;
	onResize: (size: Size) => void;
	onDelete: () => void;
	onDuplicate: () => void;
	onToggleLock: () => void;
	onUpdateAnimation: (animation: AnimationType) => void;
	invitationId?: string;
}) {
	let token = "";
	try {
		token = window.localStorage.getItem("dm-auth-token") ?? "";
	} catch {
		// localStorage not available in tests or SSR
	}

	return (
		<div>
			<div className="px-3 py-3">
				<p className="text-[11px] text-[color:var(--dm-ink-muted)]">
					Selected block
				</p>
				<p className="text-sm font-semibold capitalize text-[color:var(--dm-ink)]">
					{block.type}
				</p>
			</div>

			<ContentSection
				block={block}
				onUpdateContent={onUpdateContent}
				onRestyle={onRestyle}
				onUpdateAnimation={onUpdateAnimation}
			/>
			{isHeroImageBlock(block) && invitationId && token && (
				<LivingPortraitSection
					invitationId={invitationId}
					token={token}
					heroImageUrl={(block.content.src as string) ?? ""}
					avatarImageUrl={block.content.avatarImageUrl as string | undefined}
					avatarStyle={block.content.avatarStyle as string | undefined}
					animatedVideoUrl={
						block.content.animatedVideoUrl as string | undefined
					}
					onUpdateContent={onUpdateContent}
				/>
			)}
			<LayoutSection
				block={block}
				onMove={onMove}
				onResize={onResize}
				onRestyle={onRestyle}
			/>
			<ActionsRow
				locked={Boolean(block.locked)}
				onDuplicate={onDuplicate}
				onToggleLock={onToggleLock}
				onDelete={onDelete}
			/>
		</div>
	);
}

export function BlockInspectorSidebar({
	selectedBlocks,
	onUpdateContent,
	onRestyle,
	onMove,
	onResize,
	onDelete,
	onDuplicate,
	onToggleLock,
	onUpdateAnimation,
	onBulkDelete,
	onBulkLock,
	onBulkRestyle,
	designTokens,
	onDesignTokenChange,
	onSpacingChange,
	invitationId,
}: {
	selectedBlocks: Block[];
	onUpdateContent: (
		blockId: string,
		contentPatch: Record<string, unknown>,
	) => void;
	onRestyle: (blockId: string, stylePatch: Record<string, string>) => void;
	onMove: (blockId: string, position: Position) => void;
	onResize: (blockId: string, size: Size) => void;
	onDelete: (blockId: string) => void;
	onDuplicate: (blockId: string) => void;
	onToggleLock: (blockId: string) => void;
	onUpdateAnimation: (blockId: string, animation: AnimationType) => void;
	onBulkDelete: (blockIds: string[]) => void;
	onBulkLock: (blockIds: string[], locked: boolean) => void;
	onBulkRestyle: (
		blockIds: string[],
		stylePatch: Record<string, string>,
	) => void;
	designTokens?: DesignTokens;
	onDesignTokenChange?: (
		section: "colors" | "fonts",
		key: string,
		value: string,
	) => void;
	onSpacingChange?: (spacing: number) => void;
	invitationId?: string;
}) {
	if (selectedBlocks.length === 0) {
		if (designTokens && onDesignTokenChange && onSpacingChange) {
			return (
				<aside className="h-full overflow-y-auto">
					<DesignTokensPanel
						designTokens={designTokens}
						onDesignTokenChange={onDesignTokenChange}
						onSpacingChange={onSpacingChange}
					/>
				</aside>
			);
		}

		return (
			<aside className="grid h-full place-items-center p-6">
				<div className="max-w-[220px] text-center">
					<p className="text-sm font-semibold text-[color:var(--dm-ink)]">
						Select an element
					</p>
					<p className="mt-1 text-xs text-[color:var(--dm-ink-muted)]">
						Click any canvas block to edit it here.
					</p>
				</div>
			</aside>
		);
	}

	if (selectedBlocks.length > 1) {
		return (
			<aside className="h-full overflow-y-auto">
				<BulkInspector
					blocks={selectedBlocks}
					onBulkDelete={onBulkDelete}
					onBulkLock={onBulkLock}
					onBulkRestyle={onBulkRestyle}
				/>
			</aside>
		);
	}

	const block = selectedBlocks[0];
	if (!block) return null;

	return (
		<aside className="h-full overflow-y-auto">
			<SingleInspector
				block={block}
				onUpdateContent={(contentPatch) =>
					onUpdateContent(block.id, contentPatch)
				}
				onRestyle={(stylePatch) => onRestyle(block.id, stylePatch)}
				onMove={(position) => onMove(block.id, position)}
				onResize={(size) => onResize(block.id, size)}
				onDelete={() => onDelete(block.id)}
				onDuplicate={() => onDuplicate(block.id)}
				onToggleLock={() => onToggleLock(block.id)}
				onUpdateAnimation={(animation) =>
					onUpdateAnimation(block.id, animation)
				}
				invitationId={invitationId}
			/>
		</aside>
	);
}
