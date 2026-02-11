import { useEffect, useRef } from "react";

interface FloatingParticlesProps {
	count?: number;
	color?: string;
	reducedMotion?: boolean;
}

export function FloatingParticles({
	count = 5,
	color = "var(--dm-gold-electric)",
	reducedMotion = false,
}: FloatingParticlesProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (reducedMotion || !containerRef.current) return;

		let ctx: gsap.Context | undefined;

		async function initGSAP() {
			const gsap = (await import("gsap")).default;

			if (!containerRef.current) return;

			const dots = containerRef.current.querySelectorAll(".dm-particle");
			ctx = gsap.context(() => {
				for (const dot of Array.from(dots)) {
					gsap.to(dot, {
						x: `random(-40, 40)`,
						y: `random(-40, 40)`,
						duration: `random(3, 6)`,
						repeat: -1,
						yoyo: true,
						ease: "sine.inOut",
						delay: `random(0, 2)`,
					});
				}
			}, containerRef.current);
		}

		initGSAP();
		return () => ctx?.revert();
	}, [reducedMotion]);

	if (reducedMotion) return null;

	return (
		<div
			ref={containerRef}
			className="absolute inset-0 pointer-events-none overflow-hidden"
			aria-hidden="true"
		>
			{Array.from({ length: count }).map((_, i) => (
				<div
					key={i}
					className="dm-particle absolute h-1.5 w-1.5 rounded-full"
					style={{
						background: color,
						opacity: 0.4 + Math.random() * 0.3,
						left: `${15 + Math.random() * 70}%`,
						top: `${15 + Math.random() * 70}%`,
					}}
				/>
			))}
		</div>
	);
}
