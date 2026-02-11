import {
	BarChart3,
	Check,
	Heart,
	QrCode,
	Share2,
	Sparkles,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { MeshGradientBackground } from "./MeshGradientBackground";
import { PaperCutEdge } from "./motifs/PaperCutEdge";
import { SectionHeader } from "./motifs/SectionHeader";

const FEATURES = [
	{
		title: "AI-Powered Content",
		desc: "Your love story, schedule, and details written by AI in seconds. Just answer a few questions.",
		icon: Sparkles,
	},
	{
		title: "Chinese Wedding Customs",
		desc: "Double happiness motifs, tea ceremony sections, banquet seating, and bilingual support.",
		icon: Heart,
	},
	{
		title: "One-Tap RSVP",
		desc: "Guests reply instantly from their phones. No accounts, no app downloads, no friction.",
		icon: Check,
	},
	{
		title: "Angpao QR Code",
		desc: "Let guests send digital angpao directly. QR code linked to your preferred payment method.",
		icon: QrCode,
	},
	{
		title: "WhatsApp Share",
		desc: "Share your invitation via WhatsApp in one tap. Beautiful preview card auto-generated.",
		icon: Share2,
	},
	{
		title: "Real-Time Dashboard",
		desc: "Track views, RSVPs, dietary preferences, and plus-ones at a glance.",
		icon: BarChart3,
	},
];

export function Features({ reducedMotion }: { reducedMotion: boolean }) {
	const sectionRef = useRef<HTMLElement>(null);
	const featureItemsRef = useRef<HTMLDivElement[]>([]);
	const mockupRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (reducedMotion || featureItemsRef.current.length === 0) return;

		let ctx: gsap.Context | undefined;

		async function initGSAP() {
			const gsap = (await import("gsap")).default;
			const { ScrollTrigger } = await import("gsap/ScrollTrigger");
			gsap.registerPlugin(ScrollTrigger);

			if (!sectionRef.current) return;

			ctx = gsap.context(() => {
				gsap.fromTo(
					featureItemsRef.current.filter(Boolean),
					{ opacity: 0, y: 24 },
					{
						opacity: 1,
						y: 0,
						duration: 0.6,
						ease: "power2.out",
						stagger: 0.1,
						scrollTrigger: {
							trigger: sectionRef.current,
							start: "top 80%",
							toggleActions: "play none none none",
						},
					},
				);
				const icons = sectionRef.current?.querySelectorAll(".dm-feature-icon");
				if (icons) {
					gsap.fromTo(
						icons,
						{ boxShadow: "0 0 0px rgba(212,184,122,0)" },
						{
							boxShadow: "0 0 20px rgba(212,184,122,0.4)",
							duration: 0.6,
							stagger: 0.1,
							ease: "power2.out",
							scrollTrigger: {
								trigger: sectionRef.current,
								start: "top 80%",
								toggleActions: "play none none none",
							},
							onComplete: () => {
								if (icons) {
									gsap.to(icons, {
										boxShadow: "0 0 0px rgba(212,184,122,0)",
										duration: 1.0,
										stagger: 0.1,
										delay: 0.3,
									});
								}
							},
						},
					);
				}

				if (mockupRef.current) {
					gsap.fromTo(
						mockupRef.current,
						{ rotateY: -5 },
						{
							rotateY: 5,
							ease: "none",
							scrollTrigger: {
								trigger: sectionRef.current,
								start: "top bottom",
								end: "bottom top",
								scrub: true,
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
			className="dm-vermillion-section relative overflow-hidden"
			style={{
				background: "var(--dm-vermillion)",
				// Paper-cut SVG overlay at subtler opacity for texture on crimson bg
				backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='white' stroke-width='0.5' opacity='0.06'/%3E%3Ccircle cx='0' cy='0' r='20' fill='none' stroke='white' stroke-width='0.5' opacity='0.06'/%3E%3Ccircle cx='80' cy='80' r='20' fill='none' stroke='white' stroke-width='0.5' opacity='0.06'/%3E%3C/svg%3E")`,
			}}
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

			<div className="mx-auto max-w-6xl px-6 py-[clamp(5rem,10vw,10rem)]">
				<div className="grid items-start gap-16 lg:grid-cols-2 lg:gap-20">
					{/* Left: section header + feature list */}
					<div>
						<SectionHeader
							kickerEn="WHY DREAMMOMENTS"
							kickerCn="为何选择"
							title=""
							kickerColor="var(--dm-gold)"
							kickerEnColor="rgba(255,255,255,0.7)"
							light
							reducedMotion={reducedMotion}
						/>

						{/* Custom heading below section header */}
						<h3
							className="-mt-12 font-display font-bold tracking-tight"
							style={{
								fontSize: "var(--text-subsection)",
								color: "#FFFFFF",
								letterSpacing: "-0.025em",
								lineHeight: 1.2,
							}}
						>
							Everything you need.{" "}
							<span className="font-accent italic" style={{ color: "#FFFFFF" }}>
								Nothing you don&apos;t.
							</span>
						</h3>

						{/* Feature list */}
						<div className="mt-10 space-y-6">
							{FEATURES.map((f, i) => (
								<div
									key={f.title}
									ref={(el) => {
										if (el) featureItemsRef.current[i] = el;
									}}
									className="flex items-start gap-4 group"
								>
									{/* Gold circular icon container */}
									<div
										className="dm-feature-icon flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
										style={{
											background: "var(--dm-gold-electric)",
											color: "#FFFFFF",
										}}
									>
										<f.icon aria-hidden="true" className="h-5 w-5" />
									</div>
									<div>
										<h3
											className="font-semibold"
											style={{
												color: "#FFFFFF",
												fontSize: "1.0625rem",
											}}
										>
											{f.title}
										</h3>
										<p
											className="mt-1 text-sm leading-relaxed"
											style={{
												color: "rgba(255,255,255,0.85)",
												fontSize: "0.9375rem",
											}}
										>
											{f.desc}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Right: Phone mockup */}
					<div
						data-scroll-reveal
						className="dm-reveal-scale relative flex items-center justify-center lg:sticky lg:top-32"
						style={{ perspective: "800px" }}
					>
						{/* Phone frame */}
						<div ref={mockupRef} className="relative w-full max-w-[280px]">
							<div
								className="overflow-hidden rounded-[2.5rem] border-[6px] shadow-xl"
								style={{
									borderColor: "#FFFFFF",
									background: "var(--dm-surface)",
									boxShadow: "0 20px 60px -12px rgba(0,0,0,0.25)",
								}}
							>
								{/* Notch */}
								<div className="relative">
									<div
										className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-28 rounded-b-2xl z-10"
										style={{
											background: "#1A1A1A",
										}}
									/>
								</div>

								{/* Screen content */}
								<div className="aspect-[9/19] overflow-hidden">
									<div
										className="h-full w-full flex flex-col items-center justify-center text-center p-8 pt-12"
										style={{
											background: "var(--dm-bg)",
										}}
									>
										<p
											className="text-xs uppercase tracking-[0.2em] mb-3"
											style={{
												color: "var(--dm-muted)",
											}}
										>
											We&apos;re getting married
										</p>
										<p
											className="font-accent text-2xl mb-1"
											style={{
												color: "var(--dm-ink)",
											}}
										>
											Sarah &amp; Tom
										</p>
										<p
											className="font-display text-xl mb-6"
											style={{
												color: "var(--dm-ink)",
											}}
										>
											永结同心
										</p>
										<div
											className="w-12 h-px mb-6"
											style={{
												background: "var(--dm-gold)",
											}}
										/>
										<p
											className="text-sm"
											style={{
												color: "var(--dm-muted)",
											}}
										>
											September 24, 2026
										</p>
										<p
											className="text-sm"
											style={{
												color: "var(--dm-muted)",
											}}
										>
											Grand Ballroom, KL
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Paper-cut edge at bottom transitioning to Pricing */}
			<PaperCutEdge
				position="bottom"
				color="var(--dm-vermillion)"
				scallops={24}
			/>
		</section>
	);
}
