import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface MovingBorderButtonProps {
	children: React.ReactNode;
	className?: string;
	variant?: "crimson" | "gold";
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
	href,
	onClick,
	onMouseEnter,
}: MovingBorderButtonProps & { onMouseEnter?: React.MouseEventHandler }) {
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

	const innerClasses = cn(
		"relative z-10 inline-flex items-center justify-center gap-2 rounded-full px-6 sm:px-8 py-3 text-sm font-medium tracking-wide transition-colors duration-200 min-h-[52px]",
		variant === "crimson"
			? "bg-[var(--dm-crimson)] text-white hover:bg-[var(--dm-crimson-bold)]"
			: "bg-[var(--dm-bg)] text-[var(--dm-ink)] hover:bg-[var(--dm-surface-muted)]",
	);

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
	if (href) {
		return (
			<Link
				to={href}
				className={outerClasses}
				onClick={onClick}
				onMouseEnter={onMouseEnter}
			>
				{content}
			</Link>
		);
	}

	return (
		<button
			type="button"
			className={outerClasses}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
		>
			{content}
		</button>
	);
}
