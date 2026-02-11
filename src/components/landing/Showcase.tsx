import { Link } from "@tanstack/react-router";
import { MeshGradientBackground } from "./MeshGradientBackground";
import { SectionHeader } from "./motifs/SectionHeader";
import { PerspectiveCardStack } from "./PerspectiveCardStack";

const templates = [
	{
		id: "garden-romance",
		title: "Garden Romance",
		desc: "Chinese tradition with modern warmth.",
		photo: "/photos/golden-hour.jpg",
		alt: "Garden Romance template preview",
		culturalBadge: "Chinese Traditional",
		bilingual: true,
	},
	{
		id: "blush-romance",
		title: "Blush Romance",
		desc: "Soft, sun-drenched romance.",
		photo: "/photos/floral-detail.jpg",
		alt: "Blush Romance template preview",
		culturalBadge: null,
		bilingual: false,
	},
	{
		id: "love-at-dusk",
		title: "Love at Dusk",
		desc: "Twilight elegance for evening vows.",
		photo: "/photos/couple-walking.jpg",
		alt: "Love at Dusk template preview",
		culturalBadge: null,
		bilingual: false,
	},
	{
		id: "eternal-elegance",
		title: "Eternal Elegance",
		desc: "Timeless black and gold sophistication.",
		photo: "/photos/golden-hour.jpg",
		alt: "Eternal Elegance template preview",
		culturalBadge: "Chinese Modern",
		bilingual: true,
	},
];

export function Showcase({ reducedMotion }: { reducedMotion: boolean }) {
	return (
		<section
			id="templates"
			className="relative overflow-hidden scroll-mt-20"
			style={{
				background: "var(--dm-bg)",
				padding: "clamp(5rem, 10vw, 10rem) 0",
			}}
		>
			{/* Mesh gradient background */}
			<div className="absolute inset-0 pointer-events-none" aria-hidden="true">
				<MeshGradientBackground
					variant="warm"
					className="h-full"
					reducedMotion={reducedMotion}
				>
					<div />
				</MeshGradientBackground>
			</div>

			<div className="relative z-10 mx-auto max-w-7xl px-6">
				<SectionHeader
					kickerEn="THE COLLECTION"
					kickerCn="四款精选"
					title="Four templates. One for every love story."
					kickerColor="var(--dm-crimson)"
					reducedMotion={reducedMotion}
				/>

				{/* Card gallery with ambient glow */}
				<div className="relative">
					{/* Ambient glow behind cards */}
					<div
						className="pointer-events-none absolute inset-0 -inset-x-12 -inset-y-8"
						aria-hidden="true"
						style={{
							background:
								"radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,64,64,0.08) 0%, rgba(212,184,122,0.06) 40%, transparent 70%)",
							filter: "blur(40px)",
						}}
					/>
					<PerspectiveCardStack
						templates={templates}
						reducedMotion={reducedMotion}
					/>
				</div>

				{/* See a live invitation link */}
				<div data-scroll-reveal className="mt-10 text-center">
					<Link
						to="/invite/$slug"
						params={{ slug: "garden-romance-sample" }}
						className="dm-reveal inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-300 hover:bg-[var(--dm-crimson)]/5"
						style={{
							border: "1.5px solid var(--dm-crimson)",
							color: "var(--dm-crimson)",
						}}
					>
						See a live invitation
						<span aria-hidden="true">&rarr;</span>
					</Link>
				</div>
			</div>
		</section>
	);
}
