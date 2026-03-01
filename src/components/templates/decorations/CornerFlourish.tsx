import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Corner = "tl" | "tr" | "bl" | "br";

interface CornerFlourishProps {
	corner: Corner;
	color?: string;
	className?: string;
}

const CORNER_STYLES: Record<Corner, CSSProperties> = {
	tl: { top: 0, left: 0, transform: "none" },
	tr: { top: 0, right: 0, transform: "scaleX(-1)" },
	bl: { bottom: 0, left: 0, transform: "scaleY(-1)" },
	br: { bottom: 0, right: 0, transform: "scale(-1)" },
};

export function CornerFlourish({
	corner,
	color = "#D4A843",
	className,
}: CornerFlourishProps) {
	return (
		<span
			aria-hidden="true"
			className={cn("pointer-events-none", className)}
			style={{
				position: "absolute",
				...CORNER_STYLES[corner],
			}}
		>
			<svg
				aria-hidden="true"
				width={32}
				height={32}
				viewBox="0 0 32 32"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M2 30V18C2 10 6 4 14 2C10 6 8 12 8 18V30"
					stroke={color}
					strokeWidth={1}
					strokeLinecap="round"
					fill="none"
				/>
				<path
					d="M2 30H14C22 30 28 26 30 18C26 22 20 24 14 24H2"
					stroke={color}
					strokeWidth={1}
					strokeLinecap="round"
					fill="none"
				/>
				<circle cx={5} cy={22} r={1.5} fill={color} opacity={0.5} />
				<circle cx={12} cy={27} r={1} fill={color} opacity={0.4} />
			</svg>
		</span>
	);
}
