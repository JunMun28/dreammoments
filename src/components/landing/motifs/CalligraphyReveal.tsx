import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

interface CalligraphyRevealProps {
	color?: string;
	reducedMotion: boolean;
}

// Simplified stroke paths for 爱情故事 (love story) -- decorative approximation
const CHARACTERS = [
	{
		char: "爱",
		viewBox: "0 0 100 100",
		paths: [
			"M30 15 L70 15", // top horizontal
			"M50 10 L50 45", // top vertical
			"M20 30 L80 30", // mid horizontal
			"M25 45 L75 45", // lower horizontal
			"M50 45 L30 85", // left diagonal
			"M50 45 L70 85", // right diagonal
		],
	},
	{
		char: "情",
		viewBox: "0 0 100 100",
		paths: [
			"M15 15 L15 90", // left vertical (忄)
			"M15 35 L25 25", // left dot upper
			"M15 55 L25 65", // left dot lower
			"M40 15 L85 15", // top horizontal (青)
			"M62 15 L62 45", // mid vertical
			"M40 45 L85 45", // mid horizontal
			"M40 45 L40 90 L85 90 L85 45", // box
			"M40 67 L85 67", // inner horizontal
		],
	},
	{
		char: "故",
		viewBox: "0 0 100 100",
		paths: [
			"M15 15 L40 15", // left top horizontal (古)
			"M27 15 L27 50", // left vertical
			"M15 50 L40 50 L40 15 L15 15", // left box
			"M15 33 L40 33", // left inner horizontal
			"M60 10 L60 65", // right vertical (攵)
			"M55 30 L85 15", // right upper diagonal
			"M55 50 L85 85", // right lower diagonal
			"M75 50 L55 85", // right cross diagonal
		],
	},
	{
		char: "事",
		viewBox: "0 0 100 100",
		paths: [
			"M20 15 L80 15", // top horizontal
			"M50 10 L50 95", // main vertical
			"M25 30 L75 30", // second horizontal
			"M20 45 L80 45", // third horizontal
			"M25 60 L75 60", // fourth horizontal
			"M30 75 L70 75", // bottom horizontal
		],
	},
];

export function CalligraphyReveal({
	color = "var(--dm-gold-electric)",
	reducedMotion,
}: CalligraphyRevealProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (reducedMotion || !containerRef.current) return;

		const paths = containerRef.current.querySelectorAll("path");
		const pathArray = Array.from(paths);

		for (const path of pathArray) {
			const length = path.getTotalLength();
			path.style.strokeDasharray = `${length}`;
			path.style.strokeDashoffset = `${length}`;
			path.style.fill = "transparent";
		}

		const ctx = gsap.context(() => {
			// Stroke draw animation
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: containerRef.current,
					start: "top 55%",
					once: true,
				},
			});

			tl.to(pathArray, {
				strokeDashoffset: 0,
				duration: 0.6,
				stagger: 0.12,
				ease: "power2.out",
			});

			// Fill transition after strokes complete
			tl.to(
				pathArray,
				{
					fill: color,
					duration: 0.4,
					ease: "power2.out",
				},
				">-0.2",
			);
		}, containerRef.current);

		return () => ctx.revert();
	}, [reducedMotion, color]);

	return (
		<div
			ref={containerRef}
			className="flex items-center justify-center gap-2"
			role="img"
			aria-label="爱情故事 - Love Story"
		>
			{CHARACTERS.map((char) => (
				<svg
					key={char.char}
					viewBox={char.viewBox}
					className="h-12 w-12 sm:h-16 sm:w-16"
					fill="none"
					stroke={color}
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
					role="presentation"
				>
					{char.paths.map((d, i) => (
						<path
							key={`${char.char}-${i}`}
							d={d}
							style={
								reducedMotion
									? { strokeDashoffset: "0", fill: color }
									: undefined
							}
						/>
					))}
				</svg>
			))}
		</div>
	);
}
