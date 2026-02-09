import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ANIMATION, sectionReveal } from "./animation";
import { LatticeOverlay } from "./motifs/LatticeOverlay";
import { SectionHeader } from "./motifs/SectionHeader";
import { PerspectiveCardStack } from "./PerspectiveCardStack";

const templates = [
	{
		id: "garden-romance",
		title: "Garden Romance",
		desc: "Chinese tradition with modern warmth.",
		photo: "/photos/golden-hour.jpg",
	},
	{
		id: "blush-romance",
		title: "Blush Romance",
		desc: "Soft, sun-drenched romance.",
		photo: "/photos/floral-detail.jpg",
	},
	{
		id: "love-at-dusk",
		title: "Love at Dusk",
		desc: "Twilight elegance for evening vows.",
		photo: "/photos/couple-walking.jpg",
	},
	{
		id: "eternal-elegance",
		title: "Eternal Elegance",
		desc: "Timeless black and gold sophistication.",
		photo: "/photos/golden-hour.jpg",
	},
];

export function Showcase({ reducedMotion }: { reducedMotion: boolean }) {
	return (
		// biome-ignore lint/correctness/useUniqueElementIds: intentional anchor for in-page navigation
		<section
			id="showcase"
			className="relative overflow-hidden"
			style={{
				background: "var(--dm-bg)",
				padding: "clamp(5rem, 10vw, 10rem) 0",
			}}
		>
			{/* Lattice overlay at 8% */}
			<LatticeOverlay color="var(--dm-gold)" opacity={0.08} />

			<div className="relative z-10 mx-auto max-w-7xl px-6">
				{/* biome-ignore lint/correctness/useUniqueElementIds: intentional anchor for header nav */}
				<div id="templates" />

				<SectionHeader
					kickerEn="THE COLLECTION"
					kickerCn="四款精选"
					title="Four templates. One for every love story."
					kickerColor="var(--dm-crimson)"
					reducedMotion={reducedMotion}
				/>

				{/* Card gallery */}
				<PerspectiveCardStack
					templates={templates}
					reducedMotion={reducedMotion}
				/>

				{/* See a live invitation link */}
				<motion.div
					initial={reducedMotion ? false : "hidden"}
					whileInView="visible"
					viewport={ANIMATION.viewport}
					variants={sectionReveal}
					className="mt-10 text-center"
				>
					<Link
						to="/invite/$slug"
						params={{ slug: "garden-romance-sample" }}
						className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-300 hover:bg-[var(--dm-crimson)]/5"
						style={{
							border: "1.5px solid var(--dm-crimson)",
							color: "var(--dm-crimson)",
						}}
					>
						See a live invitation
						<span aria-hidden="true">&rarr;</span>
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
