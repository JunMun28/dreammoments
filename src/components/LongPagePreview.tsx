import { type CSSProperties, useEffect, useMemo } from "react";
import { useInvitationBuilder } from "@/contexts/InvitationBuilderContext";
import { cn } from "@/lib/utils";
import { CountdownSection } from "./sections/CountdownSection";
import { GallerySectionPreview } from "./sections/GallerySectionPreview";
import { HeroSection } from "./sections/HeroSection";
import { NotesSection } from "./sections/NotesSection";
import { RsvpSection } from "./sections/RsvpSection";
import { ScheduleSection } from "./sections/ScheduleSection";
import { VenueSection } from "./sections/VenueSection";
import { getFontPairingById, getGoogleFontsUrl } from "./ui/font-picker";
import { SectionNav } from "./ui/section-nav";
import type { ViewportMode } from "./ui/viewport-toggle";

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

interface LongPagePreviewProps {
	/**
	 * Viewport mode for preview sizing.
	 * - "desktop": Full width preview (default)
	 * - "mobile": Constrained width to simulate mobile device
	 */
	viewportMode?: ViewportMode;
	/**
	 * Whether to show the floating section navigation
	 */
	showNav?: boolean;
}

/**
 * Long-page format preview component that renders the wedding invitation
 * as a scrollable multi-section page.
 * Consumes InvitationBuilderContext for real-time updates.
 */
export function LongPagePreview({
	viewportMode = "desktop",
	showNav = true,
}: LongPagePreviewProps) {
	const { invitation } = useInvitationBuilder();

	const {
		partner1Name,
		partner2Name,
		weddingDate,
		venueName,
		venueAddress,
		venueLatitude,
		venueLongitude,
		scheduleBlocks,
		notes,
		accentColor,
		fontPairing,
		heroImageUrl,
		galleryImages,
		rsvpDeadline,
		themeVariant,
		backgroundColor,
		decorativeElements,
	} = invitation;

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

		const existingLink = document.querySelector(`link[href="${fontsUrl}"]`);
		if (existingLink) return;

		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = fontsUrl;
		link.dataset.fontPreview = "true";
		document.head.appendChild(link);
	}, [fontsUrl]);

	const isMobile = viewportMode === "mobile";
	const effectiveAccentColor = accentColor || DEFAULT_ACCENT_COLOR;
	const isDark = themeVariant === "dark";

	// Define sections for navigation
	const sections = [
		{ id: "hero", label: "Home" },
		{ id: "countdown", label: "Countdown" },
		...(galleryImages && galleryImages.length > 0
			? [{ id: "gallery", label: "Gallery" }]
			: []),
		...(scheduleBlocks && scheduleBlocks.length > 0
			? [{ id: "schedule", label: "Schedule" }]
			: []),
		...(venueName || venueAddress ? [{ id: "venue", label: "Venue" }] : []),
		...(notes && notes.length > 0 ? [{ id: "notes", label: "Details" }] : []),
		{ id: "rsvp", label: "RSVP" },
	];

	return (
		<div
			className={cn(
				"relative overflow-x-hidden transition-all duration-300",
				isDark ? "" : "bg-white",
				isMobile
					? "mx-auto max-w-[375px] min-h-[667px]"
					: "h-full min-h-[400px]",
			)}
			style={{
				...combinedStyle,
				backgroundColor: isDark ? backgroundColor : undefined,
			}}
			data-viewport={viewportMode}
		>
			{/* Section navigation - only show on desktop in builder preview */}
			{showNav && !isMobile && (
				<SectionNav sections={sections} accentColor={effectiveAccentColor} />
			)}

			{/* Hero Section */}
			{/* biome-ignore lint/correctness/useUniqueElementIds: Static IDs used for scroll navigation anchors */}
			<div id="hero">
				<HeroSection
					partner1Name={partner1Name}
					partner2Name={partner2Name}
					weddingDate={weddingDate}
					heroImageUrl={heroImageUrl}
					accentColor={effectiveAccentColor}
					fontStyle={combinedStyle}
					isMobile={isMobile}
					themeVariant={themeVariant}
					backgroundColor={backgroundColor}
					decorativeElements={decorativeElements}
				/>
			</div>

			{/* Countdown Section */}
			{/* biome-ignore lint/correctness/useUniqueElementIds: Static IDs used for scroll navigation anchors */}
			<div id="countdown">
				<CountdownSection
					weddingDate={
						weddingDate ? weddingDate.toISOString().split("T")[0] : undefined
					}
					accentColor={effectiveAccentColor}
					isMobile={isMobile}
					themeVariant={themeVariant}
					backgroundColor={backgroundColor}
				/>
			</div>

			{/* Gallery Section */}
			{galleryImages && galleryImages.length > 0 && (
				// biome-ignore lint/correctness/useUniqueElementIds: Static IDs used for scroll navigation anchors
				<div id="gallery">
					<GallerySectionPreview
						images={galleryImages}
						accentColor={effectiveAccentColor}
						isMobile={isMobile}
						themeVariant={themeVariant}
						backgroundColor={backgroundColor}
					/>
				</div>
			)}

			{/* Schedule Section */}
			{scheduleBlocks && scheduleBlocks.length > 0 && (
				// biome-ignore lint/correctness/useUniqueElementIds: Static IDs used for scroll navigation anchors
				<div id="schedule">
					<ScheduleSection
						scheduleBlocks={scheduleBlocks}
						accentColor={effectiveAccentColor}
						isMobile={isMobile}
						themeVariant={themeVariant}
						backgroundColor={backgroundColor}
					/>
				</div>
			)}

			{/* Venue Section */}
			{(venueName || venueAddress) && (
				// biome-ignore lint/correctness/useUniqueElementIds: Static IDs used for scroll navigation anchors
				<div id="venue">
					<VenueSection
						venueName={venueName}
						venueAddress={venueAddress}
						venueLatitude={venueLatitude}
						venueLongitude={venueLongitude}
						accentColor={effectiveAccentColor}
						isMobile={isMobile}
						themeVariant={themeVariant}
						backgroundColor={backgroundColor}
					/>
				</div>
			)}

			{/* Notes Section */}
			{notes && notes.length > 0 && (
				// biome-ignore lint/correctness/useUniqueElementIds: Static IDs used for scroll navigation anchors
				<div id="notes">
					<NotesSection
						notes={notes}
						accentColor={effectiveAccentColor}
						isMobile={isMobile}
						themeVariant={themeVariant}
						backgroundColor={backgroundColor}
					/>
				</div>
			)}

			{/* RSVP Section */}
			{/* biome-ignore lint/correctness/useUniqueElementIds: Static IDs used for scroll navigation anchors */}
			<div id="rsvp">
				<RsvpSection
					rsvpDeadline={rsvpDeadline}
					accentColor={effectiveAccentColor}
					isMobile={isMobile}
					themeVariant={themeVariant}
					backgroundColor={backgroundColor}
				/>
			</div>

			{/* Footer */}
			<footer
				className={`py-8 text-center ${isDark ? "" : "bg-stone-100"}`}
				style={{ backgroundColor: isDark ? backgroundColor : undefined }}
			>
				<p className={`text-xs ${isDark ? "text-white/40" : "text-stone-400"}`}>
					Made with love using DreamMoments
				</p>
			</footer>
		</div>
	);
}
