import { Link } from "@tanstack/react-router";
import { animate, scroll } from "motion";
import { useEffect, useRef, useState } from "react";

const photos = [
	{
		src: "/photos/landing/showcase-ceremony.jpg",
		alt: "Tea ceremony moment under a tropical pavilion",
	},
	{
		src: "/photos/landing/showcase-laughter.jpg",
		alt: "Couple laughing together in a tropical garden",
	},
	{
		src: "/photos/landing/showcase-details.jpg",
		alt: "Wedding details with rings and tropical flowers",
	},
	{
		src: "/photos/landing/showcase-reception.jpg",
		alt: "Reception dinner under string lights",
	},
];

export function Showcase() {
	const sectionRef = useRef<HTMLElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const [scrollDistance, setScrollDistance] = useState(0);

	useEffect(() => {
		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReducedMotion) return;

		const track = trackRef.current;
		const section = sectionRef.current;
		if (!track || !section) return;

		let scrollCleanup: VoidFunction | undefined;

		const setup = () => {
			scrollCleanup?.();
			const dist = track.scrollWidth - window.innerWidth;
			setScrollDistance(dist);
			scrollCleanup = scroll(
				animate(
					track,
					{ transform: ["translateX(0)", `translateX(-${dist}px)`] },
					{ ease: "linear" },
				),
				{ target: section },
			);
		};

		setup();

		window.addEventListener("resize", setup);
		return () => {
			scrollCleanup?.();
			window.removeEventListener("resize", setup);
		};
	}, []);

	return (
		// biome-ignore lint/correctness/useUniqueElementIds: scroll navigation anchor
		<section
			ref={sectionRef}
			id="showcase"
			className="bg-background relative"
			style={{ height: `calc(100vh + ${scrollDistance}px)` }}
		>
			<div className="sticky top-0 h-[100svh] overflow-hidden">
				<div
					ref={trackRef}
					className="flex h-full w-max items-center gap-6 pl-[8vw] pr-[4vw]"
				>
					{/* Intro text panel */}
					<div className="flex h-[70vh] w-[35vw] shrink-0 flex-col justify-center lg:w-[25vw]">
						<p className="font-script text-gold text-3xl sm:text-4xl md:text-5xl">
							Our templates
						</p>
						<h2 className="font-heading text-foreground mt-4 text-[clamp(2rem,4vw,4rem)] leading-[1.1] tracking-tight">
							Every detail, effortlessly yours
						</h2>
					</div>

					{/* Photo cards */}
					{photos.map((photo) => (
						<div
							key={photo.src}
							className="group relative h-[70vh] w-[70vw] shrink-0 overflow-hidden rounded-2xl sm:w-[55vw] lg:w-[42vw]"
						>
							<img
								src={photo.src}
								alt={photo.alt}
								loading="lazy"
								className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
							{/* Bottom gradient overlay */}
							<div
								className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent"
								aria-hidden="true"
							/>
						</div>
					))}

					{/* Template preview card */}
					<div className="flex h-[70vh] w-[70vw] shrink-0 flex-col items-center justify-center rounded-2xl border border-border bg-muted px-8 text-center sm:w-[55vw] lg:w-[42vw]">
						<p className="font-script text-gold text-2xl sm:text-3xl">
							See it in action
						</p>
						<h3 className="font-heading text-foreground mt-3 text-2xl sm:text-3xl md:text-4xl leading-tight tracking-tight">
							One invitation. Every detail.
						</h3>
						<p className="text-muted-foreground mt-4 max-w-md text-base leading-relaxed sm:text-lg">
							Bilingual invitations, built-in RSVP, and personal messaging —
							everything your guests need, beautifully presented.
						</p>
						<Link
							to="/editor/new"
							search={{ template: "double-happiness" }}
							className="mt-8 inline-block rounded-full border-2 border-gold px-8 py-3 text-sm font-semibold text-gold transition-colors duration-300 hover:bg-gold hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--agency-ring)]"
						>
							Try it free
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
