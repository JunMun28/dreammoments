import {
	Calendar,
	Clock,
	Heart,
	Image,
	MapPin,
	MessageSquare,
	UserCheck,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import {
	type SectionId,
	useInvitationBuilder,
} from "@/contexts/InvitationBuilderContext";
import { cn } from "@/lib/utils";

/**
 * Section definition with id, label, and icon
 */
interface SectionDef {
	id: SectionId;
	label: string;
	icon: typeof Heart;
}

/**
 * All available sections for the longpage format
 */
const ALL_SECTIONS: SectionDef[] = [
	{ id: "hero", label: "Hero", icon: Heart },
	{ id: "countdown", label: "Countdown", icon: Clock },
	{ id: "gallery", label: "Gallery", icon: Image },
	{ id: "schedule", label: "Schedule", icon: Calendar },
	{ id: "venue", label: "Venue", icon: MapPin },
	{ id: "notes", label: "Details", icon: MessageSquare },
	{ id: "rsvp", label: "RSVP", icon: UserCheck },
];

/**
 * Section thumbnail card component
 */
function SectionThumbnail({
	section,
	isActive,
	isVisible,
	onClick,
}: {
	section: SectionDef;
	isActive: boolean;
	isVisible: boolean;
	onClick: () => void;
}) {
	const Icon = section.icon;

	return (
		<button
			type="button"
			className={cn(
				"group w-full rounded-lg border-2 p-3 text-left transition-all",
				isActive
					? "border-stone-800 bg-stone-50"
					: "border-transparent hover:border-stone-200 hover:bg-stone-50",
				!isVisible && "opacity-50",
			)}
			onClick={onClick}
		>
			{/* Mini preview placeholder */}
			<div
				className={cn(
					"mb-2 flex h-16 items-center justify-center rounded bg-stone-100",
					isActive && "bg-stone-200",
				)}
			>
				<Icon
					className={cn(
						"h-6 w-6",
						isActive ? "text-stone-600" : "text-stone-400",
					)}
				/>
			</div>

			{/* Label */}
			<span
				className={cn(
					"text-xs font-medium",
					isActive ? "text-stone-800" : "text-stone-500",
				)}
			>
				{section.label}
			</span>
		</button>
	);
}

/**
 * Section thumbnails panel.
 * Shows miniature previews of each invitation section.
 * Clicking a thumbnail scrolls the canvas to that section.
 */
export function SectionThumbnails() {
	const { invitation, editorState, setActiveSection } = useInvitationBuilder();

	// Determine which sections are visible based on invitation data
	const visibleSections = useMemo(() => {
		const visible = new Set<SectionId>(["hero", "countdown", "rsvp"]);

		if (invitation.galleryImages && invitation.galleryImages.length > 0) {
			visible.add("gallery");
		}
		if (invitation.scheduleBlocks && invitation.scheduleBlocks.length > 0) {
			visible.add("schedule");
		}
		if (invitation.venueName || invitation.venueAddress) {
			visible.add("venue");
		}
		if (invitation.notes && invitation.notes.length > 0) {
			visible.add("notes");
		}

		return visible;
	}, [invitation]);

	const handleSectionClick = useCallback(
		(sectionId: SectionId) => {
			setActiveSection(sectionId);

			// Scroll the canvas to the section
			const canvasElement = document.querySelector(".flex-1.overflow-auto.p-8");
			if (canvasElement) {
				const sectionElement = canvasElement.querySelector(`#${sectionId}`);
				if (sectionElement) {
					sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			}
		},
		[setActiveSection],
	);

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="border-b bg-stone-50 px-4 py-3">
				<h3 className="text-sm font-semibold text-stone-700">Sections</h3>
			</div>

			{/* Section list */}
			<div className="flex-1 space-y-2 overflow-y-auto p-3">
				{ALL_SECTIONS.map((section) => (
					<SectionThumbnail
						key={section.id}
						section={section}
						isActive={editorState.activeSection === section.id}
						isVisible={visibleSections.has(section.id)}
						onClick={() => handleSectionClick(section.id)}
					/>
				))}
			</div>
		</div>
	);
}
