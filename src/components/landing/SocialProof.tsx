import { Fragment, useEffect, useRef } from "react";
import { MeshGradientBackground } from "./MeshGradientBackground";
import { GoldRule } from "./motifs/GoldRule";
import { PetalShower } from "./motifs/PetalShower";
import { SplitWords } from "./SplitWords";

interface StatConfig {
	value: number;
	suffix: string;
	prefix: string;
	label: string;
	isDecimal: boolean;
	displaySuffix?: string;
}

const STATS: StatConfig[] = [
	{
		value: 100,
		suffix: "s",
		prefix: "",
		label: "Couples & counting",
		isDecimal: false,
	},
	{
		value: 4.9,
		suffix: "",
		prefix: "",
		label: "Average rating",
		isDecimal: true,
	},
	{
		value: 3,
		suffix: "",
		prefix: "< ",
		label: "Minutes to set up",
		isDecimal: false,
		displaySuffix: " min",
	},
];

const TESTIMONIALS = [
	{
		quote:
			"Our guests kept saying the invitation was the most beautiful they'd ever received. The tea ceremony section was perfect.",
		author: "Wei Lin & Jun Hao",
		location: "Kuala Lumpur",
	},
	{
		quote:
			"We created our invitation in one evening. The AI wrote our love story better than we could ourselves!",
		author: "Hui Wen & Zhi Yang",
		location: "Singapore",
	},
	{
		quote:
			"The bilingual feature saved us so much time. Our parents loved that everything was in both English and Chinese.",
		author: "Shu Qi & Wei Jie",
		location: "Penang",
	},
];

export function SocialProof({ reducedMotion }: { reducedMotion: boolean }) {
	const sectionRef = useRef<HTMLElement>(null);
	const statsRef = useRef<HTMLDivElement>(null);
	const testimonialRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (reducedMotion || !sectionRef.current) return;

		let ctx: gsap.Context | undefined;

		async function initGSAP() {
			const gsap = (await import("gsap")).default;
			const { ScrollTrigger } = await import("gsap/ScrollTrigger");
			gsap.registerPlugin(ScrollTrigger);

			if (!sectionRef.current) return;

			ctx = gsap.context(() => {
				const statValues =
					statsRef.current?.querySelectorAll("[data-stat-value]");
				const statItems =
					statsRef.current?.querySelectorAll("[data-stat-item]");

				if (statItems) {
					gsap.set(statItems, { y: 30, opacity: 0 });

					gsap.to(statItems, {
						y: 0,
						opacity: 1,
						duration: 0.6,
						stagger: 0.15,
						ease: "power2.out",
						scrollTrigger: {
							trigger: statsRef.current,
							start: "top 80%",
							toggleActions: "play none none none",
						},
					});
				}

				if (statValues) {
					for (const el of statValues) {
						const target = Number.parseFloat(
							(el as HTMLElement).dataset.statTarget ?? "0",
						);
						const isDecimal =
							(el as HTMLElement).dataset.statDecimal === "true";
						const prefix = (el as HTMLElement).dataset.statPrefix ?? "";
						const displaySuffix =
							(el as HTMLElement).dataset.statDisplaySuffix ?? "";
						const suffix = (el as HTMLElement).dataset.statSuffix ?? "";

						const obj = { val: 0 };
						gsap.to(obj, {
							val: target,
							duration: 2.0,
							ease: "power2.out",
							snap: isDecimal ? { val: 0.1 } : { val: 1 },
							scrollTrigger: {
								trigger: statsRef.current,
								start: "top 80%",
								toggleActions: "play none none none",
							},
							onUpdate: () => {
								(el as HTMLElement).textContent = `${prefix}${
									isDecimal ? obj.val.toFixed(1) : Math.round(obj.val)
								}${suffix}${displaySuffix}`;
							},
						});
					}
				}

				const words = testimonialRef.current?.querySelectorAll("[data-word]");
				if (words && words.length > 0) {
					gsap.set(words, { opacity: 0.15 });

					gsap.to(words, {
						opacity: 1.0,
						duration: 0.3,
						stagger: 0.05,
						ease: "power2.out",
						scrollTrigger: {
							trigger: testimonialRef.current,
							start: "top 75%",
							end: "top 40%",
							scrub: 0.5,
						},
					});
				}
			}, sectionRef);
		}

		initGSAP();
		return () => ctx?.revert();
	}, [reducedMotion]);

	return (
		<section
			ref={sectionRef}
			className="relative"
			style={{ background: "var(--dm-crimson-soft)" }}
		>
			{/* Mesh gradient overlay */}
			<div className="absolute inset-0 pointer-events-none" aria-hidden="true">
				<MeshGradientBackground
					variant="crimson"
					className="h-full"
					reducedMotion={reducedMotion}
				>
					<div />
				</MeshGradientBackground>
			</div>

			{/* Petal shower */}
			<PetalShower reducedMotion={reducedMotion} />

			<GoldRule className="absolute top-0 left-0 right-0 z-10" />

			<div
				className="mx-auto max-w-4xl px-6 text-center"
				style={{ padding: "clamp(4rem, 8vw, 7rem) 1.5rem" }}
			>
				{/* Stats row */}
				<div
					ref={statsRef}
					className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-12 lg:gap-20"
				>
					{STATS.map((stat, i) => (
						<Fragment key={stat.label}>
							{/* Gold divider between items */}
							{i > 0 && (
								<div
									className="mx-auto my-2 md:my-0"
									style={{
										width: "4rem",
										height: "1px",
										background: "var(--dm-gold)",
										opacity: 0.3,
									}}
									aria-hidden="true"
								/>
							)}
							<div data-stat-item className="text-center">
								<p
									data-stat-value
									data-stat-target={stat.value}
									data-stat-decimal={stat.isDecimal ? "true" : "false"}
									data-stat-prefix={stat.prefix}
									data-stat-suffix={stat.suffix}
									data-stat-display-suffix={
										stat.displaySuffix ?? ""
									}
									className="font-display font-extrabold"
									style={{
										fontFamily:
											'"Playfair Display", "Noto Serif SC", Georgia, serif',
										fontWeight: 800,
										fontSize: "clamp(2.5rem, 6vw, 4rem)",
										color: "var(--dm-ink)",
										lineHeight: 1.1,
									}}
								>
									{stat.prefix}
									{stat.isDecimal ? stat.value.toFixed(1) : stat.value}
									{stat.suffix}
									{stat.displaySuffix ?? ""}
								</p>
								<p
									className="mt-1"
									style={{
										fontFamily: '"Inter", system-ui, sans-serif',
										fontWeight: 400,
										fontSize: "var(--text-sm)",
										color: "var(--dm-muted)",
									}}
								>
									{stat.label}
								</p>
							</div>
						</Fragment>
					))}
				</div>

				{/* Testimonials */}
				<div
					ref={testimonialRef}
					className="mx-auto mt-10 grid max-w-4xl gap-8 md:grid-cols-3"
				>
					{TESTIMONIALS.map((t) => (
						<blockquote
							key={t.author}
							className="relative text-left"
							style={{
								borderLeft: "3px solid var(--dm-gold-electric)",
								paddingLeft: "1.5rem",
							}}
						>
							<span
								className="pointer-events-none absolute select-none"
								style={{
									fontFamily: '"Playfair Display", serif',
									fontSize: "3rem",
									color: "var(--dm-crimson)",
									opacity: 0.2,
									lineHeight: 1,
									top: "-0.5em",
									left: "-0.5rem",
								}}
								aria-hidden="true"
							>
								{"\u201C"}
							</span>
							<p
								style={{
									fontFamily:
										'"Playfair Display", "Noto Serif SC", Georgia, serif',
									fontWeight: 400,
									fontStyle: "italic",
									fontSize: "clamp(1rem, 1.5vw, 1.125rem)",
									color: "var(--dm-ink)",
									lineHeight: 1.7,
								}}
							>
								<SplitWords>{t.quote}</SplitWords>
							</p>
							<footer
								className="mt-4"
								style={{
									fontFamily: '"Inter", system-ui, sans-serif',
									fontWeight: 500,
									fontVariant: "small-caps",
									fontSize: "var(--text-sm)",
									letterSpacing: "0.05em",
									color: "var(--dm-muted)",
								}}
							>
								{t.author}, {t.location}
							</footer>
						</blockquote>
					))}
				</div>
			</div>

			<GoldRule className="absolute bottom-0 left-0 right-0 z-10" />
		</section>
	);
}
