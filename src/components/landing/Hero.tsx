import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { GradientText } from "./GradientText";
import { MeshGradientBackground } from "./MeshGradientBackground";
import { MovingBorderButton } from "./MovingBorderButton";
import { NeonXi } from "./NeonXi";
import { SparkleEffect } from "./SparkleEffect";
import { SpotlightCursor } from "./SpotlightCursor";
import { use3DTilt } from "./hooks/use3DTilt";
import { LatticeOverlay } from "./motifs/LatticeOverlay";

gsap.registerPlugin(ScrollTrigger);

export function Hero({ reducedMotion }: { reducedMotion: boolean }) {
	const tiltRef = use3DTilt({ maxRotation: 6, reducedMotion });
	const sectionRef = useRef<HTMLElement>(null);
	const kickerCnRef = useRef<HTMLSpanElement>(null);
	const kickerEnRef = useRef<HTMLDivElement>(null);
	const headlineRef = useRef<HTMLHeadingElement>(null);
	const accentRef = useRef<HTMLSpanElement>(null);
	const bodyRef = useRef<HTMLParagraphElement>(null);
	const ctaRef = useRef<HTMLDivElement>(null);
	const trustRef = useRef<HTMLDivElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (reducedMotion || !sectionRef.current) return;

		const ctx = gsap.context(() => {
			const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

			// Set initial states
			gsap.set(kickerCnRef.current, {
				clipPath: "inset(0 100% 0 0)",
			});
			gsap.set(kickerEnRef.current, { opacity: 0, x: -12 });
			gsap.set(headlineRef.current, { opacity: 0, y: 40 });
			gsap.set(accentRef.current, { opacity: 0, scale: 0.92 });
			gsap.set([bodyRef.current, ctaRef.current, trustRef.current], {
				opacity: 0,
				y: 20,
			});
			gsap.set(cardRef.current, { opacity: 0, y: 60, rotateX: 12 });

			// t=0.0: Chinese kicker clip-path reveal
			tl.to(
				kickerCnRef.current,
				{
					clipPath: "inset(0 0% 0 0)",
					duration: 0.6,
					ease: "power3.out",
				},
				0,
			);

			// t=0.4: English kicker fade
			tl.to(
				kickerEnRef.current,
				{
					opacity: 1,
					x: 0,
					duration: 0.4,
					ease: "power3.out",
				},
				0.4,
			);

			// t=0.5: Headline reveal
			tl.to(
				headlineRef.current,
				{
					opacity: 1,
					y: 0,
					duration: 0.7,
					ease: "power3.out",
				},
				0.5,
			);

			// t=0.9: Accent word scale
			tl.to(
				accentRef.current,
				{
					opacity: 1,
					scale: 1,
					duration: 0.8,
					ease: "back.out(1.2)",
				},
				0.9,
			);

			// t=1.1: Body + CTAs fade
			tl.to(
				[bodyRef.current, ctaRef.current, trustRef.current],
				{
					opacity: 1,
					y: 0,
					duration: 0.5,
					stagger: 0.1,
					ease: "power2.out",
				},
				1.1,
			);

			// t=1.2: Card rise
			tl.to(
				cardRef.current,
				{
					opacity: 1,
					y: 0,
					rotateX: 0,
					duration: 1.0,
					ease: "power4.out",
				},
				1.2,
			);
		}, sectionRef);

		return () => ctx.revert();
	}, [reducedMotion]);

	return (
		<section
			ref={sectionRef}
			className="relative min-h-svh overflow-hidden"
			style={{ background: "var(--dm-bg)" }}
		>
			{/* Mesh gradient background */}
			<div className="absolute inset-0">
				<MeshGradientBackground variant="warm" className="h-full" reducedMotion={reducedMotion}>
					<div />
				</MeshGradientBackground>
			</div>

			{/* Spotlight cursor */}
			<SpotlightCursor />

			{/* Lattice overlay */}
			<LatticeOverlay color="var(--dm-gold)" opacity={0.1} />

			{/* Sparkle effect near headline */}
			<SparkleEffect count={8} className="z-[2]" />

			{/* Content */}
			<div className="relative z-10 mx-auto max-w-5xl px-6 pt-28 pb-16 lg:pt-32">
				<div className="text-center">
					{/* Chinese kicker */}
					<span
						ref={kickerCnRef}
						className="inline-block"
						style={{
							fontFamily: '"Noto Serif SC", serif',
							fontWeight: 700,
							fontSize: "var(--text-kicker-cn)",
							color: "var(--dm-crimson)",
							lineHeight: 1.3,
							marginBottom: "0.75rem",
						}}
					>
						喜事来了
					</span>

					{/* English kicker pill */}
					<div
						ref={kickerEnRef}
						className="mb-6 flex items-center justify-center gap-2"
					>
						<span
							role="img"
							aria-label="double happiness"
							style={{
								fontFamily: '"Noto Serif SC", serif',
								fontSize: "1rem",
								color: "var(--dm-crimson)",
							}}
						>
							囍
						</span>
						<span
							style={{
								fontFamily: '"Inter", system-ui, sans-serif',
								fontWeight: 500,
								fontSize: "var(--text-kicker-en)",
								letterSpacing: "0.15em",
								color: "var(--dm-muted)",
								textTransform: "uppercase",
							}}
						>
							AI-POWERED INVITATIONS
						</span>
					</div>

					{/* Headline */}
					<h1
						ref={headlineRef}
						className="font-display font-extrabold"
						style={{
							fontSize: "var(--text-hero)",
							lineHeight: 0.95,
							letterSpacing: "-0.04em",
							color: "var(--dm-ink)",
						}}
					>
						Beautiful invitations your guests will{" "}
						<span
							ref={accentRef}
							className="inline-block italic"
							style={{ fontSize: "var(--text-hero-accent)" }}
						>
							<GradientText gradient="linear-gradient(135deg, var(--dm-crimson-bold), var(--dm-gold-bold))">
								remember.
							</GradientText>
						</span>
					</h1>

					{/* Subtitle */}
					<p
						ref={bodyRef}
						className="mx-auto mt-6"
						style={{
							fontFamily: '"Inter", system-ui, sans-serif',
							fontWeight: 400,
							fontSize: "var(--text-lg)",
							lineHeight: 1.7,
							color: "var(--dm-muted)",
							maxWidth: "52ch",
						}}
					>
						Create a stunning digital wedding invitation in minutes. AI writes
						your content, you make it yours. Share via WhatsApp in one tap.
					</p>

					{/* CTA group */}
					<div
						ref={ctaRef}
						className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
					>
						<MovingBorderButton href="/auth/signup" variant="crimson">
							Create Your Invitation
							<span aria-hidden="true" className="ml-2">
								&rarr;
							</span>
						</MovingBorderButton>

						<Link
							to="/"
							hash="templates"
							className="inline-flex min-h-[52px] items-center justify-center rounded-full px-8 py-3 text-base font-medium transition-colors duration-300 hover:bg-[var(--dm-crimson)]/5 dm-cta-mobile-full"
							style={{
								border: "1.5px solid var(--dm-crimson)",
								color: "var(--dm-crimson)",
							}}
						>
							Browse Templates
						</Link>
					</div>

					{/* Trust line */}
					<div
						ref={trustRef}
						className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1"
						style={{
							fontSize: "var(--text-sm)",
							color: "var(--dm-muted)",
						}}
					>
						<span>Free to start</span>
						<span aria-hidden="true">{"\u00B7"}</span>
						<span>No credit card</span>
						<span aria-hidden="true">{"\u00B7"}</span>
						<span>3-minute setup</span>
					</div>
				</div>

				{/* Template card */}
				<div className="relative mx-auto mt-12 max-w-sm lg:mt-16">
					{/* Neon xi behind card */}
					<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
						<NeonXi
							size="8rem"
							variant="crimson"
							opacity={0.1}
							breathe
							className="lg:text-[12rem]"
						/>
					</div>

					{/* Radial glow beneath */}
					<div
						className="absolute inset-0 -z-1 mx-auto"
						style={{
							background:
								"radial-gradient(ellipse, rgba(212,32,64,0.12) 0%, transparent 70%)",
							filter: "blur(40px)",
						}}
						aria-hidden="true"
					/>

					<div
						ref={(node) => {
							// Merge tiltRef and cardRef
							if (node) {
								(
									tiltRef as React.MutableRefObject<HTMLDivElement | null>
								).current = node;
								(
									cardRef as React.MutableRefObject<HTMLDivElement | null>
								).current = node;
							}
						}}
						className="relative"
						style={{ transformStyle: "preserve-3d" }}
					>
						<div
							className="overflow-hidden bg-[var(--dm-surface)]"
							style={{
								borderRadius: "1.5rem",
								boxShadow: "0 20px 60px -12px rgba(0,0,0,0.12)",
							}}
						>
							<div className="aspect-[3/4] w-full">
								<img
									src="/photos/golden-hour.jpg"
									alt="Garden Romance template preview showing a Chinese wedding invitation"
									className="h-full w-full object-cover"
									loading="eager"
									fetchPriority="high"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
