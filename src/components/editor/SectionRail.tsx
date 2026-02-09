import type { LucideIcon } from "lucide-react";
import {
	BookHeart,
	CalendarDays,
	Clock,
	FileText,
	Gift,
	Heart,
	HelpCircle,
	Images,
	Mail,
	MapPin,
	MessageSquare,
	ScrollText,
	Timer,
	Users,
} from "lucide-react";
import { useCallback, useRef } from "react";

type SectionRailProps = {
	sections: Array<{ id: string; label: string; completion: number }>;
	activeSection: string;
	onSectionChange: (sectionId: string) => void;
};

const sectionIconMap: Record<string, LucideIcon> = {
	hero: Heart,
	announcement: ScrollText,
	couple: Users,
	story: BookHeart,
	gallery: Images,
	schedule: Clock,
	venue: MapPin,
	entourage: Users,
	registry: Gift,
	rsvp: Mail,
	faq: HelpCircle,
	footer: MessageSquare,
	calendar: CalendarDays,
	countdown: Timer,
	details: FileText,
};

function CompletionRing({
	completion,
	active,
}: {
	completion: number;
	active: boolean;
}) {
	const radius = 19;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (completion / 100) * circumference;

	return (
		<svg
			className="pointer-events-none absolute inset-0"
			width="44"
			height="44"
			viewBox="0 0 44 44"
			aria-hidden="true"
		>
			{/* Background circle */}
			<circle
				cx="22"
				cy="22"
				r={radius}
				fill="none"
				stroke={active ? "rgba(255,255,255,0.2)" : "var(--dm-border)"}
				strokeWidth="2"
			/>
			{/* Progress arc */}
			{completion > 0 && (
				<circle
					cx="22"
					cy="22"
					r={radius}
					fill="none"
					stroke={active ? "var(--dm-on-accent)" : "var(--dm-peach)"}
					strokeWidth="2"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					transform="rotate(-90 22 22)"
				/>
			)}
		</svg>
	);
}

export function SectionRail({
	sections,
	activeSection,
	onSectionChange,
}: SectionRailProps) {
	const itemsRef = useRef<Map<string, HTMLButtonElement>>(new Map());

	const setItemRef = useCallback(
		(id: string) => (el: HTMLButtonElement | null) => {
			if (el) {
				itemsRef.current.set(id, el);
			} else {
				itemsRef.current.delete(id);
			}
		},
		[],
	);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		const currentIndex = sections.findIndex((s) => s.id === activeSection);
		let nextIndex = currentIndex;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				nextIndex = (currentIndex + 1) % sections.length;
				break;
			case "ArrowUp":
				e.preventDefault();
				nextIndex = (currentIndex - 1 + sections.length) % sections.length;
				break;
			case "Home":
				e.preventDefault();
				nextIndex = 0;
				break;
			case "End":
				e.preventDefault();
				nextIndex = sections.length - 1;
				break;
			default:
				return;
		}

		const nextSection = sections[nextIndex];
		onSectionChange(nextSection.id);
		itemsRef.current.get(nextSection.id)?.focus();
	};

	return (
		<div
			className="dm-section-rail"
			role="tablist"
			aria-orientation="vertical"
			aria-label="Invitation sections"
			onKeyDown={handleKeyDown}
		>
			{sections.map((section) => {
				const Icon = sectionIconMap[section.id] ?? FileText;
				const isActive = section.id === activeSection;

				return (
					<button
						key={section.id}
						ref={setItemRef(section.id)}
						type="button"
						role="tab"
						aria-selected={isActive}
						aria-label={`${section.label} — ${Math.round(section.completion)}% complete`}
						tabIndex={isActive ? 0 : -1}
						className="dm-section-rail-item"
						onClick={() => onSectionChange(section.id)}
					>
						<CompletionRing completion={section.completion} active={isActive} />
						<Icon className="h-5 w-5" aria-hidden="true" />
					</button>
				);
			})}
		</div>
	);
}
