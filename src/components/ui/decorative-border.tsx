import { cn } from "@/lib/utils";

type BorderStyle = "flourish" | "geometric" | "minimal" | "none";
type Position = "top" | "bottom" | "both";

interface DecorativeBorderProps {
	/** Border style pattern */
	style?: BorderStyle;
	/** Position - top, bottom, or both */
	position?: Position;
	/** Color (default: gold #d4af37) */
	color?: string;
	/** Width of the border element (default: 200) */
	width?: number;
	/** Additional CSS classes */
	className?: string;
}

/**
 * Flourish border SVG - elegant curving scrollwork pattern
 */
function FlourishBorder({ color, width }: { color: string; width: number }) {
	const height = width * 0.15; // Maintain aspect ratio

	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 200 30"
			preserveAspectRatio="xMidYMid meet"
			aria-hidden="true"
		>
			<g fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
				{/* Left flourish */}
				<path d="M10 15 Q 30 5, 50 15 T 90 15" />
				<path d="M15 15 Q 25 20, 40 15" />
				{/* Center ornament */}
				<circle cx="100" cy="15" r="4" fill={color} />
				<circle cx="100" cy="15" r="8" strokeWidth="1" />
				{/* Right flourish (mirrored) */}
				<path d="M190 15 Q 170 5, 150 15 T 110 15" />
				<path d="M185 15 Q 175 20, 160 15" />
				{/* Connecting curves */}
				<path d="M50 15 Q 60 8, 70 15 Q 80 22, 92 15" opacity="0.6" />
				<path d="M150 15 Q 140 8, 130 15 Q 120 22, 108 15" opacity="0.6" />
			</g>
		</svg>
	);
}

/**
 * Geometric border SVG - angular Art Deco inspired pattern
 */
function GeometricBorder({ color, width }: { color: string; width: number }) {
	const height = width * 0.1;

	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 200 20"
			preserveAspectRatio="xMidYMid meet"
			aria-hidden="true"
		>
			<g fill={color}>
				{/* Left section */}
				<polygon points="0,10 15,5 30,10 15,15" opacity="0.6" />
				<polygon points="25,10 40,5 55,10 40,15" opacity="0.8" />
				<polygon points="50,10 65,5 80,10 65,15" />
				{/* Center diamond */}
				<polygon points="100,2 110,10 100,18 90,10" />
				<rect x="95" y="8" width="10" height="4" fill="none" stroke={color} />
				{/* Right section (mirrored) */}
				<polygon points="200,10 185,5 170,10 185,15" opacity="0.6" />
				<polygon points="175,10 160,5 145,10 160,15" opacity="0.8" />
				<polygon points="150,10 135,5 120,10 135,15" />
			</g>
		</svg>
	);
}

/**
 * Minimal border SVG - simple elegant line with small ornaments
 */
function MinimalBorder({ color, width }: { color: string; width: number }) {
	const height = width * 0.05;

	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 200 10"
			preserveAspectRatio="xMidYMid meet"
			aria-hidden="true"
		>
			<g stroke={color} fill={color}>
				{/* Main horizontal line */}
				<line x1="20" y1="5" x2="80" y2="5" strokeWidth="1" />
				<line x1="120" y1="5" x2="180" y2="5" strokeWidth="1" />
				{/* Center ornament */}
				<circle cx="100" cy="5" r="2" />
				{/* Small dots */}
				<circle cx="90" cy="5" r="1" />
				<circle cx="110" cy="5" r="1" />
			</g>
		</svg>
	);
}

/**
 * DecorativeBorder component - SVG-based decorative border patterns.
 * Supports flourish, geometric, and minimal styles.
 * Can be positioned at top, bottom, or both ends of a section.
 */
export function DecorativeBorder({
	style = "flourish",
	position = "both",
	color = "#d4af37",
	width = 200,
	className,
}: DecorativeBorderProps) {
	if (style === "none") {
		return null;
	}

	const BorderComponent =
		style === "flourish"
			? FlourishBorder
			: style === "geometric"
				? GeometricBorder
				: MinimalBorder;

	const renderBorder = (isBottom: boolean) => (
		<div
			className={cn("flex justify-center", isBottom && "rotate-180", className)}
		>
			<BorderComponent color={color} width={width} />
		</div>
	);

	if (position === "top") {
		return renderBorder(false);
	}

	if (position === "bottom") {
		return renderBorder(true);
	}

	// Both
	return (
		<>
			{renderBorder(false)}
			{renderBorder(true)}
		</>
	);
}
