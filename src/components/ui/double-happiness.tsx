import { cn } from "@/lib/utils";

interface DoubleHappinessProps {
	/** Size in pixels (default: 200) */
	size?: number;
	/** Color (default: gold #d4af37) */
	color?: string;
	/** Opacity (default: 0.15 for subtle watermark effect) */
	opacity?: number;
	/** Additional CSS classes */
	className?: string;
}

/**
 * DoubleHappiness component - Traditional Chinese 囍 (Double Happiness) symbol.
 * SVG implementation for crisp rendering at any size.
 * Used as a subtle watermark effect on Chinese-inspired wedding templates.
 */
export function DoubleHappiness({
	size = 200,
	color = "#d4af37",
	opacity = 0.15,
	className,
}: DoubleHappinessProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 100 100"
			className={cn("pointer-events-none", className)}
			style={{ opacity }}
			aria-label="Double Happiness symbol"
			role="img"
		>
			{/* Left 喜 character */}
			<g fill={color}>
				{/* Left half of double happiness - simplified geometric representation */}
				{/* Top horizontal bar */}
				<rect x="5" y="10" width="20" height="3" />
				{/* Second horizontal bar */}
				<rect x="3" y="18" width="24" height="3" />
				{/* Third horizontal bar with gap */}
				<rect x="5" y="26" width="8" height="3" />
				<rect x="17" y="26" width="8" height="3" />
				{/* Vertical connector left */}
				<rect x="5" y="26" width="3" height="12" />
				{/* Vertical connector right */}
				<rect x="22" y="26" width="3" height="12" />
				{/* Cross bar */}
				<rect x="5" y="35" width="20" height="3" />
				{/* Lower section - mouth radical */}
				<rect x="2" y="42" width="26" height="3" />
				{/* Left vertical */}
				<rect x="2" y="42" width="3" height="28" />
				{/* Right vertical */}
				<rect x="25" y="42" width="3" height="28" />
				{/* Bottom horizontal */}
				<rect x="2" y="67" width="26" height="3" />
				{/* Center vertical divider */}
				<rect x="13" y="48" width="3" height="14" />
				{/* Inner horizontal bars */}
				<rect x="6" y="52" width="18" height="2" />
				<rect x="6" y="58" width="18" height="2" />
				{/* Bottom legs */}
				<rect x="7" y="70" width="3" height="20" />
				<rect x="20" y="70" width="3" height="20" />
			</g>

			{/* Right 喜 character (mirrored) */}
			<g fill={color} transform="translate(100, 0) scale(-1, 1)">
				{/* Same structure as left, mirrored */}
				<rect x="5" y="10" width="20" height="3" />
				<rect x="3" y="18" width="24" height="3" />
				<rect x="5" y="26" width="8" height="3" />
				<rect x="17" y="26" width="8" height="3" />
				<rect x="5" y="26" width="3" height="12" />
				<rect x="22" y="26" width="3" height="12" />
				<rect x="5" y="35" width="20" height="3" />
				<rect x="2" y="42" width="26" height="3" />
				<rect x="2" y="42" width="3" height="28" />
				<rect x="25" y="42" width="3" height="28" />
				<rect x="2" y="67" width="26" height="3" />
				<rect x="13" y="48" width="3" height="14" />
				<rect x="6" y="52" width="18" height="2" />
				<rect x="6" y="58" width="18" height="2" />
				<rect x="7" y="70" width="3" height="20" />
				<rect x="20" y="70" width="3" height="20" />
			</g>
		</svg>
	);
}
