import { useEffect, useRef } from "react";

export function LoveStory({ reducedMotion }: { reducedMotion: boolean }) {
	const sectionRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (reducedMotion || window.innerWidth < 768) return; // Disable GSAP data-scroll on mobile

		let ctx: gsap.Context;

		const initScroll = async () => {
			const gsap = (await import("gsap")).default;
			const { ScrollTrigger } = await import("gsap/ScrollTrigger");
			gsap.registerPlugin(ScrollTrigger);

			ctx = gsap.context(() => {
				const sections = gsap.utils.toArray(".story-card");

				if (sections.length === 0) return;

				gsap.to(sections, {
					xPercent: -100 * (sections.length - 1),
					ease: "none",
					scrollTrigger: {
						trigger: triggerRef.current,
						pin: true,
						scrub: 1,
						snap: {
							snapTo: 1 / (sections.length - 1),
							duration: { min: 0.2, max: 0.3 },
							delay: 0.1,
							ease: "power1.inOut",
						},
						end: () => `+=${(triggerRef.current?.offsetWidth || 0) * 1.5}`, // Extend scroll distance for smoother feel
					},
				});
			}, sectionRef);
		};

		const timer = setTimeout(() => {
			initScroll();
		}, 100); // Small delay to ensure layout is ready

		return () => {
			clearTimeout(timer);
			ctx?.revert();
		};
	}, [reducedMotion]);

	const stories = [
		{
			title: "The First Hello",
			description: "Every love story begins with a spark. Share how you met.",
			img: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop",
			year: "Chapter 01",
		},
		{
			title: "The Yes",
			description: "The moment that changed everything.",
			img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop",
			year: "Chapter 02",
		},
		{
			title: "The Invitation",
			description: "Invite your loved ones to witness your union.",
			img: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800&auto=format&fit=crop",
			year: "Chapter 03",
		},
		{
			title: "Forever",
			description: "Capture memories that last a lifetime.",
			img: "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=800&auto=format&fit=crop",
			year: "Chapter 04",
		},
	];

	return (
		<section
			ref={sectionRef}
			className="bg-dm-bg overflow-hidden relative py-24 md:py-0"
		>
			{/* Header - Static on Mobile, Absolute on Desktop */}
			<div className="md:absolute md:top-20 md:left-20 z-10 px-6 md:px-0 mb-12 md:mb-0">
				<span className="text-dm-primary font-medium tracking-widest uppercase text-sm block mb-2">
					Our Story
				</span>
				<h2 className="text-display text-5xl md:text-6xl text-dm-ink/10 md:text-dm-ink/5 select-none">
					Your Journey
				</h2>
			</div>

			<div
				ref={triggerRef}
				className="md:h-screen w-full flex flex-col md:flex-row md:items-center overflow-x-auto md:overflow-hidden relative no-scrollbar snap-x snap-mandatory md:snap-none"
			>
				{/* Desktop Spacer for Title */}
				<div className="hidden md:block w-[15vw] flex-shrink-0" />

				{/* Cards Container */}
				<div className="flex md:flex-nowrap px-6 md:px-0 gap-6 md:gap-0 pb-12 md:pb-0 w-full md:w-auto overflow-x-auto snap-x snap-mandatory md:snap-none">
					{stories.map((story, i) => (
						<div
							key={i}
							className="story-card w-[85vw] md:w-[45vw] lg:w-[35vw] flex-shrink-0 md:px-12 flex flex-col gap-6 snap-center"
						>
							<span className="text-dm-primary/60 font-medium tracking-widest uppercase text-xs md:text-sm">
								{story.year}
							</span>
							<div className="aspect-[3/4] overflow-hidden rounded-2xl shadow-xl group cursor-pointer relative">
								<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
								<img
									src={story.img}
									alt={story.title}
									className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
								/>
							</div>
							<div>
								<h3 className="text-3xl font-display mb-3 text-dm-ink">
									{story.title}
								</h3>
								<p className="text-dm-ink-muted leading-relaxed max-w-sm text-lg">
									{story.description}
								</p>
							</div>
						</div>
					))}

					{/* Final CTA Card */}
					<div className="story-card w-[85vw] md:w-[45vw] lg:w-[35vw] flex-shrink-0 md:px-12 flex items-center justify-center snap-center bg-dm-surface-muted rounded-3xl mx-6 md:mx-0 p-8 md:p-0 my-auto aspect-[3/4] md:aspect-auto md:h-[60vh]">
						<div className="text-center">
							<h3 className="text-4xl md:text-5xl font-display mb-8 text-dm-ink">
								Ready to start <br /> your chapter?
							</h3>
							<a
								href="/auth/signup"
								className="dm-button-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
							>
								Create Invitation
							</a>
						</div>
					</div>

					{/* Desktop End Spacer */}
					<div className="hidden md:block w-[10vw] flex-shrink-0" />
				</div>
			</div>
		</section>
	);
}
