import { useMemo } from "react";
import type { Block } from "@/lib/canvas/types";
import { InspectorField, InspectorSection, NumberInput } from "./InspectorSection";

export function ContentSection({
	block,
	onUpdateContent,
	onRestyle,
}: {
	block: Block;
	onUpdateContent: (contentPatch: Record<string, unknown>) => void;
	onRestyle?: (stylePatch: Record<string, string>) => void;
}) {
	const fontSize = useMemo(() => {
		const raw = block.style.fontSize;
		if (!raw || !raw.endsWith("px")) return "";
		return raw.replace("px", "");
	}, [block.style.fontSize]);
	const textInput = (
		<InspectorField label="Text">
			<textarea
				value={typeof block.content.text === "string" ? block.content.text : ""}
				onChange={(event) => onUpdateContent({ text: event.target.value })}
				aria-label="Block text content"
				rows={3}
				className="w-full resize-y rounded-lg border border-[color:var(--dm-border)] px-2 py-1.5 text-xs text-[color:var(--dm-ink)]"
			/>
		</InspectorField>
	);

	return (
		<InspectorSection title="Content">
			{(block.type === "text" || block.type === "heading") && (
				<>
					{textInput}
					{onRestyle && (
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
					)}
				</>
			)}

			{block.type === "image" && (
				<>
					<InspectorField label="Image URL">
						<input
							type="url"
							value={
								typeof block.content.src === "string" ? block.content.src : ""
							}
							onChange={(event) =>
								onUpdateContent({ src: event.target.value })
							}
							aria-label="Image URL"
							className="w-full rounded-lg border border-[color:var(--dm-border)] px-2 py-1.5 text-xs text-[color:var(--dm-ink)]"
						/>
					</InspectorField>
					<InspectorField label="Alt text">
						<input
							type="text"
							value={
								typeof block.content.alt === "string" ? block.content.alt : ""
							}
							onChange={(event) =>
								onUpdateContent({ alt: event.target.value })
							}
							aria-label="Image alt text"
							className="w-full rounded-lg border border-[color:var(--dm-border)] px-2 py-1.5 text-xs text-[color:var(--dm-ink)]"
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
							onUpdateContent({ targetDate: event.target.value })
						}
						aria-label="Countdown target date"
						className="w-full rounded-lg border border-[color:var(--dm-border)] px-2 py-1.5 text-xs text-[color:var(--dm-ink)]"
					/>
				</InspectorField>
			)}

			{block.type === "decorative" && (
				<InspectorField label="Color">
					<input
						type="color"
						value={
							typeof block.content.color === "string"
								? block.content.color
								: "#d94674"
						}
						onChange={(event) =>
							onUpdateContent({ color: event.target.value })
						}
						aria-label="Decorative color"
						className="h-9 w-full rounded border border-[color:var(--dm-border)] p-1"
					/>
				</InspectorField>
			)}
		</InspectorSection>
	);
}
