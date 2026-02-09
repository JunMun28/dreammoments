import { createFileRoute } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { Features } from "../components/landing/Features";
import { FinalCTA } from "../components/landing/FinalCTA";
import { Footer } from "../components/landing/Footer";
import { Hero } from "../components/landing/Hero";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Pricing } from "../components/landing/Pricing";
import { Showcase } from "../components/landing/Showcase";
import { SocialProof } from "../components/landing/SocialProof";

gsap.registerPlugin(ScrollTrigger);

export const Route = createFileRoute("/")({ component: Landing });

function usePrefersReducedMotion() {
	const [reduced, setReduced] = useState(() => {
		if (typeof window === "undefined") return false;
		return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	});

	useEffect(() => {
		if (typeof window === "undefined") return;
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setReduced(query.matches);
		update();
		query.addEventListener?.("change", update);
		return () => query.removeEventListener?.("change", update);
	}, []);
	return reduced;
}

export function Landing() {
	const reducedMotion = usePrefersReducedMotion();
	const gsapScope = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!gsapScope.current) return;
		const ctx = gsap.context(() => {
			if (reducedMotion) {
				for (const t of ScrollTrigger.getAll()) {
					t.kill();
				}
			}
		}, gsapScope.current);
		return () => ctx.revert();
	}, [reducedMotion]);

	return (
		<div
			ref={gsapScope}
			className="min-h-screen bg-dm-bg selection:bg-dm-crimson/20 selection:text-dm-ink"
		>
			<Hero reducedMotion={reducedMotion} />
			<SocialProof reducedMotion={reducedMotion} />
			<Showcase reducedMotion={reducedMotion} />
			<HowItWorks reducedMotion={reducedMotion} />
			<Features reducedMotion={reducedMotion} />
			<Pricing reducedMotion={reducedMotion} />
			<FinalCTA reducedMotion={reducedMotion} />
			<Footer />
		</div>
	);
}
