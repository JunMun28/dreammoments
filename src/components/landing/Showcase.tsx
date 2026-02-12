import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

const templates = [
	{
		id: "love-at-dusk",
		title: "Love at Dusk",
		desc: "A cinematic, twilight-inspired theme for the romantic soul.",
		photo:
			"https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop",
		theme: "Cinematic",
	},
	{
		id: "garden-romance",
		title: "Garden Romance",
		desc: "Soft florals and natural light for an outdoor celebration.",
		photo:
			"https://images.unsplash.com/photo-1519225448526-06451554c289?q=80&w=800&auto=format&fit=crop",
		theme: "Natural",
	},
	{
		id: "eternal-elegance",
		title: "Eternal Elegance",
		desc: "Timeless black and gold sophistication.",
		photo:
			"https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop",
		theme: "Classic",
	},
];

export function Showcase({ reducedMotion }: { reducedMotion: boolean }) {
	const sectionRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (reducedMotion) return;

		// Optional: Add simple parallax or fade-in logic here if needed beyond CSS
	}, [reducedMotion]);

	return (
		// biome-ignore lint/correctness/useUniqueElementIds: stable hash target for in-page navigation links
		<section
			id="templates"
			className="relative py-24 lg:py-32 bg-dm-surface-muted overflow-hidden"
			ref={sectionRef}
		>
			<div className="dm-container relative z-10">
				<div className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
					<span className="text-dm-primary font-medium tracking-widest uppercase text-sm mb-4 block animate-fade-in">
						The Collection
					</span>
					<h2 className="text-display text-4xl md:text-5xl lg:text-6xl mb-6 text-dm-ink animate-fade-up">
						Choose Your Style
					</h2>
					<p className="text-body-lg animate-fade-up delay-100">
						Start with a professionally designed template, then customize every
						detail to match your wedding theme.
					</p>
				</div>

				{/* Cinematic Grid */}
				<div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-20">
					{templates.map((template, i) => (
						<div
							key={template.id}
							className={`group relative aspect-[3/4] md:aspect-[2/3] rounded-sm overflow-hidden bg-gray-100 cursor-pointer animate-fade-up`}
							style={{ animationDelay: `${i * 200}ms` }}
						>
							<img
								src={template.photo}
								alt={template.title}
								className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:contrast-[1.1] ${!reducedMotion ? "grayscale-[20%] group-hover:grayscale-0" : ""}`}
							/>

							{/* Overlay Content */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-500 flex flex-col justify-end p-8 text-white">
								<div className="transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
									<span className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2 block border-l-2 border-white/50 pl-3">
										{template.theme}
									</span>
									<h3 className="text-3xl font-display mb-2">
										{template.title}
									</h3>
									<p className="text-white/80 text-sm leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 hidden md:block">
										{template.desc}
									</p>
									<div className="flex items-center gap-2 text-sm font-medium border-b border-white/30 pb-1 w-max opacity-80 group-hover:opacity-100">
										Preview Template
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											className="group-hover:translate-x-1 transition-transform"
										>
											<title>Arrow right</title>
											<path d="M5 12h14" />
											<path d="m12 5 7 7-7 7" />
										</svg>
									</div>
								</div>
							</div>

							<Link
								to="/invite/$slug"
								params={{ slug: `${template.id}-sample` }}
								className="absolute inset-0 z-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
								aria-label={`View ${template.title} template`}
							/>
						</div>
					))}
				</div>

				{/* Bottom CTA */}
				<div className="text-center animate-fade-in delay-500">
					<p className="text-dm-ink-muted mb-6">Not sure which one to pick?</p>
					<Link
						to="/auth/signup"
						className="dm-button-secondary border-dm-ink/20 hover:border-dm-ink text-dm-ink px-8 py-3"
					>
						Try them all for free
					</Link>
				</div>
			</div>
		</section>
	);
}
