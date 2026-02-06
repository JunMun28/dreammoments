import { createFileRoute, Link } from "@tanstack/react-router";
import { type ClassValue, clsx } from "clsx";
import { Check, Heart, Play, Sparkles, Star } from "lucide-react";
import { motion } from "motion/react";
import { type MouseEvent, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

// Utility for safe class merging
function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const Route = createFileRoute("/")({ component: Landing });
export const HERO_INTRO_STORAGE_KEY = "dm.heroIntro.v1";
export const HERO_VIDEO_WEBM = "/videos/hero-loop.webm";
export const HERO_VIDEO_MP4 = "/videos/hero-loop.mp4";
export const HERO_VIDEO_POSTER = "/photos/romantic-portrait.jpg";

type HeroSatellite = {
	id: string;
	label: string;
	value: string;
	toneClass: string;
	desktop: { x: number; y: number };
	mobile: { x: number; y: number };
};

const HERO_SATELLITES: HeroSatellite[] = [
	{
		id: "story-flow",
		label: "Vow Script",
		value: "Personalized ceremony copy",
		toneClass: "dm-satellite-tone-peach",
		desktop: { x: 16, y: 22 },
		mobile: { x: 18, y: 20 },
	},
	{
		id: "guest-view",
		label: "Guest Journey",
		value: "One-tap RSVP flow",
		toneClass: "dm-satellite-tone-surface",
		desktop: { x: 85, y: 22 },
		mobile: { x: 84, y: 29 },
	},
	{
		id: "rsvp-pulse",
		label: "Live Replies",
		value: "Replies in real time",
		toneClass: "dm-satellite-tone-sage",
		desktop: { x: 14, y: 77 },
		mobile: { x: 20, y: 82 },
	},
	{
		id: "mood-board",
		label: "Memory Vault",
		value: "Photo and timeline sync",
		toneClass: "dm-satellite-tone-ink",
		desktop: { x: 86, y: 76 },
		mobile: { x: 82, y: 84 },
	},
];

function buildBranchPath(x: number, y: number) {
	const centerX = 50;
	const centerY = 50;
	const driftX = x - centerX;
	const driftY = y - centerY;
	const curveLift = y < centerY ? -8 : 8;
	const controlOneX = centerX + driftX * 0.32;
	const controlOneY = centerY + curveLift;
	const controlTwoX = centerX + driftX * 0.76;
	const controlTwoY = centerY + driftY * 0.68;
	return `M ${centerX} ${centerY} C ${controlOneX} ${controlOneY}, ${controlTwoX} ${controlTwoY}, ${x} ${y}`;
}

type HeroIntroStorageRead = Pick<Storage, "getItem">;
type HeroIntroStorageWrite = Pick<Storage, "setItem">;

export function shouldPlayHeroIntro(
	reducedMotion: boolean,
	storage: HeroIntroStorageRead,
) {
	if (reducedMotion) return false;
	return storage.getItem(HERO_INTRO_STORAGE_KEY) !== "1";
}

export function persistHeroIntroSeen(storage: HeroIntroStorageWrite) {
	storage.setItem(HERO_INTRO_STORAGE_KEY, "1");
}

// --- Components ---

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

function useIsMobileHero() {
	const [isMobile, setIsMobile] = useState(() => {
		if (typeof window === "undefined") return false;
		return window.matchMedia("(max-width: 1023px)").matches;
	});

	useEffect(() => {
		if (typeof window === "undefined") return;
		const query = window.matchMedia("(max-width: 1023px)");
		const update = () => setIsMobile(query.matches);
		update();
		query.addEventListener?.("change", update);
		return () => query.removeEventListener?.("change", update);
	}, []);

	return isMobile;
}

function useHeroIntro() {
	const reducedMotion = usePrefersReducedMotion();
	const [shouldPlayIntro, setShouldPlayIntro] = useState(() => {
		if (typeof window === "undefined") return false;
		const isReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		return shouldPlayHeroIntro(isReduced, window.sessionStorage);
	});

	useEffect(() => {
		if (typeof window === "undefined") return;
		const shouldPlay = shouldPlayHeroIntro(
			reducedMotion,
			window.sessionStorage,
		);
		setShouldPlayIntro(shouldPlay);
		if (shouldPlay) {
			persistHeroIntroSeen(window.sessionStorage);
		}
	}, [reducedMotion]);

	return { shouldPlayIntro, reducedMotion };
}

function CinematicHero() {
	const { shouldPlayIntro, reducedMotion } = useHeroIntro();
	const isMobileHero = useIsMobileHero();
	const shouldAnimate = shouldPlayIntro && !reducedMotion;
	const titleLineDuration = isMobileHero ? 0.26 : 0.34;
	const titleDelayStart = isMobileHero ? 0.04 : 0.08;
	const motionEase: [number, number, number, number] = [0.165, 0.84, 0.44, 1];
	const titleLines = [
		[{ text: "More than an invitation." }],
		[
			{ text: "A " },
			{ text: "cinematic", highlight: true },
			{ text: " love story." },
		],
		[
			{ text: "Crafted to be " },
			{ text: "remembered.", highlight: true },
		],
	];
	const satellites = HERO_SATELLITES.filter(
		(satellite) => !(isMobileHero && satellite.id === "mood-board"),
	).map((satellite) => ({
		...satellite,
		position: isMobileHero ? satellite.mobile : satellite.desktop,
	}));

	const handleNodePointerMove = (event: MouseEvent<HTMLDivElement>) => {
		if (reducedMotion || isMobileHero) return;
		const node = event.currentTarget;
		const rect = node.getBoundingClientRect();
		const ratioX = (event.clientX - rect.left) / rect.width - 0.5;
		const ratioY = (event.clientY - rect.top) / rect.height - 0.5;
		const tiltX = (-ratioY * 10).toFixed(2);
		const tiltY = (ratioX * 10).toFixed(2);
		node.style.setProperty("--dm-node-tilt-x", `${tiltX}deg`);
		node.style.setProperty("--dm-node-tilt-y", `${tiltY}deg`);
	};

	const handleNodePointerLeave = (event: MouseEvent<HTMLDivElement>) => {
		const node = event.currentTarget;
		node.style.setProperty("--dm-node-tilt-x", "0deg");
		node.style.setProperty("--dm-node-tilt-y", "0deg");
	};

	return (
		<section
			data-hero-intro={shouldAnimate ? "play" : "skip"}
			className="dm-cinema-hero relative min-h-[100svh] w-full overflow-hidden text-[color:var(--dm-ink)]"
		>
			<div className="absolute inset-0">
				<div className="dm-cinema-overlay absolute inset-0" />
				<div className="dm-cinema-grain absolute inset-0" />
			</div>

			<div className="dm-cinema-content relative z-10 min-h-[100svh]">
				<div className="mx-auto min-h-[100svh] w-full max-w-7xl px-6 pt-24 pb-14 lg:pt-28 flex flex-col items-center gap-10 lg:gap-12">
					<div className="max-w-[860px] text-center">
						<span className="font-accent text-3xl sm:text-4xl text-[color:var(--dm-peach)]/95 block mb-4 rotate-[-2deg]">
							romantic cinematic mode
						</span>
						<h1 className="dm-hero-title mb-7">
							{titleLines.map((lineParts, index) => (
								<motion.span
									key={`hero-line-${index + 1}`}
									initial={
										shouldAnimate ? { opacity: 0, y: 18 } : { opacity: 1, y: 0 }
									}
									animate={{ opacity: 1, y: 0 }}
									transition={
										shouldAnimate
											? {
													duration: titleLineDuration,
													delay: titleDelayStart + index * 0.04,
													ease: motionEase,
												}
											: { duration: 0 }
									}
									className="block text-[color:var(--dm-ink)]"
								>
									{lineParts.map((part) => (
										<span
											key={`${part.text}-${index}`}
											className={part.highlight ? "dm-hero-highlight" : undefined}
										>
											{part.text}
										</span>
									))}
								</motion.span>
							))}
						</h1>
						<p className="font-body text-lg sm:text-xl text-[color:var(--dm-ink)]/82 max-w-[42ch] leading-relaxed mx-auto mb-10">
							DreamMoments turns your wedding details into a luminous page your
							guests feel before they even tap RSVP.
						</p>

						<div className="dm-hero-cta-group flex flex-col sm:flex-row gap-4 items-center justify-center">
							<Link
								to="/editor/new"
								className="dm-hero-cta-primary group relative px-8 py-4 rounded-full text-lg font-medium active:scale-95"
							>
								Start Free Trial
								<span className="dm-hero-cta-ring absolute inset-0 rounded-full ring-1 ring-white/20 transition-all" />
							</Link>
							<a
								href="#showcase"
								className="dm-hero-cta-secondary px-8 py-4 rounded-full text-lg font-medium"
							>
								See Real Invites
							</a>
						</div>
					</div>

					<motion.div
						initial={shouldAnimate ? { opacity: 0 } : false}
						animate={{ opacity: 1 }}
						transition={
							shouldAnimate
								? { duration: 0.52, delay: 0.1, ease: motionEase }
								: { duration: 0 }
						}
						className="dm-hero-network-stage"
					>
						<svg
							data-hero-filmstrip
							className="dm-hero-branches"
							viewBox="0 0 100 100"
							preserveAspectRatio="none"
							aria-hidden="true"
						>
							{satellites.map((satellite, index) => {
								const path = buildBranchPath(
									satellite.position.x,
									satellite.position.y,
								);
								return (
									<g key={`${satellite.id}-branch`}>
										<path
											d={path}
											className="dm-hero-branch-base"
											style={{ animationDelay: `${index * 0.28}s` }}
										/>
										<path
											d={path}
											className="dm-hero-branch-pulse"
											style={{ animationDelay: `${index * 0.34}s` }}
										/>
									</g>
								);
							})}
						</svg>

						<motion.div
							data-hero-film
							initial={shouldAnimate ? { opacity: 0 } : false}
							animate={{ opacity: 1 }}
							transition={
								shouldAnimate
									? { duration: 0.42, delay: 0.2, ease: motionEase }
									: { duration: 0 }
							}
							className="dm-central-node"
							onMouseMove={handleNodePointerMove}
							onMouseLeave={handleNodePointerLeave}
						>
							<video
								muted
								playsInline
								autoPlay={!reducedMotion}
								loop
								preload="metadata"
								poster={HERO_VIDEO_POSTER}
								className="dm-central-node-media"
							>
								<source src={HERO_VIDEO_WEBM} type="video/webm" />
								<source src={HERO_VIDEO_MP4} type="video/mp4" />
							</video>
							<div className="dm-central-node-overlay absolute inset-0" />
							<div className="dm-central-node-content">
								<span className="dm-central-node-chip">Live Preview Node</span>
								<p className="dm-central-node-label">
									A 16:9 story canvas blending vows, photos, and details in one
									glass layer.
								</p>
							</div>
						</motion.div>

						{satellites.map((satellite, index) => (
							<motion.article
								key={satellite.id}
								data-hero-proof={
									satellite.id === "rsvp-pulse" ? "RSVP in 20 sec" : undefined
								}
								initial={shouldAnimate ? { opacity: 0 } : false}
								animate={{ opacity: 1 }}
								transition={
									shouldAnimate
										? {
												duration: 0.24,
												delay: 0.28 + index * 0.08,
												ease: motionEase,
											}
										: { duration: 0 }
								}
								className="dm-satellite-card"
								style={{
									left: `${satellite.position.x}%`,
									top: `${satellite.position.y}%`,
									animationDelay: `${index * 0.42}s`,
								}}
							>
								<div className={cn("dm-satellite-card-inner", satellite.toneClass)}>
									<p className="dm-satellite-label">{satellite.label}</p>
									<p className="dm-satellite-value">{satellite.value}</p>
								</div>
							</motion.article>
						))}
					</motion.div>
				</div>
			</div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.9, duration: 0.6 }}
				className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[color:var(--dm-muted)] lg:hidden"
			>
				<span className="text-sm font-medium tracking-widest uppercase text-[10px]">
					Scroll for More
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
			photo: "/photos/golden-hour.jpg",
			accent: "bg-[color:var(--dm-sage)]",
		},
		{
			id: "velvet-dusk",
			title: "Velvet Dusk",
			desc: "Warm tones for evening vows.",
			photo: "/photos/couple-walking.jpg",
			accent: "bg-black/60",
		},
		{
			id: "peach-haze",
			title: "Peach Haze",
			desc: "Soft, sun-drenched romance.",
			photo: "/photos/floral-detail.jpg",
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
											alt={`${t.title} wedding invitation mood preview`}
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

function MomentsGallery() {
	const moments = [
		{
			id: "vows",
			src: "/photos/romantic-portrait.jpg",
			alt: "Bride and groom sharing a quiet portrait moment",
			className: "md:col-span-7",
		},
		{
			id: "sunset",
			src: "/photos/golden-hour.jpg",
			alt: "Couple embracing during golden-hour light",
			className: "md:col-span-5",
		},
		{
			id: "walk",
			src: "/photos/couple-walking.jpg",
			alt: "Newlyweds walking hand in hand",
			className: "md:col-span-4",
		},
		{
			id: "rings",
			src: "/photos/rings.jpg",
			alt: "Wedding rings arranged on a soft background",
			className: "md:col-span-8",
		},
	];

	return (
		<section className="py-28 px-6">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-14">
					<p className="font-accent text-3xl text-[color:var(--dm-peach)] mb-2 rotate-[-1deg]">
						real moments
					</p>
					<h2 className="font-heading text-4xl sm:text-5xl mb-4">
						Photos that hold the feeling.
					</h2>
					<p className="max-w-2xl mx-auto text-[color:var(--dm-muted)] text-lg leading-relaxed">
						Make every scroll feel like opening a keepsake album your guests
						will remember.
					</p>
				</div>

				<div className="grid gap-5 md:grid-cols-12 auto-rows-[220px] md:auto-rows-[260px]">
					{moments.map((moment, i) => (
						<motion.figure
							key={moment.id}
							initial={{ opacity: 0, y: 24 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-80px" }}
							transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.08 }}
							className={cn(
								"group relative overflow-hidden rounded-[2rem] dm-photo-frame",
								moment.className,
							)}
						>
							<img
								src={moment.src}
								alt={moment.alt}
								loading="lazy"
								decoding="async"
								className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10" />
							<div className="absolute inset-0 dm-grain opacity-50" />
						</motion.figure>
					))}
				</div>
			</div>
		</section>
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
			<CinematicHero />
			<CinematicShowcase />
			<MomentsGallery />
			<Features />
			<Footer />
		</div>
	);
}
