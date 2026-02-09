import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface MovingBorderButtonProps {
	children: React.ReactNode;
	className?: string;
	variant?: "crimson" | "gold";
	as?: "button" | "a";
	href?: string;
	onClick?: () => void;
}

/**
 * Aceternity UI-inspired button with an animated conic-gradient border.
 *
 * - Outer wrapper: `overflow-hidden rounded-full p-[2px]`
 * - Spinning gradient ring: `absolute inset-[-200%]` with `dm-border-spin` keyframe
 * - Inner surface: solid `--dm-bg` background with text
 *
 * Reduced motion: the spinning gradient is replaced by a static 2px solid border
 * via the `prefers-reduced-motion` rule in styles.css.
 */
export function MovingBorderButton({
	children,
	className,
	variant = "crimson",
	as = "button",
	href,
	onClick,
}: MovingBorderButtonProps) {
	const gradients: Record<string, string> = {
		crimson:
			"conic-gradient(from 0deg, transparent 0deg 240deg, var(--dm-crimson) 260deg 300deg, transparent 320deg 360deg)",
		gold: "conic-gradient(from 0deg, transparent 0deg 240deg, var(--dm-gold) 260deg 300deg, transparent 320deg 360deg)",
	};

	const staticBorder: Record<string, string> = {
		crimson: "var(--dm-crimson)",
		gold: "var(--dm-gold)",
	};

	const outerClasses = cn(
		"dm-moving-border group relative inline-flex overflow-hidden rounded-full p-[2px]",
		"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--dm-focus)]",
		className,
	);

	const spinnerStyle: React.CSSProperties = {
		background: gradients[variant],
	};

	const innerClasses =
		"relative z-10 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--dm-bg)] px-8 py-3 text-sm font-medium tracking-wide text-[var(--dm-ink)] transition-colors duration-200 group-hover:bg-[var(--dm-surface-muted)] min-h-[52px]";

	const content = (
		<>
			{/* Spinning gradient ring */}
			<span
				className="dm-moving-border-spin pointer-events-none absolute inset-[-200%]"
				style={spinnerStyle}
				aria-hidden="true"
			/>
			{/* Reduced-motion fallback: static border is handled by the parent
			    ring via a CSS media query override */}
			<span
				className="dm-moving-border-static pointer-events-none absolute inset-0 hidden rounded-full"
				style={{ border: `2px solid ${staticBorder[variant]}` }}
				aria-hidden="true"
			/>
			<span className={innerClasses}>{children}</span>
		</>
	);

	// Render as TanStack Router Link for internal navigation
	if (as === "a" && href) {
		return (
			<Link to={href} className={outerClasses} onClick={onClick}>
				{content}
			</Link>
		);
	}

	return (
		<button type="button" className={outerClasses} onClick={onClick}>
			{content}
		</button>
	);
}
