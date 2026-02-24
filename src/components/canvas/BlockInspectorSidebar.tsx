import { useMemo, useState } from "react";
import type { Block, Position, Size } from "@/lib/canvas/types";

function coerceNumber(value: string, fallback: number): number {
	const parsed = Number(value);
	if (Number.isNaN(parsed)) return fallback;
	return parsed;
}

function coercePositiveSize(value: string, fallback: number): number {
	const parsed = Number(value);
	if (Number.isNaN(parsed)) return fallback;
	return Math.max(10, parsed);
}

function sharedStyleValue(blocks: Block[], key: string): string {
	if (blocks.length === 0) return "";
	const base = blocks[0]?.style[key] ?? "";
	for (const block of blocks) {
		if ((block.style[key] ?? "") !== base) return "";
	}
	return base;
}

function sharedOpacityValue(blocks: Block[]): string {
	const raw = sharedStyleValue(blocks, "opacity");
	if (!raw) return "";
	const parsed = Number(raw);
	if (Number.isNaN(parsed)) return "";
	return String(parsed);
}

function sharedFontSizeValue(blocks: Block[]): string {
	const raw = sharedStyleValue(blocks, "fontSize");
	if (!raw || !raw.endsWith("px")) return "";
	return raw.replace("px", "");
}

function InspectorField({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="grid gap-1.5">
			<span className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--dm-muted)]">
				{label}
			</span>
			{children}
		</div>
	);
}

function NumberField({
	ariaLabel,
	value,
	onChange,
	min,
	max,
}: {
	ariaLabel: string;
	value: string;
	onChange: (value: string) => void;
	min?: number;
	max?: number;
}) {
	return (
		<input
			type="number"
			min={min}
			max={max}
			value={value}
			onChange={(event) => onChange(event.target.value)}
			aria-label={ariaLabel}
			className="rounded-lg border border-[color:var(--dm-border)] px-2 py-1.5 text-xs text-[color:var(--dm-ink)]"
		/>
	);
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
	const [opacity, setOpacity] = useState(() => sharedOpacityValue(blocks));
	const [fontSize, setFontSize] = useState(() => sharedFontSizeValue(blocks));

	const allLocked = blocks.every((block) => block.locked);
	const anyTextLike = blocks.some(
		(block) => block.type === "text" || block.type === "heading",
	);

	return (
		<div className="grid gap-4">
			<div>
				<p className="text-xs font-semibold text-[color:var(--dm-ink)]">
					{blocks.length} blocks selected
				</p>
				<p className="text-[11px] text-[color:var(--dm-muted)]">
					Shared controls only
				</p>
			</div>
			<div className="grid gap-3 rounded-xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] p-3">
				<InspectorField label="Opacity">
					<NumberField
						ariaLabel="Shared opacity"
						value={opacity}
						min={0}
						max={1}
						onChange={(next) => {
							setOpacity(next);
							const value = coerceNumber(next, 1);
							onBulkRestyle(ids, { opacity: String(Math.max(0, Math.min(1, value))) });
						}}
					/>
				</InspectorField>
				{anyTextLike ? (
					<InspectorField label="Font size">
						<NumberField
							ariaLabel="Shared font size"
							value={fontSize}
							min={10}
							max={120}
							onChange={(next) => {
								setFontSize(next);
								const value = coercePositiveSize(next, 16);
								onBulkRestyle(ids, { fontSize: `${value}px` });
							}}
						/>
					</InspectorField>
				) : null}
			</div>
			<div className="grid grid-cols-2 gap-2">
				<button
					type="button"
					onClick={() => onBulkLock(ids, !allLocked)}
					className="rounded-full border border-[color:var(--dm-border)] px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-[color:var(--dm-ink)]"
				>
					{allLocked ? "Unlock all" : "Lock all"}
				</button>
				<button
					type="button"
					onClick={() => onBulkDelete(ids)}
					className="rounded-full border border-red-300 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-red-600"
				>
					Delete all
				</button>
			</div>
		</div>
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
}: {
	block: Block;
	onUpdateContent: (contentPatch: Record<string, unknown>) => void;
	onRestyle: (stylePatch: Record<string, string>) => void;
	onMove: (position: Position) => void;
	onResize: (size: Size) => void;
	onDelete: () => void;
	onDuplicate: () => void;
	onToggleLock: () => void;
}) {
	const fontSize = useMemo(() => {
		const raw = block.style.fontSize;
		if (!raw || !raw.endsWith("px")) return "";
		return raw.replace("px", "");
	}, [block.style.fontSize]);

	return (
		<div className="grid gap-4">
			<div>
				<p className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--dm-muted)]">
					Selected block
				</p>
				<p className="text-sm font-semibold text-[color:var(--dm-ink)]">
					{block.type}
				</p>
			</div>

			<div className="grid gap-3 rounded-xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] p-3">
				{(block.type === "text" || block.type === "heading") && (
					<>
						<InspectorField label="Text">
							<input
								type="text"
								value={typeof block.content.text === "string" ? block.content.text : ""}
								onChange={(event) =>
									onUpdateContent({
										text: event.target.value,
									})
								}
								aria-label="Block text content"
								className="rounded-lg border border-[color:var(--dm-border)] px-2 py-1.5 text-xs text-[color:var(--dm-ink)]"
							/>
						</InspectorField>
						<InspectorField label="Font size">
							<NumberField
								ariaLabel="Font size"
								value={fontSize}
								min={10}
								max={120}
								onChange={(next) =>
									onRestyle({
										fontSize: `${coercePositiveSize(next, 16)}px`,
									})
								}
							/>
						</InspectorField>
					</>
				)}

				{block.type === "image" && (
					<>
						<InspectorField label="Image URL">
							<input
								type="url"
								value={typeof block.content.src === "string" ? block.content.src : ""}
								onChange={(event) =>
									onUpdateContent({
										src: event.target.value,
									})
								}
								aria-label="Image URL"
								className="rounded-lg border border-[color:var(--dm-border)] px-2 py-1.5 text-xs text-[color:var(--dm-ink)]"
							/>
						</InspectorField>
						<InspectorField label="Alt text">
							<input
								type="text"
								value={typeof block.content.alt === "string" ? block.content.alt : ""}
								onChange={(event) =>
									onUpdateContent({
										alt: event.target.value,
									})
								}
								aria-label="Image alt text"
								className="rounded-lg border border-[color:var(--dm-border)] px-2 py-1.5 text-xs text-[color:var(--dm-ink)]"
							/>
						</InspectorField>
					</>
				)}

				{block.type === "countdown" && (
					<InspectorField label="Target date">
						<input
							type="date"
							value={
								typeof block.content.targetDate === "string"
									? block.content.targetDate.slice(0, 10)
									: ""
							}
							onChange={(event) =>
								onUpdateContent({
									targetDate: event.target.value,
								})
							}
							aria-label="Countdown target date"
							className="rounded-lg border border-[color:var(--dm-border)] px-2 py-1.5 text-xs text-[color:var(--dm-ink)]"
						/>
					</InspectorField>
				)}

				{block.type === "decorative" && (
					<InspectorField label="Color">
						<input
							type="color"
							value={typeof block.content.color === "string" ? block.content.color : "#d94674"}
							onChange={(event) =>
								onUpdateContent({
									color: event.target.value,
								})
							}
							aria-label="Decorative color"
							className="h-9 rounded border border-[color:var(--dm-border)] p-1"
						/>
					</InspectorField>
				)}

				<div className="grid grid-cols-2 gap-2">
					<InspectorField label="X">
						<NumberField
							ariaLabel="Block X position"
							value={String(Math.round(block.position.x))}
							onChange={(next) =>
								onMove({
									x: coerceNumber(next, block.position.x),
									y: block.position.y,
								})
							}
						/>
					</InspectorField>
					<InspectorField label="Y">
						<NumberField
							ariaLabel="Block Y position"
							value={String(Math.round(block.position.y))}
							onChange={(next) =>
								onMove({
									x: block.position.x,
									y: coerceNumber(next, block.position.y),
								})
							}
						/>
					</InspectorField>
				</div>
				<div className="grid grid-cols-2 gap-2">
					<InspectorField label="Width">
						<NumberField
							ariaLabel="Block width"
							value={String(Math.round(block.size.width))}
							onChange={(next) =>
								onResize({
									width: coercePositiveSize(next, block.size.width),
									height: block.size.height,
								})
							}
						/>
					</InspectorField>
					<InspectorField label="Height">
						<NumberField
							ariaLabel="Block height"
							value={String(Math.round(block.size.height))}
							onChange={(next) =>
								onResize({
									width: block.size.width,
									height: coercePositiveSize(next, block.size.height),
								})
							}
						/>
					</InspectorField>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-2">
				<button
					type="button"
					onClick={onDuplicate}
					className="rounded-full border border-[color:var(--dm-border)] px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-[color:var(--dm-ink)]"
				>
					Duplicate
				</button>
				<button
					type="button"
					onClick={onToggleLock}
					className="rounded-full border border-[color:var(--dm-border)] px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-[color:var(--dm-ink)]"
				>
					{block.locked ? "Unlock" : "Lock"}
				</button>
				<button
					type="button"
					onClick={onDelete}
					className="rounded-full border border-red-300 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-red-600"
				>
					Delete
				</button>
			</div>
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
	onBulkDelete,
	onBulkLock,
	onBulkRestyle,
}: {
	selectedBlocks: Block[];
	onUpdateContent: (blockId: string, contentPatch: Record<string, unknown>) => void;
	onRestyle: (blockId: string, stylePatch: Record<string, string>) => void;
	onMove: (blockId: string, position: Position) => void;
	onResize: (blockId: string, size: Size) => void;
	onDelete: (blockId: string) => void;
	onDuplicate: (blockId: string) => void;
	onToggleLock: (blockId: string) => void;
	onBulkDelete: (blockIds: string[]) => void;
	onBulkLock: (blockIds: string[], locked: boolean) => void;
	onBulkRestyle: (blockIds: string[], stylePatch: Record<string, string>) => void;
}) {
	if (selectedBlocks.length === 0) {
		return (
			<aside className="grid h-full place-items-center p-6">
				<div className="max-w-[220px] text-center">
					<p className="text-sm font-semibold text-[color:var(--dm-ink)]">
						Select an element
					</p>
					<p className="mt-1 text-xs text-[color:var(--dm-muted)]">
						Click any canvas block to edit it here.
					</p>
				</div>
			</aside>
		);
	}

	if (selectedBlocks.length > 1) {
		return (
			<aside className="h-full overflow-y-auto p-4">
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
		<aside className="h-full overflow-y-auto p-4">
			<SingleInspector
				block={block}
				onUpdateContent={(contentPatch) => onUpdateContent(block.id, contentPatch)}
				onRestyle={(stylePatch) => onRestyle(block.id, stylePatch)}
				onMove={(position) => onMove(block.id, position)}
				onResize={(size) => onResize(block.id, size)}
				onDelete={() => onDelete(block.id)}
				onDuplicate={() => onDuplicate(block.id)}
				onToggleLock={() => onToggleLock(block.id)}
			/>
		</aside>
	);
}
