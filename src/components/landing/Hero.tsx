import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ANIMATION } from "./animation";

const heroStagger = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.12 },
	},
};

const heroChild = {
	hidden: { opacity: 0, y: 24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: ANIMATION.duration.entrance,
			ease: ANIMATION.ease.default,
		},
	},
};

const spotlightVariants = {
	hidden: { opacity: 0, scale: 0.95, y: 20 },
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			duration: 0.9,
			delay: 0.3,
			ease: ANIMATION.ease.default,
		},
	},
};

export function Hero({ reducedMotion }: { reducedMotion: boolean }) {
	return (
		<section
			className="relative min-h-svh overflow-hidden"
			style={{ background: "var(--dm-bg)" }}
		>
			{/* Background: warm gradient */}
			<div className="absolute inset-0 bg-gradient-to-br from-[var(--dm-crimson-soft)]/40 via-[var(--dm-bg)] to-[var(--dm-gold-soft)]/30" />

			<div className="relative z-10 mx-auto flex min-h-svh max-w-7xl flex-col items-center justify-center gap-12 px-6 pt-28 pb-16 lg:flex-row lg:gap-16 lg:pt-32">
				{/* Left: Copy */}
				<motion.div
					initial={reducedMotion ? false : "hidden"}
					animate="visible"
					variants={heroStagger}
					className="max-w-xl flex-1 text-center lg:text-left"
				>
					{/* Cultural kicker */}
					<motion.div
						variants={heroChild}
						className="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
					>
						<span className="inline-flex items-center gap-2 rounded-full border border-[var(--dm-border)] bg-[var(--dm-surface)]/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-[var(--dm-muted)] backdrop-blur-sm">
							<span aria-hidden="true" className="text-[var(--dm-crimson)]">
								囍
							</span>
							Made for Chinese Weddings
						</span>
						<span className="inline-flex items-center rounded-full border border-[var(--dm-gold-soft)] bg-[var(--dm-gold-soft)]/50 px-3 py-1 text-xs font-medium tracking-[0.08em] text-[var(--dm-ink)]">
							AI-Powered
						</span>
					</motion.div>

					{/* Headline */}
					<motion.h1
						variants={heroChild}
						className="mt-6 font-display font-semibold tracking-tight"
						style={{
							fontSize: "var(--text-hero)",
							lineHeight: 1.1,
							color: "var(--dm-ink)",
						}}
					>
						Beautiful invitations your guests will{" "}
						<em className="italic" style={{ color: "var(--dm-crimson)" }}>
							remember.
						</em>
					</motion.h1>

					{/* Subtitle */}
					<motion.p
						variants={heroChild}
						className="mx-auto mt-6 max-w-[44ch] text-lg leading-relaxed lg:mx-0"
						style={{ color: "var(--dm-muted)" }}
					>
						Create a stunning digital wedding invitation in minutes. AI writes
						your content, you make it yours. From RM49.
					</motion.p>

					{/* CTA Group */}
					<motion.div
						variants={heroChild}
						className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start"
					>
						<Link to="/auth/signup" className="dm-cta-primary">
							Create Your Invitation
						</Link>
						<Link to="/" hash="templates" className="dm-cta-secondary">
							Browse Templates
						</Link>
					</motion.div>

					{/* Trust indicators */}
					<motion.div
						variants={heroChild}
						className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm lg:justify-start"
						style={{ color: "var(--dm-muted)" }}
					>
						<span>Free to start</span>
						<span
							className="hidden h-3 w-px sm:inline"
							style={{ background: "var(--dm-border)" }}
							aria-hidden="true"
						/>
						<span>No credit card</span>
						<span
							className="hidden h-3 w-px sm:inline"
							style={{ background: "var(--dm-border)" }}
							aria-hidden="true"
						/>
						<span>PDPA compliant</span>
					</motion.div>
				</motion.div>

				{/* Right: Single-template spotlight */}
				<motion.div
					initial={reducedMotion ? false : "hidden"}
					animate="visible"
					variants={spotlightVariants}
					className="relative flex flex-1 items-center justify-center"
				>
					<div className="relative w-full max-w-[340px] lg:max-w-[380px]">
						<div className="overflow-hidden rounded-[2rem] border border-[var(--dm-border)] bg-[var(--dm-surface)] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)]">
							<div className="aspect-[9/16] w-full">
								<img
									src="/photos/golden-hour.jpg"
									alt="Garden Romance template preview showing a Chinese wedding invitation"
									className="h-full w-full object-cover"
									loading="eager"
									fetchPriority="high"
								/>
							</div>
						</div>
						{/* Floating badge */}
						<div className="absolute -bottom-3 -right-3 rounded-xl border border-[var(--dm-gold-soft)] bg-[var(--dm-surface)] px-4 py-2 shadow-lg">
							<p
								className="text-xs font-medium uppercase tracking-[0.1em]"
								style={{ color: "var(--dm-gold)" }}
							>
								Garden Romance
							</p>
							<p
								className="mt-0.5 text-xs"
								style={{ color: "var(--dm-muted)" }}
							>
								Chinese tradition theme
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
