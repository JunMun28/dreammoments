import type { CSSProperties } from "react";
import type { DecorativeElements } from "@/lib/template-data";
import { DecorativeBorder } from "../ui/decorative-border";
import { DoubleHappiness } from "../ui/double-happiness";
import { SparkleEffect } from "../ui/sparkle-effect";

interface HeroSectionProps {
	/** Partner 1's name */
	partner1Name?: string;
	/** Partner 2's name */
	partner2Name?: string;
	/** Wedding date */
	weddingDate?: Date;
	/** Hero image URL */
	heroImageUrl?: string;
	/** Accent color */
	accentColor?: string;
	/** Font style CSS properties */
	fontStyle?: CSSProperties;
	/** Whether in mobile viewport mode */
	isMobile?: boolean;
	/** Theme variant - light or dark */
	themeVariant?: "light" | "dark";
	/** Background color for dark themes */
	backgroundColor?: string;
	/** Decorative elements configuration */
	decorativeElements?: DecorativeElements;
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
 * Hero section for the long-page invitation format.
 * Displays couple names, wedding date, and optional hero image.
 * Supports dark theme with sparkle effects and Chinese symbols.
 */
export function HeroSection({
	partner1Name,
	partner2Name,
	weddingDate,
	heroImageUrl,
	accentColor,
	fontStyle,
	isMobile = false,
	themeVariant = "light",
	backgroundColor,
	decorativeElements,
}: HeroSectionProps) {
	const hasNames = partner1Name || partner2Name;
	const isDark = themeVariant === "dark";
	const hasHeroImage = !!heroImageUrl;

	// Determine text colors based on theme and hero image
	const getTextColor = () => {
		if (hasHeroImage) return "text-white";
		if (isDark) return "text-white";
		return "text-stone-800";
	};

	const getSubtextColor = () => {
		if (hasHeroImage) return "text-white/80";
		if (isDark) return "text-white/80";
		return "";
	};

	const getDateColor = () => {
		if (hasHeroImage) return "text-white/90";
		if (isDark) return "text-white/90";
		return "text-stone-600";
	};

	const getPlaceholderColor = () => {
		if (hasHeroImage) return "text-white/70";
		if (isDark) return "text-white/50";
		return "text-stone-400";
	};

	const getScrollIndicatorColor = () => {
		if (hasHeroImage) return "text-white/60";
		if (isDark) return "text-white/40";
		return "text-stone-400";
	};

	return (
		<section
			className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
			style={{
				...fontStyle,
				backgroundColor: isDark && !hasHeroImage ? backgroundColor : undefined,
			}}
		>
			{/* Background hero image */}
			{heroImageUrl && (
				<div className="absolute inset-0 z-0">
					<img
						src={heroImageUrl}
						alt="Wedding hero"
						className="h-full w-full object-cover"
					/>
					<div
						className="absolute inset-0"
						style={{
							background: isDark
								? `linear-gradient(to bottom, ${backgroundColor}cc, ${backgroundColor}99, ${backgroundColor}ee)`
								: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.2), rgba(0,0,0,0.5))",
						}}
					/>
				</div>
			)}

			{/* Dark theme background color when no hero image */}
			{isDark && !heroImageUrl && backgroundColor && (
				<div
					className="absolute inset-0 z-0"
					style={{ backgroundColor }}
					aria-hidden="true"
				/>
			)}

			{/* Double Happiness symbol watermark */}
			{decorativeElements?.doubleHappiness && (
				<div className="absolute inset-0 z-[1] flex items-center justify-center">
					<DoubleHappiness
						size={isMobile ? 250 : 400}
						color={accentColor}
						opacity={0.1}
					/>
				</div>
			)}

			{/* Sparkle effect overlay */}
			{decorativeElements?.sparkles && (
				<SparkleEffect
					count={isMobile ? 15 : 25}
					color={accentColor}
					className="z-[2]"
				/>
			)}

			{/* Decorative border - top */}
			{decorativeElements?.borderStyle &&
				decorativeElements.borderStyle !== "none" && (
					<div className="absolute left-0 right-0 top-8 z-[3] flex justify-center">
						<DecorativeBorder
							style={decorativeElements.borderStyle}
							position="top"
							color={accentColor}
							width={isMobile ? 150 : 250}
						/>
					</div>
				)}

			{/* Content overlay */}
			<div className={`relative z-10 text-center px-4 ${getTextColor()}`}>
				{/* You are invited text */}
				<p
					className={`mb-6 text-sm uppercase tracking-widest ${getSubtextColor()}`}
					style={{
						color: hasHeroImage || isDark ? undefined : accentColor,
					}}
				>
					You are invited to the wedding of
				</p>

				{/* Couple names */}
				{hasNames ? (
					<h1
						className={`font-light tracking-wide ${
							isMobile ? "text-4xl" : "text-5xl md:text-7xl"
						}`}
						style={{ fontFamily: "var(--font-heading)" }}
					>
						{partner1Name || "Partner One"}
						<span
							className={`mx-4 ${isMobile ? "text-3xl" : "text-4xl md:text-5xl"}`}
							style={{
								color: hasHeroImage || isDark ? accentColor : accentColor,
							}}
						>
							&
						</span>
						{partner2Name || "Partner Two"}
					</h1>
				) : (
					<h1
						className={`font-light italic tracking-wide ${
							isMobile ? "text-4xl" : "text-5xl md:text-7xl"
						} ${getPlaceholderColor()}`}
						style={{ fontFamily: "var(--font-heading)" }}
					>
						Your Names Here
					</h1>
				)}

				{/* Wedding date */}
				{weddingDate && (
					<p className={`mt-8 text-lg tracking-wider ${getDateColor()}`}>
						{formatDate(weddingDate)}
					</p>
				)}

				{/* Scroll indicator */}
				<div className="mt-16 animate-bounce">
					<svg
						className={`mx-auto h-6 w-6 ${getScrollIndicatorColor()}`}
						fill="none"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
					</svg>
				</div>
			</div>

			{/* Decorative border - bottom */}
			{decorativeElements?.borderStyle &&
				decorativeElements.borderStyle !== "none" && (
					<div className="absolute bottom-8 left-0 right-0 z-[3] flex justify-center">
						<DecorativeBorder
							style={decorativeElements.borderStyle}
							position="bottom"
							color={accentColor}
							width={isMobile ? 150 : 250}
						/>
					</div>
				)}
		</section>
	);
}
