import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { GradientText } from "./GradientText";
import { use3DTilt } from "./hooks/use3DTilt";
import { MeshGradientBackground } from "./MeshGradientBackground";
import { MovingBorderButton } from "./MovingBorderButton";
import { FloatingHearts } from "./motifs/FloatingHearts";
import { LatticeOverlay } from "./motifs/LatticeOverlay";
import { NeonXi } from "./NeonXi";
import { SpotlightCursor } from "./SpotlightCursor";
import { TextScramble, type TextScrambleHandle } from "./TextScramble";

/**
 * CSS keyframe animation classes for the hero entrance.
 * Using CSS animations instead of GSAP for the hero entrance
 * ensures animations work reliably regardless of SSR hydration timing.
 */
const HERO_ANIM_BASE =
	"opacity-0 [.hero-ready_&]:animate-[heroFadeUp_0.7s_cubic-bezier(0.16,1,0.3,1)_forwards]";

export function Hero({ reducedMotion }: { reducedMotion: boolean }) {
	const tiltRef = use3DTilt({ maxRotation: 6, reducedMotion });
	const sectionRef = useRef<HTMLElement>(null);
	const scrambleRef = useRef<TextScrambleHandle>(null);

	// Add "hero-ready" class after mount to trigger CSS animations
	useEffect(() => {
		if (reducedMotion || !sectionRef.current) return;
		// Small delay to let hydration settle
		const timer = setTimeout(() => {
			sectionRef.current?.classList.add("hero-ready");
			// Trigger text scramble after kicker reveals
			setTimeout(() => {
				scrambleRef.current?.trigger();
			}, 600);
		}, 50);
		return () => clearTimeout(timer);
	}, [reducedMotion]);

	return (
		<section
			ref={sectionRef}
			className="relative min-h-svh overflow-hidden"
			style={{ background: "var(--dm-bg)" }}
		>
			{/* Mesh gradient background */}
			<div className="absolute inset-0">
				<MeshGradientBackground
					variant="warm"
					className="h-full"
					reducedMotion={reducedMotion}
				>
					<div />
				</MeshGradientBackground>
			</div>

			{/* Floating hearts */}
			<FloatingHearts reducedMotion={reducedMotion} />

			{/* Spotlight cursor */}
			<SpotlightCursor containerRef={sectionRef} />

			{/* Lattice overlay */}
			<LatticeOverlay color="var(--dm-gold)" opacity={0.06} />

			{/* Content */}
			<div className="relative z-10 mx-auto max-w-5xl px-6 pt-28 pb-16 lg:pt-32">
				<div className="text-center">
					{/* Chinese kicker */}
					<span
						className={`inline-block ${reducedMotion ? "" : `${HERO_ANIM_BASE} [animation-delay:0s]`}`}
						style={{
							fontFamily: '"Noto Serif SC", serif',
							fontWeight: 700,
							fontSize: "var(--text-kicker-cn)",
							color: "var(--dm-crimson)",
							lineHeight: 1.3,
							marginBottom: "0.75rem",
						}}
					>
						<TextScramble
							ref={scrambleRef}
							text="喜事来了"
							duration={0.6}
							reducedMotion={reducedMotion}
						/>
					</span>

					{/* English kicker pill */}
					<div
						className={`mb-6 flex items-center justify-center gap-2 ${reducedMotion ? "" : `${HERO_ANIM_BASE} [animation-delay:0.4s]`}`}
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
						className={`font-display font-extrabold ${reducedMotion ? "" : `${HERO_ANIM_BASE} [animation-delay:0.5s]`}`}
						style={{
							fontSize: "var(--text-hero)",
							lineHeight: 0.95,
							letterSpacing: "-0.04em",
							color: "var(--dm-ink)",
						}}
					>
						Beautiful invitations your guests will{" "}
						<span
							className={`inline-block italic ${reducedMotion ? "" : `${HERO_ANIM_BASE} [animation-delay:0.9s]`}`}
							style={{ fontSize: "var(--text-hero-accent)" }}
						>
							<GradientText gradient="linear-gradient(135deg, var(--dm-crimson-bold), var(--dm-gold-bold))">
								remember.
							</GradientText>
						</span>
					</h1>

					{/* Subtitle */}
					<p
						className={`mx-auto mt-6 ${reducedMotion ? "" : `${HERO_ANIM_BASE} [animation-delay:1.1s]`}`}
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
						className={`mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row ${reducedMotion ? "" : `${HERO_ANIM_BASE} [animation-delay:1.2s]`}`}
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
						className={`mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 ${reducedMotion ? "" : `${HERO_ANIM_BASE} [animation-delay:1.3s]`}`}
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

				{/* Photo wall */}
				<div className="relative mx-auto mt-12 max-w-md px-4 sm:max-w-lg lg:mt-16 lg:max-w-xl lg:px-0">
					{/* Neon xi behind */}
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
								"radial-gradient(ellipse, rgba(200,64,64,0.12) 0%, transparent 70%)",
							filter: "blur(40px)",
						}}
						aria-hidden="true"
					/>

					<div
						ref={tiltRef as React.MutableRefObject<HTMLDivElement | null>}
						className={`relative ${reducedMotion ? "" : `${HERO_ANIM_BASE} [animation-delay:1.4s]`}`}
						style={{ transformStyle: "preserve-3d" }}
					>
						<div className="relative mx-auto aspect-[4/5] w-full max-w-[420px]">
							{/* Photo wall grid — gallery layout with center hero */}
							<div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
								{/* Top-left: rings */}
								<div
									className="col-start-1 row-start-1 col-span-2 row-span-2 flex items-start justify-end pr-2 pt-2 sm:pr-3 sm:pt-3"
									style={{
										transform: reducedMotion ? undefined : "rotate(-4deg)",
									}}
								>
									<div
										className="overflow-hidden rounded-xl bg-[var(--dm-surface)] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06] sm:rounded-2xl"
										style={{ aspectRatio: "3/4", minWidth: 0 }}
									>
										<img
											src="/photos/rings.jpg"
											alt="Wedding rings"
											className="h-full w-full object-cover"
											width={200}
											height={267}
											loading="eager"
											fetchPriority="high"
											decoding="async"
										/>
									</div>
								</div>

								{/* Top-right: romantic portrait */}
								<div
									className="col-start-3 row-start-1 col-span-2 row-span-2 flex items-start justify-start pl-2 pt-2 sm:pl-3 sm:pt-3"
									style={{
										transform: reducedMotion ? undefined : "rotate(3deg)",
									}}
								>
									<div
										className="overflow-hidden rounded-xl bg-[var(--dm-surface)] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06] sm:rounded-2xl"
										style={{
											aspectRatio: "3/4",
											minWidth: 0,
											backgroundColor: "#f5ede4",
										}}
									>
										<img
											src="/photos/romantic-portrait.jpg"
											alt="Romantic couple portrait"
											className="h-full w-full object-cover"
											width={200}
											height={267}
											loading="lazy"
											decoding="async"
										/>
									</div>
								</div>

								{/* Center: golden hour — hero image (stacked on top) */}
								<div className="col-start-2 row-start-2 col-span-2 row-span-2 z-10 flex items-center justify-center">
									<div
										className="overflow-hidden rounded-xl bg-[var(--dm-surface)] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.08] sm:rounded-2xl"
										style={{ aspectRatio: "3/4", minWidth: 0 }}
									>
										<img
											src="/photos/golden-hour.jpg"
											alt="Garden Romance template preview showing a Chinese wedding invitation"
											className="h-full w-full object-cover"
											width={280}
											height={373}
											loading="eager"
											fetchPriority="high"
											decoding="async"
										/>
									</div>
								</div>

								{/* Bottom-left: couple walking */}
								<div
									className="col-start-1 row-start-3 col-span-2 row-span-2 flex items-end justify-end pr-2 pb-2 sm:pr-3 sm:pb-3"
									style={{
										transform: reducedMotion ? undefined : "rotate(3deg)",
									}}
								>
									<div
										className="overflow-hidden rounded-xl bg-[var(--dm-surface)] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06] sm:rounded-2xl"
										style={{
											aspectRatio: "3/4",
											minWidth: 0,
											backgroundColor: "#f5ede4",
										}}
									>
										<img
											src="/photos/couple-walking.jpg"
											alt="Couple walking together"
											className="h-full w-full object-cover"
											width={200}
											height={267}
											loading="lazy"
											decoding="async"
										/>
									</div>
								</div>

								{/* Bottom-right: floral detail */}
								<div
									className="col-start-3 row-start-3 col-span-2 row-span-2 flex items-end justify-start pl-2 pb-2 sm:pl-3 sm:pb-3"
									style={{
										transform: reducedMotion ? undefined : "rotate(-3deg)",
									}}
								>
									<div
										className="overflow-hidden rounded-xl bg-[var(--dm-surface)] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06] sm:rounded-2xl"
										style={{
											aspectRatio: "3/4",
											minWidth: 0,
											backgroundColor: "#f5ede4",
										}}
									>
										<img
											src="/photos/floral-detail.jpg"
											alt="Floral wedding detail"
											className="h-full w-full object-cover"
											width={200}
											height={267}
											loading="lazy"
											decoding="async"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
