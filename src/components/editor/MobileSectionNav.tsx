import { ChevronLeft, ChevronRight } from "lucide-react";
import {
	type KeyboardEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { cn } from "../../lib/utils";

export type MobileSectionNavProps = {
	sections: Array<{ id: string; label?: string; completion?: number }>;
	activeSection: string;
	onSectionChange: (sectionId: string) => void;
	/** When true, removes border-t, background, and safe-area padding (for use inside bottom sheet header) */
	embedded?: boolean;
	/** When provided, the nav handles scroll + highlight on pill tap */
	scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
};

function CompletionIcon({ completion }: { completion: number | undefined }) {
	const value = completion ?? 0;
	if (value >= 100) {
		return (
			<svg
				width="12"
				height="12"
				viewBox="0 0 12 12"
				fill="none"
				aria-hidden="true"
				className="shrink-0"
			>
				<circle
					cx="6"
					cy="6"
					r="5.5"
					stroke="currentColor"
					strokeWidth="1"
					fill="currentColor"
					opacity="0.15"
				/>
				<path
					d="M3.5 6L5.5 8L8.5 4"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
			</svg>
		);
	}
	if (value > 0) {
		return (
			<svg
				width="12"
				height="12"
				viewBox="0 0 12 12"
				fill="none"
				aria-hidden="true"
				className="shrink-0"
			>
				<circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
				<path d="M6 1A5 5 0 0 0 6 11Z" fill="currentColor" opacity="0.4" />
			</svg>
		);
	}
	return (
		<svg
			width="12"
			height="12"
			viewBox="0 0 12 12"
			fill="none"
			aria-hidden="true"
			className="shrink-0"
		>
			<circle
				cx="6"
				cy="6"
				r="5"
				stroke="currentColor"
				strokeWidth="1"
				opacity="0.4"
			/>
		</svg>
	);
}

export default function MobileSectionNav({
	sections,
	activeSection,
	onSectionChange,
	embedded = false,
	scrollContainerRef,
}: MobileSectionNavProps) {
	const activeRef = useRef<HTMLButtonElement>(null);
	const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
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

	const currentIndex = sections.findIndex((s) => s.id === activeSection);

	// Auto-scroll the active pill into view when activeSection changes
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

	const handleTabKeyDown = useCallback(
		(e: KeyboardEvent<HTMLButtonElement>) => {
			let targetIndex: number | null = null;

			switch (e.key) {
				case "ArrowRight":
					targetIndex =
						currentIndex < sections.length - 1 ? currentIndex + 1 : 0;
					break;
				case "ArrowLeft":
					targetIndex =
						currentIndex > 0 ? currentIndex - 1 : sections.length - 1;
					break;
				case "Home":
					targetIndex = 0;
					break;
				case "End":
					targetIndex = sections.length - 1;
					break;
				default:
					return;
			}

			e.preventDefault();
			const targetSection = sections[targetIndex];
			if (targetSection) {
				onSectionChange(targetSection.id);
				tabRefs.current.get(targetSection.id)?.focus();
			}
		},
		[currentIndex, sections, onSectionChange],
	);

	return (
		<nav
			className={cn(
				"flex items-center gap-2 px-2 py-2",
				!embedded &&
					"border-t border-[color:var(--dm-border)] bg-[color:var(--dm-surface)]",
			)}
			style={
				!embedded ? { paddingBottom: "env(safe-area-inset-bottom)" } : undefined
			}
			aria-label="Section navigation"
		>
			{/* Previous button - outside tablist */}
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

			{/* Scrollable tab strip */}
			<div
				className="dm-pill-bar min-w-0 flex-1"
				role="tablist"
				aria-label="Invitation sections"
			>
				{sections.map((section) => {
					const isActive = section.id === activeSection;
					return (
						<button
							key={section.id}
							ref={(el) => {
								if (el) {
									tabRefs.current.set(section.id, el);
								} else {
									tabRefs.current.delete(section.id);
								}
								if (isActive) {
									(
										activeRef as React.MutableRefObject<HTMLButtonElement | null>
									).current = el;
								}
							}}
							type="button"
							role="tab"
							tabIndex={isActive ? 0 : -1}
							aria-selected={isActive}
							aria-label={`${section.label || section.id}${section.completion != null ? ` (${section.completion}% complete)` : ""}`}
							className={cn(
								"inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-xs uppercase tracking-[0.15em] transition-colors",
								isActive
									? "bg-[color:var(--dm-accent-strong)] text-[color:var(--dm-on-accent)]"
									: "border border-[color:var(--dm-border)] text-[color:var(--dm-muted)]",
							)}
							onClick={() => {
								onSectionChange(section.id);
								if (scrollContainerRef?.current) {
									const target =
										scrollContainerRef.current.querySelector<HTMLElement>(
											`[data-section-form="${section.id}"]`,
										);
									if (target) {
										target.scrollIntoView({
											behavior: prefersReducedMotion ? "instant" : "smooth",
											block: "start",
										});
										if (!prefersReducedMotion) {
											target.classList.add("section-highlight");
											setTimeout(() => {
												target.classList.remove("section-highlight");
											}, 700);
										}
									}
								}
							}}
							onKeyDown={handleTabKeyDown}
						>
							{section.label || section.id}
							<CompletionIcon completion={section.completion} />
						</button>
					);
				})}
			</div>

			{/* Next button - outside tablist */}
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
		</nav>
	);
}
