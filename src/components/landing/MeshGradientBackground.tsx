import gsap from "gsap";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type MeshVariant = "warm" | "crimson" | "gold" | "intense";

interface MeshGradientBackgroundProps {
	variant?: MeshVariant;
	className?: string;
	children: React.ReactNode;
	reducedMotion?: boolean;
}

interface OrbConfig {
	gradient: string;
	size: string;
	position: { top: string; left: string };
	opacity: number;
}

const ORBS: Record<MeshVariant, OrbConfig[]> = {
	warm: [
		{
			gradient:
				"radial-gradient(circle, rgba(232,24,64,0.25) 0%, transparent 70%)",
			size: "50%",
			position: { top: "10%", left: "15%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(255,184,0,0.20) 0%, transparent 70%)",
			size: "45%",
			position: { top: "60%", left: "70%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(255,107,107,0.18) 0%, transparent 70%)",
			size: "40%",
			position: { top: "70%", left: "20%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)",
			size: "35%",
			position: { top: "20%", left: "75%" },
			opacity: 1,
		},
	],
	crimson: [
		{
			gradient:
				"radial-gradient(circle, rgba(232,24,64,0.22) 0%, transparent 70%)",
			size: "55%",
			position: { top: "5%", left: "10%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(212,32,64,0.20) 0%, transparent 70%)",
			size: "50%",
			position: { top: "50%", left: "65%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(255,184,0,0.15) 0%, transparent 70%)",
			size: "40%",
			position: { top: "30%", left: "80%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(255,107,107,0.12) 0%, transparent 70%)",
			size: "35%",
			position: { top: "75%", left: "30%" },
			opacity: 1,
		},
	],
	gold: [
		{
			gradient:
				"radial-gradient(circle, rgba(255,184,0,0.25) 0%, transparent 70%)",
			size: "50%",
			position: { top: "15%", left: "20%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(212,175,55,0.22) 0%, transparent 70%)",
			size: "45%",
			position: { top: "55%", left: "70%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(232,24,64,0.12) 0%, transparent 70%)",
			size: "40%",
			position: { top: "70%", left: "15%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(255,127,80,0.15) 0%, transparent 70%)",
			size: "35%",
			position: { top: "10%", left: "80%" },
			opacity: 1,
		},
	],
	intense: [
		{
			gradient:
				"radial-gradient(circle, rgba(255,184,0,0.30) 0%, transparent 70%)",
			size: "55%",
			position: { top: "10%", left: "70%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(255,107,107,0.25) 0%, transparent 70%)",
			size: "50%",
			position: { top: "60%", left: "20%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(212,175,55,0.22) 0%, transparent 70%)",
			size: "45%",
			position: { top: "30%", left: "50%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(255,127,80,0.20) 0%, transparent 70%)",
			size: "40%",
			position: { top: "80%", left: "75%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(232,24,64,0.18) 0%, transparent 70%)",
			size: "35%",
			position: { top: "5%", left: "30%" },
			opacity: 1,
		},
	],
};

const DRIFT_RANGE = 40; // px

export function MeshGradientBackground({
	variant = "warm",
	className,
	children,
	reducedMotion = false,
}: MeshGradientBackgroundProps) {
	const orbRefs = useRef<(HTMLDivElement | null)[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (reducedMotion || typeof window === "undefined") return;

		// Skip ambient animation on mobile
		const isMobile = window.innerWidth < 768;
		if (isMobile) return;

		const ctx = gsap.context(() => {
			for (const orb of orbRefs.current) {
				if (!orb) continue;
				gsap.to(orb, {
					x: `random(-${DRIFT_RANGE}, ${DRIFT_RANGE})`,
					y: `random(-${DRIFT_RANGE}, ${DRIFT_RANGE})`,
					duration: `random(18, 25)`,
					ease: "sine.inOut",
					repeat: -1,
					yoyo: true,
				});
			}
		}, containerRef);

		return () => ctx.revert();
	}, [reducedMotion]);

	const orbs = ORBS[variant];

	return (
		<div ref={containerRef} className={cn("relative", className)}>
			{/* Mesh gradient orbs */}
			<div
				className="pointer-events-none absolute inset-0 overflow-hidden"
				aria-hidden="true"
			>
				{orbs.map((orb, i) => (
					<div
						key={`${variant}-orb-${i}`}
						ref={(el) => {
							orbRefs.current[i] = el;
						}}
						className="absolute rounded-full"
						style={{
							background: orb.gradient,
							width: orb.size,
							height: orb.size,
							top: orb.position.top,
							left: orb.position.left,
							opacity: orb.opacity,
							willChange: reducedMotion ? "auto" : "transform",
						}}
					/>
				))}
			</div>

			{/* Content */}
			<div className="relative z-[1]">{children}</div>
		</div>
	);
}
