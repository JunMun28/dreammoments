import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { MeshGradientBackground } from "./MeshGradientBackground";
import { MovingBorderButton } from "./MovingBorderButton";
import { CalligraphyReveal } from "./motifs/CalligraphyReveal";
import { GoldRule } from "./motifs/GoldRule";
import { NeonXi } from "./NeonXi";

gsap.registerPlugin(ScrollTrigger);

export function FinalCTA({ reducedMotion }: { reducedMotion: boolean }) {
	const sectionRef = useRef<HTMLElement>(null);
	const xiRef = useRef<HTMLDivElement>(null);
	const headlineRef = useRef<HTMLDivElement>(null);
	const topRuleRef = useRef<HTMLDivElement>(null);
	const bottomRuleRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (reducedMotion || !sectionRef.current) return;

		const ctx = gsap.context(() => {
			// Xi entrance: scale + rotation settle
			if (xiRef.current) {
				gsap.fromTo(
					xiRef.current,
					{ scale: 0.85, rotation: -5, opacity: 0 },
					{
						scale: 1,
						rotation: 0,
						opacity: 1,
						duration: 1.5,
						ease: "power2.out",
						scrollTrigger: {
							trigger: sectionRef.current,
							start: "top 70%",
							toggleActions: "play none none none",
						},
					},
				);
			}

			// Headline entrance
			if (headlineRef.current) {
				gsap.fromTo(
					headlineRef.current,
					{ scale: 0.9, y: 30, opacity: 0 },
					{
						scale: 1,
						y: 0,
						opacity: 1,
						duration: 1.0,
						ease: "power3.out",
						scrollTrigger: {
							trigger: sectionRef.current,
							start: "top 60%",
							toggleActions: "play none none none",
						},
					},
				);
			}

			// Gold rules: scaleX draw
			const rules = [topRuleRef.current, bottomRuleRef.current].filter(Boolean);
			for (const rule of rules) {
				gsap.fromTo(
					rule,
					{ scaleX: 0 },
					{
						scaleX: 1,
						duration: 0.8,
						ease: "power2.out",
						scrollTrigger: {
							trigger: rule,
							start: "top 90%",
							toggleActions: "play none none none",
						},
					},
				);
			}
		}, sectionRef);

		return () => ctx.revert();
	}, [reducedMotion]);

	return (
		<section
			ref={sectionRef}
			className="relative overflow-hidden"
			style={{ background: "var(--dm-crimson)" }}
		>
			{/* Mesh gradient overlay */}
			<div className="absolute inset-0 pointer-events-none" aria-hidden="true">
				<MeshGradientBackground variant="intense" className="h-full" reducedMotion={reducedMotion}>
					<div />
				</MeshGradientBackground>
			</div>

			{/* Gold rule top */}
			<div ref={topRuleRef} className="origin-center">
				<GoldRule className="absolute top-0 left-0 right-0" />
			</div>

			{/* Giant neon-glow xi behind content */}
			<div
				ref={xiRef}
				className="absolute inset-0 flex items-center justify-center pointer-events-none"
				style={reducedMotion ? undefined : { opacity: 0 }}
			>
				<NeonXi
					size="clamp(12rem, 35vw, 22rem)"
					variant="gold"
					opacity={0.1}
					breathe
				/>
			</div>

			{/* Content */}
			<div className="relative z-10 mx-auto max-w-4xl px-6 py-[clamp(6rem,14vw,12rem)] text-center">
				{/* Calligraphy reveal */}
				<div className="mb-6">
					<CalligraphyReveal
						color="var(--dm-gold-electric, #FFD700)"
						reducedMotion={reducedMotion}
					/>
				</div>

				{/* Sub-kicker */}
				<p
					className="font-accent text-lg italic"
					style={{ color: "var(--dm-gold-electric)" }}
				>
					Your love story awaits
				</p>

				{/* Headline */}
				<div ref={headlineRef}>
					<h2
						className="mt-4 font-display font-bold tracking-tight"
						style={{
							fontSize: "var(--text-section)",
							color: "#FFFFFF",
						}}
					>
						Create an invitation your guests will{" "}
						<em
							className="inline-block italic"
							style={{ color: "var(--dm-gold-electric)" }}
						>
							treasure.
						</em>
					</h2>
				</div>

				<p
					className="mx-auto mt-4 text-lg"
					style={{
						color: "rgba(255,255,255,0.8)",
						maxWidth: "48ch",
					}}
				>
					Join hundreds of Malaysian and Singaporean couples who chose
					DreamMoments for their special day.
				</p>

				{/* CTA */}
				<div className="mt-8">
					<MovingBorderButton href="/auth/signup" variant="gold">
						Create Your Invitation
						<span aria-hidden="true" className="ml-2">
							&rarr;
						</span>
					</MovingBorderButton>
				</div>

				{/* Trust line */}
				<p
					className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1"
					style={{
						fontSize: "var(--text-sm)",
						color: "rgba(255,255,255,0.8)",
					}}
				>
					<span>Free to start</span>
					<span aria-hidden="true" style={{ color: "rgba(255,255,255,0.5)" }}>
						{"\u00B7"}
					</span>
					<span>No credit card</span>
					<span aria-hidden="true" style={{ color: "rgba(255,255,255,0.5)" }}>
						{"\u00B7"}
					</span>
					<span>3-minute setup</span>
				</p>
			</div>

			{/* Gold rule bottom */}
			<div ref={bottomRuleRef} className="origin-center">
				<GoldRule className="absolute bottom-0 left-0 right-0" />
			</div>
		</section>
	);
}
