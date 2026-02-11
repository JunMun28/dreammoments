import { useEffect, useRef } from "react";
import { CurvedConnectorPath } from "./CurvedConnectorPath";
import { PaperCutEdge } from "./motifs/PaperCutEdge";
import { SectionHeader } from "./motifs/SectionHeader";

const TIMELINE_STEPS = [
	{
		id: "01",
		title: "Sign up in seconds",
		description:
			"Create your account with email or Google. No credit card needed.",
	},
	{
		id: "02",
		title: "Pick your template",
		description:
			"Choose from 4 designs crafted for Chinese weddings. Tea ceremony, banquet, and bilingual sections included.",
	},
	{
		id: "03",
		title: "Let AI write your story",
		description:
			"Our AI generates your couple story, schedule, and details in English and Chinese. You just fill in the basics.",
	},
	{
		id: "04",
		title: "Make it yours",
		description:
			"Edit every section. Change photos, colors, and wording until it feels like you.",
	},
	{
		id: "05",
		title: "Share & track RSVPs",
		description:
			"Publish your unique link. Share via WhatsApp in one tap. Track who's viewed, who's replied, and dietary preferences.",
	},
];

export function HowItWorks({ reducedMotion }: { reducedMotion: boolean }) {
	const sectionRef = useRef<HTMLElement>(null);
	const stepsRef = useRef<HTMLDivElement[]>([]);

	useEffect(() => {
		if (reducedMotion || stepsRef.current.length === 0) return;

		let ctx: gsap.Context | undefined;

		async function initGSAP() {
			const gsap = (await import("gsap")).default;
			const { ScrollTrigger } = await import("gsap/ScrollTrigger");
			gsap.registerPlugin(ScrollTrigger);

			if (!sectionRef.current) return;

			ctx = gsap.context(() => {
				for (let i = 0; i < stepsRef.current.length; i++) {
					const step = stepsRef.current[i];
					if (!step) continue;
					const isOdd = i % 2 === 0;
					gsap.fromTo(
						step,
						{ opacity: 0, x: isOdd ? -40 : 40 },
						{
							opacity: 1,
							x: 0,
							duration: 0.6,
							ease: "power2.out",
							scrollTrigger: {
								trigger: step,
								start: "top 85%",
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
			className="relative py-[clamp(5rem,10vw,10rem)] px-6 overflow-hidden"
			style={{
				background:
					"linear-gradient(180deg, var(--dm-surface-rose) 0%, var(--dm-gold-soft) 100%)",
			}}
		>
			{/* biome-ignore lint/correctness/useUniqueElementIds: intentional anchor for in-page navigation */}
			<div id="process" />

			<div className="relative z-10 max-w-5xl mx-auto">
				<SectionHeader
					kickerEn="THE PROCESS"
					kickerCn="五步成礼"
					title="Five steps to your perfect invitation."
					subtitle="From sign-up to RSVPs in minutes."
					kickerColor="var(--dm-crimson)"
					reducedMotion={reducedMotion}
				/>

				{/* Alternating left-right layout */}
				<div className="mx-auto max-w-4xl">
					{TIMELINE_STEPS.map((step, i) => {
						const isOdd = i % 2 === 0; // 0-indexed: steps 1,3,5 go left
						return (
							<div key={step.id}>
								{/* Curved connector between steps (hidden on mobile) */}
								{i > 0 && (
									<div className="hidden md:block">
										<CurvedConnectorPath
											direction={isOdd ? "right-to-left" : "left-to-right"}
										/>
									</div>
								)}

								{/* Step row: alternating alignment */}
								<div
									ref={(el) => {
										if (el) stepsRef.current[i] = el;
									}}
									className={`flex ${isOdd ? "md:justify-start" : "md:justify-end"}`}
								>
									<div className="w-full md:w-[60%] relative">
										{/* Step number circle */}
										<div className="flex items-center gap-4 mb-3">
											<span
												className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full font-display text-base font-semibold tracking-[0.18em]"
												style={{
													border: "3px solid var(--dm-gold-electric)",
													background: "var(--dm-surface)",
													color: "var(--dm-gold-electric)",
												}}
											>
												{step.id}
											</span>
											<h3
												className="font-heading font-semibold"
												style={{
													fontSize: "var(--text-card-title)",
													color: "var(--dm-ink)",
												}}
											>
												{step.title}
											</h3>
										</div>

										{/* Card */}
										<div
											className="rounded-[1.5rem] border bg-[var(--dm-surface)] p-6 sm:p-7 relative overflow-hidden"
											style={{
												borderColor: "var(--dm-border)",
												boxShadow: "0 4px 20px -2px rgba(0,0,0,0.05)",
											}}
										>
											{/* Step number watermark */}
											<span
												className="absolute top-2 right-4 font-display font-extrabold pointer-events-none select-none"
												style={{
													fontSize: "clamp(3rem, 5vw, 5rem)",
													color: "var(--dm-gold-electric)",
													opacity: 0.08,
													lineHeight: 1,
												}}
												aria-hidden="true"
											>
												{step.id}
											</span>

											<p
												className="text-base leading-relaxed relative z-[1]"
												style={{ color: "var(--dm-muted)" }}
											>
												{step.description}
											</p>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Paper-cut edge at bottom transitioning to Features */}
			<PaperCutEdge
				position="bottom"
				color="var(--dm-surface-muted)"
				scallops={20}
			/>
		</section>
	);
}
