import { Sparkles } from "lucide-react";
import { useMemo } from "react";
import type { Block } from "@/lib/canvas/types";

function ToolbarButton({
	label,
	onClick,
	danger,
	children,
}: {
	label: string;
	onClick: () => void;
	danger?: boolean;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.14em] transition-colors ${
				danger
					? "border-red-300 text-red-600 hover:bg-red-50"
					: "border-[color:var(--dm-border)] text-[color:var(--dm-ink)] hover:bg-[color:var(--dm-surface-muted)]"
			}`}
			aria-label={label}
		>
			{children}
		</button>
	);
}

export function BlockToolbar({
	block,
	onDelete,
	onDuplicate,
	onLockToggle,
	onBringForward,
	onSendBackward,
	onBringToFront,
	onSendToBack,
	onAiClick,
	onUpdateContent,
	onRestyle,
}: {
	block: Block;
	onDelete: () => void;
	onDuplicate: () => void;
	onLockToggle: () => void;
	onBringForward: () => void;
	onSendBackward: () => void;
	onBringToFront: () => void;
	onSendToBack: () => void;
	onAiClick: () => void;
	onUpdateContent: (contentPatch: Record<string, unknown>) => void;
	onRestyle: (stylePatch: Record<string, string>) => void;
}) {
	const fontSizeValue = useMemo(() => {
		const styleValue = block.style.fontSize;
		const parsed = Number.parseInt(styleValue ?? "", 10);
		return Number.isNaN(parsed) ? "" : String(parsed);
	}, [block.style.fontSize]);

	return (
		<div
			className="pointer-events-auto absolute -top-[8.2rem] left-0 z-50 w-[19.5rem] rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-2 shadow-sm"
			onPointerDown={(event) => event.stopPropagation()}
		>
			<div className="mb-2 flex flex-wrap items-center gap-1">
				<ToolbarButton label="AI actions" onClick={onAiClick}>
					<span className="inline-flex items-center gap-1">
						<Sparkles className="h-3 w-3" aria-hidden="true" />
						AI
					</span>
				</ToolbarButton>
				<ToolbarButton label="Duplicate block" onClick={onDuplicate}>
					Duplicate
				</ToolbarButton>
				<ToolbarButton label="Bring forward" onClick={onBringForward}>
					Forward
				</ToolbarButton>
				<ToolbarButton label="Send backward" onClick={onSendBackward}>
					Backward
				</ToolbarButton>
				<ToolbarButton label="Bring to front" onClick={onBringToFront}>
					Front
				</ToolbarButton>
				<ToolbarButton label="Send to back" onClick={onSendToBack}>
					Back
				</ToolbarButton>
				<ToolbarButton
					label={block.locked ? "Unlock block" : "Lock block"}
					onClick={onLockToggle}
				>
					{block.locked ? "Unlock" : "Lock"}
				</ToolbarButton>
				<ToolbarButton label="Delete block" onClick={onDelete} danger>
					Delete
				</ToolbarButton>
			</div>
			<div className="grid gap-1.5 text-[11px]">
				{(block.type === "text" || block.type === "heading") && (
					<>
						<label className="grid gap-1">
							<span className="uppercase tracking-[0.12em] text-[color:var(--dm-muted)]">
								Text
							</span>
							<input
								type="text"
								value={
									typeof block.content.text === "string"
										? block.content.text
										: ""
								}
								onChange={(event) =>
									onUpdateContent({
										text: event.target.value,
									})
								}
								aria-label="Block text content"
								className="rounded-lg border border-[color:var(--dm-border)] px-2 py-1 text-xs"
							/>
						</label>
						<label className="grid gap-1">
							<span className="uppercase tracking-[0.12em] text-[color:var(--dm-muted)]">
								Font size
							</span>
							<input
								type="number"
								min={10}
								max={120}
								value={fontSizeValue}
								onChange={(event) =>
									onRestyle({
										fontSize: `${Math.max(10, Number(event.target.value) || 10)}px`,
									})
								}
								aria-label="Font size"
								className="rounded-lg border border-[color:var(--dm-border)] px-2 py-1 text-xs"
							/>
						</label>
					</>
				)}

				{block.type === "image" && (
					<>
						<label className="grid gap-1">
							<span className="uppercase tracking-[0.12em] text-[color:var(--dm-muted)]">
								Image URL
							</span>
							<input
								type="url"
								value={
									typeof block.content.src === "string" ? block.content.src : ""
								}
								onChange={(event) =>
									onUpdateContent({
										src: event.target.value,
									})
								}
								aria-label="Image URL"
								className="rounded-lg border border-[color:var(--dm-border)] px-2 py-1 text-xs"
							/>
						</label>
						<label className="grid gap-1">
							<span className="uppercase tracking-[0.12em] text-[color:var(--dm-muted)]">
								Alt text
							</span>
							<input
								type="text"
								value={
									typeof block.content.alt === "string" ? block.content.alt : ""
								}
								onChange={(event) =>
									onUpdateContent({
										alt: event.target.value,
									})
								}
								aria-label="Image alt text"
								className="rounded-lg border border-[color:var(--dm-border)] px-2 py-1 text-xs"
							/>
						</label>
					</>
				)}

				{block.type === "countdown" && (
					<label className="grid gap-1">
						<span className="uppercase tracking-[0.12em] text-[color:var(--dm-muted)]">
							Target date
						</span>
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
							className="rounded-lg border border-[color:var(--dm-border)] px-2 py-1 text-xs"
						/>
					</label>
				)}

				{block.type === "decorative" && (
					<label className="grid gap-1">
						<span className="uppercase tracking-[0.12em] text-[color:var(--dm-muted)]">
							Color
						</span>
						<input
							type="color"
							value={
								typeof block.content.color === "string"
									? block.content.color
									: "#d94674"
							}
							onChange={(event) =>
								onUpdateContent({
									color: event.target.value,
								})
							}
							aria-label="Decorative color"
							className="h-8 rounded border border-[color:var(--dm-border)] p-1"
						/>
					</label>
				)}
			</div>
		</div>
	);
}
