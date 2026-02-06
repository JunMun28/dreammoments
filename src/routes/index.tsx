import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Heart, Monitor, Play, Smartphone, Sparkles, Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({ component: Landing });

// --- Hooks ---

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

// --- Shared animation config ---
const REVEAL_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const REVEAL_TRANSITION = { duration: 0.8, ease: REVEAL_EASE };

// --- Components ---

function Hero() {
	const reducedMotion = usePrefersReducedMotion();

	return (
		<section className="dm-hero relative min-h-[100svh] w-full overflow-hidden">
			{/* Floating blobs */}
			<div className="dm-blob dm-blob-sage w-[420px] h-[420px] top-[10%] left-[8%]" />
			<div
				className="dm-blob dm-blob-lavender w-[360px] h-[360px] top-[15%] right-[5%]"
				style={{ animationDelay: "2s" }}
			/>
			<div
				className="dm-blob dm-blob-peach w-[300px] h-[300px] bottom-[20%] left-[25%]"
				style={{
					animationDelay: "4s",
					animationName: "dm-blob-float-alt",
				}}
			/>

			{/* Grain overlay */}
			<div className="dm-hero-grain absolute inset-0" />

			{/* Content */}
			<div className="dm-hero-content relative z-10 min-h-[100svh]">
				<div className="mx-auto min-h-[100svh] w-full max-w-5xl px-6 pt-32 pb-20 lg:pt-40 flex flex-col items-center justify-center gap-10">
					<div className="max-w-[780px] text-center">
						<motion.span
							initial={reducedMotion ? false : { opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ ...REVEAL_TRANSITION, delay: 0.1 }}
							className="font-accent text-3xl sm:text-4xl text-dm-peach block mb-5"
						>
							your love story, softly told
						</motion.span>

						<motion.h1
							initial={reducedMotion ? false : { opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ ...REVEAL_TRANSITION, delay: 0.2 }}
							className="dm-hero-title mb-8"
						>
							Wedding invitations that feel like{" "}
							<span className="dm-hero-highlight">home.</span>
						</motion.h1>

						<motion.p
							initial={reducedMotion ? false : { opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ ...REVEAL_TRANSITION, delay: 0.35 }}
							className="text-lg sm:text-xl text-dm-muted max-w-[44ch] leading-relaxed mx-auto mb-12"
						>
							DreamMoments turns your wedding details into a warm, beautiful
							page your guests will love — before they even tap RSVP.
						</motion.p>

						<motion.div
							initial={reducedMotion ? false : { opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ ...REVEAL_TRANSITION, delay: 0.5 }}
							className="flex flex-col sm:flex-row gap-4 items-center justify-center"
						>
							<Link
								to="/editor/new"
								className="dm-cta-primary active:scale-[0.97]"
							>
								Start free trial
							</Link>
							<a href="#showcase" className="dm-cta-secondary">
								See real invites
							</a>
						</motion.div>
					</div>

					{/* Feature pills */}
					<motion.div
						initial={reducedMotion ? false : { opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ ...REVEAL_TRANSITION, delay: 0.65 }}
						className="flex flex-wrap gap-3 justify-center"
					>
						{[
							"One-tap RSVP",
							"AI-written vows",
							"Photo gallery",
							"Live replies",
						].map((label) => (
							<span key={label} className="dm-hero-pill">
								{label}
							</span>
						))}
					</motion.div>
				</div>
			</div>
		</section>
	);
}

type PreviewLayout = "web" | "mobile";

function LayoutToggle({
	layout,
	onChange,
}: { layout: PreviewLayout; onChange: (l: PreviewLayout) => void }) {
	return (
		<div className="inline-flex items-center rounded-full border border-dm-border bg-dm-surface p-1 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
			{(["web", "mobile"] as const).map((mode) => (
				<button
					key={mode}
					type="button"
					onClick={() => onChange(mode)}
					aria-pressed={layout === mode}
					className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium tracking-wide uppercase transition-all duration-300 ${
						layout === mode
							? "bg-dm-ink text-white shadow-sm"
							: "text-dm-muted hover:text-dm-ink"
					}`}
				>
					{mode === "web" ? (
						<Monitor aria-hidden="true" className="w-3.5 h-3.5" />
					) : (
						<Smartphone aria-hidden="true" className="w-3.5 h-3.5" />
					)}
					{mode === "web" ? "Web" : "Mobile"}
				</button>
			))}
		</div>
	);
}

function Showcase() {
	const [layout, setLayout] = useState<PreviewLayout>("web");
	const isMobile = layout === "mobile";

	const templates = [
		{
			id: "garden-romance",
			title: "Sage morning",
			desc: "For quiet garden ceremonies.",
			photo: "/photos/golden-hour.jpg",
			accent: "bg-dm-sage",
		},
		{
			id: "love-at-dusk",
			title: "Velvet dusk",
			desc: "Warm tones for evening vows.",
			photo: "/photos/couple-walking.jpg",
			accent: "bg-dm-ink/60",
		},
		{
			id: "blush-romance",
			title: "Peach haze",
			desc: "Soft, sun-drenched romance.",
			photo: "/photos/floral-detail.jpg",
			accent: "bg-dm-peach/40",
		},
	];

	return (
		// biome-ignore lint: used for in-page navigation from header
		<section id="showcase" className="relative py-32 px-6 overflow-hidden">
			{/* Background blobs */}
			<div className="dm-blob dm-blob-lavender w-[500px] h-[500px] -top-[100px] -right-[100px]" />
			<div
				className="dm-blob dm-blob-sage w-[400px] h-[400px] bottom-[10%] -left-[80px]"
				style={{ animationDelay: "3s" }}
			/>

			{/* Grain */}
			<div className="dm-grain absolute inset-0" />

			<div className="relative z-10 max-w-7xl mx-auto">
				{/* biome-ignore lint: used for in-page navigation from header */}
				<div id="templates" />

				<div className="text-center mb-12">
					<motion.h2
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={REVEAL_TRANSITION}
						className="font-heading text-4xl sm:text-5xl mb-4"
					>
						The collection
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ ...REVEAL_TRANSITION, delay: 0.15 }}
						className="font-accent text-2xl text-dm-muted"
					>
						curated for intimacy
					</motion.p>
				</div>

				{/* Layout toggle */}
				<div className="flex justify-center mb-14">
					<LayoutToggle layout={layout} onChange={setLayout} />
				</div>

				{/* Template grid — switches between web (3-col) and mobile (single scroll) */}
				<div
					className={`transition-all duration-500 ease-out ${
						isMobile
							? "flex gap-8 overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 scroll-smooth"
							: "grid md:grid-cols-3 gap-8"
					}`}
				>
					{templates.map((t, i) => (
						<motion.div
							key={t.id}
							layout
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{
								delay: i * 0.15,
								...REVEAL_TRANSITION,
								layout: { duration: 0.4, ease: REVEAL_EASE },
							}}
							className={
								isMobile
									? "flex-shrink-0 w-[280px] snap-center"
									: ""
							}
						>
							<Link
								to="/invite/$slug"
								params={{ slug: `${t.id}-sample` }}
								className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dm-peach focus-visible:ring-offset-2 rounded-[2.5rem]"
							>
								<div
									className={`rounded-[3rem] overflow-hidden mb-6 relative transition-transform duration-[800ms] ease-out group-hover:-translate-y-2 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] ${
										isMobile
											? "aspect-[9/16]"
											: "aspect-[3/4]"
									}`}
								>
									<img
										src={t.photo}
										alt={`${t.title} wedding invitation mood preview`}
										loading="lazy"
										decoding="async"
										className="absolute inset-0 h-full w-full object-cover scale-[1.02] transition-transform duration-[800ms] ease-out group-hover:scale-[1.05]"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-white/10" />
									<div className="absolute inset-0 dm-grain opacity-60" />

									<div className="absolute inset-4 rounded-[2.5rem] overflow-hidden border border-white/25 bg-white/10 backdrop-blur-[2px]">
										<div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/0" />
										<div className="relative h-full w-full p-6 flex flex-col justify-between">
											<div className="flex items-center justify-between gap-3">
												<div className="inline-flex items-center gap-2 rounded-full bg-white/50 backdrop-blur-md border border-white/30 px-3 py-1 text-[10px] tracking-[0.2em] uppercase text-dm-ink/60">
													Template
												</div>
												<div
													className={`h-8 w-8 rounded-full border border-white/30 ${t.accent}`}
													aria-hidden="true"
												/>
											</div>

											<div className="text-center">
												<p className="font-accent text-3xl text-white/85 rotate-[-1deg] drop-shadow-sm">
													Sarah & Tom
												</p>
												<h3 className="font-heading text-3xl text-white drop-shadow-sm mt-1">
													We&rsquo;re getting married.
												</h3>
												<div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/25 text-white/85 border border-white/15 text-xs uppercase tracking-[0.2em]">
													<span>Sept 24</span>
													<span className="opacity-40">
														&middot;
													</span>
													<span>RSVP</span>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="text-center">
									<h3 className="font-heading text-2xl mb-1 group-hover:text-dm-peach transition-colors duration-500">
										{t.title}
									</h3>
									<p className="text-dm-muted">{t.desc}</p>
								</div>
							</Link>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

function GettingStartedTimeline() {
	const steps = [
		{
			id: "01",
			title: "Sign up",
			description: "Create account with email or Google.",
		},
		{
			id: "02",
			title: "Choose a template",
			description: "Pick the design that matches your ceremony mood.",
		},
		{
			id: "03",
			title: "Personalize your details",
			description: "Edit names, schedule, story, gallery, RSVP fields.",
		},
		{
			id: "04",
			title: "Publish and share",
			description: "Generate your invitation link and send to guests.",
		},
		{
			id: "05",
			title: "Collect RSVPs",
			description: "Track replies and views from your dashboard.",
		},
	];

	return (
		<section className="relative py-28 px-6 overflow-hidden">
			{/* biome-ignore lint: used for in-page navigation from header */}
			<div id="process" />

			{/* Background blob */}
			<div
				className="dm-blob dm-blob-peach w-[500px] h-[500px] top-[30%] -right-[120px]"
				style={{ animationDelay: "1s" }}
			/>
			<div className="dm-grain absolute inset-0" />

			<div className="relative z-10 max-w-5xl mx-auto">
				<div className="text-center mb-14">
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-60px" }}
						transition={REVEAL_TRANSITION}
						className="font-accent text-3xl text-dm-peach mb-2"
					>
						simple steps
					</motion.p>
					<motion.h2
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-60px" }}
						transition={{ ...REVEAL_TRANSITION, delay: 0.1 }}
						className="font-heading text-4xl sm:text-5xl mb-4"
					>
						From sign up to RSVPs in 5 steps
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-60px" }}
						transition={{ ...REVEAL_TRANSITION, delay: 0.2 }}
						className="max-w-2xl mx-auto text-dm-muted text-lg leading-relaxed"
					>
						Account, template, edits, publish, share.
					</motion.p>
				</div>

				<ol className="relative mx-auto max-w-3xl border-l border-dm-border pl-7 space-y-6">
					{steps.map((step, i) => (
						<motion.li
							key={step.id}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-60px" }}
							transition={{
								...REVEAL_TRANSITION,
								delay: i * 0.08,
							}}
							className="relative"
						>
							<span className="absolute -left-[46px] top-6 flex h-10 w-10 items-center justify-center rounded-full border border-dm-border bg-dm-surface text-[11px] font-semibold tracking-[0.18em] text-dm-muted">
								{step.id}
							</span>
							<div className="rounded-[2rem] border border-dm-border bg-dm-surface/90 p-6 sm:p-7 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
								<h3 className="font-heading text-2xl sm:text-3xl text-dm-ink">
									{step.title}
								</h3>
								<p className="mt-3 text-dm-muted text-base leading-relaxed">
									{step.description}
								</p>
							</div>
						</motion.li>
					))}
				</ol>
			</div>
		</section>
	);
}

function Features() {
	return (
		<section className="relative py-32 px-6 overflow-hidden">
			{/* Background blobs */}
			<div className="dm-blob dm-blob-sage w-[450px] h-[450px] top-[5%] -left-[100px]" />
			<div
				className="dm-blob dm-blob-lavender w-[380px] h-[380px] bottom-[15%] right-[5%]"
				style={{ animationDelay: "2.5s" }}
			/>
			<div className="dm-grain absolute inset-0" />

			<div className="relative z-10 max-w-6xl mx-auto">
				<div className="bg-dm-surface-muted rounded-[3rem] p-10 sm:p-16 lg:p-20 border border-dm-border shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
					<div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={REVEAL_TRANSITION}
						>
							<span className="font-accent text-3xl text-dm-peach block mb-4">
								gentle features
							</span>
							<h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl mb-8 leading-tight">
								Designed to feel{" "}
								<span className="italic">like a living room.</span>
							</h2>
							<p className="text-lg sm:text-xl text-dm-muted leading-relaxed mb-12">
								No clutter, no noise. Just a serene space for your guests
								to feel the love, get the details, and say yes.
							</p>

							<div className="space-y-7">
								{[
									{
										title: "Tactile textures",
										desc: "Grainy, paper-like feel.",
										icon: (
											<Sparkles
												aria-hidden="true"
												className="w-5 h-5"
											/>
										),
									},
									{
										title: "Fluid motion",
										desc: "Slow, calming transitions.",
										icon: (
											<Play
												aria-hidden="true"
												className="w-5 h-5"
											/>
										),
									},
									{
										title: "Guest ease",
										desc: "One-tap RSVP, no logins.",
										icon: (
											<Check
												aria-hidden="true"
												className="w-5 h-5"
											/>
										),
									},
								].map((item, i) => (
									<motion.div
										key={item.title}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{
											...REVEAL_TRANSITION,
											delay: i * 0.12 + 0.3,
										}}
										className="flex items-start gap-4"
									>
										<div className="w-10 h-10 rounded-full bg-dm-surface border border-dm-border flex items-center justify-center text-dm-ink shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
											{item.icon}
										</div>
										<div>
											<h4 className="font-heading font-semibold text-lg">
												{item.title}
											</h4>
											<p className="text-dm-muted">
												{item.desc}
											</p>
										</div>
									</motion.div>
								))}
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, scale: 0.97 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{
								duration: 1,
								ease: [0.25, 0.1, 0.25, 1],
							}}
							className="relative aspect-square bg-dm-surface rounded-[3rem] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-8 border border-dm-border"
						>
							<div className="h-full w-full rounded-[2.5rem] bg-dm-bg overflow-hidden relative flex flex-col">
								{/* Mock browser chrome */}
								<div className="h-12 border-b border-dm-border flex items-center px-6 gap-2">
									<div className="w-2 h-2 rounded-full bg-dm-border" />
									<div className="w-2 h-2 rounded-full bg-dm-border" />
								</div>

								{/* Mock invitation preview */}
								<div className="flex-1 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
									<div className="dm-blob dm-blob-sage w-20 h-20 top-1/4 left-1/4" />
									<div className="dm-blob dm-blob-peach w-32 h-32 bottom-1/4 right-1/4" />

									<div className="relative z-10">
										<p className="font-accent text-3xl mb-2">
											Sarah & Tom
										</p>
										<h3 className="font-heading text-3xl sm:text-4xl mb-6">
											We're getting married.
										</h3>
										<div className="inline-block px-6 py-2 rounded-full border border-dm-border bg-dm-surface/80 backdrop-blur-md text-sm uppercase tracking-widest text-dm-muted">
											Sept 24
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
}

function Footer() {
	return (
		// biome-ignore lint: used for in-page navigation from header
		<footer
			id="pricing"
			className="relative py-20 text-center text-dm-muted overflow-hidden"
		>
			<div className="dm-grain absolute inset-0" />
			<div className="relative z-10">
				<div className="flex justify-center gap-2 mb-8 opacity-40">
					<Star aria-hidden="true" className="w-4 h-4" />
					<Star aria-hidden="true" className="w-4 h-4" />
					<Star aria-hidden="true" className="w-4 h-4" />
				</div>
				<p className="font-heading text-2xl text-dm-ink mb-2">
					DreamMoments
				</p>
				<p className="text-sm">
					Made with{" "}
					<Heart
						aria-hidden="true"
						className="w-3 h-3 inline text-dm-peach"
					/>{" "}
					for love.
				</p>
			</div>
		</footer>
	);
}

export function Landing() {
	return (
		<div className="min-h-screen bg-dm-bg selection:bg-dm-peach/30 selection:text-dm-ink">
			<Hero />
			<Showcase />
			<GettingStartedTimeline />
			<Features />
			<Footer />
		</div>
	);
}
