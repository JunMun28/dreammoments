import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

type SectionPillBarProps = {
	sections: Array<{ id: string; label: string; completion: number }>;
	activeSection: string;
	onSectionChange: (sectionId: string) => void;
};

function CompletionIcon({ completion }: { completion: number }) {
	if (completion >= 100) {
		// Checkmark for complete
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
	if (completion > 0) {
		// Half-filled circle for partial
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
	// Empty circle for not started
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

export function SectionPillBar({
	sections,
	activeSection,
	onSectionChange,
}: SectionPillBarProps) {
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
						<CompletionIcon completion={section.completion} />
					</button>
				);
			})}
		</div>
	);
}
