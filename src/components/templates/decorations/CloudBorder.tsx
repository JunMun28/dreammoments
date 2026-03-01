import type { CSSProperties } from "react";

type CloudBorderPosition =
	| "top-left"
	| "top-right"
	| "bottom-left"
	| "bottom-right";

interface CloudBorderProps {
	position: CloudBorderPosition;
	opacity?: number;
	size?: number;
}

const POSITION_STYLES: Record<CloudBorderPosition, CSSProperties> = {
	"top-left": { top: 0, left: 0, transform: "none" },
	"top-right": { top: 0, right: 0, transform: "scaleX(-1)" },
	"bottom-left": { bottom: 0, left: 0, transform: "scaleY(-1)" },
	"bottom-right": { bottom: 0, right: 0, transform: "scale(-1)" },
};

export function CloudBorder({
	position,
	opacity = 0.1,
	size = 80,
}: CloudBorderProps) {
	return (
		<span
			aria-hidden="true"
			style={{
				position: "absolute",
				pointerEvents: "none",
				opacity,
				...POSITION_STYLES[position],
			}}
		>
			<svg
				aria-hidden="true"
				width={size}
				height={size}
				viewBox="0 0 80 80"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M8 72C8 72 12 52 24 48C16 44 14 32 22 26C18 20 22 10 32 10C36 4 48 2 52 10C58 6 68 10 66 20C74 22 76 34 68 40C76 46 74 60 64 62C68 70 60 78 52 74C46 80 34 78 32 70C24 74 12 70 8 72Z"
					fill="#D4A843"
				/>
			</svg>
		</span>
	);
}
