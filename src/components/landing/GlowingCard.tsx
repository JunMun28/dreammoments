import { cn } from "@/lib/utils";

interface GlowingCardProps {
	children: React.ReactNode;
	className?: string;
	glowColors?: string;
}

export function GlowingCard({
	children,
	className,
	glowColors = "conic-gradient(from 0deg, transparent 0deg 200deg, var(--dm-crimson-bold) 240deg, var(--dm-gold-bold) 280deg, transparent 320deg 360deg)",
}: GlowingCardProps) {
	return (
		<div
			className={cn(
				"dm-glowing-card group relative overflow-hidden rounded-2xl p-[2px]",
				className,
			)}
		>
			{/* Animated glow ring */}
			<span
				className="dm-glowing-card-spin pointer-events-none absolute inset-[-200%]"
				style={{ background: glowColors }}
				aria-hidden="true"
			/>

			{/* Static fallback for reduced motion */}
			<span
				className="dm-glowing-card-static pointer-events-none absolute inset-0 hidden rounded-2xl"
				style={{
					border: "2px solid var(--dm-gold)",
					opacity: 0.5,
				}}
				aria-hidden="true"
			/>

			{/* Card content */}
			<div className="relative z-10 rounded-[calc(1rem-2px)] bg-[var(--dm-surface)]">
				{children}
			</div>

			<style>{`
				.dm-glowing-card-spin {
					animation: dm-glow-spin 6s linear infinite;
				}
				@keyframes dm-glow-spin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
				.dm-glowing-card:hover .dm-glowing-card-spin {
					opacity: 1;
				}
				.dm-glowing-card .dm-glowing-card-spin {
					opacity: 0.6;
					transition: opacity 0.3s ease;
				}
				@media (prefers-reduced-motion: reduce) {
					.dm-glowing-card-spin {
						animation: none;
						display: none;
					}
					.dm-glowing-card-static {
						display: block !important;
					}
				}
			`}</style>
		</div>
	);
}
