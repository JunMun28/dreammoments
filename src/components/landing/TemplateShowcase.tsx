import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { HeroSection } from "@/components/sections/HeroSection";
import { Button } from "@/components/ui/button";
import { getTemplateById } from "@/lib/template-data";

/**
 * TemplateShowcase - Interactive template preview section.
 * Shows mobile/desktop viewport toggle with accurate HeroSection preview.
 */
export function TemplateShowcase() {
	const [isMobile, setIsMobile] = useState(false);
	const template = getTemplateById("crimson-blessings");

	if (!template) return null;

	const features = [
		{
			title: "Cinematic Full-Screen Design",
			description:
				"A breathtaking hero section that sets the tone for your celebration",
		},
		{
			title: "Gold Sparkle Effects",
			description:
				"Delicate animated particles that add magic without distraction",
		},
		{
			title: "Double Happiness Symbol",
			description:
				"Traditional Chinese motif symbolizing marital bliss and fortune",
		},
		{
			title: "Elegant Typography",
			description:
				"Carefully curated fonts that blend Eastern and Western aesthetics",
		},
	];

	return (
		// biome-ignore lint/correctness/useUniqueElementIds: Static ID for anchor navigation from hero section
		<section id="showcase" className="bg-[#faf8f5] px-6 py-20">
			<div className="mx-auto max-w-7xl">
				{/* Section header */}
				<div className="mb-12 text-center">
					<p className="mb-2 text-sm uppercase tracking-widest text-[#d4af37]">
						Featured Template
					</p>
					<h2 className="mb-4 text-3xl font-light text-[#5c1a1b] md:text-4xl">
						Crimson Blessings
					</h2>
					<p className="mx-auto max-w-xl text-stone-600">
						A luxurious design that honors tradition while embracing modern
						elegance
					</p>
				</div>

				{/* Two-column layout */}
				<div className="grid gap-12 lg:grid-cols-2 lg:items-center">
					{/* Preview column */}
					<div className="relative">
						{/* Viewport toggle */}
						<div className="mb-4 flex justify-center gap-2">
							<Button
								variant={!isMobile ? "default" : "outline"}
								size="sm"
								onClick={() => setIsMobile(false)}
								className={
									!isMobile
										? "bg-[#5c1a1b] text-white hover:bg-[#7a2829]"
										: "border-[#5c1a1b]/30 text-[#5c1a1b] hover:bg-[#5c1a1b]/5"
								}
							>
								<Monitor className="mr-2 h-4 w-4" />
								Desktop
							</Button>
							<Button
								variant={isMobile ? "default" : "outline"}
								size="sm"
								onClick={() => setIsMobile(true)}
								className={
									isMobile
										? "bg-[#5c1a1b] text-white hover:bg-[#7a2829]"
										: "border-[#5c1a1b]/30 text-[#5c1a1b] hover:bg-[#5c1a1b]/5"
								}
							>
								<Smartphone className="mr-2 h-4 w-4" />
								Mobile
							</Button>
						</div>

						{/* Preview container */}
						<div
							className={`relative mx-auto overflow-hidden rounded-lg border-4 border-[#d4af37]/30 shadow-2xl transition-all duration-500 ${
								isMobile ? "max-w-[320px]" : "max-w-full"
							}`}
						>
							<div
								className={`${
									isMobile ? "h-[568px]" : "h-[500px]"
								} overflow-hidden`}
							>
								<div
									className={`transform ${isMobile ? "scale-100" : "scale-[0.6] origin-top-left"}`}
									style={{
										width: isMobile ? "100%" : "166.67%",
										height: isMobile ? "100%" : "166.67%",
									}}
								>
									<HeroSection
										partner1Name={template.preview.partner1Name}
										partner2Name={template.preview.partner2Name}
										weddingDate={template.preview.weddingDate}
										heroImageUrl={template.heroImageUrl}
										accentColor={template.accentColor}
										isMobile={isMobile}
										themeVariant={template.themeVariant}
										backgroundColor={template.backgroundColor}
										decorativeElements={template.decorativeElements}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Features column */}
					<div className="space-y-6">
						<h3
							className="text-2xl font-light text-[#5c1a1b]"
							style={{ fontFamily: "'Cinzel Decorative', serif" }}
						>
							Every Detail, Thoughtfully Crafted
						</h3>

						<div className="space-y-4">
							{features.map((feature) => (
								<div
									key={feature.title}
									className="flex items-start gap-4 rounded-lg border border-[#d4af37]/20 bg-white p-4 shadow-sm"
								>
									<div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#d4af37]" />
									<div>
										<h4 className="font-medium text-[#5c1a1b]">
											{feature.title}
										</h4>
										<p className="text-sm text-stone-600">
											{feature.description}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
