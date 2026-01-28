/**
 * Blessings section for long page format
 */

import { Heart } from "lucide-react";
import type { BlessingData } from "@/lib/blessings-server";
import { cn } from "@/lib/utils";
import { BlessingsBoard } from "../BlessingsBoard";

interface BlessingsSectionProps {
	/** Invitation ID */
	invitationId: string;
	/** List of blessings to display */
	blessings: BlessingData[];
	/** Callback when a new blessing is submitted */
	onSubmit: (data: {
		authorName: string;
		message: string;
		parentId?: string;
	}) => Promise<void>;
	/** Whether a blessing is being submitted */
	isSubmitting?: boolean;
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
 * Blessings section for displaying and collecting guest messages
 */
export function BlessingsSection({
	invitationId,
	blessings,
	onSubmit,
	isSubmitting = false,
	accentColor = "#b76e79",
	isMobile = false,
	themeVariant = "light",
	backgroundColor,
}: BlessingsSectionProps) {
	const isDark = themeVariant === "dark";

	return (
		<section
			className={cn("py-12 md:py-16", isDark ? "" : "bg-white")}
			style={{ backgroundColor: isDark ? backgroundColor : undefined }}
		>
			<div className={cn("container mx-auto px-4", isMobile ? "px-4" : "px-8")}>
				{/* Section header */}
				<div className="text-center mb-8">
					<div className="flex items-center justify-center gap-2 mb-2">
						<Heart className="h-5 w-5" style={{ color: accentColor }} />
					</div>
					<h2
						className={cn(
							"text-2xl md:text-3xl font-heading",
							isDark ? "text-white" : "text-stone-800",
						)}
						style={{ fontFamily: "var(--font-heading)" }}
					>
						Blessings & Wishes
					</h2>
					<p
						className={cn(
							"mt-2 text-sm",
							isDark ? "text-white/60" : "text-stone-500",
						)}
					>
						Share your love and best wishes for the couple
					</p>
				</div>

				{/* Blessings board */}
				<div className="max-w-2xl mx-auto">
					<BlessingsBoard
						invitationId={invitationId}
						blessings={blessings}
						onSubmit={onSubmit}
						isSubmitting={isSubmitting}
						accentColor={accentColor}
						isDark={isDark}
						allowReplies={true}
					/>
				</div>
			</div>
		</section>
	);
}
