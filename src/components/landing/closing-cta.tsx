import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function ClosingCta() {
	const sectionRef = useRef<HTMLElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReducedMotion) return;

		const ctx = gsap.context(() => {
			gsap.from(contentRef.current, {
				y: 30,
				opacity: 0,
				duration: 0.8,
				ease: "power2.out",
				scrollTrigger: {
					trigger: sectionRef.current,
					start: "top 70%",
					toggleActions: "play none none reverse",
				},
			});
		}, sectionRef);

		return () => ctx.revert();
	}, []);

	return (
		<section
			ref={sectionRef}
			className="relative min-h-[70vh] overflow-hidden flex items-center justify-center"
		>
			<img
				src="/photos/landing/closing-couple.jpg"
				alt=""
				loading="lazy"
				className="absolute inset-0 h-full w-full object-cover"
			/>
			<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

			<div
				ref={contentRef}
				className="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
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
			</div>
		</section>
	);
}
