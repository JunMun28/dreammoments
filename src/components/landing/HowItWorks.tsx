import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ANIMATION, sectionReveal } from "./animation";

const REVEAL_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const REVEAL_TRANSITION = { duration: 0.8, ease: REVEAL_EASE };

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
			"Our AI generates your couple story, schedule, and details. You just fill in the basics.",
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
			"Publish your unique link. Track who's viewed, who's replied, and dietary preferences.",
	},
];

function TimelineStep({
	step,
	index,
	total,
	scrollYProgress,
	reducedMotion,
}: {
	step: (typeof TIMELINE_STEPS)[number];
	index: number;
	total: number;
	scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
	reducedMotion: boolean;
}) {
	const threshold = (index + 0.5) / total;
	const isActive = useTransform(scrollYProgress, (v) => v >= threshold);
	const [active, setActive] = useState(false);

	useEffect(() => {
		if (reducedMotion) return;
		return isActive.on("change", (v) => setActive(v));
	}, [isActive, reducedMotion]);

	return (
		<motion.li
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-60px" }}
			transition={{
				...REVEAL_TRANSITION,
				delay: index * 0.08,
			}}
			className="relative"
		>
			<span
				className={`dm-timeline-step absolute -left-[46px] top-6 flex h-10 w-10 items-center justify-center rounded-full border font-display text-[11px] font-semibold tracking-[0.18em] ${
					active
						? "dm-timeline-step-active"
						: "border-dm-border bg-dm-surface text-dm-muted"
				}`}
			>
				{step.id}
			</span>
			<div className="rounded-4xl border border-dm-border bg-dm-surface/90 p-6 sm:p-7 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
				<h3 className="font-heading text-2xl sm:text-3xl text-dm-ink">
					{step.title}
				</h3>
				<p className="mt-3 text-dm-muted text-base leading-relaxed">
					{step.description}
				</p>
			</div>
		</motion.li>
	);
}

export function HowItWorks({ reducedMotion }: { reducedMotion: boolean }) {
	const olRef = useRef<HTMLOListElement>(null);

	const { scrollYProgress } = useScroll({
		target: olRef,
		offset: ["start 0.8", "end 0.6"],
	});

	const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

	return (
		<section
			className="relative py-28 px-6 overflow-hidden"
			style={{ background: "var(--dm-surface-rose)" }}
		>
			{/* biome-ignore lint/correctness/useUniqueElementIds: intentional anchor for in-page navigation */}
			<div id="process" />

			<div className="relative z-10 max-w-5xl mx-auto">
				<div className="text-center mb-14">
					<motion.span
						initial={reducedMotion ? false : "hidden"}
						whileInView="visible"
						viewport={ANIMATION.viewport}
						variants={sectionReveal}
						className="text-sm font-medium uppercase tracking-[0.12em]"
						style={{ color: "var(--dm-crimson)" }}
					>
						How It Works
					</motion.span>
					<motion.h2
						initial={reducedMotion ? false : "hidden"}
						whileInView="visible"
						viewport={ANIMATION.viewport}
						variants={sectionReveal}
						className="mt-3 font-display font-semibold tracking-tight"
						style={{
							fontSize: "var(--text-section)",
							color: "var(--dm-ink)",
						}}
					>
						From sign up to RSVPs in 5 steps
					</motion.h2>
					<motion.p
						initial={reducedMotion ? false : "hidden"}
						whileInView="visible"
						viewport={ANIMATION.viewport}
						variants={sectionReveal}
						className="mt-4 max-w-2xl mx-auto text-lg leading-relaxed"
						style={{ color: "var(--dm-muted)" }}
					>
						Account, template, edits, publish, share.
					</motion.p>
				</div>

				<ol ref={olRef} className="relative mx-auto max-w-3xl pl-7 space-y-6">
					{/* Timeline track */}
					<div className="dm-timeline-track" aria-hidden="true">
						<div className="dm-timeline-bg" />
						{!reducedMotion && (
							<motion.div
								className="dm-timeline-line"
								style={{ height: lineHeight }}
							/>
						)}
					</div>

					{TIMELINE_STEPS.map((step, i) => (
						<TimelineStep
							key={step.id}
							step={step}
							index={i}
							total={TIMELINE_STEPS.length}
							scrollYProgress={scrollYProgress}
							reducedMotion={reducedMotion}
						/>
					))}
				</ol>
			</div>
		</section>
	);
}
