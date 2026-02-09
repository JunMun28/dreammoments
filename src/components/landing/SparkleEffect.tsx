import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface SparkleEffectProps {
	count?: number;
	className?: string;
}

interface Sparkle {
	id: number;
	top: string;
	left: string;
	size: number;
	delay: string;
	duration: string;
}

export function SparkleEffect({ count = 8, className }: SparkleEffectProps) {
	const sparkles: Sparkle[] = useMemo(() => {
		return Array.from({ length: count }, (_, i) => ({
			id: i,
			top: `${10 + Math.random() * 80}%`,
			left: `${5 + Math.random() * 90}%`,
			size: 2 + Math.random() * 3,
			delay: `${Math.random() * 3}s`,
			duration: `${2 + Math.random() * 2}s`,
		}));
	}, [count]);

	return (
		<div
			className={cn(
				"pointer-events-none absolute inset-0 overflow-hidden",
				className,
			)}
			aria-hidden="true"
		>
			{sparkles.map((s) => (
				<span
					key={s.id}
					className="dm-sparkle absolute rounded-full"
					style={{
						top: s.top,
						left: s.left,
						width: `${s.size}px`,
						height: `${s.size}px`,
						background:
							"radial-gradient(circle, var(--dm-gold-electric) 0%, transparent 70%)",
						boxShadow: "0 0 6px 2px rgba(255,215,0,0.4)",
						animationDelay: s.delay,
						animationDuration: s.duration,
					}}
				/>
			))}

			<style>{`
				@keyframes dm-sparkle-twinkle {
					0%, 100% { opacity: 0; transform: scale(0.5); }
					50% { opacity: 1; transform: scale(1); }
				}
				.dm-sparkle {
					animation: dm-sparkle-twinkle 2.5s ease-in-out infinite;
				}
				@media (prefers-reduced-motion: reduce) {
					.dm-sparkle { animation: none; opacity: 0.6; }
				}
			`}</style>
		</div>
	);
}
