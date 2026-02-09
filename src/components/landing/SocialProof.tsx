import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { GoldRule } from "./motifs/GoldRule";
import { SplitWords } from "./SplitWords";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
	{
		value: 500,
		suffix: "+",
		prefix: "",
		label: "Couples served",
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
		label: "Setup time",
		isDecimal: false,
		displaySuffix: " min",
	},
];

export function SocialProof({ reducedMotion }: { reducedMotion: boolean }) {
	const sectionRef = useRef<HTMLElement>(null);
	const statsRef = useRef<HTMLDivElement>(null);
	const testimonialRef = useRef<HTMLBlockquoteElement>(null);

	useEffect(() => {
		if (reducedMotion || !sectionRef.current) return;

		const ctx = gsap.context(() => {
			// Stat count-up with entrance animation
			const statValues =
				statsRef.current?.querySelectorAll("[data-stat-value]");
			const statItems = statsRef.current?.querySelectorAll("[data-stat-item]");

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
					const isDecimal = (el as HTMLElement).dataset.statDecimal === "true";
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

			// Word-by-word testimonial reveal
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

		return () => ctx.revert();
	}, [reducedMotion]);

	return (
		<section
			ref={sectionRef}
			className="relative"
			style={{ background: "var(--dm-dark-bg)" }}
		>
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
						<div
							key={stat.label}
							className="flex items-center gap-8 md:gap-12 lg:gap-20"
						>
							{/* Gold vertical divider (desktop only, between items) */}
							{i > 0 && (
								<div
									className="hidden md:block"
									style={{
										width: "1px",
										height: "60%",
										minHeight: "3rem",
										background: "var(--dm-gold)",
										opacity: 0.2,
										alignSelf: "center",
									}}
									aria-hidden="true"
								/>
							)}
							{/* Gold horizontal divider (mobile only, between items) */}
							{i > 0 && (
								<div
									className="block md:hidden"
									style={{
										width: "4rem",
										height: "1px",
										background: "var(--dm-gold)",
										opacity: 0.2,
										position: "absolute",
										marginTop: "-1rem",
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
										(stat as { displaySuffix?: string }).displaySuffix ?? ""
									}
									className="font-display font-extrabold"
									style={{
										fontFamily:
											'"Playfair Display", "Noto Serif SC", Georgia, serif',
										fontWeight: 800,
										fontSize: "clamp(2.5rem, 6vw, 4rem)",
										color: "var(--dm-dark-text)",
										lineHeight: 1.1,
									}}
								>
									{stat.prefix}
									{stat.isDecimal ? stat.value.toFixed(1) : stat.value}
									{stat.suffix}
									{(stat as { displaySuffix?: string }).displaySuffix ?? ""}
								</p>
								<p
									className="mt-1"
									style={{
										fontFamily: '"Inter", system-ui, sans-serif',
										fontWeight: 400,
										fontSize: "var(--text-sm)",
										color: "var(--dm-dark-muted)",
									}}
								>
									{stat.label}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* Testimonial */}
				<blockquote
					ref={testimonialRef}
					className="mx-auto mt-10 max-w-2xl text-left"
					style={{
						borderLeft: "3px solid var(--dm-crimson)",
						paddingLeft: "1.5rem",
					}}
				>
					<p
						style={{
							fontFamily:
								'"Cormorant Garamond", "Noto Serif SC", Georgia, serif',
							fontWeight: 400,
							fontStyle: "italic",
							fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
							color: "var(--dm-dark-text)",
							lineHeight: 1.7,
						}}
					>
						<SplitWords>
							Our guests kept saying the invitation was the most beautiful
							they'd ever received. The tea ceremony section was perfect.
						</SplitWords>
					</p>
					<footer
						className="mt-4"
						style={{
							fontFamily: '"Inter", system-ui, sans-serif',
							fontWeight: 400,
							fontVariant: "small-caps",
							fontSize: "var(--text-sm)",
							color: "var(--dm-dark-muted)",
						}}
					>
						Wei Lin &amp; Jun Hao, Kuala Lumpur
					</footer>
				</blockquote>
			</div>

			<GoldRule className="absolute bottom-0 left-0 right-0 z-10" />
		</section>
	);
}
