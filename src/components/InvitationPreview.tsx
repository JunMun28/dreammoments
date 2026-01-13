import { CalendarDays, Clock, MapPin } from "lucide-react";
import { type CSSProperties, useEffect, useMemo } from "react";
import {
	type Note,
	type ScheduleBlock,
	useInvitationBuilder,
} from "@/contexts/InvitationBuilderContext";
import { cn } from "@/lib/utils";
import { getFontPairingById, getGoogleFontsUrl } from "./ui/font-picker";
import type { ViewportMode } from "./ui/viewport-toggle";

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
 * Formats 24h time "HH:mm" to "H:MM AM/PM"
 */
function formatTime(time: string | undefined): string {
	if (!time) return "";
	const [hours, minutes] = time.split(":").map(Number);
	const period = hours >= 12 ? "PM" : "AM";
	const displayHours = hours % 12 || 12;
	return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Sorts schedule blocks by order field
 */
function sortBlocksByOrder(blocks: ScheduleBlock[]): ScheduleBlock[] {
	return [...blocks].sort((a, b) => a.order - b.order);
}

/**
 * Sorts notes by order field
 */
function sortNotesByOrder(notes: Note[]): Note[] {
	return [...notes].sort((a, b) => a.order - b.order);
}

/**
 * Default accent color for the invitation preview
 */
const DEFAULT_ACCENT_COLOR = "#b76e79"; // Rose Gold

/**
 * Generates CSS custom properties style object for accent color
 */
function getAccentColorStyle(accentColor?: string): CSSProperties {
	const color = accentColor || DEFAULT_ACCENT_COLOR;
	return {
		"--accent-color": color,
	} as CSSProperties;
}

/**
 * Generates CSS custom properties style object for font families
 */
function getFontStyle(fontPairingId?: string): CSSProperties {
	const pairing = getFontPairingById(fontPairingId);
	return {
		"--font-heading": `"${pairing.headingFont}", serif`,
		"--font-body": `"${pairing.bodyFont}", sans-serif`,
	} as CSSProperties;
}

interface InvitationPreviewProps {
	/**
	 * Viewport mode for preview sizing.
	 * - "desktop": Full width preview (default)
	 * - "mobile": Constrained width to simulate mobile device
	 */
	viewportMode?: ViewportMode;
}

/**
 * Preview component that renders the wedding invitation.
 * Consumes InvitationBuilderContext for real-time updates.
 */
export function InvitationPreview({
	viewportMode = "desktop",
}: InvitationPreviewProps) {
	const { invitation } = useInvitationBuilder();

	const {
		partner1Name,
		partner2Name,
		weddingDate,
		weddingTime,
		venueName,
		venueAddress,
		scheduleBlocks,
		notes,
		accentColor,
		fontPairing,
	} = invitation;

	// Memoize accent color style to avoid recalculating on every render
	const accentStyle = useMemo(
		() => getAccentColorStyle(accentColor),
		[accentColor],
	);

	// Memoize font style to avoid recalculating on every render
	const fontStyle = useMemo(() => getFontStyle(fontPairing), [fontPairing]);

	// Combine all styles
	const combinedStyle = useMemo(
		() => ({ ...accentStyle, ...fontStyle }),
		[accentStyle, fontStyle],
	);

	// Load Google Fonts for the selected pairing
	const selectedPairing = useMemo(
		() => getFontPairingById(fontPairing),
		[fontPairing],
	);
	const fontsUrl = useMemo(
		() =>
			getGoogleFontsUrl([
				selectedPairing.headingFont,
				selectedPairing.bodyFont,
			]),
		[selectedPairing],
	);

	useEffect(() => {
		if (!fontsUrl) return;

		// Check if link already exists
		const existingLink = document.querySelector(`link[href="${fontsUrl}"]`);
		if (existingLink) return;

		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = fontsUrl;
		link.dataset.fontPreview = "true";
		document.head.appendChild(link);
	}, [fontsUrl]);

	const sortedBlocks = scheduleBlocks ? sortBlocksByOrder(scheduleBlocks) : [];
	const hasSchedule = sortedBlocks.length > 0;

	const sortedNotes = notes ? sortNotesByOrder(notes) : [];
	const hasNotes = sortedNotes.length > 0;

	const hasNames = partner1Name || partner2Name;
	const hasDateOrTime = weddingDate || weddingTime;
	const hasVenue = venueName || venueAddress;

	const isMobile = viewportMode === "mobile";

	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-lg bg-gradient-to-br from-stone-100 to-stone-200 transition-all duration-300",
				isMobile
					? "mx-auto max-w-[375px] min-h-[667px] p-4"
					: "h-full min-h-[400px] p-8",
			)}
			style={combinedStyle}
			data-viewport={viewportMode}
		>
			{/* Glassmorphism card */}
			<div
				className={cn(
					"relative mx-auto rounded-xl border border-white/40 bg-white/70 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] backdrop-blur-md",
					isMobile ? "max-w-full p-4" : "max-w-md p-8",
				)}
				style={{ fontFamily: "var(--font-body)" }}
			>
				{/* Header accent */}
				<div className="mb-8 text-center">
					<p
						className="text-sm uppercase tracking-widest"
						style={{ color: "var(--accent-color)" }}
					>
						You are invited to the wedding of
					</p>
				</div>

				{/* Couple names */}
				<div className="mb-8 text-center">
					{hasNames ? (
						<h1
							className="text-3xl font-light tracking-wide text-stone-800 md:text-4xl"
							style={{ fontFamily: "var(--font-heading)" }}
						>
							{partner1Name || "Partner One"}
							<span
								className="mx-3 text-2xl"
								style={{ color: "var(--accent-color)" }}
							>
								&
							</span>
							{partner2Name || "Partner Two"}
						</h1>
					) : (
						<h1
							className="text-3xl font-light italic tracking-wide text-stone-400 md:text-4xl"
							style={{ fontFamily: "var(--font-heading)" }}
						>
							Your Names Here
						</h1>
					)}
				</div>

				{/* Divider */}
				<div
					className="mx-auto mb-8 h-px w-24"
					style={{ backgroundColor: "var(--accent-color)" }}
				/>

				{/* Date and time */}
				<div className="mb-6 flex flex-col items-center gap-3">
					{hasDateOrTime ? (
						<>
							{weddingDate && (
								<div className="flex items-center gap-2 text-stone-600">
									<CalendarDays className="h-4 w-4" />
									<span className="text-lg">{formatDate(weddingDate)}</span>
								</div>
							)}
							{weddingTime && (
								<div className="flex items-center gap-2 text-stone-600">
									<Clock className="h-4 w-4" />
									<span>{formatTime(weddingTime)}</span>
								</div>
							)}
						</>
					) : (
						<p className="text-sm italic text-stone-400">
							Date and time will appear here
						</p>
					)}
				</div>

				{/* Venue */}
				<div className="text-center">
					{hasVenue ? (
						<div className="flex flex-col items-center gap-1">
							<div className="flex items-center gap-2 text-stone-600">
								<MapPin className="h-4 w-4" />
								<span className="font-medium">{venueName}</span>
							</div>
							{venueAddress && (
								<p className="text-sm text-stone-500">{venueAddress}</p>
							)}
						</div>
					) : (
						<p className="text-sm italic text-stone-400">
							Venue details will appear here
						</p>
					)}
				</div>

				{/* Schedule */}
				<div className="mt-8 border-t border-stone-200 pt-6">
					<p
						className="mb-4 text-center text-xs uppercase tracking-widest"
						style={{ color: "var(--accent-color)" }}
					>
						Schedule
					</p>
					{hasSchedule ? (
						<div className="space-y-4">
							{sortedBlocks.map((block) => (
								<div key={block.id} className="flex gap-4 text-left">
									{/* Time column */}
									<div className="w-20 shrink-0 text-right">
										{block.time ? (
											<span className="text-sm font-medium text-stone-600">
												{formatTime(block.time)}
											</span>
										) : (
											<span className="text-sm text-stone-400">—</span>
										)}
									</div>
									{/* Content column */}
									<div className="flex-1">
										<p className="font-medium text-stone-700">{block.title}</p>
										{block.description && (
											<p className="mt-1 text-sm text-stone-500">
												{block.description}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-center text-sm italic text-stone-400">
							Schedule events will appear here
						</p>
					)}
				</div>

				{/* Notes */}
				<div className="mt-8 border-t border-stone-200 pt-6">
					<p
						className="mb-4 text-center text-xs uppercase tracking-widest"
						style={{ color: "var(--accent-color)" }}
					>
						Things to Know
					</p>
					{hasNotes ? (
						<div className="space-y-4">
							{sortedNotes.map((note) => (
								<div key={note.id} className="text-center">
									<p className="font-medium text-stone-700">{note.title}</p>
									{note.description && (
										<p className="mt-1 text-sm text-stone-500">
											{note.description}
										</p>
									)}
								</div>
							))}
						</div>
					) : (
						<p className="text-center text-sm italic text-stone-400">
							Notes and FAQ will appear here
						</p>
					)}
				</div>

				{/* RSVP section placeholder */}
				<div className="mt-10 border-t border-stone-200 pt-6 text-center">
					<p
						className="mb-3 text-xs uppercase tracking-widest"
						style={{ color: "var(--accent-color)" }}
					>
						RSVP
					</p>
					<p className="text-sm text-stone-500">Please respond by [deadline]</p>
				</div>
			</div>
		</div>
	);
}

export {
	DEFAULT_ACCENT_COLOR,
	formatDate,
	formatTime,
	getAccentColorStyle,
	getFontStyle,
	sortBlocksByOrder,
	sortNotesByOrder,
};
