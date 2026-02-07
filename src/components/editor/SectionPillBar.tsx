import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

type SectionPillBarProps = {
	sections: Array<{ id: string; label: string; completion: number }>;
	activeSection: string;
	onSectionChange: (sectionId: string) => void;
};

function completionStatus(completion: number): "full" | "partial" | "empty" {
	if (completion >= 100) return "full";
	if (completion > 0) return "partial";
	return "empty";
}

export function SectionPillBar({
	sections,
	activeSection,
	onSectionChange,
}: SectionPillBarProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const activeRef = useRef<HTMLButtonElement>(null);

	// Auto-scroll active pill into view
	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll on active section change only
	useEffect(() => {
		if (activeRef.current) {
			activeRef.current.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "center",
			});
		}
	}, [activeSection]);

	return (
		<div
			ref={containerRef}
			className="dm-pill-bar"
			role="tablist"
			aria-label="Invitation sections"
			style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
		>
			{sections.map((section) => {
				const isActive = section.id === activeSection;
				return (
					<button
						key={section.id}
						ref={isActive ? activeRef : undefined}
						type="button"
						role="tab"
						aria-selected={isActive}
						aria-label={`${section.label} (${section.completion}% complete)`}
						className={cn(
							"inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-xs uppercase tracking-[0.15em] transition-colors",
							isActive
								? "bg-[color:var(--dm-accent-strong)] text-[color:var(--dm-on-accent)]"
								: "border border-[color:var(--dm-border)] text-[color:var(--dm-muted)]",
						)}
						onClick={() => onSectionChange(section.id)}
					>
						{section.label}
						<span
							className="dm-completion-ring"
							data-complete={completionStatus(section.completion)}
							aria-hidden="true"
						/>
					</button>
				);
			})}
		</div>
	);
}

export default SectionPillBar;
