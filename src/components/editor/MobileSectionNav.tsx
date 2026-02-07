import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export type MobileSectionNavProps = {
	sections: Array<{ id: string; label?: string; completion?: number }>;
	activeSection: string;
	onSectionChange: (sectionId: string) => void;
};

const SWIPE_THRESHOLD = 50;

export default function MobileSectionNav({
	sections,
	activeSection,
	onSectionChange,
}: MobileSectionNavProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const touchStartX = useRef(0);
	const touchStartY = useRef(0);
	const touchEndX = useRef(0);
	const [isSwiping, setIsSwiping] = useState(false);

	const currentIndex = sections.findIndex((s) => s.id === activeSection);

	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		touchStartX.current = e.touches[0].clientX;
		touchStartY.current = e.touches[0].clientY;
		setIsSwiping(true);
	}, []);

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (!isSwiping) return;
			touchEndX.current = e.touches[0].clientX;
		},
		[isSwiping],
	);

	const handleTouchEnd = useCallback(
		(e: React.TouchEvent) => {
			if (!isSwiping) return;
			setIsSwiping(false);

			const deltaX = touchStartX.current - touchEndX.current;
			const deltaY =
				touchStartY.current -
				(e.changedTouches[0]?.clientY ?? touchStartY.current);

			// Ignore if vertical scroll intent dominates
			if (Math.abs(deltaY) > Math.abs(deltaX)) return;

			if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

			if (deltaX > 0 && currentIndex < sections.length - 1) {
				// Swipe left - go to next section
				onSectionChange(sections[currentIndex + 1].id);
			} else if (deltaX < 0 && currentIndex > 0) {
				// Swipe right - go to previous section
				onSectionChange(sections[currentIndex - 1].id);
			}
		},
		[isSwiping, currentIndex, sections, onSectionChange],
	);

	const goToPrevious = () => {
		if (currentIndex > 0) {
			onSectionChange(sections[currentIndex - 1].id);
		}
	};

	const goToNext = () => {
		if (currentIndex < sections.length - 1) {
			onSectionChange(sections[currentIndex + 1].id);
		}
	};

	function dotColor(completion: number | undefined): string {
		if (completion == null) return "bg-[color:var(--dm-border)]";
		if (completion >= 100) return "bg-[#22c55e]";
		if (completion > 0) return "bg-[#eab308]";
		return "bg-[color:var(--dm-border)]";
	}

	return (
		<div
			ref={containerRef}
			className="flex items-center gap-2 border-t border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-4 py-3"
			style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			role="tablist"
			aria-label="Invitation sections"
		>
			{/* Previous button */}
			<button
				type="button"
				onClick={goToPrevious}
				disabled={currentIndex === 0}
				className={cn(
					"flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--dm-border)]",
					"text-[color:var(--dm-muted)] transition-colors",
					currentIndex === 0
						? "opacity-40"
						: "hover:bg-[color:var(--dm-surface-muted)]",
				)}
				aria-label="Previous section"
			>
				<ChevronLeft className="h-5 w-5" aria-hidden="true" />
			</button>

			{/* Section indicator */}
			<div className="flex min-w-0 flex-1 flex-col items-center">
				<span className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]">
					{sections[currentIndex]?.label || sections[currentIndex]?.id}
				</span>
				{/* Progress bar */}
				{sections[currentIndex]?.completion != null && (
					<div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-[color:var(--dm-border)]">
						<div
							className="h-full rounded-full bg-[color:var(--dm-accent-strong)] transition-all duration-300"
							style={{
								width: `${Math.min(100, sections[currentIndex].completion ?? 0)}%`,
							}}
						/>
					</div>
				)}
				{/* Progress dots */}
				<div className="mt-2 flex gap-1.5" role="presentation">
					{sections.map((section, index) => (
						<button
							key={section.id}
							type="button"
							role="tab"
							onClick={() => onSectionChange(section.id)}
							className={cn(
								"h-2 rounded-full transition-all",
								index === currentIndex
									? "w-6 bg-[color:var(--dm-accent-strong)]"
									: cn("w-2", dotColor(section.completion)),
								index !== currentIndex && "hover:bg-[color:var(--dm-muted)]",
							)}
							aria-label={`Go to ${section.label || section.id}`}
							aria-selected={index === currentIndex}
						/>
					))}
				</div>
			</div>

			{/* Next button */}
			<button
				type="button"
				onClick={goToNext}
				disabled={currentIndex === sections.length - 1}
				className={cn(
					"flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--dm-border)]",
					"text-[color:var(--dm-muted)] transition-colors",
					currentIndex === sections.length - 1
						? "opacity-40"
						: "hover:bg-[color:var(--dm-surface-muted)]",
				)}
				aria-label="Next section"
			>
				<ChevronRight className="h-5 w-5" aria-hidden="true" />
			</button>
		</div>
	);
}
