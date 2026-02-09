import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface TracingBeamProps {
	className?: string;
	reducedMotion?: boolean;
	triggerRef?: React.RefObject<HTMLElement>;
}

export function TracingBeam({
	className,
	reducedMotion = false,
	triggerRef,
}: TracingBeamProps) {
	const svgRef = useRef<SVGSVGElement>(null);
	const progressRef = useRef<SVGLineElement>(null);
	const dotRef = useRef<SVGCircleElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (reducedMotion || typeof window === "undefined") return;

		const trigger = triggerRef?.current ?? containerRef.current;
		if (!trigger || !progressRef.current || !dotRef.current) return;

		const ctx = gsap.context(() => {
			// Animate the progress line scaleY from 0 to 1
			gsap.fromTo(
				progressRef.current,
				{ attr: { y2: "0%" } },
				{
					attr: { y2: "100%" },
					ease: "none",
					scrollTrigger: {
						trigger,
						start: "top 80%",
						end: "bottom 50%",
						scrub: 0.5,
					},
				},
			);

			// Animate the dot traveling down
			gsap.fromTo(
				dotRef.current,
				{ attr: { cy: "0%" } },
				{
					attr: { cy: "100%" },
					ease: "none",
					scrollTrigger: {
						trigger,
						start: "top 80%",
						end: "bottom 50%",
						scrub: 0.5,
					},
				},
			);
		}, containerRef);

		return () => ctx.revert();
	}, [reducedMotion, triggerRef]);

	return (
		<div
			ref={containerRef}
			className={cn("absolute left-[14px] top-6 bottom-6 w-px", className)}
			aria-hidden="true"
		>
			<svg
				ref={svgRef}
				className="absolute inset-0 h-full w-full overflow-visible"
				preserveAspectRatio="none"
				role="presentation"
			>
				{/* Background track */}
				<line
					x1="50%"
					y1="0"
					x2="50%"
					y2="100%"
					stroke="var(--dm-border)"
					strokeWidth="2"
				/>

				{/* Animated gold progress line */}
				<line
					ref={progressRef}
					x1="50%"
					y1="0"
					x2="50%"
					y2={reducedMotion ? "100%" : "0%"}
					stroke="var(--dm-gold)"
					strokeWidth="2"
				/>

				{/* Glowing dot */}
				<circle
					ref={dotRef}
					cx="50%"
					cy={reducedMotion ? "100%" : "0%"}
					r="5"
					fill="var(--dm-gold-electric)"
					style={{
						filter: "drop-shadow(0 0 6px rgba(255,215,0,0.8))",
					}}
				/>
			</svg>
		</div>
	);
}
