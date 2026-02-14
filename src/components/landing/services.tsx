"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger);
}

function SplitText({ children }: { children: string }) {
	return (
		<>
			{children.split(" ").map((word, wi) => (
				<span key={wi} className="inline-block whitespace-nowrap">
					{word.split("").map((char, ci) => (
						<span key={ci} className="char inline-block">
							{char}
						</span>
					))}
					{wi < children.split(" ").length - 1 && (
						<span className="char inline-block">&nbsp;</span>
					)}
				</span>
			))}
		</>
	);
}

const services = [
	{ id: 1, title: "Story-first Templates" },
	{ id: 2, title: "Smart RSVP Tracking" },
	{ id: 3, title: "Multi-language Invitations" },
	{ id: 4, title: "Guest Messaging & Updates" },
];

function ServiceItem({ title }: { title: string }) {
	const itemRef = useRef<HTMLDivElement>(null);
	const overlayRef = useRef<HTMLDivElement>(null);
	const overlayInnerRef = useRef<HTMLDivElement>(null);
	const charsRef = useRef<HTMLSpanElement[]>([]);

	const animationDefaults = { duration: 0.6, ease: "expo" };

	useEffect(() => {
		if (!itemRef.current) return;

		const ctx = gsap.context(() => {
			gsap.fromTo(
				itemRef.current,
				{ x: -60, opacity: 0 },
				{
					x: 0,
					opacity: 1,
					duration: 0.8,
					ease: "power3.out",
					scrollTrigger: {
						trigger: itemRef.current,
						start: "top 90%",
						end: "top 70%",
						scrub: 1,
					},
				},
			);
		}, itemRef);

		return () => ctx.revert();
	}, []);

	const findClosestEdge = (
		mouseX: number,
		mouseY: number,
		width: number,
		height: number,
	): "top" | "bottom" => {
		const topEdgeDist = (mouseX - width / 2) ** 2 + mouseY ** 2;
		const bottomEdgeDist = (mouseX - width / 2) ** 2 + (mouseY - height) ** 2;
		return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
	};

	const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
		if (!itemRef.current || !overlayRef.current || !overlayInnerRef.current)
			return;
		const rect = itemRef.current.getBoundingClientRect();
		const edge = findClosestEdge(
			ev.clientX - rect.left,
			ev.clientY - rect.top,
			rect.width,
			rect.height,
		);

		const tl = gsap.timeline({ defaults: animationDefaults });
		tl.set(overlayRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
			.set(overlayInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
			.to([overlayRef.current, overlayInnerRef.current], { y: "0%" }, 0);

		if (charsRef.current.length > 0) {
			tl.fromTo(
				charsRef.current,
				{ y: 0 },
				{
					y: -32,
					duration: 0.15,
					ease: "sine.out",
					stagger: { each: 0.01, from: "start" },
				},
				0,
			).to(
				charsRef.current,
				{
					y: 0,
					duration: 0.2,
					ease: "sine.inOut",
					stagger: { each: 0.01, from: "start" },
				},
				0.15,
			);
		}
	};

	const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
		if (!itemRef.current || !overlayRef.current || !overlayInnerRef.current)
			return;
		const rect = itemRef.current.getBoundingClientRect();
		const edge = findClosestEdge(
			ev.clientX - rect.left,
			ev.clientY - rect.top,
			rect.width,
			rect.height,
		);

		gsap.set(charsRef.current, { y: 0 });

		gsap
			.timeline({ defaults: animationDefaults })
			.to(overlayRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
			.to(overlayInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
	};

	const chars = title.split("").map((char, i) => (
		<span
			key={i}
			ref={(el) => {
				if (el) charsRef.current[i] = el;
			}}
			className="inline-block"
			style={{ whiteSpace: char === " " ? "pre" : undefined }}
		>
			{char}
		</span>
	));

	return (
		<div
			ref={itemRef}
			className="relative overflow-hidden border-t border-foreground/10"
		>
			<a
				href="#services-menu"
				className="flex items-center justify-between cursor-pointer px-6 py-8 sm:px-12 md:py-10 lg:px-24"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<span className="text-[clamp(1.5rem,4vw,4rem)] font-light tracking-tight text-foreground">
					{title}
				</span>
			</a>

			<div
				ref={overlayRef}
				className="absolute inset-0 overflow-hidden pointer-events-none bg-foreground"
				style={{ transform: "translateY(101%)" }}
			>
				<div
					ref={overlayInnerRef}
					className="flex items-center h-full px-6 sm:px-12 lg:px-24"
					style={{ transform: "translateY(-101%)" }}
				>
					<span className="text-[clamp(1.5rem,4vw,4rem)] font-light tracking-tight text-background">
						{chars}
					</span>
				</div>
			</div>
		</div>
	);
}

export function Services() {
	const sectionRef = useRef<HTMLElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLHeadingElement>(null);

	useEffect(() => {
		if (!titleRef.current || !sectionRef.current || !contentRef.current) return;

		const title = titleRef.current;
		const chars = title.querySelectorAll(".char");
		const section = sectionRef.current;
		const content = contentRef.current;

		gsap.fromTo(
			chars,
			{
				willChange: "transform",
				transformOrigin: "50% 100%",
				scaleY: 0,
			},
			{
				ease: "power3.in",
				opacity: 1,
				scaleY: 1,
				stagger: 0.05,
				scrollTrigger: {
					trigger: section,
					start: "top top",
					end: "+=150%",
					scrub: true,
					pin: content,
					anticipatePin: 1,
				},
			},
		);

		return () => {
			ScrollTrigger.getAll().forEach((trigger) => {
				trigger.kill();
			});
		};
	}, []);

	return (
		// biome-ignore lint/correctness/useUniqueElementIds: stable hash target for in-page navigation
		<section
			ref={sectionRef}
			id="services"
			className="services relative bg-background overflow-hidden"
		>
			<div
				ref={contentRef}
				className="flex min-h-screen items-center justify-center px-6 sm:px-12 lg:px-24"
			>
				<h2
					ref={titleRef}
					className="text-center text-[clamp(2.5rem,7vw,7rem)] font-medium leading-[1.1] tracking-tight text-foreground max-w-[87.5rem]"
				>
					<SplitText>
						Everything you need between save-the-date and final thank-you.
					</SplitText>
				</h2>
			</div>

			{/* biome-ignore lint/correctness/useUniqueElementIds: stable hash target for in-page navigation */}
			<div id="services-menu" className="w-full pb-24">
				<div className="w-full">
					{services.map((service) => (
						<ServiceItem key={service.id} title={service.title} />
					))}
					<div className="border-t border-foreground/10" />
				</div>
			</div>
		</section>
	);
}
