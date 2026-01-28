import { Camera, Mail, Sparkles } from "lucide-react";

/**
 * SimplifiedFeatures - Condensed 3-feature section.
 * Gold-themed icons on burgundy cards highlighting key platform benefits.
 */
export function SimplifiedFeatures() {
	const features = [
		{
			icon: <Sparkles className="h-8 w-8" />,
			title: "Stunning Design",
			description:
				"Cinematic templates with elegant typography, sparkle effects, and cultural symbolism that make your invitation unforgettable.",
		},
		{
			icon: <Mail className="h-8 w-8" />,
			title: "Easy RSVPs",
			description:
				"Guests respond instantly via a unique link—no login required. Track responses in real-time from your dashboard.",
		},
		{
			icon: <Camera className="h-8 w-8" />,
			title: "Photo Memories",
			description:
				"Share a single upload link with all guests. Collect and curate wedding day photos in one beautiful gallery.",
		},
	];

	return (
		<section className="bg-[#faf8f5] px-6 py-20">
			<div className="mx-auto max-w-5xl">
				{/* Section header */}
				<div className="mb-12 text-center">
					<p className="mb-2 text-sm uppercase tracking-widest text-[#d4af37]">
						Everything You Need
					</p>
					<h2 className="text-3xl font-light text-[#5c1a1b] md:text-4xl">
						Simple. Elegant. Complete.
					</h2>
				</div>

				{/* Feature cards */}
				<div className="grid gap-8 md:grid-cols-3">
					{features.map((feature) => (
						<div
							key={feature.title}
							className="group relative overflow-hidden rounded-xl bg-[#5c1a1b] p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
						>
							{/* Gold gradient accent at top */}
							<div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d4af37]/50 via-[#d4af37] to-[#d4af37]/50" />

							{/* Icon */}
							<div className="mb-4 inline-flex rounded-lg bg-[#d4af37]/10 p-3 text-[#d4af37]">
								{feature.icon}
							</div>

							{/* Title */}
							<h3 className="mb-3 text-xl font-medium text-white">
								{feature.title}
							</h3>

							{/* Description */}
							<p
								className="leading-relaxed text-white/70"
								style={{ fontFamily: "'EB Garamond', serif" }}
							>
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
