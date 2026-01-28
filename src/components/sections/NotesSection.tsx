import type { Note } from "@/contexts/InvitationBuilderContext";
import { sortByOrder } from "@/lib/list-utils";

interface NotesSectionProps {
	/** Array of notes/FAQ items */
	notes?: Note[];
	/** Accent color */
	accentColor?: string;
	/** Whether in mobile viewport mode */
	isMobile?: boolean;
	/** Theme variant - light or dark */
	themeVariant?: "light" | "dark";
	/** Background color for dark themes */
	backgroundColor?: string;
}

/**
 * Notes section for the long-page invitation format.
 * Displays FAQ and additional information for guests.
 */
export function NotesSection({
	notes,
	accentColor,
	isMobile = false,
	themeVariant = "light",
	backgroundColor,
}: NotesSectionProps) {
	const sortedNotes = notes ? sortByOrder(notes) : [];
	const hasNotes = sortedNotes.length > 0;
	const isDark = themeVariant === "dark";

	return (
		<section
			className={`flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 ${
				isDark ? "" : "bg-stone-50"
			}`}
			style={{ backgroundColor: isDark ? backgroundColor : undefined }}
		>
			<p
				className="mb-8 text-center text-sm uppercase tracking-widest"
				style={{ color: accentColor }}
			>
				Things to Know
			</p>

			{hasNotes ? (
				<div
					className={`w-full ${isMobile ? "max-w-sm" : "max-w-lg"} space-y-6`}
				>
					{sortedNotes.map((note) => (
						<div
							key={note.id}
							className={`rounded-xl p-6 ${
								isDark ? "bg-white/10 backdrop-blur-sm" : "bg-white shadow-sm"
							}`}
							style={{ fontFamily: "var(--font-body)" }}
						>
							<h4
								className={`mb-2 font-medium ${isDark ? "text-white" : "text-stone-800"}`}
								style={{ fontFamily: "var(--font-heading)" }}
							>
								{note.title}
							</h4>
							{note.description && (
								<p
									className={`text-sm leading-relaxed ${
										isDark ? "text-white/70" : "text-stone-500"
									}`}
								>
									{note.description}
								</p>
							)}
						</div>
					))}
				</div>
			) : (
				<div
					className={`flex h-32 items-center justify-center rounded-lg border-2 border-dashed px-8 ${
						isDark ? "border-white/20" : "border-stone-200"
					}`}
				>
					<p
						className={`text-center text-sm italic ${
							isDark ? "text-white/40" : "text-stone-400"
						}`}
					>
						Add notes to share important information with your guests
					</p>
				</div>
			)}
		</section>
	);
}
