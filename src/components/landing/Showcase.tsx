import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ANIMATION, sectionReveal } from "./animation";
import { LatticeOverlay } from "./motifs/LatticeOverlay";
import { MeshGradientBackground } from "./MeshGradientBackground";
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
			{/* Mesh gradient background */}
			<div className="absolute inset-0 pointer-events-none" aria-hidden="true">
				<MeshGradientBackground variant="warm" className="h-full" reducedMotion={reducedMotion}>
					<div />
				</MeshGradientBackground>
			</div>

			{/* Lattice overlay at 10% */}
			<LatticeOverlay color="var(--dm-gold)" opacity={0.10} />

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

				{/* Card gallery with ambient glow */}
				<div className="relative">
					{/* Ambient glow behind cards */}
					<div
						className="pointer-events-none absolute inset-0 -inset-x-12 -inset-y-8"
						aria-hidden="true"
						style={{
							background:
								"radial-gradient(ellipse 60% 50% at 50% 50%, rgba(232,24,64,0.08) 0%, rgba(212,175,55,0.06) 40%, transparent 70%)",
							filter: "blur(40px)",
						}}
					/>
					<PerspectiveCardStack
						templates={templates}
						reducedMotion={reducedMotion}
					/>
				</div>

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
