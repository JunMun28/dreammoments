"use client";

import { motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { useLandingTheme } from "./theme-context";

const HERO_IMAGES = [
	{
		src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600&auto=format&fit=crop",
		alt: "Happy Asian couple laughing",
		rotate: -6,
		scale: 1,
		position: "top-[15%] left-[2%] md:left-[5%] lg:left-[8%] xl:left-[10%]",
		zIndex: 1,
		parallax: 20,
	},
	{
		src: "https://images.unsplash.com/photo-1621621667797-e06afc217fb0?q=80&w=600&auto=format&fit=crop",
		alt: "Couple holding hands running",
		rotate: 8,
		scale: 1.1,
		position: "bottom-[20%] right-[2%] md:right-[5%] lg:right-[8%] xl:right-[10%]",
		zIndex: 2,
		parallax: -30,
	},
	{
		src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop",
		alt: "Wedding details pastel flatlay",
		rotate: -12,
		scale: 0.9,
		position: "bottom-[10%] left-[5%] md:left-[8%] lg:left-[12%] xl:left-[15%]",
		zIndex: 0,
		parallax: 15,
	},
];

export function Hero() {
	const { resolvedTheme } = useLandingTheme();
	const _isDark = resolvedTheme === "dark";

	// Mouse parallax setup
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			// Normalize mouse position from -1 to 1
			mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
			mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
		};
		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, [mouseX, mouseY]);

	// Create individual transforms for each image at the top level
	const x1 = useTransform(
		mouseX,
		[-1, 1],
		[HERO_IMAGES[0].parallax * -1, HERO_IMAGES[0].parallax],
	);
	const y1 = useTransform(
		mouseY,
		[-1, 1],
		[HERO_IMAGES[0].parallax * -1, HERO_IMAGES[0].parallax],
	);

	const x2 = useTransform(
		mouseX,
		[-1, 1],
		[HERO_IMAGES[1].parallax * -1, HERO_IMAGES[1].parallax],
	);
	const y2 = useTransform(
		mouseY,
		[-1, 1],
		[HERO_IMAGES[1].parallax * -1, HERO_IMAGES[1].parallax],
	);

	const x3 = useTransform(
		mouseX,
		[-1, 1],
		[HERO_IMAGES[2].parallax * -1, HERO_IMAGES[2].parallax],
	);
	const y3 = useTransform(
		mouseY,
		[-1, 1],
		[HERO_IMAGES[2].parallax * -1, HERO_IMAGES[2].parallax],
	);

	const transforms = [
		{ x: x1, y: y1 },
		{ x: x2, y: y2 },
		{ x: x3, y: y3 },
	];

	return (
		// biome-ignore lint/correctness/useUniqueElementIds: stable hash target for in-page navigation
		<section
			id="hero"
			className="hero relative h-screen w-full bg-background overflow-hidden flex items-center justify-center"
		>
			<div className="relative z-10 flex flex-col items-center text-center px-6 sm:px-12 md:px-16 lg:px-24 max-w-5xl mx-auto">
				<h1 className="text-[clamp(3rem,8vw,12rem)] leading-[1.02] tracking-[-0.02em] text-foreground [text-shadow:0_1px_2px_rgba(0,0,0,0.12),0_2px_8px_rgba(255,255,255,0.9)]">
					<span className="block overflow-hidden pb-[0.1em]">
						<motion.span
							className="block"
							initial={{ y: "120%", rotateX: -90, z: -200, opacity: 0 }}
							animate={{ y: 0, rotateX: 0, z: 0, opacity: 1 }}
							transition={{
								duration: 1.2,
								ease: [0.22, 1, 0.36, 1],
								delay: 0.3,
							}}
							style={{
								transformOrigin: "center bottom",
								transformStyle: "preserve-3d",
							}}
						>
							Wedding pages
						</motion.span>
					</span>
					<span className="block overflow-hidden pb-[0.1em]">
						<motion.span
							className="block"
							initial={{ y: "120%", rotateX: -90, z: -200, opacity: 0 }}
							animate={{ y: 0, rotateX: 0, z: 0, opacity: 1 }}
							transition={{
								duration: 1.2,
								ease: [0.22, 1, 0.36, 1],
								delay: 0.5,
							}}
							style={{
								transformOrigin: "center bottom",
								transformStyle: "preserve-3d",
							}}
						>
							that feel like
						</motion.span>
					</span>
					<span className="block overflow-hidden pb-[0.1em]">
						<motion.span
							className="block"
							initial={{ y: "120%", rotateX: -90, z: -200, opacity: 0 }}
							animate={{ y: 0, rotateX: 0, z: 0, opacity: 1 }}
							transition={{
								duration: 1.2,
								ease: [0.22, 1, 0.36, 1],
								delay: 0.7,
							}}
							style={{
								transformOrigin: "center bottom",
								transformStyle: "preserve-3d",
							}}
						>
							<em className="font-serif text-transparent bg-clip-text bg-gradient-to-r from-[color:var(--dm-primary)] via-[#ff9e99] to-[color:var(--dm-primary)] animate-shimmer bg-[length:200%_100%]">
								your love story.
							</em>
						</motion.span>
					</span>
				</h1>

				<motion.p
					className="mt-10 md:mt-12 lg:mt-14 max-w-md text-[clamp(1.125rem,1.5vw,1.75rem)] leading-[1.6] text-foreground/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.08),0_1px_4px_rgba(255,255,255,0.8)] lg:max-w-lg 2xl:max-w-xl"
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 1, ease: [0.25, 1, 0.5, 1], delay: 1.2 }}
				>
					DreamMoments helps you design invitation pages, collect RSVPs, and
					coordinate guests in one beautiful flow.
				</motion.p>
			</div>

			{/* Masonry Grid Floating Images */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				{HERO_IMAGES.map((img, index) => {
					const { y } = transforms[index] || { y: 0 };
					return (
						<motion.div
							key={img.src}
							className={`absolute ${img.position} w-40 h-52 sm:w-48 sm:h-64 md:w-64 md:h-80 bg-white p-2 rounded-2xl shadow-xl border border-[color:var(--dm-border)] opacity-60 hover:opacity-100 transition-opacity duration-500 pointer-events-auto`}
							style={{ zIndex: img.zIndex, y }}
							initial={{
								opacity: 0,
								x: index % 2 === 0 ? -100 : 100,
								rotate: img.rotate * 2,
								scale: 0.8,
							}}
							animate={{
								opacity: 1,
								x: 0,
								rotate: img.rotate,
								scale: img.scale,
							}}
							transition={{
								opacity: { duration: 1, delay: 1.5 + index * 0.2 },
								rotate: { duration: 1.2, delay: 1.5 + index * 0.2 },
								scale: { duration: 1.2, delay: 1.5 + index * 0.2 },
							}}
						>
							<div className="relative w-full h-full overflow-hidden rounded-xl">
								<img
									src={img.src}
									alt={img.alt}
									loading="eager"
									className="w-full h-full object-cover"
								/>
								<div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-xl" />
							</div>
						</motion.div>
					);
				})}
			</div>

			<motion.div
				className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1.2, delay: 2 }}
			>
				<span className="text-xs tracking-[0.2em] uppercase font-medium text-foreground/60">
					Scroll
				</span>
				<motion.div
					className="w-[1px] h-12 bg-gradient-to-b from-foreground/80 to-transparent"
					initial={{ scaleY: 0, transformOrigin: "top" }}
					animate={{
						scaleY: [1, 1.15, 1],
						opacity: [0.8, 1, 0.8],
					}}
					transition={{
						duration: 2,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				/>
			</motion.div>
		</section>
	);
}
