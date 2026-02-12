import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TemplateData {
	id: string;
	title: string;
	desc: string;
	photo: string;
	alt?: string;
	culturalBadge: string | null;
	bilingual: boolean;
}

interface PerspectiveCardStackProps {
	templates: TemplateData[];
	reducedMotion: boolean;
}

/**
 * Fanned card gallery for the Showcase section.
 *
 * Desktop: `perspective: 1200px` container with cards fanned at `rotateY`
 * offsets (-6, -2, 2, 6 deg). On hover each card straightens to
 * `rotateY(0)` and lifts `translateY(-8px)`.
 *
 * Mobile: horizontal scroll container with `scroll-snap-type: x mandatory`,
 * 80vw card width, and `scroll-snap-align: center`.
 *
 * GSAP entrance: cards slide in from right with `rotateY` on ScrollTrigger
 * (applied via external useEffect in the Showcase section for tree-shaking).
 */

const ROTATE_OFFSETS = [-6, -2, 2, 6];

export function PerspectiveCardStack({
	templates,
	reducedMotion,
}: PerspectiveCardStackProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	// GSAP entrance animation (desktop only)
	useEffect(() => {
		if (reducedMotion) return;

		const isDesktop = window.matchMedia("(min-width: 768px)").matches;
		if (!isDesktop) return;

		let ctx: gsap.Context | undefined;

		async function initGSAP() {
			const { gsap } = await import("gsap");
			const { ScrollTrigger } = await import("gsap/ScrollTrigger");
			gsap.registerPlugin(ScrollTrigger);

			if (!containerRef.current) return;

			const cards = containerRef.current.querySelectorAll("[data-card]");
			if (cards.length === 0) return;

			ctx = gsap.context(() => {
				gsap.fromTo(
					cards,
					{ x: 60, opacity: 0, rotateY: 12 },
					{
						x: 0,
						opacity: 1,
						rotateY: 0,
						duration: 0.6,
						ease: "power2.out",
						stagger: 0.15,
						scrollTrigger: {
							trigger: containerRef.current,
							start: "top 75%",
							toggleActions: "play none none none",
						},
					},
				);
			}, containerRef);
		}

		initGSAP();

		return () => {
			ctx?.revert();
		};
	}, [reducedMotion]);

	return (
		<>
			{/* Desktop: perspective fan */}
			<div
				ref={containerRef}
				className="hidden md:flex justify-center items-end gap-8 lg:gap-10"
				style={{ perspective: "1200px" }}
			>
				{templates.map((template, i) => (
					<DesktopCard
						key={template.id}
						template={template}
						rotateY={ROTATE_OFFSETS[i] ?? 0}
					/>
				))}
			</div>

			{/* Mobile: horizontal scroll-snap */}
			<div
				className="flex md:hidden gap-4 overflow-x-auto px-6 pb-4 snap-x snap-mandatory scrollbar-none"
				style={{
					scrollSnapType: "x mandatory",
					WebkitOverflowScrolling: "touch",
				}}
			>
				{templates.map((template) => (
					<MobileCard key={template.id} template={template} />
				))}
			</div>
		</>
	);
}

function CardContent({
	template,
	shadowClass,
}: {
	template: TemplateData;
	shadowClass: string;
}) {
	return (
		<>
			<div
				className={cn("overflow-hidden rounded-2xl", shadowClass)}
				style={{ background: "var(--dm-surface)" }}
			>
				<div
					className="relative"
					style={{ aspectRatio: "9/16", backgroundColor: "#f5ede4" }}
				>
					<img
						src={template.photo}
						alt={
							template.alt ?? `${template.title} template - ${template.desc}`
						}
						loading="lazy"
						decoding="async"
						className="h-full w-full object-cover"
					/>
					<div
						className="absolute inset-x-0 bottom-0 p-4"
						style={{
							backdropFilter: "blur(12px)",
							WebkitBackdropFilter: "blur(12px)",
							background: "rgba(255,255,255,0.15)",
						}}
					>
						<p className="font-display text-base font-semibold text-white">
							{template.title}
						</p>
						<p className="mt-0.5 text-sm text-white/80">{template.desc}</p>
					</div>
					{template.culturalBadge && (
						<div
							className="absolute top-3 left-3 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em]"
							style={{
								background: "white",
								color: "var(--dm-crimson)",
							}}
						>
							{template.culturalBadge}
						</div>
					)}
					{template.bilingual && (
						<div className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-medium backdrop-blur-sm">
							<span style={{ color: "var(--dm-ink)" }}>EN</span>
							<span className="mx-1 opacity-40">/</span>
							<span style={{ color: "var(--dm-crimson)" }}>中文</span>
						</div>
					)}
				</div>
			</div>
			<p className="mt-3 text-center font-display text-base font-semibold text-[var(--dm-ink)]">
				{template.title}
			</p>
		</>
	);
}

function DesktopCard({
	template,
	rotateY,
}: {
	template: TemplateData;
	rotateY: number;
}) {
	return (
		<Link
			to="/invite/$slug"
			params={{ slug: `${template.id}-sample` }}
			data-card=""
			className={cn(
				"group block w-[380px] flex-shrink-0 rounded-2xl",
				"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--dm-crimson)]",
				"transition-transform duration-350 ease-out hover:scale-105 hover:-translate-y-2 hover:!rotate-y-0",
			)}
			style={{
				transform: `rotateY(${rotateY}deg)`,
				transformOrigin: "center bottom",
			}}
		>
			<CardContent
				template={template}
				shadowClass="shadow-[0_25px_60px_-12px_rgba(0,0,0,0.10)] transition-shadow duration-350 group-hover:shadow-[0_30px_70px_-12px_rgba(0,0,0,0.18)]"
			/>
		</Link>
	);
}

function MobileCard({ template }: { template: TemplateData }) {
	return (
		<Link
			to="/invite/$slug"
			params={{ slug: `${template.id}-sample` }}
			className={cn(
				"group block flex-shrink-0 snap-center rounded-2xl",
				"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--dm-crimson)]",
			)}
			style={{ width: "min(300px, 75vw)" }}
		>
			<CardContent template={template} shadowClass="shadow-lg" />
		</Link>
	);
}
