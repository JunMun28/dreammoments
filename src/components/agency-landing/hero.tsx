"use client";

import { motion } from "motion/react";
import { useLandingTheme } from "./theme-context";

const HERO_IMAGES = [
	{
		src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600&auto=format&fit=crop",
		alt: "Happy Asian couple laughing",
		rotate: -6,
		scale: 1,
		position: "top-[15%] left-[5%] md:left-[10%]",
		zIndex: 1,
	},
	{
		src: "https://images.unsplash.com/photo-1621621667797-e06afc217fb0?q=80&w=600&auto=format&fit=crop",
		alt: "Couple holding hands running",
		rotate: 8,
		scale: 1.1,
		position: "bottom-[20%] right-[5%] md:right-[8%]",
		zIndex: 2,
	},
	{
		src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop",
		alt: "Wedding details pastel flatlay",
		rotate: -12,
		scale: 0.9,
		position: "bottom-[10%] left-[8%] md:left-[15%]",
		zIndex: 0,
	},
];

export function Hero() {
	const { resolvedTheme } = useLandingTheme();
	const _isDark = resolvedTheme === "dark";

	return (
		// biome-ignore lint/correctness/useUniqueElementIds: stable hash target for in-page navigation
		<section
			id="hero"
			className="hero relative h-screen w-full bg-background overflow-hidden flex items-center justify-center"
		>
			<div className="relative z-10 flex flex-col items-center text-center px-4">
				<h1 className="text-[clamp(3rem,8vw,12rem)] leading-[1.05] tracking-tight text-foreground drop-shadow-sm">
					<span className="block overflow-hidden pb-[0.1em]">
						<motion.span
							className="block"
							initial={{ y: "120%", rotateX: -90, z: -200, opacity: 0 }}
							animate={{ y: 0, rotateX: 0, z: 0, opacity: 1 }}
							transition={{
								duration: 1.6,
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
								duration: 1.6,
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
								duration: 1.6,
								ease: [0.22, 1, 0.36, 1],
								delay: 0.7,
							}}
							style={{
								transformOrigin: "center bottom",
								transformStyle: "preserve-3d",
							}}
						>
							<em className="font-serif text-[color:var(--dm-primary)]">
								your love story.
							</em>
						</motion.span>
					</span>
				</h1>

				<motion.p
					className="mt-8 max-w-md text-[clamp(1.125rem,1.5vw,1.75rem)] leading-relaxed text-foreground/80 lg:max-w-lg 2xl:max-w-xl"
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
				{HERO_IMAGES.map((img, index) => (
					<motion.div
						key={img.src}
						className={`absolute ${img.position} w-48 h-64 md:w-64 md:h-80 bg-white p-2 rounded-2xl shadow-xl border border-[color:var(--dm-border)]`}
						style={{ zIndex: img.zIndex }}
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
							y: [0, index % 2 === 0 ? -15 : 15, 0],
						}}
						transition={{
							opacity: { duration: 1, delay: 1.5 + index * 0.2 },
							x: { duration: 1.2, delay: 1.5 + index * 0.2, ease: "easeOut" },
							rotate: { duration: 1.2, delay: 1.5 + index * 0.2 },
							scale: { duration: 1.2, delay: 1.5 + index * 0.2 },
							y: {
								repeat: Number.POSITIVE_INFINITY,
								duration: 5 + index,
								ease: "easeInOut",
								delay: index * 0.5,
							},
						}}
					>
						<div className="relative w-full h-full overflow-hidden rounded-xl">
							<img
								src={img.src}
								alt={img.alt}
								className="w-full h-full object-cover"
							/>
							<div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-xl" />
						</div>
					</motion.div>
				))}
			</div>

			<motion.div
				className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1.2, delay: 2 }}
			>
				<span className="text-lg tracking-tight font-medium text-foreground/80">
					Scroll
				</span>
			</motion.div>
		</section>
	);
}
