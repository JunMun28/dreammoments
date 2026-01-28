import type { ScheduleBlock } from "@/contexts/InvitationBuilderContext";
import { formatTime } from "@/lib/format-utils";
import { sortByOrder } from "@/lib/list-utils";

interface ScheduleSectionProps {
	/** Array of schedule blocks */
	scheduleBlocks?: ScheduleBlock[];
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
 * Schedule section for the long-page invitation format.
 * Displays the wedding day timeline.
 */
export function ScheduleSection({
	scheduleBlocks,
	accentColor,
	isMobile = false,
	themeVariant = "light",
	backgroundColor,
}: ScheduleSectionProps) {
	const sortedBlocks = scheduleBlocks ? sortByOrder(scheduleBlocks) : [];
	const hasSchedule = sortedBlocks.length > 0;
	const isDark = themeVariant === "dark";

	return (
		<section
			className={`flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 ${
				isDark ? "" : "bg-stone-50"
			}`}
			style={{ backgroundColor: isDark ? backgroundColor : undefined }}
		>
			<p
				className="mb-8 text-center text-sm uppercase tracking-widest"
				style={{ color: accentColor }}
			>
				Order of Events
			</p>

			{hasSchedule ? (
				<div
					className={`w-full ${isMobile ? "max-w-sm" : "max-w-md"} space-y-6`}
				>
					{sortedBlocks.map((block, index) => (
						<div
							key={block.id}
							className="relative flex gap-4"
							style={{ fontFamily: "var(--font-body)" }}
						>
							{/* Timeline line */}
							{index < sortedBlocks.length - 1 && (
								<div
									className="absolute left-[11px] top-8 h-full w-0.5"
									style={{
										backgroundColor: isDark
											? `${accentColor}40`
											: `${accentColor}20`,
									}}
								/>
							)}

							{/* Timeline dot */}
							<div
								className="relative z-10 mt-1.5 h-6 w-6 shrink-0 rounded-full border-2"
								style={{
									borderColor: accentColor,
									backgroundColor: isDark ? backgroundColor : "white",
								}}
							>
								<div
									className="absolute inset-1 rounded-full"
									style={{ backgroundColor: accentColor }}
								/>
							</div>

							{/* Content */}
							<div className="flex-1 pb-6">
								{block.time && (
									<p
										className="text-sm font-medium"
										style={{ color: accentColor }}
									>
										{formatTime(block.time)}
									</p>
								)}
								<p
									className={`mt-1 font-medium ${isDark ? "text-white" : "text-stone-800"}`}
								>
									{block.title}
								</p>
								{block.description && (
									<p
										className={`mt-1 text-sm ${isDark ? "text-white/60" : "text-stone-500"}`}
									>
										{block.description}
									</p>
								)}
							</div>
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
						Add schedule events to show your wedding day timeline
					</p>
				</div>
			)}
		</section>
	);
}
