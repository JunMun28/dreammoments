import { CountdownTimer } from "../CountdownTimer";

interface CountdownSectionProps {
	/** Wedding date in ISO format (YYYY-MM-DD) */
	weddingDate?: string;
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
 * Countdown section for the long-page invitation format.
 * Displays a countdown timer to the wedding day.
 */
export function CountdownSection({
	weddingDate,
	accentColor,
	isMobile = false,
	themeVariant = "light",
	backgroundColor,
}: CountdownSectionProps) {
	const isDark = themeVariant === "dark";

	// Slightly lighter/darker shade for alternating sections
	const getSectionBg = () => {
		if (isDark && backgroundColor) {
			// Lighten the background slightly for contrast
			return backgroundColor;
		}
		return undefined;
	};

	return (
		<section
			className={`flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 ${
				isDark ? "" : "bg-stone-50"
			}`}
			style={{ backgroundColor: getSectionBg() }}
		>
			<p
				className="mb-8 text-center text-sm uppercase tracking-widest"
				style={{ color: accentColor }}
			>
				Counting Down To Our Big Day
			</p>

			<div className={isMobile ? "w-full max-w-sm" : "w-full max-w-lg"}>
				<CountdownTimer
					weddingDate={weddingDate}
					accentColor={accentColor}
					themeVariant={themeVariant}
				/>
			</div>

			{!weddingDate && (
				<p
					className={`mt-4 text-center text-sm italic ${
						isDark ? "text-white/40" : "text-stone-400"
					}`}
				>
					Set a wedding date to see the countdown
				</p>
			)}
		</section>
	);
}
