import { cn } from "@/lib/utils";

interface NeonXiProps {
	size: string;
	variant: "crimson" | "gold";
	opacity: number;
	breathe?: boolean;
	className?: string;
}

/**
 * Neon-glow Double Happiness (囍) character.
 *
 * Renders the character with layered text-shadow for a soft neon glow.
 * When `breathe` is enabled, applies a CSS animation that pulses opacity
 * and glow intensity (`.neon-xi-crimson` / `.neon-xi-gold` in styles.css).
 *
 * Always `aria-hidden` and `pointer-events-none` — purely decorative.
 */

const GLOW_SHADOWS: Record<string, string> = {
	crimson: [
		"0 0 20px rgba(232,36,60,0.6)",
		"0 0 40px rgba(232,36,60,0.3)",
		"0 0 80px rgba(232,36,60,0.15)",
		"0 0 120px rgba(232,36,60,0.05)",
	].join(", "),
	gold: [
		"0 0 20px rgba(255,215,0,0.6)",
		"0 0 40px rgba(255,215,0,0.3)",
		"0 0 80px rgba(255,215,0,0.15)",
		"0 0 120px rgba(255,215,0,0.05)",
	].join(", "),
};

const GLOW_COLORS: Record<string, string> = {
	crimson: "var(--dm-crimson-vivid, #E8243C)",
	gold: "var(--dm-gold-electric, #FFD700)",
};

export function NeonXi({
	size,
	variant,
	opacity,
	breathe = false,
	className,
}: NeonXiProps) {
	const breatheClass = breathe
		? variant === "crimson"
			? "neon-xi-crimson"
			: "neon-xi-gold"
		: undefined;

	return (
		<span
			className={cn(
				"pointer-events-none select-none font-['Noto_Serif_SC'] font-black leading-none",
				breatheClass,
				className,
			)}
			style={{
				fontSize: size,
				opacity,
				color: GLOW_COLORS[variant],
				textShadow: GLOW_SHADOWS[variant],
				lineHeight: 1,
			}}
			aria-hidden="true"
		>
			囍
		</span>
	);
}
