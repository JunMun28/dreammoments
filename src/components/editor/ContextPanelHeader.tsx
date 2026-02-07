import { Sparkles } from "lucide-react";
import { ToggleSwitch } from "./ToggleSwitch";

type ContextPanelHeaderProps = {
	sectionId: string;
	sectionLabel: string;
	visible: boolean;
	onVisibilityChange: (visible: boolean) => void;
	onAiClick: () => void;
	completion: number;
};

export function ContextPanelHeader({
	sectionId,
	sectionLabel,
	visible,
	onVisibilityChange,
	onAiClick,
	completion,
}: ContextPanelHeaderProps) {
	return (
		<div className="sticky top-0 z-10 border-b border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-5 py-4">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[color:var(--dm-ink)]">
					{sectionLabel}
				</h2>

				<div className="flex items-center gap-2">
					<span className="text-xs tabular-nums text-[color:var(--dm-muted)]">
						{Math.round(completion)}%
					</span>

					<button
						type="button"
						onClick={onAiClick}
						aria-label={`Generate AI content for ${sectionLabel}`}
						className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--dm-border)] text-[color:var(--dm-muted)] transition-colors hover:bg-[color:var(--dm-surface-muted)] hover:text-[color:var(--dm-ink)]"
					>
						<Sparkles className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>
			</div>

			<div className="mt-3">
				<ToggleSwitch
					label="Show section"
					checked={visible}
					onChange={onVisibilityChange}
					id={`visibility-${sectionId}`}
				/>
			</div>
		</div>
	);
}

export default ContextPanelHeader;
