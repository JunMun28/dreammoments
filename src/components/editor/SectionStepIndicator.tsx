import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

type Props = {
	sections: { id: string; label: string }[];
	activeSectionId: string;
	sectionProgress: Record<string, number>;
	onSectionClick: (sectionId: string) => void;
};

export function SectionStepIndicator({
	sections,
	activeSectionId,
	sectionProgress,
	onSectionClick,
}: Props) {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setPrefersReducedMotion(mq.matches);
		const handler = (e: MediaQueryListEvent) =>
			setPrefersReducedMotion(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	if (sections.length === 0) return null;

	const activeIndex = sections.findIndex((s) => s.id === activeSectionId);
	const isLarge = sections.length <= 10;

	return (
		<div className="flex items-center justify-between px-5 py-1.5">
			<div
				role="tablist"
				aria-label="Section progress"
				className="flex items-center gap-1.5"
			>
				{sections.map((section) => {
					const progress = sectionProgress[section.id] ?? 0;
					const isComplete = progress >= 100;
					const isActive = section.id === activeSectionId;

					return (
						<button
							key={section.id}
							type="button"
							role="tab"
							aria-label={section.label}
							aria-selected={isActive}
							onClick={() => onSectionClick(section.id)}
							className={cn(
								"shrink-0 rounded-full border-2",
								isLarge ? "size-2" : "size-1.5",
								!prefersReducedMotion && "transition-colors duration-200",
								isComplete
									? "border-[color:var(--dm-peach,#e8a87c)] bg-[color:var(--dm-peach,#e8a87c)]"
									: isActive
										? "border-[color:var(--dm-peach,#e8a87c)] bg-white"
										: "border-[color:var(--dm-ink)]/20 bg-transparent",
							)}
						/>
					);
				})}
			</div>
			<span
				aria-live="polite"
				className="text-xs tabular-nums text-[color:var(--dm-ink)]/60"
			>
				{activeIndex + 1} of {sections.length}
			</span>
		</div>
	);
}
