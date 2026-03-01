import { cn } from "@/lib/utils";

interface GoldDustParticlesProps {
	count?: number;
	className?: string;
}

/**
 * Deterministic pseudo-random number generator based on particle index.
 * Avoids Math.random() to prevent SSR/client hydration mismatch.
 */
function seededRandom(seed: number): number {
	const x = Math.sin(seed * 9301 + 49297) * 233280;
	return x - Math.floor(x);
}

export function GoldDustParticles({
	count = 24,
	className,
}: GoldDustParticlesProps) {
	const particles = Array.from({ length: count }, (_, i) => {
		const r1 = seededRandom(i + 1);
		const r2 = seededRandom(i + 100);
		const r3 = seededRandom(i + 200);
		const r4 = seededRandom(i + 300);
		const r5 = seededRandom(i + 400);

		return {
			left: `${r1 * 100}%`,
			top: `${r2 * 100}%`,
			size: 2 + r3 * 2, // 2-4px
			opacity: 0.4 + r4 * 0.2, // 40-60%
			delay: r5 * 8, // 0-8s
			duration: 6 + r1 * 6, // 6-12s (reuse r1 for variety)
		};
	});

	return (
		<div
			aria-hidden="true"
			className={cn(
				"dm-gold-dust pointer-events-none absolute inset-0 overflow-hidden",
				className,
			)}
		>
			{particles.map((p, i) => (
				<span
					key={i}
					className="absolute rounded-full"
					style={{
						left: p.left,
						top: p.top,
						width: p.size,
						height: p.size,
						backgroundColor: "#D4A843",
						opacity: p.opacity,
						animation: `dm-particle-drift-up ${p.duration}s linear ${p.delay}s infinite`,
					}}
				/>
			))}
		</div>
	);
}
