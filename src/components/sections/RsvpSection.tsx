interface RsvpSectionProps {
	/** RSVP deadline date */
	rsvpDeadline?: Date;
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
 * Formats a Date to a readable string like "June 15, 2026"
 */
function formatDate(date: Date | undefined): string {
	if (!date) return "";
	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

/**
 * RSVP section for the long-page invitation format.
 * Displays RSVP information and deadline.
 */
export function RsvpSection({
	rsvpDeadline,
	accentColor,
	isMobile = false,
	themeVariant = "light",
	backgroundColor,
}: RsvpSectionProps) {
	const isDark = themeVariant === "dark";

	return (
		<section
			className={`flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 ${
				isDark ? "" : "bg-white"
			}`}
			style={{ backgroundColor: isDark ? backgroundColor : undefined }}
		>
			<p
				className="mb-4 text-center text-sm uppercase tracking-widest"
				style={{ color: accentColor }}
			>
				RSVP
			</p>

			<div
				className={`w-full ${isMobile ? "max-w-sm" : "max-w-md"} text-center`}
			>
				<p
					className={`mb-6 text-2xl font-light ${isDark ? "text-white" : "text-stone-800"}`}
					style={{ fontFamily: "var(--font-heading)" }}
				>
					We hope you can make it!
				</p>

				{rsvpDeadline ? (
					<p className={`mb-8 ${isDark ? "text-white/70" : "text-stone-500"}`}>
						Please respond by{" "}
						<span className="font-medium" style={{ color: accentColor }}>
							{formatDate(rsvpDeadline)}
						</span>
					</p>
				) : (
					<p
						className={`mb-8 text-sm italic ${
							isDark ? "text-white/40" : "text-stone-400"
						}`}
					>
						Set an RSVP deadline in the settings
					</p>
				)}

				{/* Placeholder RSVP button */}
				<button
					type="button"
					className="rounded-full px-8 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
					style={{ backgroundColor: accentColor }}
					disabled
				>
					RSVP Now
				</button>

				<p
					className={`mt-4 text-xs ${isDark ? "text-white/40" : "text-stone-400"}`}
				>
					(RSVP functionality available on the guest page)
				</p>
			</div>
		</section>
	);
}
