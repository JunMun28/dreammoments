import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
	ANIMATION,
	childReveal,
	containerReveal,
	sectionReveal,
} from "./animation";

const templates: {
	id: string;
	title: string;
	desc: string;
	photo: string;
	culturalBadge: string | null;
}[] = [
	{
		id: "garden-romance",
		title: "Garden Romance",
		desc: "Chinese tradition with modern warmth.",
		photo: "/photos/golden-hour.jpg",
		culturalBadge: "Chinese Tradition",
	},
	{
		id: "love-at-dusk",
		title: "Love at Dusk",
		desc: "Twilight elegance for evening vows.",
		photo: "/photos/couple-walking.jpg",
		culturalBadge: null,
	},
	{
		id: "blush-romance",
		title: "Blush Romance",
		desc: "Soft, sun-drenched romance.",
		photo: "/photos/floral-detail.jpg",
		culturalBadge: null,
	},
	{
		id: "eternal-elegance",
		title: "Eternal Elegance",
		desc: "Timeless black and gold sophistication.",
		photo: "/photos/golden-hour.jpg",
		culturalBadge: null,
	},
];

export function Showcase({ reducedMotion }: { reducedMotion: boolean }) {
	return (
		// biome-ignore lint/correctness/useUniqueElementIds: intentional anchor for in-page navigation
		<section
			id="showcase"
			className="relative py-24 px-6 overflow-hidden"
			style={{ background: "var(--dm-bg)" }}
		>
			<div className="mx-auto max-w-7xl">
				{/* biome-ignore lint/correctness/useUniqueElementIds: intentional anchor for header nav */}
				<div id="templates" />

				{/* Section header */}
				<div className="mx-auto max-w-2xl text-center mb-16">
					<motion.span
						initial={reducedMotion ? false : "hidden"}
						whileInView="visible"
						viewport={ANIMATION.viewport}
						variants={sectionReveal}
						className="text-sm font-medium uppercase tracking-[0.12em]"
						style={{ color: "var(--dm-gold)" }}
					>
						The Collection
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
						Four templates, crafted for Chinese weddings
					</motion.h2>
					<motion.p
						initial={reducedMotion ? false : "hidden"}
						whileInView="visible"
						viewport={ANIMATION.viewport}
						variants={sectionReveal}
						className="mt-4 text-lg leading-relaxed"
						style={{ color: "var(--dm-muted)" }}
					>
						From garden ceremonies to evening banquets. Tea ceremony sections,
						bilingual text, and double happiness motifs built in.
					</motion.p>
				</div>

				{/* Template grid */}
				<motion.div
					initial={reducedMotion ? false : "hidden"}
					whileInView="visible"
					viewport={ANIMATION.viewport}
					variants={containerReveal}
					className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
				>
					{templates.map((t) => (
						<motion.div key={t.id} variants={childReveal}>
							<Link
								to="/invite/$slug"
								params={{ slug: `${t.id}-sample` }}
								className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-crimson)] focus-visible:ring-offset-2"
							>
								<div className="overflow-hidden rounded-2xl border border-[var(--dm-border)] bg-[var(--dm-surface)] shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-md">
									<div className="aspect-[3/4] relative">
										<img
											src={t.photo}
											alt={`${t.title} wedding invitation template preview`}
											loading="lazy"
											decoding="async"
											className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
										{t.culturalBadge && (
											<div
												className="absolute top-3 left-3 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em]"
												style={{
													background: "var(--dm-crimson)",
													color: "white",
												}}
											>
												{t.culturalBadge}
											</div>
										)}
									</div>
								</div>
								<div className="mt-4 text-center">
									<h3
										className="font-display text-lg font-semibold transition-colors duration-300 group-hover:text-[var(--dm-crimson)]"
										style={{ color: "var(--dm-ink)" }}
									>
										{t.title}
									</h3>
									<p
										className="mt-1 text-sm"
										style={{ color: "var(--dm-muted)" }}
									>
										{t.desc}
									</p>
								</div>
							</Link>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
