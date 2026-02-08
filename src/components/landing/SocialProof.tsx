import { motion } from "motion/react";
import {
	ANIMATION,
	childReveal,
	containerReveal,
	sectionReveal,
} from "./animation";

const STATS = [
	{ value: "500+", label: "Couples served in MY & SG" },
	{ value: "4.9/5", label: "Average rating" },
	{ value: "< 3 min", label: "Average setup time" },
];

export function SocialProof({ reducedMotion }: { reducedMotion: boolean }) {
	return (
		<section
			className="relative border-y py-16 px-6"
			style={{
				borderColor: "var(--dm-border)",
				background: "var(--dm-surface-muted)",
			}}
		>
			<div className="mx-auto max-w-5xl">
				{/* Stats row */}
				<motion.div
					initial={reducedMotion ? false : "hidden"}
					whileInView="visible"
					viewport={ANIMATION.viewport}
					variants={containerReveal}
					className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3"
				>
					{STATS.map((stat) => (
						<motion.div key={stat.label} variants={childReveal}>
							<p
								className="font-display text-4xl font-semibold"
								style={{ color: "var(--dm-ink)" }}
							>
								{stat.value}
							</p>
							<p className="mt-1 text-sm" style={{ color: "var(--dm-muted)" }}>
								{stat.label}
							</p>
						</motion.div>
					))}
				</motion.div>

				{/* Testimonial */}
				<motion.blockquote
					initial={reducedMotion ? false : "hidden"}
					whileInView="visible"
					viewport={ANIMATION.viewport}
					variants={sectionReveal}
					className="mx-auto mt-12 max-w-2xl text-center"
				>
					<p
						className="font-accent text-xl italic leading-relaxed"
						style={{ color: "var(--dm-ink)" }}
					>
						"Our guests kept saying the invitation was the most beautiful they'd
						ever received. The tea ceremony section was perfect."
					</p>
					<footer className="mt-4 text-sm" style={{ color: "var(--dm-muted)" }}>
						— Wei Lin & Jun Hao, Kuala Lumpur
					</footer>
				</motion.blockquote>
			</div>
		</section>
	);
}
