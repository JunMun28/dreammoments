/**
 * TemplatePreview - Standalone preview component for template browsing.
 * Unlike InvitationPreview, this accepts data via props instead of context.
 */

import { CalendarDays, Clock, MapPin } from "lucide-react";
import { type CSSProperties, useEffect, useMemo } from "react";
import type { Note, ScheduleBlock } from "@/contexts/InvitationBuilderContext";
import { formatTime } from "@/lib/format-utils";
import { sortByOrder } from "@/lib/list-utils";
import { cn } from "@/lib/utils";
import { CountdownTimer } from "./CountdownTimer";
import { getFontPairingById, getGoogleFontsUrl } from "./ui/font-picker";
import type { ViewportMode } from "./ui/viewport-toggle";

/**
 * Formats a Date to a readable string like "June 15, 2026"
 * Note: This accepts Date objects, unlike format-utils.ts which accepts strings
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

export interface TemplatePreviewProps {
	partner1Name?: string;
	partner2Name?: string;
	weddingDate?: Date;
	weddingTime?: string;
	venueName?: string;
	venueAddress?: string;
	scheduleBlocks?: ScheduleBlock[];
	notes?: Note[];
	accentColor?: string;
	fontPairing?: string;
	heroImageUrl?: string;
	viewportMode?: ViewportMode;
}

/**
 * Standalone preview component for template browsing.
 * Accepts all invitation data as props instead of from context.
 */
export function TemplatePreview({
	partner1Name,
	partner2Name,
	weddingDate,
	weddingTime,
	venueName,
	venueAddress,
	scheduleBlocks = [],
	notes = [],
	accentColor,
	fontPairing,
	heroImageUrl,
	viewportMode = "desktop",
}: TemplatePreviewProps) {
	// Memoize accent color style
	const accentStyle = useMemo(
		() => getAccentColorStyle(accentColor),
		[accentColor],
	);

	// Memoize font style
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

	const sortedBlocks = sortByOrder(scheduleBlocks);
	const hasSchedule = sortedBlocks.length > 0;

	const sortedNotes = sortByOrder(notes);
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
					? "mx-auto max-w-[375px] min-h-[667px]"
					: "h-full min-h-[400px]",
			)}
			style={combinedStyle}
			data-viewport={viewportMode}
			data-testid="template-preview"
		>
			{/* Hero image */}
			{heroImageUrl && (
				<div
					className={cn("relative overflow-hidden", isMobile ? "h-48" : "h-64")}
					data-testid="hero-image-container"
				>
					<img
						src={heroImageUrl}
						alt={
							partner1Name && partner2Name
								? `Wedding photo of ${partner1Name} and ${partner2Name}`
								: "Wedding invitation hero photo"
						}
						className="h-full w-full object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-100/80" />
				</div>
			)}

			{/* Glassmorphism card */}
			<div
				className={cn(
					"relative mx-auto rounded-xl border border-white/40 bg-white/70 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] backdrop-blur-md",
					isMobile ? "max-w-full p-4" : "max-w-md p-8",
					heroImageUrl
						? isMobile
							? "-mt-8 mx-4"
							: "-mt-16 mx-8"
						: isMobile
							? "m-4"
							: "m-8",
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

				{/* Countdown Timer */}
				<div className="mt-8 border-t border-stone-200 pt-6">
					<p
						className="mb-2 text-center text-xs uppercase tracking-widest"
						style={{ color: "var(--accent-color)" }}
					>
						Countdown
					</p>
					<CountdownTimer
						weddingDate={
							weddingDate ? weddingDate.toISOString().split("T")[0] : undefined
						}
						accentColor={accentColor}
					/>
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

// Re-export utilities for backwards compatibility
export { formatDate };
export { formatTime } from "@/lib/format-utils";
export {
	sortByOrder as sortBlocksByOrder,
	sortByOrder as sortNotesByOrder,
} from "@/lib/list-utils";
