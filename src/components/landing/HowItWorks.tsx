import { useRef } from "react";
import { useScrollReveal } from "./hooks/useScrollReveal";

const STEPS = [
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
			"Choose from our collection of modern designs. Each one supports English, Chinese, or both.",
	},
	{
		id: "03",
		title: "Let AI write your story",
		description:
			"Answer a few questions and our AI will generate your love story and wedding details instantly.",
	},
	{
		id: "04",
		title: "Customize & Personalize",
		description:
			"Upload your photos, tweak the colors, and make it truly yours.",
	},
	{
		id: "05",
		title: "Share with one tap",
		description:
			"Send via WhatsApp to all your guests. Track RSVPs in real-time.",
	},
];

export function HowItWorks({ reducedMotion }: { reducedMotion: boolean }) {
	const sectionRef = useRef<HTMLElement>(null);
	useScrollReveal(reducedMotion, sectionRef);

	return (
		// biome-ignore lint/correctness/useUniqueElementIds: stable hash target for in-page navigation links
		<section
			ref={sectionRef}
			className="py-24 lg:py-32 bg-white"
			id="how-it-works"
		>
			<div className="dm-container">
				<div className="max-w-3xl mx-auto text-center mb-20 dm-reveal">
					<span className="text-dm-primary font-semibold tracking-wider text-sm uppercase mb-4 block">
						Process
					</span>
					<h2 className="text-heading mb-6">
						From idea to invitation in minutes.
					</h2>
					<p className="text-body-lg">
						We&apos;ve simplified the traditional wedding card process into five
						easy steps.
					</p>
				</div>

				<div className="relative max-w-4xl mx-auto">
					{/* Vertical line connecting steps */}
					<div className="absolute left-[28px] md:left-1/2 top-4 bottom-4 w-px bg-dm-border -translate-x-1/2 hidden md:block" />
					<div className="absolute left-[28px] top-4 bottom-4 w-px bg-dm-border -translate-x-1/2 md:hidden" />

					{STEPS.map((step, i) => (
						<div
							key={step.id}
							className="relative mb-12 last:mb-0 md:flex md:justify-between items-center group dm-reveal-child"
						>
							{/* Step Number Bubble */}
							<div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white border-4 border-dm-water text-dm-primary font-display font-bold text-xl flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform duration-300">
								{step.id}
							</div>

							{/* Content - Left or Right based on index */}
							<div
								className={`ml-20 md:ml-0 md:w-[42%] ${i % 2 === 0 ? "md:mr-auto md:text-right" : "md:ml-auto md:text-left"}`}
							>
								<h3 className="text-xl font-display font-semibold text-dm-ink mb-2">
									{step.title}
								</h3>
								<p className="text-body text-sm">{step.description}</p>
							</div>

							{/* Empty spacer for the other side */}
							<div className="hidden md:block md:w-[42%]" />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
