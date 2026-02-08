import { ChevronLeft, ChevronRight } from "lucide-react";
import { type KeyboardEvent, useCallback, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

export type MobileSectionNavProps = {
	sections: Array<{ id: string; label?: string; completion?: number }>;
	activeSection: string;
	onSectionChange: (sectionId: string) => void;
	/** When true, removes border-t, background, and safe-area padding (for use inside bottom sheet header) */
	embedded?: boolean;
};

function completionStatus(
	completion: number | undefined,
): "full" | "partial" | "empty" {
	if (completion != null && completion >= 100) return "full";
	if (completion != null && completion > 0) return "partial";
	return "empty";
}

export default function MobileSectionNav({
	sections,
	activeSection,
	onSectionChange,
	embedded = false,
}: MobileSectionNavProps) {
	const activeRef = useRef<HTMLButtonElement>(null);
	const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

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
					const status = completionStatus(section.completion);
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
							onClick={() => onSectionChange(section.id)}
							onKeyDown={handleTabKeyDown}
						>
							{section.label || section.id}
							<span
								className="dm-completion-ring"
								data-complete={status}
								aria-hidden="true"
							/>
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
