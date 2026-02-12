import { BarChart, Heart, MessageCircle, RefreshCw, Zap } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "./hooks/useScrollReveal";

const FEATURES = [
	{
		title: "AI-Powered Storytelling",
		desc: "Let AI write your love story and wedding details in seconds. Perfect tone, every time.",
		icon: Zap,
		className: "md:col-span-2",
		bgClass: "bg-dm-surface",
	},
	{
		title: "Bilingual Support",
		desc: "Seamlessly switch between English and Chinese. Honor traditions without the translation headache.",
		icon: RefreshCw,
		className: "md:col-span-1",
		bgClass: "bg-dm-surface-muted",
	},
	{
		title: "One-Tap RSVP",
		desc: "Guests reply instantly via WhatsApp. No apps to download, no login required.",
		icon: MessageCircle,
		className: "md:col-span-1",
		bgClass: "bg-dm-surface-muted",
	},
	{
		title: "Digital Ang Bao",
		desc: "Modern gifting made easy. Secure QR codes for guests to send blessings directly.",
		icon: Heart,
		className: "md:col-span-1",
		bgClass: "bg-dm-surface",
	},
	{
		title: "Guest Dashboard",
		desc: "Track dietary requirements, plus-ones, and RSVPs in one beautiful, real-time dashboard.",
		icon: BarChart,
		className: "md:col-span-1",
		bgClass: "bg-dm-surface",
	},
];

export function Features({ reducedMotion }: { reducedMotion: boolean }) {
	const sectionRef = useRef<HTMLElement>(null);
	useScrollReveal(reducedMotion, sectionRef);

	return (
		// biome-ignore lint/correctness/useUniqueElementIds: stable hash target for in-page navigation links
		<section ref={sectionRef} className="py-24 lg:py-32 bg-white" id="features">
			<div className="dm-container">
				<div className="max-w-3xl mx-auto text-center mb-16 dm-reveal">
					<h2 className="text-heading mb-6">
						Everything you need for the{" "}
						<span className="text-dm-primary italic">perfect</span> celebration.
					</h2>
					<p className="text-body-lg">
						Powerful features hidden behind a beautiful, simple interface.
						Designed for modern couples who want less stress and more joy.
					</p>
				</div>

				{/* Bento Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
					{FEATURES.map((feature, i) => (
						<div
							key={feature.title}
							className={cn(
								"group relative p-8 rounded-3xl border border-dm-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dm-reveal-scale",
								feature.className,
								feature.bgClass,
							)}
							style={{ transitionDelay: `${i * 100}ms` }}
						>
							<div className="relative z-10 h-full flex flex-col justify-between">
								<div className="w-12 h-12 rounded-2xl bg-white border border-dm-border flex items-center justify-center text-dm-primary mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
									<feature.icon size={24} />
								</div>

								<div>
									<h3 className="text-xl font-display font-semibold text-dm-ink mb-3">
										{feature.title}
									</h3>
									<p className="text-body text-sm">{feature.desc}</p>
								</div>
							</div>

							{/* Decorative gradient blob */}
							<div className="absolute -top-20 -right-20 w-64 h-64 bg-dm-primary-soft/30 rounded-full blur-3xl group-hover:bg-dm-primary-soft/50 transition-colors duration-500 pointer-events-none" />
						</div>
					))}

					{/* Call to Action Card associated with features */}
					<div
						className="md:col-span-1 bg-dm-primary p-8 rounded-3xl flex flex-col justify-center items-center text-center text-white dm-reveal-scale"
						style={{ transitionDelay: "500ms" }}
					>
						<h3 className="text-2xl font-display font-medium mb-4">
							Ready to start?
						</h3>
						<p className="text-white/80 text-sm mb-6">
							Create your free invitation today.
						</p>
						<a
							href="/auth/signup"
							className="w-full py-3 bg-white text-dm-primary rounded-full font-medium hover:bg-gray-50 transition-colors"
						>
							Get Started
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
