import { BarChart3, Check, Heart, Smartphone, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import {
	ANIMATION,
	childReveal,
	containerReveal,
	mockupReveal,
} from "./animation";

const FEATURES = [
	{
		title: "AI-Powered Content",
		desc: "Your love story, schedule, and details written by AI in seconds. Just answer a few questions.",
		icon: Sparkles,
	},
	{
		title: "Built for Chinese Weddings",
		desc: "Double happiness motifs, tea ceremony sections, banquet seating, and bilingual support.",
		icon: Heart,
	},
	{
		title: "One-Tap RSVP",
		desc: "Guests reply instantly from their phones. No accounts, no app downloads, no friction.",
		icon: Check,
	},
	{
		title: "Real-Time Dashboard",
		desc: "Track views, RSVPs, dietary preferences, and plus-ones at a glance.",
		icon: BarChart3,
	},
	{
		title: "Beautiful on Every Screen",
		desc: "Mobile-first design. 80% of your guests will view on their phones — it'll look perfect.",
		icon: Smartphone,
	},
];

export function Features({ reducedMotion }: { reducedMotion: boolean }) {
	return (
		<section
			className="relative py-24 px-6"
			style={{ background: "var(--dm-bg)" }}
		>
			<div className="mx-auto max-w-6xl">
				<div
					className="rounded-[2rem] border p-10 sm:p-14 lg:p-20"
					style={{
						background: "var(--dm-surface-muted)",
						borderColor: "var(--dm-border)",
					}}
				>
					<div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
						{/* Left: features */}
						<motion.div
							initial={reducedMotion ? false : "hidden"}
							whileInView="visible"
							viewport={ANIMATION.viewport}
							variants={containerReveal}
						>
							<span
								className="text-sm font-medium uppercase tracking-[0.12em]"
								style={{ color: "var(--dm-crimson)" }}
							>
								Why DreamMoments
							</span>
							<h2
								className="mt-3 font-display font-semibold tracking-tight"
								style={{
									fontSize: "var(--text-section)",
									color: "var(--dm-ink)",
								}}
							>
								Everything you need.{" "}
								<span
									className="font-accent italic"
									style={{ color: "var(--dm-rose)" }}
								>
									Nothing you don't.
								</span>
							</h2>

							<div className="mt-10 space-y-7">
								{FEATURES.map((f) => (
									<motion.div
										key={f.title}
										variants={childReveal}
										className="flex items-start gap-4"
									>
										<div
											className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border shadow-sm"
											style={{
												background: "var(--dm-surface)",
												borderColor: "var(--dm-border)",
												color: "var(--dm-ink)",
											}}
										>
											<f.icon aria-hidden="true" className="h-5 w-5" />
										</div>
										<div>
											<h3
												className="font-display text-lg font-semibold"
												style={{
													color: "var(--dm-ink)",
												}}
											>
												{f.title}
											</h3>
											<p
												className="mt-1 text-sm leading-relaxed"
												style={{
													color: "var(--dm-muted)",
												}}
											>
												{f.desc}
											</p>
										</div>
									</motion.div>
								))}
							</div>
						</motion.div>

						{/* Right: product mockup */}
						<motion.div
							initial={reducedMotion ? false : "hidden"}
							whileInView="visible"
							viewport={ANIMATION.viewport}
							variants={mockupReveal}
							className="relative aspect-square rounded-[2rem] border p-8 shadow-sm"
							style={{
								background: "var(--dm-surface)",
								borderColor: "var(--dm-border)",
							}}
						>
							<div
								className="h-full w-full overflow-hidden rounded-[1.5rem] flex flex-col"
								style={{ background: "var(--dm-bg)" }}
							>
								{/* Mock browser chrome */}
								<div className="h-12 border-b border-dm-border flex items-center px-6 gap-2">
									<div className="w-2 h-2 rounded-full bg-dm-border" />
									<div className="w-2 h-2 rounded-full bg-dm-border" />
								</div>

								{/* Mock invitation preview */}
								<div className="flex-1 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
									<div className="relative z-10" aria-hidden="true">
										<p className="font-accent text-3xl mb-2">Sarah & Tom</p>
										<p className="font-heading text-3xl sm:text-4xl mb-6">
											We're getting married.
										</p>
										<div
											className="inline-block px-6 py-2 rounded-full border text-sm uppercase tracking-widest"
											style={{
												borderColor: "var(--dm-border)",
												background: "var(--dm-surface)",
												color: "var(--dm-muted)",
											}}
										>
											Sept 24
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
}
