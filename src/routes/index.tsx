import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { CinematicHero } from "@/components/landing/CinematicHero";
import { EmotionalStorytelling } from "@/components/landing/EmotionalStorytelling";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { GalleryShowcase } from "@/components/landing/GalleryShowcase";
import { SimplifiedFeatures } from "@/components/landing/SimplifiedFeatures";
import { TemplateShowcase } from "@/components/landing/TemplateShowcase";

export const Route = createFileRoute("/")({ component: HomePage });

/**
 * DreamMoments Landing Page
 * Cinematic showcase for the Crimson Blessings template
 */
export function HomePage() {
	return (
		<div className="min-h-screen">
			{/* Full-viewport hero with burgundy/gold theme */}
			<CinematicHero />

			{/* Interactive template preview with viewport toggle */}
			<TemplateShowcase />

			{/* Photo gallery carousel */}
			<GalleryShowcase />

			{/* Emotional/cultural storytelling sections */}
			<EmotionalStorytelling />

			{/* 3 key features */}
			<SimplifiedFeatures />

			{/* Final call-to-action */}
			<FinalCTA />

			{/* Minimal footer */}
			<footer className="border-t border-[#d4af37]/20 bg-[#faf8f5] px-6 py-8">
				<div className="mx-auto max-w-6xl">
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
						<div className="flex items-center gap-2 text-[#5c1a1b]">
							<Heart className="h-5 w-5 text-[#d4af37]" fill="currentColor" />
							<span
								className="font-light"
								style={{ fontFamily: "'Cinzel Decorative', serif" }}
							>
								DreamMoments
							</span>
						</div>
						<p className="text-sm text-stone-500">
							Crafted with love for couples everywhere
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
