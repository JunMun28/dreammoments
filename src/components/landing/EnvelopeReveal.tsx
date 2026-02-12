import { useEffect, useRef } from "react";

export function EnvelopeReveal({ reducedMotion }: { reducedMotion: boolean }) {
	const sectionRef = useRef<HTMLDivElement>(null);
	const envelopeRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const sealRef = useRef<HTMLDivElement>(null);
	const flapRef = useRef<HTMLDivElement>(null);
	const hintRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (reducedMotion) return;

		let ctx: gsap.Context;

		const initScroll = async () => {
			const gsap = (await import("gsap")).default;
			const { ScrollTrigger } = await import("gsap/ScrollTrigger");
			gsap.registerPlugin(ScrollTrigger);

			ctx = gsap.context(() => {
				const tl = gsap.timeline({
					scrollTrigger: {
						trigger: sectionRef.current,
						start: "top top",
						end: "+=250%",
						scrub: 1,
						pin: true,
						anticipatePin: 1,
					},
				});

				// 0. Fade out hint immediately
				tl.to(
					hintRef.current,
					{
						opacity: 0,
						duration: 0.2,
					},
					0,
				);

				// 1. Zoom in and rotate slightly
				tl.to(
					envelopeRef.current,
					{
						scale: 1.2,
						rotateX: 10,
						duration: 1,
						ease: "power2.inOut",
					},
					0,
				);

				// 2. Pop the seal
				tl.to(
					sealRef.current,
					{
						scale: 1.2,
						opacity: 0,
						duration: 0.3,
						ease: "back.in(2)",
					},
					"-=0.2",
				);

				// 3. Open the flap
				tl.to(
					flapRef.current,
					{
						rotateX: 180,
						duration: 1,
						ease: "power2.inOut",
					},
					"-=0.2",
				);

				// 4. Slide out the card content - adjusted to center properly
				tl.to(
					contentRef.current,
					{
						y: "-115%", // Reduced move distance slightly
						zIndex: 20,
						duration: 1.5,
						ease: "power2.out",
					},
					"-=0.5",
				);

				// 5. Expand content to fill screen - reduced scale to prevent overflow
				tl.to(contentRef.current, {
					scale: 1.05,
					duration: 1,
					ease: "power2.out",
				});

				// 6. Fade out envelope
				tl.to(
					envelopeRef.current,
					{
						opacity: 0,
						scale: 1.5,
						duration: 1,
					},
					"-=1",
				);
			}, sectionRef);
		};

		const timer = setTimeout(() => requestAnimationFrame(initScroll), 100);

		return () => {
			clearTimeout(timer);
			ctx?.revert();
		};
	}, [reducedMotion]);

	return (
		<section
			ref={sectionRef}
			className="h-screen w-full bg-dm-bg overflow-hidden flex items-center justify-center perspective relative"
		>
			{/* 3D Container - Changed to Portrait Aspect Ratio [3/4] for better text fit */}
			<div
				ref={envelopeRef}
				className="relative w-[320px] md:w-[480px] aspect-[3/4] bg-dm-surface shadow-2xl z-10 origin-center preserve-3d"
			>
				<div className="absolute inset-0 bg-[#f8f5f2] border border-dm-border/50" />

				{/* Texture Overlay */}
				<div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

				{/* Flap (Top) */}
				<div
					ref={flapRef}
					className="absolute top-0 left-0 w-full h-[50%] bg-[#efedea] origin-top border-b border-dm-border/20 z-30 transition-shadow shadow-md"
					style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
				>
					<div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
				</div>

				{/* Wax Seal */}
				<div
					ref={sealRef}
					className="absolute top-[45%] left-1/2 -translate-x-1/2 z-40 w-16 h-16 bg-dm-primary rounded-full shadow-lg flex items-center justify-center border-4 border-dm-primary-hover"
				>
					<span className="font-display text-white font-bold text-xl italic">
						DM
					</span>
				</div>

				{/* Bottom Pocket */}
				<div
					className="absolute bottom-0 left-0 w-full h-[60%] bg-[#f8f5f2] z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] border-t border-white/50"
					style={{
						clipPath: "polygon(0 100%, 100% 100%, 100% 0, 50% 20%, 0 0)",
					}}
				>
					<div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
				</div>

				{/* The Card (Content) - Improved styling for density */}
				<div
					ref={contentRef}
					className="absolute inset-x-3 md:inset-x-5 h-[94%] bg-white rounded-lg shadow-sm border border-dm-border/50 top-[100%] flex flex-col items-center text-center p-6 md:p-8 z-0 overflow-hidden"
				>
					<p className="text-dm-primary font-medium tracking-widest uppercase text-[10px] md:text-xs mb-3 md:mb-4 pt-2">
						You are invited to the journey of
					</p>
					<h2 className="font-display text-3xl md:text-5xl text-dm-ink mb-2">
						Sarah & Michael
					</h2>

					<div className="w-full h-px bg-dm-border my-4 md:my-6 max-w-[80px]" />

					<div className="space-y-6 md:space-y-8 w-full flex-grow flex flex-col justify-center">
						<div className="flex flex-col items-center">
							<span className="font-display text-xl md:text-2xl italic text-dm-ink/80 mb-1">
								The First Hello
							</span>
							<p className="text-xs md:text-sm text-dm-ink-muted max-w-[250px] md:max-w-xs leading-relaxed">
								Coffee shop, rainy Tuesday. He ordered tea, she ordered coffee.
							</p>
						</div>
						<div className="flex flex-col items-center">
							<span className="font-display text-xl md:text-2xl italic text-dm-ink/80 mb-1">
								The Yes
							</span>
							<p className="text-xs md:text-sm text-dm-ink-muted max-w-[250px] md:max-w-xs leading-relaxed">
								Under the northern lights in Iceland. Simplest word, easiest
								choice.
							</p>
						</div>
					</div>

					<div className="mt-auto pt-4 md:pt-8 w-full flex flex-col items-center">
						<div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-dm-border mb-3 md:mb-4 shrink-0">
							<img
								src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=200&auto=format&fit=crop"
								alt="Sarah & Michael"
								className="w-full h-full object-cover"
							/>
						</div>
						<p className="font-display text-lg md:text-xl text-dm-ink">
							08 . 24 . 2026
						</p>
					</div>
				</div>
			</div>

			{/* Helper Text */}
			<div
				ref={hintRef}
				className="absolute bottom-10 left-1/2 -translate-x-1/2 text-dm-ink-muted/50 text-sm animate-pulse tracking-widest uppercase font-medium"
			>
				Scroll to Open
			</div>
		</section>
	);
}
