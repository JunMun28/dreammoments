import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import { useScrollReveal } from "./hooks/useScrollReveal";

export function FinalCTA({ reducedMotion }: { reducedMotion: boolean }) {
	const sectionRef = useRef<HTMLElement>(null);
	useScrollReveal(reducedMotion, sectionRef);

	return (
		<section
			ref={sectionRef}
			className="relative py-32 lg:py-48 overflow-hidden flex items-center justify-center min-h-[600px]"
		>
			{/* Cinematic Background */}
			<div className="absolute inset-0 bg-black z-0">
				<div className="absolute inset-0 bg-black/60 z-10" />
				<img
					src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
					alt="Couple walking away together"
					className={`w-full h-full object-cover object-center z-0 opacity-70 ${!reducedMotion ? "animate-scale-in duration-[10s]" : ""}`}
				/>
			</div>

			<div className="relative z-20 text-center max-w-4xl px-6 animate-fade-up">
				<p className="text-dm-primary-soft font-medium tracking-[0.2em] uppercase mb-4 text-shadow-sm">
					Begin Your Always
				</p>
				<h2 className="text-5xl md:text-7xl lg:text-8xl font-display text-white mb-8 text-shadow-hero leading-tight">
					Your Forever <br /> Starts Here.
				</h2>
				<p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed font-light text-shadow-sm">
					Join the thousands of couples who have chosen to share their love
					story in the most beautiful way possible.
				</p>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-6">
					<Link
						to="/auth/signup"
						className="px-10 py-5 rounded-full bg-white text-dm-ink font-medium text-xl hover:bg-dm-primary-soft transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-glow"
					>
						Create Your Invitation
					</Link>
					<Link
						to="/pricing"
						className="px-8 py-3 text-white/80 hover:text-white font-medium text-lg transition-colors border-b border-transparent hover:border-white"
					>
						View Pricing
					</Link>
				</div>

				<p className="mt-8 text-sm text-white/50">
					Free to draft. No credit card required.
				</p>
			</div>
		</section>
	);
}
