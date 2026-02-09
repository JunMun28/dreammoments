import { motion } from "motion/react";
import { ANIMATION, sectionReveal } from "../animation";

interface SectionHeaderProps {
	kickerEn: string;
	kickerCn: string;
	title: string;
	subtitle?: string;
	kickerColor?: string;
	/** Color for the English kicker. Defaults to --dm-muted on dark theme, rgba white on light */
	kickerEnColor?: string;
	light?: boolean;
	reducedMotion: boolean;
}

/**
 * V3 SectionHeader: Chinese kicker displayed ABOVE English kicker.
 * Chinese is the emotional anchor at display scale; English is the functional label below.
 */
export function SectionHeader({
	kickerEn,
	kickerCn,
	title,
	subtitle,
	kickerColor = "var(--dm-gold)",
	kickerEnColor,
	light = false,
	reducedMotion,
}: SectionHeaderProps) {
	const resolvedEnColor =
		kickerEnColor ?? (light ? "rgba(255,255,255,0.7)" : "var(--dm-muted)");

	return (
		<div className="mx-auto max-w-2xl text-center mb-16">
			{/* Chinese kicker -- primary, above */}
			<motion.p
				initial={reducedMotion ? false : "hidden"}
				whileInView="visible"
				viewport={ANIMATION.viewport}
				variants={sectionReveal}
				style={{
					fontFamily: '"Noto Serif SC", serif',
					fontWeight: 700,
					fontSize: "var(--text-kicker-cn)",
					color: kickerColor,
					lineHeight: 1.3,
					marginBottom: "0.75rem",
				}}
			>
				{kickerCn}
			</motion.p>

			{/* English kicker -- secondary, below */}
			<motion.p
				initial={reducedMotion ? false : "hidden"}
				whileInView="visible"
				viewport={ANIMATION.viewport}
				variants={sectionReveal}
				style={{
					fontFamily: '"Inter", system-ui, sans-serif',
					fontWeight: 500,
					fontSize: "var(--text-kicker-en)",
					letterSpacing: "0.15em",
					textTransform: "uppercase",
					color: resolvedEnColor,
				}}
			>
				{kickerEn}
			</motion.p>

			{/* Section title */}
			{title && (
				<motion.h2
					initial={reducedMotion ? false : "hidden"}
					whileInView="visible"
					viewport={ANIMATION.viewport}
					variants={sectionReveal}
					className="mt-4 font-display font-bold"
					style={{
						fontSize: "var(--text-section)",
						letterSpacing: "-0.03em",
						lineHeight: 1.1,
						color: light ? "white" : "var(--dm-ink)",
					}}
				>
					{title}
				</motion.h2>
			)}

			{/* Subtitle */}
			{subtitle && (
				<motion.p
					initial={reducedMotion ? false : "hidden"}
					whileInView="visible"
					viewport={ANIMATION.viewport}
					variants={sectionReveal}
					className="mt-4 text-lg leading-relaxed"
					style={{
						color: light ? "rgba(255,255,255,0.8)" : "var(--dm-muted)",
					}}
				>
					{subtitle}
				</motion.p>
			)}
		</div>
	);
}
