import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

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
	const progressRef = useRef<SVGLineElement>(null);
	const dotRef = useRef<SVGCircleElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (reducedMotion || typeof window === "undefined") return;

		const trigger = triggerRef?.current ?? containerRef.current;
		if (!trigger || !progressRef.current || !dotRef.current) return;

		let ctx: gsap.Context | undefined;

		async function initGSAP() {
			const gsap = (await import("gsap")).default;
			const { ScrollTrigger } = await import("gsap/ScrollTrigger");
			gsap.registerPlugin(ScrollTrigger);

			if (!containerRef.current) return;

			ctx = gsap.context(() => {
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
		}

		initGSAP();
		return () => ctx?.revert();
	}, [reducedMotion, triggerRef]);

	return (
		<div
			ref={containerRef}
			className={cn("absolute left-[14px] top-6 bottom-6 w-px", className)}
			aria-hidden="true"
		>
			<svg
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
						filter: "drop-shadow(0 0 6px rgba(212,184,122,0.8))",
					}}
				/>
			</svg>
		</div>
	);
}
