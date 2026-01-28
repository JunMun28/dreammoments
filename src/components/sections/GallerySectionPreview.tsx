import type { GalleryImage } from "@/contexts/InvitationBuilderContext";
import { PhotoGallery } from "../PhotoGallery";

interface GallerySectionPreviewProps {
	/** Array of gallery images to display */
	images?: GalleryImage[];
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
 * Gallery section for the long-page invitation format.
 * Displays a photo carousel of the couple's images.
 */
export function GallerySectionPreview({
	images,
	accentColor,
	isMobile = false,
	themeVariant = "light",
	backgroundColor,
}: GallerySectionPreviewProps) {
	const hasImages = images && images.length > 0;
	const isDark = themeVariant === "dark";

	// Slightly lighter background for contrast in dark mode
	const sectionBg =
		isDark && backgroundColor ? lightenColor(backgroundColor, 0.08) : undefined;

	return (
		<section
			className={`flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 ${
				isDark ? "" : "bg-white"
			}`}
			style={{ backgroundColor: sectionBg }}
		>
			<p
				className="mb-8 text-center text-sm uppercase tracking-widest"
				style={{ color: accentColor }}
			>
				Our Moments Together
			</p>

			{hasImages ? (
				<div className={isMobile ? "w-full max-w-sm" : "w-full max-w-2xl"}>
					<PhotoGallery
						images={images}
						accentColor={accentColor}
						isMobile={isMobile}
					/>
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
						Add photos in the gallery section to showcase your memories
					</p>
				</div>
			)}
		</section>
	);
}
