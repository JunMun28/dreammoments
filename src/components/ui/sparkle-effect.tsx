import { useEffect, useMemo, useState } from "react";

interface Sparkle {
	id: number;
	x: number;
	y: number;
	size: number;
	delay: number;
	duration: number;
}

interface SparkleEffectProps {
	/** Number of sparkle particles (default: 25) */
	count?: number;
	/** Sparkle color (default: gold #d4af37) */
	color?: string;
	/** Whether to respect prefers-reduced-motion */
	respectReducedMotion?: boolean;
	/** Additional CSS classes */
	className?: string;
}

/**
 * Generate random sparkle particles with positions and animation timing
 */
function generateSparkles(count: number): Sparkle[] {
	return Array.from({ length: count }, (_, i) => ({
		id: i,
		x: Math.random() * 100,
		y: Math.random() * 100,
		size: Math.random() * 3 + 2, // 2-5px
		delay: Math.random() * 5, // 0-5s delay
		duration: Math.random() * 2 + 2, // 2-4s duration
	}));
}

/**
 * SparkleEffect component - CSS-based twinkling sparkle animation overlay.
 * Creates randomly positioned gold sparkle particles with staggered animations.
 * Respects prefers-reduced-motion accessibility setting.
 */
export function SparkleEffect({
	count = 25,
	color = "#d4af37",
	respectReducedMotion = true,
	className = "",
}: SparkleEffectProps) {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	// Check for reduced motion preference
	useEffect(() => {
		if (!respectReducedMotion) return;

		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		setPrefersReducedMotion(mediaQuery.matches);

		const handler = (e: MediaQueryListEvent) => {
			setPrefersReducedMotion(e.matches);
		};

		mediaQuery.addEventListener("change", handler);
		return () => mediaQuery.removeEventListener("change", handler);
	}, [respectReducedMotion]);

	// Generate sparkles once and memoize
	const sparkles = useMemo(() => generateSparkles(count), [count]);

	// Don't animate if user prefers reduced motion
	if (prefersReducedMotion) {
		return null;
	}

	return (
		<div
			className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
			aria-hidden="true"
		>
			{sparkles.map((sparkle) => (
				<div
					key={sparkle.id}
					className="absolute animate-sparkle-twinkle"
					style={{
						left: `${sparkle.x}%`,
						top: `${sparkle.y}%`,
						width: `${sparkle.size}px`,
						height: `${sparkle.size}px`,
						backgroundColor: color,
						borderRadius: "50%",
						boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.size}px ${color}40`,
						animationDelay: `${sparkle.delay}s`,
						animationDuration: `${sparkle.duration}s`,
					}}
				/>
			))}
		</div>
	);
}
