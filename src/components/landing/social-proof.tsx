import { motion } from "motion/react";

const testimonials = [
	{
		quote:
			"Our guests couldn't stop talking about how beautiful our invitation was. It felt like us.",
		name: "Wei Lin & James",
		location: "Kuala Lumpur",
	},
	{
		quote:
			"We managed everything from one link - RSVPs, meal choices, even song requests. So easy.",
		name: "Shu Qi & David",
		location: "Singapore",
	},
	{
		quote:
			"The bilingual feature was perfect for our families. Both sides felt included.",
		name: "Mei Xin & Adrian",
		location: "Penang",
	},
];

export function SocialProof() {
	return (
		// biome-ignore lint/correctness/useUniqueElementIds: scroll navigation anchor
		<section
			id="social-proof"
			className="relative py-24 sm:py-32 lg:py-40 overflow-hidden"
		>
			{/* Background image */}
			<img
				src="/photos/landing/showcase-details.jpg"
				alt=""
				loading="lazy"
				className="absolute inset-0 h-full w-full object-cover"
			/>

			{/* Dark overlay */}
			<div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

			{/* Content */}
			<div className="relative mx-auto max-w-5xl px-6">
				{/* Large stat */}
				<motion.div
					className="social-proof-stat mb-16 text-center"
					initial={{ opacity: 0, transform: "translateY(40px)" }}
					whileInView={{ opacity: 1, transform: "translateY(0)" }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
				>
					<p className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white">
						84%
					</p>
					<p className="mt-4 text-lg sm:text-xl text-white/70">
						of guests RSVP within 48 hours
					</p>
				</motion.div>

				{/* Testimonial cards */}
				<div className="testimonial-cards grid grid-cols-1 sm:grid-cols-3 gap-6">
					{testimonials.map((t, i) => (
						<motion.div
							key={t.name}
							className="testimonial-card rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 sm:p-8"
							initial={{ opacity: 0, transform: "translateY(30px)" }}
							whileInView={{ opacity: 1, transform: "translateY(0)" }}
							viewport={{ once: true, amount: 0.2 }}
							transition={{
								duration: 0.8,
								ease: [0.33, 1, 0.68, 1],
								delay: i * 0.15,
							}}
						>
							<p className="text-white/85 leading-relaxed">{t.quote}</p>
							<div className="mt-6">
								<p className="font-medium text-white">{t.name}</p>
								<p className="text-sm text-white/50">{t.location}</p>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
