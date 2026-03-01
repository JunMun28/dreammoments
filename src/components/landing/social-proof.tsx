"use client";

import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger);
}

function ArrowIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M7 17L17 7M17 7H7M17 7V17"
			/>
		</svg>
	);
}

function QuoteIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
		</svg>
	);
}

export function SocialProof() {
	const sectionRef = useRef<HTMLElement>(null);
	const headerRef = useRef<HTMLDivElement>(null);
	const gridRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!sectionRef.current) return;

		const ctx = gsap.context(() => {
			// Header animation
			gsap.fromTo(
				headerRef.current,
				{ y: 40, opacity: 0 },
				{
					y: 0,
					opacity: 1,
					duration: 1,
					ease: "power3.out",
					scrollTrigger: {
						trigger: sectionRef.current,
						start: "top 75%",
						end: "top 50%",
						scrub: 1,
					},
				},
			);

			const cards = gridRef.current?.children;
			if (cards) {
				gsap.fromTo(
					cards,
					{ y: 80, opacity: 0, scale: 0.95 },
					{
						y: 0,
						opacity: 1,
						scale: 1,
						duration: 0.8,
						ease: "power3.out",
						stagger: 0.1,
						scrollTrigger: {
							trigger: gridRef.current,
							start: "top 80%",
							end: "top 40%",
							scrub: 1,
						},
					},
				);
			}
		}, sectionRef);

		return () => ctx.revert();
	}, []);

	return (
		// biome-ignore lint/correctness/useUniqueElementIds: stable hash target for in-page navigation
		<section
			ref={sectionRef}
			id="social-proof"
			className="bg-background py-24 lg:py-32"
		>
			<div className="px-6 sm:px-12 lg:px-24 max-w-[90rem] 2xl:max-w-[112.5rem] min-[120rem]:max-w-[137.5rem] mx-auto">
				<div
					ref={headerRef}
					className="flex items-center justify-between mb-12 lg:mb-16"
				>
					<h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-foreground">
						Loved by modern couples
					</h2>
					<Link
						to="/editor/new"
						search={{ template: "double-happiness" }}
						className="hidden sm:inline-flex items-center justify-center px-6 py-3 rounded-full bg-dm-primary text-dm-primary-text text-sm font-medium transition-colors hover:bg-dm-primary-hover"
					>
						Start your invite
					</Link>
				</div>

				<div
					ref={gridRef}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:grid-rows-[minmax(220px,auto)_minmax(220px,auto)_minmax(180px,auto)]"
				>
					<div className="row-span-2 flex flex-col gap-4">
						<div className="relative flex-1 w-full overflow-hidden rounded-2xl">
							<img
								src="/img/mock-project1.webp"
								alt="Wedding memory collage"
								className="h-full w-full object-cover"
								loading="lazy"
							/>
						</div>
						<div className="relative flex-1 w-full overflow-hidden rounded-full">
							<img
								src="/img/mock-project2.webp"
								alt="Bride and groom portrait"
								className="h-full w-full object-cover"
								loading="lazy"
							/>
						</div>
					</div>

					<div className="lg:col-span-2 row-span-2 bg-muted/50 rounded-2xl p-8 flex flex-col">
						<div>
							<QuoteIcon className="w-10 h-10 text-foreground/20 mb-6" />
							<blockquote className="text-2xl lg:text-3xl font-medium leading-snug text-foreground">
								DreamMoments made our invitation feel personal and premium. Our
								families RSVP&apos;d without calling us once.
							</blockquote>
							<div className="mt-6">
								<p className="font-semibold text-foreground">Mei Lin Tan</p>
								<p className="text-sm text-foreground/60">
									Bride, Kuala Lumpur
								</p>
							</div>
						</div>
						<div className="flex items-center justify-between mt-auto pt-8">
							<span className="text-xl font-semibold text-foreground">
								DreamMoments
							</span>
							<a
								href="#projects"
								className="w-10 h-10 rounded-full bg-dm-primary/20 flex items-center justify-center hover:bg-dm-primary hover:text-dm-primary-text transition-colors text-foreground"
							>
								<ArrowIcon className="w-4 h-4" />
							</a>
						</div>
					</div>

					<div className="bg-muted/50 rounded-2xl p-6 flex flex-col">
						<div className="flex-1">
							<p className="text-3xl font-semibold text-foreground">84%</p>
							<p className="text-sm text-foreground/60 mt-1">
								RSVP within 48 hours
							</p>
						</div>
						<div className="flex items-center justify-between mt-auto pt-4">
							<span className="text-sm font-medium text-foreground">
								Guest Flow
							</span>
							<a
								href="#services-menu"
								className="w-10 h-10 rounded-full bg-dm-primary/20 flex items-center justify-center hover:bg-dm-primary hover:text-dm-primary-text transition-colors text-foreground"
							>
								<ArrowIcon className="w-4 h-4" />
							</a>
						</div>
					</div>

					<div className="bg-muted/50 rounded-2xl p-6 flex flex-col">
						<div className="flex-1">
							<p className="text-3xl font-semibold text-foreground">3 hrs</p>
							<p className="text-sm text-foreground/60 mt-1">
								Saved weekly on guest coordination
							</p>
						</div>
						<div className="flex items-center justify-between mt-auto pt-4">
							<span className="text-sm font-medium text-foreground">
								Planning Time
							</span>
							<a
								href="#faq"
								className="w-10 h-10 rounded-full bg-dm-primary/20 flex items-center justify-center hover:bg-dm-primary hover:text-dm-primary-text transition-colors text-foreground"
							>
								<ArrowIcon className="w-4 h-4" />
							</a>
						</div>
					</div>

					<div className="bg-muted/50 rounded-2xl p-8 flex flex-col">
						<div className="flex-1">
							<p className="text-3xl lg:text-4xl font-semibold text-foreground">
								Top 1%
							</p>
							<p className="text-foreground/60 mt-2">
								Recommended by modern wedding planners
							</p>
						</div>
						<div className="mt-auto pt-6">
							<p className="text-sm font-medium text-foreground">
								5.0 average client rating
							</p>
						</div>
					</div>

					<div className="lg:col-span-3 bg-muted/50 rounded-2xl p-8 flex flex-col">
						<p className="text-xl lg:text-2xl font-medium leading-relaxed text-foreground max-w-3xl flex-1">
							From first draft to wedding week, DreamMoments helps couples stay
							calm, clear, and beautifully organized.
						</p>
						<div className="flex items-center justify-between mt-auto pt-6">
							<span className="text-xl font-semibold text-foreground">
								DreamMoments
							</span>
							<a
								href="#hero"
								className="w-10 h-10 rounded-full bg-dm-primary/20 flex items-center justify-center hover:bg-dm-primary hover:text-dm-primary-text transition-colors text-foreground"
							>
								<ArrowIcon className="w-4 h-4" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
