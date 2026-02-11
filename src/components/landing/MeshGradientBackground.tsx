import { useEffect, useRef, useState } from "react";
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
				"radial-gradient(circle, rgba(200,64,64,0.14) 0%, transparent 70%)",
			size: "50%",
			position: { top: "10%", left: "15%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(168,176,138,0.15) 0%, transparent 70%)",
			size: "45%",
			position: { top: "60%", left: "70%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(212,184,122,0.14) 0%, transparent 70%)",
			size: "40%",
			position: { top: "70%", left: "20%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(200,64,64,0.08) 0%, transparent 70%)",
			size: "35%",
			position: { top: "20%", left: "75%" },
			opacity: 1,
		},
	],
	crimson: [
		{
			gradient:
				"radial-gradient(circle, rgba(200,64,64,0.12) 0%, transparent 70%)",
			size: "55%",
			position: { top: "5%", left: "10%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(200,64,64,0.10) 0%, transparent 70%)",
			size: "50%",
			position: { top: "50%", left: "65%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(168,176,138,0.12) 0%, transparent 70%)",
			size: "40%",
			position: { top: "30%", left: "80%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(212,184,122,0.10) 0%, transparent 70%)",
			size: "35%",
			position: { top: "75%", left: "30%" },
			opacity: 1,
		},
	],
	gold: [
		{
			gradient:
				"radial-gradient(circle, rgba(212,184,122,0.18) 0%, transparent 70%)",
			size: "50%",
			position: { top: "15%", left: "20%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(212,184,122,0.16) 0%, transparent 70%)",
			size: "45%",
			position: { top: "55%", left: "70%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(200,64,64,0.08) 0%, transparent 70%)",
			size: "40%",
			position: { top: "70%", left: "15%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(196,162,101,0.14) 0%, transparent 70%)",
			size: "35%",
			position: { top: "10%", left: "80%" },
			opacity: 1,
		},
	],
	intense: [
		{
			gradient:
				"radial-gradient(circle, rgba(212,184,122,0.22) 0%, transparent 70%)",
			size: "55%",
			position: { top: "10%", left: "70%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(212,184,122,0.14) 0%, transparent 70%)",
			size: "50%",
			position: { top: "60%", left: "20%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(212,184,122,0.12) 0%, transparent 70%)",
			size: "45%",
			position: { top: "30%", left: "50%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
			size: "40%",
			position: { top: "80%", left: "75%" },
			opacity: 1,
		},
		{
			gradient:
				"radial-gradient(circle, rgba(212,184,122,0.10) 0%, transparent 70%)",
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
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		setIsMobile(window.innerWidth < 768);
	}, []);

	useEffect(() => {
		if (reducedMotion || typeof window === "undefined") return;

		if (isMobile) return;

		const container = containerRef.current;
		if (!container) return;

		let ctx: gsap.Context | undefined;
		let tweens: gsap.core.Tween[] = [];
		let observer: IntersectionObserver | undefined;

		async function initGSAP() {
			const gsap = (await import("gsap")).default;

			if (!container) return;

			ctx = gsap.context(() => {
				for (const orb of orbRefs.current) {
					if (!orb) continue;
					tweens.push(
						gsap.to(orb, {
							x: `random(-${DRIFT_RANGE}, ${DRIFT_RANGE})`,
							y: `random(-${DRIFT_RANGE}, ${DRIFT_RANGE})`,
							duration: `random(18, 25)`,
							ease: "sine.inOut",
							repeat: -1,
							yoyo: true,
						}),
					);
				}
			}, container);

			observer = new IntersectionObserver(
				([entry]) => {
					for (const tween of tweens) {
						if (entry.isIntersecting) {
							tween.resume();
						} else {
							tween.pause();
						}
					}
				},
				{ threshold: 0 },
			);
			observer.observe(container);
		}

		initGSAP();

		return () => {
			observer?.disconnect();
			tweens = [];
			ctx?.revert();
		};
	}, [reducedMotion, isMobile, variant]);

	const orbs = ORBS[variant];

	return (
		<div
			ref={containerRef}
			className={cn("pointer-events-none relative", className)}
		>
			{/* Mesh gradient orbs */}
			<div className="absolute inset-0 overflow-hidden" aria-hidden="true">
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
							willChange: reducedMotion || isMobile ? "auto" : "transform",
						}}
					/>
				))}
			</div>

			{/* Content */}
			<div className="relative z-[1]">{children}</div>
		</div>
	);
}
