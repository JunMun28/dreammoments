import { cn } from "@/lib/utils";

interface PeonyOutlineProps {
	className?: string;
	opacity?: number;
}

export function PeonyOutline({ className, opacity = 0.06 }: PeonyOutlineProps) {
	return (
		<div
			className={cn("pointer-events-none select-none", className)}
			aria-hidden="true"
			style={{ opacity }}
		>
			<svg
				viewBox="0 0 400 400"
				fill="none"
				className="w-full h-full peony-draw"
				stroke="var(--dm-rose)"
				strokeWidth="1.5"
				strokeLinecap="round"
				role="presentation"
			>
				{/* Center */}
				<circle cx="200" cy="200" r="20" />
				{/* Inner petals */}
				<path d="M200 180 C180 140 150 130 160 160 C140 130 120 140 140 170 C110 150 105 170 130 185" />
				<path d="M220 200 C260 180 270 150 240 160 C270 140 260 120 230 140 C250 110 230 105 215 130" />
				<path d="M200 220 C220 260 250 270 240 240 C260 270 280 260 260 230 C290 250 295 230 270 215" />
				<path d="M180 200 C140 220 130 250 160 240 C130 260 140 280 170 260 C150 290 170 295 185 270" />
				{/* Outer petals */}
				<path d="M200 160 C175 100 130 80 140 120 C110 70 80 85 110 140" />
				<path d="M240 200 C300 175 320 130 280 140 C330 110 315 80 260 110" />
				<path d="M200 240 C225 300 270 320 260 280 C290 330 320 315 290 260" />
				<path d="M160 200 C100 225 80 270 120 260 C70 290 85 320 140 290" />
				{/* Leaves */}
				<path d="M130 280 C100 310 80 350 110 330 C90 360 110 370 140 340 L130 280" />
				<path d="M270 280 C300 310 320 350 290 330 C310 360 290 370 260 340 L270 280" />
			</svg>
			<style>{`
				.peony-draw path, .peony-draw circle {
					stroke-dasharray: 1000;
					stroke-dashoffset: 1000;
					animation: peony-reveal 3s ease-out forwards;
				}
				@keyframes peony-reveal {
					to { stroke-dashoffset: 0; }
				}
				@media (prefers-reduced-motion: reduce) {
					.peony-draw path, .peony-draw circle {
						animation: none;
						stroke-dashoffset: 0;
					}
				}
			`}</style>
		</div>
	);
}
