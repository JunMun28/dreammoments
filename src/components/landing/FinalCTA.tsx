import { useCallback, useEffect, useRef } from "react";
import { MeshGradientBackground } from "./MeshGradientBackground";
import { MovingBorderButton } from "./MovingBorderButton";
import { CalligraphyReveal } from "./motifs/CalligraphyReveal";
import { GoldRule } from "./motifs/GoldRule";
import { RisingLanterns } from "./motifs/RisingLanterns";
import { NeonXi } from "./NeonXi";

export function FinalCTA({ reducedMotion }: { reducedMotion: boolean }) {
	const sectionRef = useRef<HTMLElement>(null);
	const xiRef = useRef<HTMLDivElement>(null);
	const headlineRef = useRef<HTMLDivElement>(null);
	const topRuleRef = useRef<HTMLDivElement>(null);
	const bottomRuleRef = useRef<HTMLDivElement>(null);
	const confettiContainerRef = useRef<HTMLDivElement>(null);

	const confettiElementsRef = useRef<HTMLDivElement[]>([]);

	const handleCtaClick = useCallback(
		async (e: React.MouseEvent) => {
			if (reducedMotion) return;
			const container = confettiContainerRef.current;
			if (!container) return;

			const gsap = (await import("gsap")).default;

			const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
			const originX = rect.left + rect.width / 2;
			const originY = rect.top;

			const colors = ["#C84040", "#D4B87A", "#A83232", "#F0D090", "#FFFFFF"];

			for (let i = 0; i < 25; i++) {
				const el = document.createElement("div");
				el.style.cssText = `position:absolute;left:${originX}px;top:${originY}px;width:${4 + Math.random() * 4}px;height:${6 + Math.random() * 6}px;background:${colors[Math.floor(Math.random() * colors.length)]};border-radius:1px;`;
				container.appendChild(el);
				confettiElementsRef.current.push(el);

				const dx = (Math.random() - 0.5) * 300;
				const dy = -(Math.random() * 200 + 100);
				const rot = Math.random() * 720;

				gsap.fromTo(
					el,
					{ x: 0, y: 0, rotation: 0, opacity: 1 },
					{
						x: dx,
						y: dy + 400,
						rotation: rot,
						opacity: 0,
						duration: 1.0 + Math.random() * 0.5,
						ease: "power2.in",
						onComplete: () => {
							el.remove();
							confettiElementsRef.current = confettiElementsRef.current.filter(
								(e) => e !== el,
							);
						},
					},
				);
			}
		},
		[reducedMotion],
	);

	useEffect(() => {
		return () => {
			for (const el of confettiElementsRef.current) {
				el.remove();
			}
			confettiElementsRef.current = [];
		};
	}, []);

	useEffect(() => {
		if (reducedMotion || !sectionRef.current) return;

		let ctx: gsap.Context | undefined;

		async function initGSAP() {
			const gsap = (await import("gsap")).default;
			const { ScrollTrigger } = await import("gsap/ScrollTrigger");
			gsap.registerPlugin(ScrollTrigger);

			if (!sectionRef.current) return;

			ctx = gsap.context(() => {
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

				const rules = [topRuleRef.current, bottomRuleRef.current].filter(
					Boolean,
				);
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
		}

		initGSAP();
		return () => ctx?.revert();
	}, [reducedMotion]);

	return (
		<section
			ref={sectionRef}
			className="relative overflow-hidden"
			style={{ background: "var(--dm-terracotta-deep)" }}
		>
			{/* Mesh gradient overlay */}
			<div className="absolute inset-0 pointer-events-none" aria-hidden="true">
				<MeshGradientBackground
					variant="intense"
					className="h-full"
					reducedMotion={reducedMotion}
				>
					<div />
				</MeshGradientBackground>
			</div>

			{/* Rising lanterns */}
			<RisingLanterns reducedMotion={reducedMotion} />

			{/* Gold rule top */}
			<div ref={topRuleRef} className="origin-center">
				<GoldRule className="absolute top-0 left-0 right-0" />
			</div>

			{/* Gold Double Happiness watermark */}
			<span
				className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
				style={{
					fontFamily: '"Noto Serif SC", serif',
					fontSize: "30vh",
					color: "var(--dm-gold-electric)",
					opacity: 0.04,
					lineHeight: 1,
				}}
				aria-hidden="true"
			>
				囍
			</span>

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

			{/* Confetti container (populated via DOM manipulation) */}
			<div
				ref={confettiContainerRef}
				className="pointer-events-none fixed inset-0 z-50"
				aria-hidden="true"
			/>

			{/* Content */}
			<div className="relative z-10 mx-auto max-w-4xl px-6 py-[clamp(6rem,14vw,12rem)] text-center">
				{/* Calligraphy reveal */}
				<div className="mb-6">
					<CalligraphyReveal
						color="var(--dm-gold-electric, #D4B87A)"
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
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: confetti is decorative only */}
				{/* biome-ignore lint/a11y/noStaticElementInteractions: confetti is decorative only */}
				<div className="mt-8" onClick={handleCtaClick}>
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
