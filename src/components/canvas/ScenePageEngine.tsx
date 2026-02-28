/**
 * ScenePageEngine — Premium full-screen scene-paged invitation renderer.
 *
 * Groups blocks by sectionId into full-viewport snap-scrolling sections.
 * Used for the public invitation view (/invite/$slug).
 * The editor continues using CanvasEngine for its flat canvas layout.
 */

import {
	type CSSProperties,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	ParticleField,
	type ParticlePreset,
} from "@/components/templates/animations";
import type { Block, CanvasDocument } from "@/lib/canvas/types";
import { cn } from "@/lib/utils";
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
		sectionMap.get(sectionId)?.push(block);
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

/* ── Content Scale Hook ──────────────────────────────────────── */

/** Scale factor to enlarge content blocks for full-viewport scenes. */
function useContentScale(canvasWidth: number): number {
	const [scale, setScale] = useState(1);

	const update = useCallback(() => {
		const vw = window.innerWidth;
		// On mobile (viewport ≤ canvas + 40px padding), no scaling
		if (vw <= canvasWidth + 40) {
			setScale(1);
			return;
		}
		// Scale to fill ~60% of viewport width, capped at 2.2x
		const s = Math.min((vw * 0.6) / canvasWidth, 2.2);
		setScale(Math.max(1, s));
	}, [canvasWidth]);

	useEffect(() => {
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, [update]);

	return scale;
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
	contentScale,
}: {
	section: Section;
	index: number;
	canvasWidth: number;
	backgroundColor: string;
	isHero: boolean;
	particlePreset: ParticlePreset | null;
	overlayClass: string | null;
	contentScale: number;
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
			className={cn("dm-scene-page", !isHero && hasImages && overlayClass)}
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
							"linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.55) 100%)",
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
			{(() => {
				const effectiveScale = isHero ? 1 : contentScale;
				const contentHeight = sectionBounds.maxY - sectionBounds.minY;

				return (
					<div
						className="relative"
						style={{
							width: canvasWidth * effectiveScale,
							height: contentHeight * effectiveScale,
							zIndex: 2,
						}}
					>
						<div
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: canvasWidth,
								height: contentHeight,
								transform: `scale(${effectiveScale})`,
								transformOrigin: "top left",
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

								const isTextBlock =
									block.type === "text" || block.type === "heading";

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
									// Add text-shadow for hero readability
									...(isHero && isTextBlock
										? {
												textShadow:
													"0 2px 12px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4)",
											}
										: {}),
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
			})()}
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

/* ── Music Player ────────────────────────────────────────────── */

const TEMPLATE_MUSIC: Record<string, string | null> = {
	"blush-romance": null,
	"eternal-elegance": null,
	"garden-romance": null,
	"love-at-dusk": null,
	"double-happiness": null,
};

function MusicPlayer({ templateId }: { templateId: string }) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [playing, setPlaying] = useState(false);
	const trackUrl = TEMPLATE_MUSIC[templateId] ?? null;

	if (!trackUrl) return null;

	const toggle = () => {
		const audio = audioRef.current;
		if (!audio) return;
		if (playing) {
			audio.pause();
		} else {
			audio.play().catch(() => {});
		}
		setPlaying(!playing);
	};

	return (
		<>
			{/* biome-ignore lint/a11y/useMediaCaption: background music track, no dialogue */}
			<audio ref={audioRef} src={trackUrl} loop preload="none" />
			<button
				type="button"
				className="dm-music-btn"
				data-playing={playing}
				onClick={toggle}
				aria-label={playing ? "Pause music" : "Play music"}
			>
				{playing ? (
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<title>Pause</title>
						<rect x="6" y="4" width="4" height="16" />
						<rect x="14" y="4" width="4" height="16" />
					</svg>
				) : (
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<title>Play</title>
						<polygon points="5,3 19,12 5,21" />
					</svg>
				)}
			</button>
		</>
	);
}

/* ── Swipe Hint ──────────────────────────────────────────────── */

function SwipeHint({
	containerRef,
}: {
	containerRef: React.RefObject<HTMLDivElement | null>;
}) {
	const [hidden, setHidden] = useState(false);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleScroll = () => {
			if (container.scrollTop > 20) {
				setHidden(true);
			}
		};
		container.addEventListener("scroll", handleScroll, { passive: true });
		return () => container.removeEventListener("scroll", handleScroll);
	}, [containerRef]);

	return (
		<div className="dm-swipe-hint" data-hidden={hidden} aria-hidden="true">
			<span className="dm-swipe-hint-text">Scroll</span>
			<span className="dm-swipe-hint-chevron">
				<svg viewBox="0 0 24 24" role="img" aria-label="Scroll down">
					<title>Scroll down</title>
					<path d="M6 9l6 6 6-6" />
				</svg>
			</span>
		</div>
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
	const effects = useMemo(
		() => getTemplateEffects(doc.templateId),
		[doc.templateId],
	);
	const contentScale = useContentScale(canvasWidth);

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
					contentScale={contentScale}
				/>
			))}

			<MusicPlayer templateId={doc.templateId} />

			<SwipeHint containerRef={containerRef} />

			<SceneProgressDots
				count={sections.length}
				activeIndex={activeIndex}
				accentColor={accentColor}
				onDotClick={handleDotClick}
			/>
		</div>
	);
}
