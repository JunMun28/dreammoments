import { Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";

type ContextPanelHeaderProps = {
	sectionId: string;
	sectionLabel: string;
	visible: boolean;
	onVisibilityChange: (visible: boolean) => void;
	onAiClick: () => void;
	completion: number;
	hasErrors?: boolean;
};

export function ContextPanelHeader({
	sectionId,
	sectionLabel,
	visible,
	onVisibilityChange,
	onAiClick,
	completion,
	hasErrors,
}: ContextPanelHeaderProps) {
	return (
		<div className="sticky top-0 z-10 border-b border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-5 py-3">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[color:var(--dm-ink)]">
						{sectionLabel}
					</h2>
					{hasErrors && (
						<span
							className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-500"
							aria-label="Section has validation errors"
						/>
					)}

					<button
						id={`visibility-${sectionId}`}
						type="button"
						role="switch"
						aria-checked={visible}
						aria-label={`Show ${sectionLabel} section`}
						title="Toggle section visibility"
						onClick={() => onVisibilityChange(!visible)}
						className={cn(
							"relative inline-flex h-5 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)]/60",
							visible
								? "bg-[color:var(--dm-accent-strong)]"
								: "bg-[color:var(--dm-border)]",
						)}
						style={{ minHeight: 20, minWidth: 32 }}
					>
						<span
							aria-hidden="true"
							className={cn(
								"pointer-events-none inline-block h-3.5 w-3.5 shrink-0 rounded-full bg-white shadow-sm transition-transform duration-200",
								visible ? "translate-x-[7px]" : "-translate-x-[7px]",
							)}
						/>
					</button>
				</div>

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
		</div>
	);
}
