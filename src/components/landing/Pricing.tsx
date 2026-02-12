import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useRef } from "react";
import { useScrollReveal } from "./hooks/useScrollReveal";

const FREE_FEATURES = [
	"3 AI text regenerations",
	"All premium templates",
	"Standard link",
	"RSVP management",
	"Basic analytics",
];

const PREMIUM_FEATURES = [
	"Unlimited AI regenerations",
	"Custom URL (your-name.dreammoments.app)",
	"Digital Ang Bao QR",
	"Guest list export",
	"Advanced analytics",
	"Priority support",
	"Remove branding",
];

export function Pricing({ reducedMotion }: { reducedMotion: boolean }) {
	const sectionRef = useRef<HTMLElement>(null);
	useScrollReveal(reducedMotion, sectionRef);

	return (
		// biome-ignore lint/correctness/useUniqueElementIds: stable hash target for in-page navigation links
		<section
			ref={sectionRef}
			className="py-24 lg:py-32 bg-dm-surface-muted"
			id="pricing"
		>
			<div className="dm-container dm-reveal">
				<div className="text-center max-w-2xl mx-auto mb-16">
					<span className="text-dm-primary font-semibold tracking-wider text-sm uppercase mb-4 block">
						Pricing
					</span>
					<h2 className="text-heading mb-6">Simple, transparent pricing.</h2>
					<p className="text-body-lg mb-8">
						Start for free, upgrade only when you're ready to publish. One-time
						payment per invitation, no subscriptions.
					</p>

					<div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-dm-border text-sm text-dm-ink-muted">
						<span>Prices in</span>
						<span className="font-semibold text-dm-ink">MYR</span>
						<span className="text-gray-300">/</span>
						<span className="font-semibold text-dm-ink">SGD</span>
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
					{/* Free Plan */}
					<div className="bg-white rounded-3xl p-8 border border-dm-border shadow-sm flex flex-col">
						<div className="mb-6">
							<h3 className="text-lg font-medium text-dm-ink">Basic</h3>
							<div className="mt-4 flex items-baseline gap-1">
								<span className="text-4xl font-display font-bold text-dm-ink">
									RM0
								</span>
							</div>
							<p className="mt-2 text-sm text-dm-ink-muted">
								Perfect for trying it out.
							</p>
						</div>
						<ul className="space-y-4 mb-8 flex-1">
							{FREE_FEATURES.map((feature) => (
								<li
									key={feature}
									className="flex items-start gap-3 text-sm text-dm-ink-muted"
								>
									<Check className="w-5 h-5 text-dm-primary flex-shrink-0" />
									{feature}
								</li>
							))}
						</ul>
						<Link
							to="/auth/signup"
							className="w-full block text-center py-3 bg-white border border-dm-border rounded-full text-dm-ink font-medium hover:bg-gray-50 transition-colors"
						>
							Get Started Free
						</Link>
					</div>

					{/* Premium Plan */}
					<div className="bg-white rounded-3xl p-8 border-2 border-dm-primary shadow-xl flex flex-col relative overflow-hidden">
						<div className="absolute top-0 right-0 bg-dm-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
							Popular
						</div>
						<div className="mb-6">
							<h3 className="text-lg font-medium text-dm-ink">Premium</h3>
							<div className="mt-4 flex items-baseline gap-1">
								<span className="text-4xl font-display font-bold text-dm-ink">
									RM49
								</span>
								<span className="text-lg text-dm-ink-muted font-medium">
									/ S$19
								</span>
							</div>
							<p className="mt-2 text-sm text-dm-ink-muted">
								Everything you need for the big day.
							</p>
						</div>
						<ul className="space-y-4 mb-8 flex-1">
							{PREMIUM_FEATURES.map((feature) => (
								<li
									key={feature}
									className="flex items-start gap-3 text-sm text-dm-ink"
								>
									<Check className="w-5 h-5 text-dm-primary flex-shrink-0" />
									{feature}
								</li>
							))}
						</ul>
						<Link
							to="/auth/signup"
							className="w-full block text-center py-3 bg-dm-primary text-white rounded-full font-medium hover:bg-dm-primary-hover shadow-lg shadow-dm-primary/25 transition-all"
						>
							Create Premium Invite
						</Link>
					</div>
				</div>

				<p className="text-center text-sm text-dm-ink-muted mt-10 italic">
					"Like an angpao — give once, celebrate forever."
				</p>
			</div>
		</section>
	);
}
