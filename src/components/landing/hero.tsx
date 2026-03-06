import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
	const sectionRef = useRef<HTMLElement>(null);
	const bgRef = useRef<HTMLImageElement>(null);
	const foliageRef = useRef<HTMLImageElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReducedMotion) return;

		const ctx = gsap.context(() => {
			// Ken Burns slow zoom on background
			gsap.to(bgRef.current, {
				scale: 1.12,
				ease: "none",
				scrollTrigger: {
					trigger: sectionRef.current,
					start: "top top",
					end: "bottom top",
					scrub: true,
				},
			});

			// Foliage foreground parallax (faster)
			gsap.to(foliageRef.current, {
				yPercent: -30,
				ease: "none",
				scrollTrigger: {
					trigger: sectionRef.current,
					start: "top top",
					end: "bottom top",
					scrub: true,
				},
			});

			// Content fades out on scroll
			gsap.to(contentRef.current, {
				opacity: 0,
				yPercent: -20,
				ease: "none",
				scrollTrigger: {
					trigger: sectionRef.current,
					start: "top top",
					end: "40% top",
					scrub: true,
				},
			});
		}, sectionRef);

		return () => ctx.revert();
	}, []);

	return (
		<section
			ref={sectionRef}
			id="hero"
			className="relative w-full h-[100svh] min-h-[600px] overflow-hidden"
		>
			{/* Background layer */}
			<img
				ref={bgRef}
				src="/photos/landing/hero-bg.jpg"
				alt=""
				fetchPriority="high"
				className="absolute inset-0 w-full h-full object-cover will-change-transform"
				style={{ scale: 1 }}
			/>

			{/* Dark gradient overlay for text readability */}
			<div
				className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60"
				aria-hidden="true"
			/>

			{/* Foliage foreground layer */}
			<img
				ref={foliageRef}
				src="/photos/landing/hero-foliage.jpg"
				alt=""
				className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply dark:mix-blend-screen dark:opacity-20 will-change-transform pointer-events-none"
			/>

			{/* Content layer */}
			<div
				ref={contentRef}
				className="relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center will-change-transform"
			>
				{/* Brand name */}
				<p
					className="dm-cinema-fade font-script text-gold text-2xl sm:text-3xl md:text-4xl"
					style={{ "--delay": "0.3s" } as React.CSSProperties}
				>
					DreamMoments
				</p>

				{/* Headline */}
				<h1
					className="dm-cinema-up font-heading text-white text-[clamp(2rem,5vw,4.5rem)] leading-[1.1] tracking-tight mt-4 sm:mt-6"
					style={{ "--delay": "0.6s" } as React.CSSProperties}
				>
					Your love story, beautifully told
				</h1>

				{/* Subtitle */}
				<p
					className="dm-cinema-up text-white/80 text-base sm:text-lg md:text-xl max-w-xl mt-4 sm:mt-6 leading-relaxed"
					style={{ "--delay": "0.9s" } as React.CSSProperties}
				>
					Craft stunning digital wedding invitations that capture your unique
					journey together.
				</p>

				{/* CTA */}
				<div
					className="dm-cinema-up mt-8 sm:mt-10"
					style={{ "--delay": "1.2s" } as React.CSSProperties}
				>
					<Link
						to="/editor/new"
						search={{ template: "double-happiness" }}
						className="inline-block px-8 sm:px-10 py-3.5 sm:py-4 bg-gold hover:opacity-90 rounded-full text-white text-sm sm:text-base font-semibold tracking-wide transition-all duration-300 hover:shadow-[0_8px_32px_rgba(202,138,4,0.35)] hover:-translate-y-0.5 active:translate-y-0"
					>
						Start Creating
					</Link>
				</div>
			</div>

			{/* Scroll indicator */}
			<div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-10">
				<a
					href="#projects"
					className="dm-cinema-fade flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors"
					style={{ "--delay": "1.5s" } as React.CSSProperties}
					aria-label="Scroll to templates"
				>
					<ChevronDown className="w-5 h-5 animate-bounce" />
				</a>
			</div>
		</section>
	);
}
