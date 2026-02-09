import { useId } from "react";

interface LatticeOverlayProps {
	color?: string;
	opacity?: number;
}

export function LatticeOverlay({
	color = "white",
	opacity = 0.04,
}: LatticeOverlayProps) {
	const patternId = useId();

	return (
		<div
			className="absolute inset-0 pointer-events-none overflow-hidden"
			aria-hidden="true"
			style={{ opacity }}
		>
			<svg
				className="w-full h-full"
				xmlns="http://www.w3.org/2000/svg"
				role="presentation"
			>
				<defs>
					<pattern
						id={patternId}
						x="0"
						y="0"
						width="60"
						height="60"
						patternUnits="userSpaceOnUse"
					>
						{/* Octagonal lattice */}
						<path
							d="M30 0 L42 12 L42 48 L30 60 L18 48 L18 12 Z"
							fill="none"
							stroke={color}
							strokeWidth="1"
						/>
						<path
							d="M0 30 L12 18 L18 18 M42 18 L48 18 L60 30 L48 42 L42 42 M18 42 L12 42 L0 30"
							fill="none"
							stroke={color}
							strokeWidth="1"
						/>
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill={`url(#${patternId})`} />
			</svg>
		</div>
	);
}
