import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ANIMATION, sectionReveal } from "./animation";

export function FinalCTA({ reducedMotion }: { reducedMotion: boolean }) {
	return (
		<section
			className="relative overflow-hidden py-28 px-6"
			style={{ background: "var(--dm-dark-bg)" }}
		>
			{/* Gold divider top */}
			<div
				className="absolute top-0 left-0 right-0 h-px"
				style={{
					background:
						"linear-gradient(90deg, transparent, var(--dm-dark-gold), transparent)",
				}}
			/>

			{/* Subtle 囍 watermark */}
			<div
				className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
				aria-hidden="true"
				style={{ opacity: 0.03 }}
			>
				<span
					className="font-[Noto_Serif_SC] text-[20rem] font-bold"
					style={{ color: "var(--dm-dark-gold)" }}
				>
					囍
				</span>
			</div>

			{/* Subtle radial glow */}
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					background:
						"radial-gradient(ellipse at center, rgba(193, 39, 45, 0.08) 0%, transparent 60%)",
				}}
			/>

			<motion.div
				initial={reducedMotion ? false : "hidden"}
				whileInView="visible"
				viewport={ANIMATION.viewport}
				variants={sectionReveal}
				className="relative z-10 mx-auto max-w-2xl text-center"
			>
				<p
					className="font-accent text-lg italic"
					style={{ color: "var(--dm-dark-gold)" }}
				>
					Your love story awaits
				</p>
				<h2
					className="mt-4 font-display font-semibold tracking-tight"
					style={{
						fontSize: "var(--text-section)",
						color: "var(--dm-dark-text)",
					}}
				>
					Create an invitation your guests will treasure.
				</h2>
				<p className="mt-4 text-lg" style={{ color: "var(--dm-dark-muted)" }}>
					Join hundreds of Malaysian and Singaporean couples who chose
					DreamMoments for their special day.
				</p>

				<div className="mt-8">
					<Link
						to="/auth/signup"
						className="dm-cta-primary-dark text-sm uppercase tracking-[0.12em]"
					>
						Create Your Invitation
					</Link>
				</div>

				<p className="mt-4 text-sm" style={{ color: "var(--dm-dark-muted)" }}>
					Free to start. No credit card required.
				</p>
			</motion.div>

			{/* Gold divider bottom */}
			<div
				className="absolute bottom-0 left-0 right-0 h-px"
				style={{
					background:
						"linear-gradient(90deg, transparent, var(--dm-dark-gold), transparent)",
				}}
			/>
		</section>
	);
}
