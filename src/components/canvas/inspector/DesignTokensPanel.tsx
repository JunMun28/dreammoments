import type { DesignTokens } from "@/lib/canvas/types";
import { InspectorField, InspectorSection, NumberInput } from "./InspectorSection";

export function DesignTokensPanel({
	designTokens,
	onDesignTokenChange,
	onSpacingChange,
}: {
	designTokens: DesignTokens;
	onDesignTokenChange: (
		section: "colors" | "fonts",
		key: string,
		value: string,
	) => void;
	onSpacingChange: (spacing: number) => void;
}) {
	return (
		<div>
			<div className="px-3 py-3">
				<p className="text-sm font-semibold text-[color:var(--dm-ink)]">
					Document
				</p>
				<p className="mt-0.5 text-[11px] text-[color:var(--dm-ink-muted)]">
					Select a block to edit, or adjust design tokens below.
				</p>
			</div>

			<InspectorSection title="Colors">
				<InspectorField label="Background">
					<input
						type="color"
						value={designTokens.colors.background || "#ffffff"}
						onChange={(event) =>
							onDesignTokenChange("colors", "background", event.target.value)
						}
						aria-label="Canvas background color"
						className="h-9 w-full rounded border border-[color:var(--dm-border)] p-1"
					/>
				</InspectorField>
				<InspectorField label="Text">
					<input
						type="color"
						value={designTokens.colors.text || "#111111"}
						onChange={(event) =>
							onDesignTokenChange("colors", "text", event.target.value)
						}
						aria-label="Canvas text color"
						className="h-9 w-full rounded border border-[color:var(--dm-border)] p-1"
					/>
				</InspectorField>
			</InspectorSection>

			<InspectorSection title="Typography">
				<InspectorField label="Heading font">
					<input
						type="text"
						value={designTokens.fonts.heading || ""}
						onChange={(event) =>
							onDesignTokenChange("fonts", "heading", event.target.value)
						}
						aria-label="Heading font family"
						className="w-full rounded-lg border border-[color:var(--dm-border)] px-2 py-1.5 text-xs text-[color:var(--dm-ink)]"
					/>
				</InspectorField>
				<InspectorField label="Body font">
					<input
						type="text"
						value={designTokens.fonts.body || ""}
						onChange={(event) =>
							onDesignTokenChange("fonts", "body", event.target.value)
						}
						aria-label="Body font family"
						className="w-full rounded-lg border border-[color:var(--dm-border)] px-2 py-1.5 text-xs text-[color:var(--dm-ink)]"
					/>
				</InspectorField>
			</InspectorSection>

			<InspectorSection title="Grid">
				<InspectorField label="Snap grid size">
					<NumberInput
						ariaLabel="Snap grid size"
						value={String(designTokens.spacing)}
						min={1}
						max={24}
						suffix="px"
						onChange={(next) =>
							onSpacingChange(Math.max(1, Number(next) || 8))
						}
					/>
				</InspectorField>
			</InspectorSection>
		</div>
	);
}
