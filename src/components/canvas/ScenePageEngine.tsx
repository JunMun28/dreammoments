/**
 * ScenePageEngine — Premium full-screen scene-paged invitation renderer.
 *
 * Groups blocks by sectionId into full-viewport snap-scrolling sections.
 * Used for the public invitation view (/invite/$slug).
 * The editor continues using CanvasEngine for its flat canvas layout.
 */

import {
	type CSSProperties,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { Block, CanvasDocument } from "@/lib/canvas/types";
import { cn } from "@/lib/utils";
import { ParticleField } from "@/components/templates/animations";
import type { ParticlePreset } from "@/components/templates/animations";
import { BlockRenderer } from "./BlockRenderer";

/* ── Types ───────────────────────────────────────────────────────── */

interface Section {
	id: string;
	blocks: Block[];
}

export interface ScenePageEngineProps {
	document: CanvasDocument;
	className?: string;
}

/* ── Helpers ──────────────────────────────────────────────────────── */

function groupBlocksBySection(doc: CanvasDocument): Section[] {
	const sectionMap = new Map<string, Block[]>();
	const sectionOrder: string[] = [];

	for (const blockId of doc.blockOrder) {
		const block = doc.blocksById[blockId];
		if (!block) continue;
		const sectionId = block.sectionId || "default";
		if (!sectionMap.has(sectionId)) {
			sectionMap.set(sectionId, []);
			sectionOrder.push(sectionId);
		}
		sectionMap.get(sectionId)!.push(block);
	}

	return sectionOrder.map((id) => ({
		id,
		blocks: sectionMap.get(id) ?? [],
	}));
}

function isHeroSection(section: Section): boolean {
	return (
		section.id === "hero" || section.id === "welcome" || section.id === "cover"
	);
}

function getHeroImageSrc(blocks: Block[]): string | null {
	for (const block of blocks) {
		if (block.type === "image" && block.content.src) {
			return block.content.src as string;
		}
	}
	return null;
}

function toCssProperties(style: Record<string, string>): CSSProperties {
	const next: CSSProperties = {};
	for (const [key, value] of Object.entries(style)) {
		(next as Record<string, unknown>)[key] = value;
	}
	return next;
}

/** Map template IDs to particle and overlay presets */
function getTemplateEffects(templateId: string): {
	particle: ParticlePreset | null;
	overlay: string | null;
} {
	switch (templateId) {
		case "blush-romance":
			return { particle: "petalRain", overlay: "dm-overlay-romantic" };
		case "eternal-elegance":
			return { particle: "goldDust", overlay: "dm-overlay-cinematic" };
		case "garden-romance":
			return { particle: "petalRain", overlay: "dm-overlay-romantic" };
		case "love-at-dusk":
			return { particle: "starlight", overlay: "dm-overlay-dramatic" };
		case "double-happiness":
			return { particle: "lanterns", overlay: "dm-overlay-golden" };
		default:
			return { particle: "goldDust", overlay: "dm-overlay-cinematic" };
	}
}

/* ── Scene Section ─────────────────────────────────────────────── */

function SceneSection({
	section,
	index,
	canvasWidth,
	backgroundColor,
	isHero,
	particlePreset,
	overlayClass,
}: {
	section: Section;
	index: number;
	canvasWidth: number;
	backgroundColor: string;
	isHero: boolean;
	particlePreset: ParticlePreset | null;
	overlayClass: string | null;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);
	const hasImages = section.blocks.some((b) => b.type === "image");

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReduced) {
			setIsVisible(true);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.unobserve(el);
				}
			},
			{ threshold: 0.2 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	// Calculate section height from block positions
	const sectionBounds = useMemo(() => {
		let minY = Number.POSITIVE_INFINITY;
		let maxY = 0;
		for (const block of section.blocks) {
			minY = Math.min(minY, block.position.y);
			maxY = Math.max(maxY, block.position.y + block.size.height);
		}
		return { minY: minY === Number.POSITIVE_INFINITY ? 0 : minY, maxY };
	}, [section.blocks]);

	const heroImgSrc = isHero ? getHeroImageSrc(section.blocks) : null;

	return (
		<div
			ref={ref}
			className={cn(
				"dm-scene-page",
				!isHero && hasImages && overlayClass,
			)}
			data-scene-section={section.id}
			data-scene-index={index}
			style={{ backgroundColor }}
		>
			{/* Ken Burns background for hero */}
			{isHero && heroImgSrc && (
				<div
					className="absolute inset-0 dm-ken-burns"
					style={{
						backgroundImage: `url(${heroImgSrc})`,
						backgroundSize: "cover",
						backgroundPosition: "center",
						zIndex: 0,
					}}
					aria-hidden="true"
				/>
			)}

			{/* Gradient overlay for hero readability */}
			{isHero && heroImgSrc && (
				<div
					className="absolute inset-0"
					style={{
						background:
							"linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.4) 100%)",
						zIndex: 1,
					}}
					aria-hidden="true"
				/>
			)}

			{/* Ambient particles for hero section */}
			{isHero && particlePreset && (
				<div className="absolute inset-0 z-[1]" aria-hidden="true">
					<ParticleField preset={particlePreset} className="h-full" />
				</div>
			)}

			{/* Block content — positioned relative within the section */}
			<div
				className="relative w-full"
				style={{
					maxWidth: canvasWidth,
					minHeight: sectionBounds.maxY - sectionBounds.minY,
					zIndex: 2,
				}}
			>
				{section.blocks.map((block, blockIndex) => {
					// Skip the hero image block since we render it as Ken Burns background
					if (
						isHero &&
						heroImgSrc &&
						block.type === "image" &&
						block.content.src === heroImgSrc
					) {
						return null;
					}

					const blockStyle: CSSProperties = {
						position: "absolute",
						width: block.size.width,
						height: block.size.height,
						// Offset Y relative to section start
						transform: `translate3d(${block.position.x}px, ${block.position.y - sectionBounds.minY}px, 0)`,
						zIndex: block.zIndex,
						// Entrance animation
						opacity: isVisible ? 1 : 0,
						transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${blockIndex * 0.1}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${blockIndex * 0.1}s`,
						...toCssProperties(block.style),
					};

					// Apply gold foil to heading blocks in hero
					const isGoldFoil = block.type === "heading" && isHero;

					return (
						<div
							key={block.id}
							style={blockStyle}
							data-canvas-block-id={block.id}
							data-canvas-block-type={block.type}
							className={isGoldFoil ? "dm-gold-foil" : undefined}
						>
							<BlockRenderer block={block} />
						</div>
					);
				})}
			</div>
		</div>
	);
}

/* ── Progress Dots ────────────────────────────────────────────── */

function SceneProgressDots({
	count,
	activeIndex,
	accentColor,
	onDotClick,
}: {
	count: number;
	activeIndex: number;
	accentColor: string;
	onDotClick: (index: number) => void;
}) {
	if (count <= 1) return null;

	return (
		<nav
			className="fixed right-3 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2"
			aria-label="Section navigation"
		>
			{Array.from({ length: count }, (_, i) => (
				<button
					key={i}
					type="button"
					onClick={() => onDotClick(i)}
					className="group flex h-5 w-5 items-center justify-center"
					aria-label={`Go to section ${i + 1}`}
					aria-current={i === activeIndex ? "step" : undefined}
				>
					<span
						className="block rounded-full transition-all duration-300"
						style={{
							width: i === activeIndex ? 8 : 5,
							height: i === activeIndex ? 8 : 5,
							backgroundColor:
								i === activeIndex ? accentColor : "rgba(255,255,255,0.4)",
							boxShadow:
								i === activeIndex
									? `0 0 6px ${accentColor}`
									: "0 0 2px rgba(0,0,0,0.2)",
						}}
					/>
				</button>
			))}
		</nav>
	);
}

/* ── Main Component ───────────────────────────────────────────── */

export function ScenePageEngine({
	document: doc,
	className,
}: ScenePageEngineProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [activeIndex, setActiveIndex] = useState(0);

	const sections = useMemo(() => groupBlocksBySection(doc), [doc]);
	const canvasWidth = doc.canvas.width;
	const backgroundColor = doc.designTokens.colors.background ?? "#ffffff";
	const accentColor = doc.designTokens.colors.primary ?? "#C4727F";
	const effects = useMemo(() => getTemplateEffects(doc.templateId), [doc.templateId]);

	// Track active section via IntersectionObserver
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-observe when sections change
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const sectionEls = container.querySelectorAll<HTMLElement>(
			"[data-scene-section]",
		);
		if (sectionEls.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const idx = Number(entry.target.getAttribute("data-scene-index"));
						if (!Number.isNaN(idx)) setActiveIndex(idx);
					}
				}
			},
			{ root: container, threshold: 0.6 },
		);

		for (const el of sectionEls) observer.observe(el);
		return () => observer.disconnect();
	}, [sections]);

	const handleDotClick = (index: number) => {
		const container = containerRef.current;
		if (!container) return;
		const target = container.querySelector<HTMLElement>(
			`[data-scene-index="${index}"]`,
		);
		target?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<div
			ref={containerRef}
			className={cn("dm-scene-container", className)}
			data-canvas-template={doc.templateId}
		>
			{sections.map((section, index) => (
				<SceneSection
					key={section.id}
					section={section}
					index={index}
					canvasWidth={canvasWidth}
					backgroundColor={backgroundColor}
					isHero={index === 0 || isHeroSection(section)}
					particlePreset={effects.particle}
					overlayClass={effects.overlay}
				/>
			))}

			<SceneProgressDots
				count={sections.length}
				activeIndex={activeIndex}
				accentColor={accentColor}
				onDotClick={handleDotClick}
			/>
		</div>
	);
}
