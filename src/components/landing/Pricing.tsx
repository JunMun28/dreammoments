import { Link } from "@tanstack/react-router";
import { Check, Crown } from "lucide-react";
import { motion } from "motion/react";
import {
	ANIMATION,
	childReveal,
	containerReveal,
	sectionReveal,
} from "./animation";

const FREE_FEATURES = [
	"3 AI content generations",
	"All 4 premium templates",
	"Standard invitation link",
	"RSVP management",
	"Basic view analytics",
];

const PREMIUM_FEATURES = [
	"100 AI content generations",
	"Custom slug (your-name.dreammoments.app)",
	"CSV guest import / export",
	"Detailed analytics dashboard",
	"Priority support",
	'Remove "Made with DreamMoments" branding',
];

export function Pricing({ reducedMotion }: { reducedMotion: boolean }) {
	return (
		// biome-ignore lint/correctness/useUniqueElementIds: intentional anchor for in-page navigation
		<section
			id="pricing"
			className="relative py-24 px-6"
			style={{ background: "var(--dm-surface-muted)" }}
		>
			<div className="mx-auto max-w-5xl">
				{/* Header */}
				<div className="mx-auto max-w-2xl text-center mb-14">
					<motion.span
						initial={reducedMotion ? false : "hidden"}
						whileInView="visible"
						viewport={ANIMATION.viewport}
						variants={sectionReveal}
						className="text-sm font-medium uppercase tracking-[0.12em]"
						style={{ color: "var(--dm-gold)" }}
					>
						Simple Pricing
					</motion.span>
					<motion.h2
						initial={reducedMotion ? false : "hidden"}
						whileInView="visible"
						viewport={ANIMATION.viewport}
						variants={sectionReveal}
						className="mt-3 font-display font-semibold tracking-tight"
						style={{
							fontSize: "var(--text-section)",
							color: "var(--dm-ink)",
						}}
					>
						One price. No subscriptions.
					</motion.h2>
					<motion.p
						initial={reducedMotion ? false : "hidden"}
						whileInView="visible"
						viewport={ANIMATION.viewport}
						variants={sectionReveal}
						className="mt-4 text-lg"
						style={{ color: "var(--dm-muted)" }}
					>
						Start free, upgrade when you're ready. One-time payment per
						invitation.
					</motion.p>

					{/* Currency context pill */}
					<motion.div
						initial={reducedMotion ? false : "hidden"}
						whileInView="visible"
						viewport={ANIMATION.viewport}
						variants={sectionReveal}
						className="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
						style={{
							borderColor: "var(--dm-border)",
							background: "var(--dm-surface)",
							color: "var(--dm-muted)",
						}}
					>
						<span>Prices shown in</span>
						<span className="font-semibold" style={{ color: "var(--dm-ink)" }}>
							MYR (Malaysia)
						</span>
						<span className="text-xs">/ SGD (Singapore)</span>
					</motion.div>
				</div>

				{/* Cards */}
				<motion.div
					initial={reducedMotion ? false : "hidden"}
					whileInView="visible"
					viewport={ANIMATION.viewport}
					variants={containerReveal}
					className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto"
				>
					{/* Free Card */}
					<motion.div
						variants={childReveal}
						className="flex flex-col rounded-2xl border p-8 sm:p-10"
						style={{
							borderColor: "var(--dm-border)",
							background: "var(--dm-surface)",
						}}
					>
						<span
							className="text-sm font-medium uppercase tracking-[0.12em]"
							style={{ color: "var(--dm-muted)" }}
						>
							Free
						</span>
						<div
							className="mt-3 font-display text-5xl font-semibold"
							style={{ color: "var(--dm-ink)" }}
						>
							RM0
						</div>
						<p className="mt-2" style={{ color: "var(--dm-muted)" }}>
							Everything to get started.
						</p>

						<ul className="mt-8 flex-1 space-y-4">
							{FREE_FEATURES.map((f) => (
								<li key={f} className="flex items-start gap-3">
									<Check
										aria-hidden="true"
										className="mt-0.5 h-5 w-5 flex-shrink-0"
										style={{ color: "var(--dm-rose)" }}
									/>
									<span style={{ color: "var(--dm-ink)" }}>{f}</span>
								</li>
							))}
						</ul>

						<Link
							to="/auth/signup"
							className="dm-cta-secondary mt-10 w-full text-center text-sm uppercase tracking-[0.12em]"
						>
							Get Started Free
						</Link>
					</motion.div>

					{/* Premium Card */}
					<motion.div
						variants={childReveal}
						className="relative flex flex-col rounded-2xl border-2 p-8 sm:p-10 shadow-[0_8px_28px_-4px_rgba(0,0,0,0.08)]"
						style={{
							borderColor: "var(--dm-gold)",
							background: "var(--dm-surface)",
						}}
					>
						{/* Badge */}
						<div
							className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em]"
							style={{
								background: "var(--dm-crimson)",
								color: "white",
							}}
						>
							<Crown aria-hidden="true" className="h-3.5 w-3.5" />
							Most Popular
						</div>

						<span
							className="text-sm font-medium uppercase tracking-[0.12em]"
							style={{ color: "var(--dm-muted)" }}
						>
							Premium
						</span>
						<div className="mt-3">
							<span
								className="font-display text-5xl font-semibold"
								style={{ color: "var(--dm-ink)" }}
							>
								RM49
							</span>
							<span
								className="ml-2 text-sm"
								style={{ color: "var(--dm-muted)" }}
							>
								/ SGD19
							</span>
						</div>
						<p className="mt-2" style={{ color: "var(--dm-muted)" }}>
							One-time per invitation. Not a subscription.
						</p>

						<ul className="mt-8 flex-1 space-y-4">
							{PREMIUM_FEATURES.map((f) => (
								<li key={f} className="flex items-start gap-3">
									<Check
										aria-hidden="true"
										className="mt-0.5 h-5 w-5 flex-shrink-0"
										style={{
											color: "var(--dm-crimson)",
										}}
									/>
									<span style={{ color: "var(--dm-ink)" }}>{f}</span>
								</li>
							))}
						</ul>

						<Link
							to="/auth/signup"
							className="dm-cta-primary mt-10 w-full text-center text-sm uppercase tracking-[0.12em]"
						>
							Upgrade for RM49
						</Link>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
