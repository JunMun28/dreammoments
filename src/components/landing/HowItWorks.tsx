import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { useStrokeDraw } from "./hooks/useStrokeDraw";
import { PaperCutEdge } from "./motifs/PaperCutEdge";
import { SectionHeader } from "./motifs/SectionHeader";

gsap.registerPlugin(ScrollTrigger);

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
	const pathRef = useRef<SVGPathElement>(null);
	const stepsRef = useRef<HTMLLIElement[]>([]);

	useStrokeDraw({
		pathRef,
		triggerRef: sectionRef as React.RefObject<HTMLElement>,
		scrub: 0.8,
		reducedMotion,
	});

	// GSAP per-step entrance
	useEffect(() => {
		if (reducedMotion || stepsRef.current.length === 0) return;

		const ctx = gsap.context(() => {
			for (const step of stepsRef.current) {
				if (!step) continue;
				gsap.fromTo(
					step,
					{ opacity: 0, y: 30 },
					{
						opacity: 1,
						y: 0,
						duration: 0.6,
						ease: "power3.out",
						scrollTrigger: {
							trigger: step,
							start: "top 85%",
							end: "top 55%",
							scrub: 0.3,
						},
					},
				);
			}
		}, sectionRef);

		return () => ctx.revert();
	}, [reducedMotion]);

	return (
		<section
			ref={sectionRef}
			className="relative py-[clamp(5rem,10vw,10rem)] px-6 overflow-hidden"
			style={{ background: "var(--dm-surface-muted)" }}
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

				<ol className="relative mx-auto max-w-3xl pl-7 space-y-6">
					{/* Golden thread SVG */}
					<div
						className="absolute left-[14px] top-6 bottom-6 w-px"
						aria-hidden="true"
					>
						<svg
							className="absolute inset-0 w-full h-full"
							preserveAspectRatio="none"
							role="presentation"
						>
							{/* Background track */}
							<line
								x1="50%"
								y1="0"
								x2="50%"
								y2="100%"
								stroke="var(--dm-border)"
								strokeWidth="2"
							/>
							{/* Animated gold line */}
							<path
								ref={pathRef}
								d="M 0.5 0 L 0.5 1"
								stroke="var(--dm-gold)"
								strokeWidth="2"
								fill="none"
								vectorEffect="non-scaling-stroke"
								style={{
									transform: "scaleY(1)",
									transformOrigin: "top",
								}}
							/>
						</svg>
					</div>

					{TIMELINE_STEPS.map((step, i) => (
						<li
							key={step.id}
							ref={(el) => {
								if (el) stepsRef.current[i] = el;
							}}
							className="relative"
							style={reducedMotion ? undefined : { opacity: 0 }}
						>
							{/* Step number circle: gold border, white bg, gold text */}
							<span
								className="absolute -left-[46px] top-6 flex h-10 w-10 items-center justify-center rounded-full font-display text-[11px] font-semibold tracking-[0.18em]"
								style={{
									border: "2px solid var(--dm-gold)",
									background: "var(--dm-surface)",
									color: "var(--dm-gold)",
								}}
							>
								{step.id}
							</span>

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
									className="absolute top-2 right-4 font-display font-bold pointer-events-none select-none"
									style={{
										fontSize: "clamp(2rem, 4vw, 3.5rem)",
										color: "var(--dm-gold)",
										opacity: 0.15,
										lineHeight: 1,
									}}
									aria-hidden="true"
								>
									{step.id}
								</span>

								<h3
									className="font-heading text-[var(--text-card-title)] font-semibold"
									style={{ color: "var(--dm-ink)" }}
								>
									{step.title}
								</h3>
								<p
									className="mt-3 text-base leading-relaxed"
									style={{ color: "var(--dm-muted)" }}
								>
									{step.description}
								</p>
							</div>
						</li>
					))}
				</ol>
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
