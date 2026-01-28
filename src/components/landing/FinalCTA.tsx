import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SparkleEffect } from "@/components/ui/sparkle-effect";

/**
 * FinalCTA - Closing call-to-action section.
 * Full-width burgundy section with sparkle effect and prominent gold CTA.
 */
export function FinalCTA() {
	return (
		<section className="relative overflow-hidden bg-[#5c1a1b] px-6 py-24">
			{/* Gradient overlay */}
			<div
				className="absolute inset-0 z-0"
				style={{
					background:
						"radial-gradient(ellipse at center, #7a2829 0%, #5c1a1b 60%, #3d1112 100%)",
				}}
				aria-hidden="true"
			/>

			{/* Sparkle effect */}
			<SparkleEffect count={20} color="#d4af37" className="z-[1]" />

			{/* Content */}
			<div className="relative z-10 mx-auto max-w-3xl text-center">
				{/* Headline */}
				<h2
					className="mb-6 text-3xl font-light text-white md:text-5xl"
					style={{ fontFamily: "'Cinzel Decorative', serif" }}
				>
					Begin Your <span className="gold-shimmer-text">Forever</span>
				</h2>

				{/* Subheadline */}
				<p
					className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-white/80"
					style={{ fontFamily: "'EB Garamond', serif" }}
				>
					Your love story deserves to be shared beautifully. Start creating your
					invitation today—it only takes a few minutes to make something
					extraordinary.
				</p>

				{/* CTA button */}
				<Button
					size="lg"
					className="min-w-[240px] border-2 border-[#d4af37] bg-[#d4af37] px-8 py-6 text-lg text-[#5c1a1b] shadow-lg shadow-[#d4af37]/30 transition-all hover:bg-[#e5c048] hover:shadow-xl hover:shadow-[#d4af37]/40"
					asChild
				>
					<Link to="/login">
						<Sparkles className="mr-2 h-5 w-5" />
						Create Your Invitation
					</Link>
				</Button>

				{/* Trust text */}
				<p className="mt-6 text-sm text-white/50">
					Free to start • No credit card required
				</p>
			</div>
		</section>
	);
}
