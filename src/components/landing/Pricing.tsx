import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import {
	ANIMATION,
	childReveal,
	containerReveal,
	sectionReveal,
} from "./animation";
import { HongbaoBadge } from "./HongbaoBadge";
import { useCountUp } from "./hooks/useCountUp";
import { MovingBorderButton } from "./MovingBorderButton";
import { SectionHeader } from "./motifs/SectionHeader";

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
	"Angpao QR code",
	"CSV guest import / export",
	"Detailed analytics dashboard",
	"Priority support",
	'Remove "Made with DreamMoments" branding',
];

export function Pricing({ reducedMotion }: { reducedMotion: boolean }) {
	const priceRef = useCountUp(49, {
		duration: 1.8,
		reducedMotion,
	});

	return (
		// biome-ignore lint/correctness/useUniqueElementIds: intentional anchor for in-page navigation
		<section
			id="pricing"
			className="relative px-6 py-[clamp(5rem,10vw,10rem)]"
			style={{ background: "var(--dm-bg)" }}
		>
			<div className="mx-auto max-w-5xl">
				<SectionHeader
					kickerEn="SIMPLE PRICING"
					kickerCn="简单定价"
					title="One price. No subscriptions."
					subtitle="Start free, upgrade when you're ready. One-time payment per invitation."
					kickerColor="var(--dm-gold)"
					reducedMotion={reducedMotion}
				/>

				{/* Currency context pill */}
				<motion.div
					initial={reducedMotion ? false : "hidden"}
					whileInView="visible"
					viewport={ANIMATION.viewport}
					variants={sectionReveal}
					className="-mt-10 mb-14 text-center"
				>
					<span
						className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
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
					</span>
				</motion.div>

				{/* Cards */}
				<motion.div
					initial={reducedMotion ? false : "hidden"}
					whileInView="visible"
					viewport={ANIMATION.viewport}
					variants={containerReveal}
					className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2"
				>
					{/* Free Card */}
					<motion.div
						variants={childReveal}
						className="flex flex-col rounded-2xl p-8 sm:p-10 order-2 md:order-1"
						style={{
							border: "1px dashed var(--dm-border)",
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
										style={{ color: "var(--dm-sage)" }}
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
						className="relative flex flex-col rounded-2xl p-8 sm:p-10 order-1 md:order-2 md:-translate-y-3"
						style={{
							border: "3px solid var(--dm-gold)",
							background: "var(--dm-gold-soft)",
							boxShadow: "0 12px 48px -12px rgba(212, 175, 55, 0.15)",
						}}
					>
						<HongbaoBadge label="Most Popular" />

						<span
							className="mt-2 text-sm font-medium uppercase tracking-[0.12em]"
							style={{ color: "var(--dm-muted)" }}
						>
							Premium
						</span>
						<div className="mt-3">
							<span
								className="font-display font-semibold"
								style={{
									fontSize: "3.5rem",
									color: "var(--dm-gold-warm)",
								}}
							>
								RM
								<span ref={priceRef as React.RefObject<HTMLSpanElement>}>
									49
								</span>
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
										style={{ color: "var(--dm-gold-warm)" }}
									/>
									<span style={{ color: "var(--dm-ink)" }}>{f}</span>
								</li>
							))}
						</ul>

						<div className="mt-10 w-full">
							<MovingBorderButton
								href="/auth/signup"
								variant="gold"
								className="w-full justify-center"
							>
								Upgrade for RM49
							</MovingBorderButton>
						</div>
					</motion.div>
				</motion.div>

				{/* Angpao tagline */}
				<motion.p
					initial={reducedMotion ? false : "hidden"}
					whileInView="visible"
					viewport={ANIMATION.viewport}
					variants={sectionReveal}
					className="mt-10 text-center font-accent text-lg italic"
					style={{ color: "var(--dm-muted)" }}
				>
					One-time payment. Like an angpao — give once, celebrate forever.
				</motion.p>
			</div>
		</section>
	);
}
