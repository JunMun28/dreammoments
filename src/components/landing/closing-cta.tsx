import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

export function ClosingCta() {
	return (
		<section className="relative min-h-[70vh] overflow-hidden flex items-center justify-center">
			<img
				src="/photos/landing/closing-couple.jpg"
				alt=""
				loading="lazy"
				className="absolute inset-0 h-full w-full object-cover"
			/>
			<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

			<motion.div
				className="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
				initial={{ opacity: 0, transform: "translateY(30px)" }}
				whileInView={{ opacity: 1, transform: "translateY(0)" }}
				viewport={{ once: true, amount: 0.2 }}
				transition={{
					duration: 0.8,
					ease: [0.25, 0.46, 0.45, 0.94],
				}}
			>
				<h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-white">
					Ready to begin?
				</h2>
				<p className="text-lg text-white/70">
					Create your invitation in minutes. Share it with everyone.
				</p>
				<Link
					to="/editor/new"
					search={{ template: "double-happiness" }}
					className="rounded-full bg-gold px-10 py-4 text-white transition-transform duration-300 hover:scale-105"
				>
					Start Creating
				</Link>
			</motion.div>
		</section>
	);
}
