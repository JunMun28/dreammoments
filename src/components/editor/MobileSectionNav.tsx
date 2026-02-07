import { useCallback, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export type MobileSectionNavProps = {
	sections: Array<{ id: string; label?: string }>;
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
	const touchEndX = useRef(0);
	const [isSwiping, setIsSwiping] = useState(false);

	const currentIndex = sections.findIndex((s) => s.id === activeSection);

	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		touchStartX.current = e.touches[0].clientX;
		setIsSwiping(true);
	}, []);

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (!isSwiping) return;
			touchEndX.current = e.touches[0].clientX;
		},
		[isSwiping],
	);

	const handleTouchEnd = useCallback(() => {
		if (!isSwiping) return;
		setIsSwiping(false);

		const deltaX = touchStartX.current - touchEndX.current;

		if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

		if (deltaX > 0 && currentIndex < sections.length - 1) {
			// Swipe left - go to next section
			onSectionChange(sections[currentIndex + 1].id);
		} else if (deltaX < 0 && currentIndex > 0) {
			// Swipe right - go to previous section
			onSectionChange(sections[currentIndex - 1].id);
		}
	}, [isSwiping, currentIndex, sections, onSectionChange]);

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

	return (
		<div
			ref={containerRef}
			className="flex items-center gap-2 border-b border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-4 py-3"
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
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
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M15 18l-6-6 6-6" />
				</svg>
			</button>

			{/* Section indicator */}
			<div className="flex min-w-0 flex-1 flex-col items-center">
				<span className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]">
					{sections[currentIndex]?.label || sections[currentIndex]?.id}
				</span>
				{/* Progress dots */}
				<div className="mt-2 flex gap-1.5">
					{sections.map((section, index) => (
						<button
							key={section.id}
							type="button"
							onClick={() => onSectionChange(section.id)}
							className={cn(
								"h-2 w-2 rounded-full transition-all",
								index === currentIndex
									? "w-6 bg-[color:var(--dm-accent-strong)]"
									: "bg-[color:var(--dm-border)] hover:bg-[color:var(--dm-muted)]",
							)}
							aria-label={`Go to ${section.label || section.id}`}
							aria-current={index === currentIndex ? "true" : undefined}
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
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M9 18l6-6-6-6" />
				</svg>
			</button>
		</div>
	);
}
