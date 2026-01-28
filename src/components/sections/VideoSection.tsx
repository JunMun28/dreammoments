/**
 * Video section for long page format
 */

import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoPlayer } from "../VideoPlayer";

interface VideoSectionProps {
	/** Video URL */
	videoUrl: string;
	/** Video source type */
	videoSource: "upload" | "youtube";
	/** Accent color for styling */
	accentColor?: string;
	/** Whether in mobile mode */
	isMobile?: boolean;
	/** Theme variant */
	themeVariant?: "light" | "dark";
	/** Background color for dark themes */
	backgroundColor?: string;
}

/**
 * Video section for displaying wedding videos
 */
export function VideoSection({
	videoUrl,
	videoSource,
	accentColor = "#b76e79",
	isMobile = false,
	themeVariant = "light",
	backgroundColor,
}: VideoSectionProps) {
	const isDark = themeVariant === "dark";

	return (
		<section
			className={cn("py-12 md:py-16", isDark ? "" : "bg-stone-50")}
			style={{ backgroundColor: isDark ? backgroundColor : undefined }}
		>
			<div className={cn("container mx-auto px-4", isMobile ? "px-4" : "px-8")}>
				{/* Section header */}
				<div className="text-center mb-8">
					<div className="flex items-center justify-center gap-2 mb-2">
						<Play className="h-5 w-5" style={{ color: accentColor }} />
					</div>
					<h2
						className={cn(
							"text-2xl md:text-3xl font-heading",
							isDark ? "text-white" : "text-stone-800",
						)}
						style={{ fontFamily: "var(--font-heading)" }}
					>
						Our Story
					</h2>
					<p
						className={cn(
							"mt-2 text-sm",
							isDark ? "text-white/60" : "text-stone-500",
						)}
					>
						Watch our journey together
					</p>
				</div>

				{/* Video player */}
				<div className="max-w-3xl mx-auto">
					<VideoPlayer
						videoUrl={videoUrl}
						videoSource={videoSource}
						accentColor={accentColor}
						isDark={isDark}
						className="shadow-lg"
					/>
				</div>
			</div>
		</section>
	);
}
