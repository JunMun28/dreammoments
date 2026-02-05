import { createFileRoute, Link } from "@tanstack/react-router";
import { type ClassValue, clsx } from "clsx";
import { Check, Heart, Play, Sparkles, Star } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

// Utility for safe class merging
function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const Route = createFileRoute("/")({ component: Landing });

// --- Components ---

function usePrefersReducedMotion() {
	const [reduced, setReduced] = useState(false);
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

function EnvelopeHero() {
	const sectionRef = useRef<HTMLElement | null>(null);
	const reducedMotion = usePrefersReducedMotion();

	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start start", "end start"],
	});

	// Background blobs drift a little within the hero section.
	const bgY1 = useTransform(scrollYProgress, [0, 1], [0, 160]);
	const bgY2 = useTransform(scrollYProgress, [0, 1], [0, -120]);

	// Envelope animation (0..1 over the section scroll)
	const flapRotateX = useTransform(
		scrollYProgress,
		[0, 0.7, 1],
		[0, -120, -160],
	);
	const letterY = useTransform(scrollYProgress, [0, 0.45, 1], [22, -36, -140]);
	const letterRotate = useTransform(scrollYProgress, [0, 1], [2, 0]);
	const photoScale = useTransform(scrollYProgress, [0, 1], [1.06, 1]);
	const photoFade = useTransform(scrollYProgress, [0, 0.2, 0.6], [0.0, 0.9, 1]);

	return (
		<section
			ref={sectionRef}
			className="relative min-h-[140svh] w-full overflow-hidden bg-[color:var(--dm-bg)] text-[color:var(--dm-ink)]"
		>
			{/* Soft Blob Backgrounds */}
			<div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
				<motion.div
					style={{ y: bgY1 }}
					className="absolute -top-[10%] -left-[5%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-[color:var(--dm-sage)] blur-[100px] opacity-60 animate-float"
				/>
				<motion.div
					style={{ y: bgY2 }}
					className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-[color:var(--dm-lavender)] blur-[80px] opacity-60 animate-float"
				/>
				<motion.div
					className="absolute bottom-[10%] left-[20%] w-[30vw] h-[30vw] max-w-[300px] max-h-[300px] rounded-full bg-[color:var(--dm-peach)] blur-[90px] opacity-40 animate-float"
					transition={{ delay: 2 }}
				/>
			</div>

			<div className="sticky top-0 z-10 min-h-[95svh] flex items-center">
				<div className="mx-auto w-full max-w-6xl px-6 pt-24 pb-10 lg:pt-28 grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
					<motion.div
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: "easeOut" }}
						className="text-center lg:text-left"
					>
						<span className="font-accent text-3xl sm:text-4xl text-[color:var(--dm-muted)] block mb-4 rotate-[-2deg]">
							slow down & savour
						</span>
						<h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-8">
							Digital invites that feel{" "}
							<span className="text-[color:var(--dm-peach)] italic">
								warmly
							</span>{" "}
							yours.
						</h1>
						<p className="font-body text-xl text-[color:var(--dm-ink)]/80 max-w-lg mx-auto lg:mx-0 leading-relaxed mb-10">
							A quiet space for your big news. Thoughtfully designed,
							intentionally simple, and beautiful on every screen.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
							<Link
								to="/editor/new"
								className="group relative px-8 py-4 bg-[color:var(--dm-ink)] text-[color:var(--dm-surface)] rounded-full text-lg font-medium transition-transform hover:scale-105 active:scale-95"
							>
								Start Designing
								<span className="absolute inset-0 rounded-full ring-1 ring-white/20 group-hover:ring-white/40 transition-all" />
							</Link>
							<a
								href="#showcase"
								className="px-8 py-4 bg-white/50 backdrop-blur-sm border border-[color:var(--dm-border)] text-[color:var(--dm-ink)] rounded-full text-lg font-medium transition-all hover:bg-white hover:shadow-lg"
							>
								View Collection
							</a>
						</div>

						<div className="mt-10 hidden lg:block text-[color:var(--dm-muted)]">
							<div className="flex items-center gap-3">
								<span className="text-[10px] tracking-[0.3em] uppercase">
									Scroll
								</span>
								<div className="h-[1px] w-16 bg-gradient-to-r from-[color:var(--dm-muted)] to-transparent" />
								<span className="font-accent text-xl rotate-[-2deg]">
									open the note
								</span>
							</div>
						</div>
					</motion.div>

					{/* Envelope Stage (decorative) */}
					<div className="relative mx-auto w-full max-w-[420px] lg:max-w-[520px]">
						<div aria-hidden="true" className="relative aspect-[4/5]">
							{/* Photo background (reveals as the letter slides) */}
							<motion.div
								style={reducedMotion ? { opacity: 1 } : { opacity: photoFade }}
								className="absolute inset-0 rounded-[2.75rem] overflow-hidden"
							>
								<motion.img
									src="/landing/wedding_01.svg"
									alt=""
									loading="eager"
									decoding="async"
									style={reducedMotion ? undefined : { scale: photoScale }}
									className="h-full w-full object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/15 via-black/0 to-white/15" />
								<div className="absolute inset-0 dm-grain" />
							</motion.div>

							{/* Envelope base */}
							<div className="absolute inset-0 rounded-[2.75rem] dm-envelope shadow-2xl">
								{/* Letter/card */}
								<motion.div
									style={
										reducedMotion
											? { y: -140, rotate: 0 }
											: { y: letterY, rotate: letterRotate }
									}
									className="absolute left-1/2 -translate-x-1/2 bottom-10 w-[82%] rounded-[2.25rem] dm-letter border border-white/40 shadow-xl"
								>
									<div className="p-7 sm:p-8 text-center">
										<p className="font-accent text-3xl mb-1 text-[color:var(--dm-muted)] rotate-[-1deg]">
											With love,
										</p>
										<h3 className="font-heading text-3xl sm:text-4xl mb-4">
											Sarah & Tom
										</h3>
										<div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 backdrop-blur-md border border-[color:var(--dm-border)] text-xs uppercase tracking-[0.25em] text-[color:var(--dm-ink)]/70">
											<span>Sept 24</span>
											<span className="opacity-40">•</span>
											<span>Kuala Lumpur</span>
										</div>
										<p className="mt-5 text-sm text-[color:var(--dm-muted)] leading-relaxed">
											A quiet, modern invite your guests will actually enjoy
											reading.
										</p>
									</div>
								</motion.div>

								{/* Envelope flap */}
								<motion.div
									style={
										reducedMotion ? { rotateX: -160 } : { rotateX: flapRotateX }
									}
									className="absolute inset-x-8 top-8 h-[44%] origin-top dm-envelope-flap"
								/>

								{/* Bottom fold highlight */}
								<div className="absolute inset-x-8 bottom-8 h-[36%] rounded-[2rem] bg-white/15 border border-white/20" />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile scroll indicator */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1, duration: 1 }}
				className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[color:var(--dm-muted)] lg:hidden"
			>
				<span className="text-sm font-medium tracking-widest uppercase text-[10px]">
					Scroll to Open
				</span>
				<div className="w-[1px] h-12 bg-gradient-to-b from-[color:var(--dm-muted)] to-transparent" />
			</motion.div>
		</section>
	);
}

function CinematicShowcase() {
	const templates = [
		{
			id: "sage-morning",
			title: "Sage Morning",
			desc: "For quiet garden ceremonies.",
			photo: "/landing/wedding_01.svg",
			accent: "bg-[color:var(--dm-sage)]",
		},
		{
			id: "velvet-dusk",
			title: "Velvet Dusk",
			desc: "Warm tones for evening vows.",
			photo: "/landing/wedding_02.svg",
			accent: "bg-black/60",
		},
		{
			id: "peach-haze",
			title: "Peach Haze",
			desc: "Soft, sun-drenched romance.",
			photo: "/landing/wedding_04.svg",
			accent: "bg-[color:var(--dm-peach)]/40",
		},
	];

	return (
		<>
			{/* biome-ignore lint: used for in-page navigation from header */}
			<section id="showcase" className="py-32 px-6">
				{/* biome-ignore lint: used for in-page navigation from header */}
				<div id="templates" />
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-20">
						<h2 className="font-heading text-4xl sm:text-5xl mb-4">
							The Collection
						</h2>
						<p className="font-accent text-2xl text-[color:var(--dm-muted)]">
							curated for intimacy
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{templates.map((t, i) => (
							<motion.div
								key={t.id}
								initial={{ opacity: 0, y: 40 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-50px" }}
								transition={{ delay: i * 0.2, duration: 0.8 }}
							>
								<Link
									to="/editor/new"
									search={{ template: t.id }}
									className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-peach)] focus-visible:ring-offset-2 rounded-[2.5rem]"
								>
									<div
										className={cn(
											"aspect-[3/4] rounded-[2.5rem] overflow-hidden mb-6 relative transition-transform duration-700 ease-out group-hover:-translate-y-2 shadow-xl",
										)}
									>
										<img
											src={t.photo}
											alt=""
											loading="lazy"
											decoding="async"
											className="absolute inset-0 h-full w-full object-cover scale-[1.02] transition-transform duration-700 ease-out group-hover:scale-[1.06]"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-white/15" />
										<div className="absolute inset-0 dm-grain opacity-70" />

										<div className="absolute inset-4 rounded-[2rem] overflow-hidden border border-white/30 bg-white/10 backdrop-blur-[2px] shadow-sm">
											<div className="absolute inset-0 bg-gradient-to-b from-white/25 to-white/0" />
											<div className="relative h-full w-full p-6 flex flex-col justify-between">
												<div className="flex items-center justify-between gap-3">
													<div className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-md border border-white/40 px-3 py-1 text-[10px] tracking-[0.25em] uppercase text-[color:var(--dm-ink)]/70">
														<span>Template</span>
													</div>
													<div
														className={cn(
															"h-8 w-8 rounded-full border border-white/40",
															t.accent,
														)}
														aria-hidden="true"
													/>
												</div>

												<div className="text-center">
													<p className="font-accent text-3xl text-white/90 rotate-[-1deg] drop-shadow-sm">
														Sarah & Tom
													</p>
													<h3 className="font-heading text-3xl text-white drop-shadow-sm mt-1">
														We&rsquo;re getting married.
													</h3>
													<div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/35 text-white/90 border border-white/20 text-xs uppercase tracking-[0.25em]">
														<span>Sept 24</span>
														<span className="opacity-50">•</span>
														<span>RSVP</span>
													</div>
													<p className="mt-5 text-sm text-white/80 leading-relaxed">
														Tap to preview, then personalize in minutes.
													</p>
												</div>
											</div>
										</div>
									</div>
									<div className="text-center">
										<h3 className="font-heading text-2xl mb-1 group-hover:text-[color:var(--dm-peach)] transition-colors">
											{t.title}
										</h3>
										<p className="text-[color:var(--dm-muted)]">{t.desc}</p>
									</div>
								</Link>
							</motion.div>
						))}
					</div>
				</div>
			</section>
		</>
	);
}

function Features() {
	return (
		<>
			{/* biome-ignore lint: used for in-page navigation from header */}
			<section
				id="process"
				className="py-32 px-6 bg-[color:var(--dm-surface-muted)] rounded-[3rem] mx-4 sm:mx-8 mb-20"
			>
				<div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
					>
						<span className="font-accent text-3xl text-[color:var(--dm-peach)] block mb-4">
							gentle features
						</span>
						<h2 className="font-heading text-5xl sm:text-6xl mb-8 leading-tight">
							Designed to feel <br /> like a{" "}
							<span className="italic">living room.</span>
						</h2>
						<p className="text-xl text-[color:var(--dm-muted)] leading-relaxed mb-12">
							No clutter, no noise. Just a serene space for your guests to feel
							the love, get the details, and say yes.
						</p>

						<div className="space-y-8">
							{[
								{
									title: "Tactile Textures",
									desc: "Grainy, paper-like feel.",
									icon: <Sparkles aria-hidden="true" className="w-5 h-5" />,
								},
								{
									title: "Fluid Motion",
									desc: "Slow, calming transitions.",
									icon: <Play aria-hidden="true" className="w-5 h-5" />,
								},
								{
									title: "Guest Ease",
									desc: "One-tap RSVP, no logins.",
									icon: <Check aria-hidden="true" className="w-5 h-5" />,
								},
							].map((item, i) => (
								<motion.div
									key={item.title}
									initial={{ opacity: 0, y: 10 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ delay: i * 0.1 + 0.5 }}
									className="flex items-start gap-4"
								>
									<div className="w-10 h-10 rounded-full bg-[color:var(--dm-surface)] border border-[color:var(--dm-border)] flex items-center justify-center text-[color:var(--dm-ink)] shadow-sm">
										{item.icon}
									</div>
									<div>
										<h4 className="font-bold text-lg">{item.title}</h4>
										<p className="text-[color:var(--dm-muted)]">{item.desc}</p>
									</div>
								</motion.div>
							))}
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 1, ease: "easeOut" }}
						className="relative aspect-square bg-[color:var(--dm-surface)] rounded-[3rem] shadow-2xl p-8 border border-[color:var(--dm-border)] transform rotate-2 hover:rotate-0 transition-transform duration-700"
					>
						{/* Abstract Phone / Card UI */}
						<div className="h-full w-full rounded-[2rem] bg-[color:var(--dm-bg)] overflow-hidden relative flex flex-col">
							<div className="h-12 border-b border-[color:var(--dm-border)] flex items-center px-6 gap-2">
								<div className="w-2 h-2 rounded-full bg-[color:var(--dm-border)]"></div>
								<div className="w-2 h-2 rounded-full bg-[color:var(--dm-border)]"></div>
							</div>
							<div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
								<div className="w-20 h-20 rounded-full bg-[color:var(--dm-sage)] blur-2xl absolute top-1/4 left-1/4 opacity-50"></div>
								<div className="w-32 h-32 rounded-full bg-[color:var(--dm-peach)] blur-3xl absolute bottom-1/4 right-1/4 opacity-40"></div>

								<div className="relative z-10">
									<p className="font-accent text-3xl mb-2">Sarah & Tom</p>
									<h3 className="font-heading text-4xl mb-6">
										We're getting married.
									</h3>
									<div className="inline-block px-6 py-2 rounded-full border border-[color:var(--dm-ink)]/20 bg-white/50 backdrop-blur-md text-sm uppercase tracking-widest">
										Sept 24
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</section>
		</>
	);
}

function Footer() {
	return (
		<>
			{/* biome-ignore lint: used for in-page navigation from header */}
			<footer
				id="pricing"
				className="py-20 text-center text-[color:var(--dm-muted)]"
			>
				<div className="flex justify-center gap-2 mb-8 opacity-50">
					<Star aria-hidden="true" className="w-4 h-4" />
					<Star aria-hidden="true" className="w-4 h-4" />
					<Star aria-hidden="true" className="w-4 h-4" />
				</div>
				<p className="font-heading text-2xl text-[color:var(--dm-ink)] mb-2">
					DreamMoments
				</p>
				<p className="text-sm">
					Made with{" "}
					<Heart
						aria-hidden="true"
						className="w-3 h-3 inline text-[color:var(--dm-peach)]"
					/>{" "}
					for love.
				</p>
			</footer>
		</>
	);
}

export function Landing() {
	return (
		<div className="min-h-screen bg-[color:var(--dm-bg)] selection:bg-[color:var(--dm-peach)] selection:text-[color:var(--dm-ink)]">
			<EnvelopeHero />
			<CinematicShowcase />
			<Features />
			<Footer />
		</div>
	);
}
