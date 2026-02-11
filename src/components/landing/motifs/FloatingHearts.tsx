import { useEffect, useState } from "react";

interface FloatingHeartsProps {
	reducedMotion: boolean;
}

function seededRandom(seed: number) {
	const x = Math.sin(seed + 1) * 10000;
	return x - Math.floor(x);
}

const r = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

function generateHearts(count: number) {
	return Array.from({ length: count }, (_, i) => ({
		id: i,
		size: r(12 + seededRandom(i * 7 + 1) * 8),
		left: r(10 + seededRandom(i * 7 + 2) * 80),
		opacity: r(0.15 + seededRandom(i * 7 + 3) * 0.15),
		duration: r(10 + seededRandom(i * 7 + 4) * 6),
		delay: r(seededRandom(i * 7 + 5) * 8),
		swayAmount: r(15 + seededRandom(i * 7 + 6) * 20),
	}));
}

const HEARTS = generateHearts(7);

export function FloatingHearts({ reducedMotion }: FloatingHeartsProps) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		setIsMobile(window.innerWidth < 768);
	}, []);

	if (reducedMotion || isMobile) return null;

	return (
		<div
			className="pointer-events-none absolute inset-0 overflow-hidden"
			aria-hidden="true"
		>
			{HEARTS.map((h) => (
				<svg
					key={h.id}
					className="absolute"
					width={h.size}
					height={h.size}
					viewBox="0 0 24 24"
					fill="var(--dm-crimson)"
					role="presentation"
					style={{
						left: `${h.left}%`,
						bottom: "-5%",
						opacity: h.opacity,
						animationName: "dm-heart-float",
						animationDuration: `${h.duration}s`,
						animationDelay: `${h.delay}s`,
						animationTimingFunction: "ease-in-out",
						animationIterationCount: "infinite",
						["--heart-sway" as string]: `${h.swayAmount}px`,
					}}
				>
					<title>Decorative heart</title>
					<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
				</svg>
			))}
		</div>
	);
}
