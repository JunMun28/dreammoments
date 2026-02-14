"use client";

import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";

function BlurText({ text, delay = 0 }: { text: string; delay?: number }) {
	const words = text.split(" ");

	return (
		<span className="inline-flex flex-wrap">
			{words.map((word, wordIndex) => (
				<span key={wordIndex} className="inline-flex mr-[0.25em]">
					{word.split("").map((char, charIndex) => {
						const totalIndex =
							words.slice(0, wordIndex).join("").length + charIndex + wordIndex;
						return (
							<motion.span
								key={charIndex}
								initial={{ opacity: 0, filter: "blur(12px)" }}
								animate={{ opacity: 1, filter: "blur(0px)" }}
								transition={{
									duration: 0.4,
									delay: delay + totalIndex * 0.03,
									ease: "easeOut",
								}}
								className="inline-block"
							>
								{char}
							</motion.span>
						);
					})}
				</span>
			))}
		</span>
	);
}

export function Hero() {
	return (
		// biome-ignore lint/correctness/useUniqueElementIds: stable hash target for in-page navigation
		<section id="hero" className="relative w-full min-h-svh overflow-hidden">
			<video
				autoPlay
				loop
				muted
				playsInline
				className="absolute inset-0 w-full h-full object-cover"
				poster="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80"
			>
				<source
					src="https://videos.pexels.com/video-files/2746398/2746398-uhd_2560_1440_25fps.mp4"
					type="video/mp4"
				/>
			</video>

			<div className="absolute inset-0 bg-black/20 dark:bg-black/40" />

			<div className="relative z-10 min-h-svh flex flex-col justify-end px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-6 sm:pb-12 lg:pb-16">
				<div className="max-w-[1400px] mx-auto w-full">
					<div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 sm:gap-8 lg:gap-16">
						<div className="flex flex-col items-start">
							<h1 className="text-[clamp(2.25rem,8vw,8rem)] font-medium text-white leading-[1.1] tracking-tight">
								<BlurText text="Create your" delay={0.1} />
								<br />
								<BlurText text="dream invitation" delay={0.5} />
							</h1>

							<motion.a
								href="#projects"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.5, delay: 0.4 }}
								className="mt-4 sm:mt-6 md:mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors cursor-pointer"
							>
								<span className="w-2 h-2 rounded-full bg-white animate-pulse" />
								Scroll
								<ChevronDown className="w-4 h-4" />
							</motion.a>
						</div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							className="flex flex-col items-start lg:items-end gap-3 sm:gap-4 lg:gap-5"
						>
							<p className="text-base sm:text-lg md:text-xl text-white/90 max-w-xs lg:text-right">
								Design beautiful invitations, collect RSVPs, and coordinate
								guests in one flow.
							</p>

							<div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full sm:w-auto">
								<Link
									to="/editor/new"
									search={{ template: "love-at-dusk" }}
									className="flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium transition-colors w-full sm:w-auto cursor-pointer"
								>
									<svg
										className="w-5 h-5 shrink-0"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										aria-hidden="true"
									>
										<title>Create</title>
										<path d="M12 5v14M5 12h14" />
									</svg>
									<span className="font-semibold leading-tight">
										Create invitation
									</span>
								</Link>

								<a
									href="#projects"
									className="flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium transition-colors w-full sm:w-auto cursor-pointer"
								>
									<svg
										className="w-5 h-5 shrink-0"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										aria-hidden="true"
									>
										<title>Templates</title>
										<rect x="3" y="3" width="7" height="7" />
										<rect x="14" y="3" width="7" height="7" />
										<rect x="14" y="14" width="7" height="7" />
										<rect x="3" y="14" width="7" height="7" />
									</svg>
									<span className="font-semibold leading-tight">
										View templates
									</span>
								</a>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
}
