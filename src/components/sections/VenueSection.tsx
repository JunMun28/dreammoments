import { MapPin } from "lucide-react";
import { VenueMap } from "../VenueMap";

interface VenueSectionProps {
	/** Venue name */
	venueName?: string;
	/** Venue address */
	venueAddress?: string;
	/** Venue latitude */
	venueLatitude?: string;
	/** Venue longitude */
	venueLongitude?: string;
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
 * Lighten a hex color by a percentage
 */
function lightenColor(hex: string, percent: number): string {
	const num = Number.parseInt(hex.replace("#", ""), 16);
	const r = Math.min(
		255,
		Math.floor((num >> 16) + (255 - (num >> 16)) * percent),
	);
	const g = Math.min(
		255,
		Math.floor(((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * percent),
	);
	const b = Math.min(
		255,
		Math.floor((num & 0x0000ff) + (255 - (num & 0x0000ff)) * percent),
	);
	return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Venue section for the long-page invitation format.
 * Displays venue details and an embedded map.
 */
export function VenueSection({
	venueName,
	venueAddress,
	venueLatitude,
	venueLongitude,
	accentColor,
	isMobile = false,
	themeVariant = "light",
	backgroundColor,
}: VenueSectionProps) {
	const hasVenue = venueName || venueAddress;
	const hasCoordinates = venueLatitude && venueLongitude;
	const isDark = themeVariant === "dark";

	// Slightly lighter background for contrast in dark mode
	const sectionBg =
		isDark && backgroundColor ? lightenColor(backgroundColor, 0.08) : undefined;

	return (
		<section
			className={`flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 ${
				isDark ? "" : "bg-white"
			}`}
			style={{ backgroundColor: sectionBg }}
		>
			<p
				className="mb-8 text-center text-sm uppercase tracking-widest"
				style={{ color: accentColor }}
			>
				The Venue
			</p>

			{hasVenue ? (
				<div
					className={`w-full ${isMobile ? "max-w-sm" : "max-w-lg"} space-y-6`}
				>
					{/* Venue info */}
					<div className="text-center">
						<div className="mb-2 flex items-center justify-center gap-2">
							<MapPin className="h-5 w-5" style={{ color: accentColor }} />
							<h3
								className={`text-xl font-medium ${isDark ? "text-white" : "text-stone-800"}`}
								style={{ fontFamily: "var(--font-heading)" }}
							>
								{venueName}
							</h3>
						</div>
						{venueAddress && (
							<p className={isDark ? "text-white/70" : "text-stone-500"}>
								{venueAddress}
							</p>
						)}
					</div>

					{/* Map */}
					{hasCoordinates && (
						<div className="overflow-hidden rounded-xl shadow-lg">
							<VenueMap
								latitude={Number.parseFloat(venueLatitude)}
								longitude={Number.parseFloat(venueLongitude)}
								venueName={venueName}
								height={isMobile ? "200px" : "300px"}
								isMobile={isMobile}
							/>
						</div>
					)}

					{/* Directions link */}
					{hasCoordinates && (
						<div className="text-center">
							<a
								href={`https://www.google.com/maps/dir/?api=1&destination=${venueLatitude},${venueLongitude}`}
								target="_blank"
								rel="noopener noreferrer"
								className={`inline-flex items-center gap-2 rounded-full border px-6 py-2 text-sm font-medium transition-colors ${
									isDark ? "hover:bg-white/10" : "hover:bg-stone-50"
								}`}
								style={{ borderColor: accentColor, color: accentColor }}
							>
								Get Directions
								<svg
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
									/>
								</svg>
							</a>
						</div>
					)}
				</div>
			) : (
				<div
					className={`flex h-48 items-center justify-center rounded-lg border-2 border-dashed px-8 ${
						isDark ? "border-white/20" : "border-stone-200"
					}`}
				>
					<p
						className={`text-center text-sm italic ${
							isDark ? "text-white/40" : "text-stone-400"
						}`}
					>
						Add venue details to show your wedding location
					</p>
				</div>
			)}
		</section>
	);
}
