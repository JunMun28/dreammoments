import { useMemo } from "react";
import type { AnimationType, Block } from "@/lib/canvas/types";
import {
	InspectorField,
	InspectorSection,
	NumberInput,
} from "./InspectorSection";

const INPUT_CLASS =
	"w-full rounded-lg border border-[color:var(--dm-border)] px-2 py-1.5 text-xs text-[color:var(--dm-ink)] focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)] focus-visible:outline-none";

const SELECT_CLASS =
	"w-full rounded-lg border border-[color:var(--dm-border)] px-2 py-1.5 text-xs text-[color:var(--dm-ink)] focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)] focus-visible:outline-none";

const ALIGNMENT_OPTIONS = ["left", "center", "right"] as const;

const ANIMATION_OPTIONS: { value: AnimationType | "none"; label: string }[] = [
	{ value: "none", label: "None" },
	{ value: "fadeInUp", label: "Fade up" },
	{ value: "fadeIn", label: "Fade in" },
	{ value: "slideFromLeft", label: "Slide left" },
	{ value: "slideFromRight", label: "Slide right" },
	{ value: "scaleIn", label: "Scale in" },
];

const OBJECT_FIT_OPTIONS = [
	{ value: "cover", label: "Cover" },
	{ value: "contain", label: "Contain" },
	{ value: "fill", label: "Fill" },
] as const;

function contentString(block: Block, key: string): string {
	const val = block.content[key];
	return typeof val === "string" ? val : "";
}

export function ContentSection({
	block,
	onUpdateContent,
	onRestyle,
	onUpdateAnimation,
}: {
	block: Block;
	onUpdateContent: (contentPatch: Record<string, unknown>) => void;
	onRestyle?: (stylePatch: Record<string, string>) => void;
	onUpdateAnimation?: (animation: AnimationType) => void;
}) {
	const fontSize = useMemo(() => {
		const raw = block.style.fontSize;
		if (!raw || !raw.endsWith("px")) return "";
		return raw.replace("px", "");
	}, [block.style.fontSize]);

	const textColor = block.style.color ?? "";
	const textAlign = block.style.textAlign ?? "left";
	const fontFamily = block.style.fontFamily ?? "";

	return (
		<InspectorSection title="Content">
			{/* ── Text / Heading ── */}
			{(block.type === "text" || block.type === "heading") && (
				<>
					<InspectorField label="Text">
						<textarea
							value={contentString(block, "text")}
							onChange={(e) => onUpdateContent({ text: e.target.value })}
							aria-label="Block text content"
							rows={3}
							className={`${INPUT_CLASS} resize-y`}
						/>
					</InspectorField>

					{onRestyle && (
						<>
							<InspectorField label="Font size">
								<NumberInput
									ariaLabel="Font size"
									value={fontSize}
									min={10}
									max={120}
									suffix="px"
									onChange={(next) => {
										const value = Math.max(10, Number(next) || 16);
										onRestyle({ fontSize: `${value}px` });
									}}
								/>
							</InspectorField>

							<InspectorField label="Text color">
								<div className="flex items-center gap-2">
									<input
										type="color"
										value={textColor || "#000000"}
										onChange={(e) => onRestyle({ color: e.target.value })}
										aria-label="Text color"
										className="h-7 w-7 shrink-0 cursor-pointer rounded border border-[color:var(--dm-border)] p-0.5"
									/>
									<input
										type="text"
										value={textColor}
										onChange={(e) => onRestyle({ color: e.target.value })}
										placeholder="#000000"
										aria-label="Text color hex"
										className={INPUT_CLASS}
									/>
								</div>
							</InspectorField>

							<InspectorField label="Alignment">
								<div className="flex gap-1">
									{ALIGNMENT_OPTIONS.map((align) => (
										<button
											key={align}
											type="button"
											onClick={() => onRestyle({ textAlign: align })}
											aria-label={`Align ${align}`}
											className={`flex h-7 flex-1 items-center justify-center rounded-md text-[11px] transition-colors ${
												textAlign === align
													? "bg-[color:var(--dm-accent-strong)] text-[color:var(--dm-on-accent)]"
													: "border border-[color:var(--dm-border)] text-[color:var(--dm-ink)] hover:bg-[color:var(--dm-surface-muted)]"
											}`}
										>
											{align[0].toUpperCase() + align.slice(1)}
										</button>
									))}
								</div>
							</InspectorField>

							<InspectorField label="Font family">
								<input
									type="text"
									value={fontFamily}
									onChange={(e) => onRestyle({ fontFamily: e.target.value })}
									placeholder="'Noto Serif SC', serif"
									aria-label="Font family"
									className={INPUT_CLASS}
								/>
							</InspectorField>
						</>
					)}
				</>
			)}

			{/* ── Image ── */}
			{block.type === "image" && (
				<>
					<InspectorField label="Image URL">
						<input
							type="url"
							value={contentString(block, "src")}
							onChange={(e) => onUpdateContent({ src: e.target.value })}
							aria-label="Image URL"
							className={INPUT_CLASS}
						/>
					</InspectorField>
					<InspectorField label="Alt text">
						<input
							type="text"
							value={contentString(block, "alt")}
							onChange={(e) => onUpdateContent({ alt: e.target.value })}
							aria-label="Image alt text"
							className={INPUT_CLASS}
						/>
					</InspectorField>
					<InspectorField label="Object fit">
						<select
							value={contentString(block, "objectFit") || "cover"}
							onChange={(e) => onUpdateContent({ objectFit: e.target.value })}
							aria-label="Image object fit"
							className={SELECT_CLASS}
						>
							{OBJECT_FIT_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</InspectorField>
				</>
			)}

			{/* ── Countdown ── */}
			{block.type === "countdown" && (
				<>
					<InspectorField label="Target date">
						<input
							type="date"
							value={contentString(block, "targetDate").slice(0, 10)}
							onChange={(e) => onUpdateContent({ targetDate: e.target.value })}
							aria-label="Countdown target date"
							className={INPUT_CLASS}
						/>
					</InspectorField>
					<InspectorField label="Label">
						<input
							type="text"
							value={contentString(block, "label")}
							onChange={(e) => onUpdateContent({ label: e.target.value })}
							placeholder="Days until our wedding"
							aria-label="Countdown label"
							className={INPUT_CLASS}
						/>
					</InspectorField>
				</>
			)}

			{/* ── Map / Venue ── */}
			{block.type === "map" && (
				<>
					<InspectorField label="Venue name">
						<input
							type="text"
							value={contentString(block, "name")}
							onChange={(e) => onUpdateContent({ name: e.target.value })}
							placeholder="Grand Ballroom"
							aria-label="Venue name"
							className={INPUT_CLASS}
						/>
					</InspectorField>
					<InspectorField label="Address">
						<textarea
							value={contentString(block, "address")}
							onChange={(e) => onUpdateContent({ address: e.target.value })}
							placeholder="123 Wedding Lane, Singapore"
							aria-label="Venue address"
							rows={2}
							className={`${INPUT_CLASS} resize-y`}
						/>
					</InspectorField>
				</>
			)}

			{/* ── RSVP Form ── */}
			{block.type === "form" && (
				<>
					<InspectorField label="Title">
						<input
							type="text"
							value={contentString(block, "title")}
							onChange={(e) => onUpdateContent({ title: e.target.value })}
							placeholder="RSVP"
							aria-label="Form title"
							className={INPUT_CLASS}
						/>
					</InspectorField>
					<InspectorField label="RSVP deadline">
						<input
							type="date"
							value={contentString(block, "deadline").slice(0, 10)}
							onChange={(e) => onUpdateContent({ deadline: e.target.value })}
							aria-label="RSVP deadline"
							className={INPUT_CLASS}
						/>
					</InspectorField>
				</>
			)}

			{/* ── Divider ── */}
			{block.type === "divider" && (
				<>
					<InspectorField label="Color">
						<div className="flex items-center gap-2">
							<input
								type="color"
								value={contentString(block, "color") || "#D4A843"}
								onChange={(e) => onUpdateContent({ color: e.target.value })}
								aria-label="Divider color"
								className="h-7 w-7 shrink-0 cursor-pointer rounded border border-[color:var(--dm-border)] p-0.5"
							/>
							<input
								type="text"
								value={contentString(block, "color")}
								onChange={(e) => onUpdateContent({ color: e.target.value })}
								placeholder="#D4A843"
								aria-label="Divider color hex"
								className={INPUT_CLASS}
							/>
						</div>
					</InspectorField>
					<InspectorField label="Thickness">
						<NumberInput
							ariaLabel="Divider thickness"
							value={contentString(block, "thickness") || "1"}
							min={1}
							max={10}
							suffix="px"
							onChange={(next) => {
								const value = Math.max(1, Number(next) || 1);
								onUpdateContent({ thickness: String(value) });
							}}
						/>
					</InspectorField>
				</>
			)}

			{/* ── Decorative ── */}
			{block.type === "decorative" && (
				<InspectorField label="Color">
					<div className="flex items-center gap-2">
						<input
							type="color"
							value={contentString(block, "color") || "#C4727F"}
							onChange={(e) => onUpdateContent({ color: e.target.value })}
							aria-label="Decorative color"
							className="h-7 w-7 shrink-0 cursor-pointer rounded border border-[color:var(--dm-border)] p-0.5"
						/>
						<input
							type="text"
							value={contentString(block, "color")}
							onChange={(e) => onUpdateContent({ color: e.target.value })}
							placeholder="#C4727F"
							aria-label="Decorative color hex"
							className={INPUT_CLASS}
						/>
					</div>
				</InspectorField>
			)}

			{/* ── Animation (all block types) ── */}
			{onUpdateAnimation && (
				<InspectorField label="Animation">
					<select
						value={block.animation ?? "none"}
						onChange={(e) => onUpdateAnimation(e.target.value as AnimationType)}
						aria-label="Block animation"
						className={SELECT_CLASS}
					>
						{ANIMATION_OPTIONS.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</InspectorField>
			)}
		</InspectorSection>
	);
}
