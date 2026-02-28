/**
 * Shared animation components for wedding invitation templates.
 * Uses the `motion` library (Framer Motion) for scroll-driven and entry animations.
 * All animations respect prefers-reduced-motion via the motion library's built-in support.
 */

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

// ── Scroll-reveal wrapper ────────────────────────────────────────────

interface RevealProps {
	children: ReactNode;
	direction?: "up" | "left" | "right" | "none" | "blur" | "scale";
	delay?: number;
	/** Duration in seconds (default 0.8) */
	duration?: number;
	className?: string;
}

/**
 * Fade-in + slide on scroll using Intersection Observer.
 * Falls back to visible if prefers-reduced-motion is set.
 */
export function Reveal({
	children,
	direction = "up",
	delay = 0,
	duration = 0.8,
	className = "",
}: RevealProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);
	const prefersReduced = usePrefersReducedMotion();

	useEffect(() => {
		if (prefersReduced) {
			setIsVisible(true);
			return;
		}
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.unobserve(el);
				}
			},
			{ threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [prefersReduced]);

	const transform = isVisible
		? "translate3d(0, 0, 0) scale(1)"
		: direction === "up"
			? "translate3d(0, 30px, 0)"
			: direction === "left"
				? "translate3d(-30px, 0, 0)"
				: direction === "right"
					? "translate3d(30px, 0, 0)"
					: direction === "scale"
						? "scale(0.95)"
						: "translate3d(0, 0, 0)";

	const filter = direction === "blur" && !isVisible ? "blur(8px)" : "blur(0)";

	return (
		<div
			ref={ref}
			className={className}
			style={{
				opacity: isVisible ? 1 : 0,
				transform,
				filter: direction === "blur" ? filter : undefined,
				transition: prefersReduced
					? "none"
					: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, filter ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
			}}
		>
			{children}
		</div>
	);
}

// ── Staggered reveal for child elements ──────────────────────────────

interface StaggerProps {
	children: ReactNode;
	/** Delay between each child in seconds */
	interval?: number;
	/** Base delay before first child in seconds */
	baseDelay?: number;
	direction?: RevealProps["direction"];
	className?: string;
}

/**
 * Wraps each child in a Reveal with staggered delay.
 * Children animate in sequentially with configurable interval.
 */
export function Stagger({
	children,
	interval = 0.1,
	baseDelay = 0,
	direction = "up",
	className = "",
}: StaggerProps) {
	const childArray = Array.isArray(children) ? children : [children];

	return (
		<div className={className}>
			{childArray.map((child, index) => (
				<Reveal
					key={index}
					direction={direction}
					delay={baseDelay + index * interval}
					duration={0.8}
				>
					{child}
				</Reveal>
			))}
		</div>
	);
}

// ── Floating particle system ─────────────────────────────────────────

type ParticlePreset = "petalRain" | "goldDust" | "starlight" | "snowfall" | "lanterns";

const PARTICLE_PRESETS: Record<
	ParticlePreset,
	{ count: number; color: string; shape: "circle" | "petal" | "sparkle"; drift: "down" | "up" | "float" }
> = {
	petalRain: { count: 18, color: "rgba(196, 114, 127, 0.5)", shape: "petal", drift: "down" },
	goldDust: { count: 24, color: "rgba(212, 175, 55, 0.6)", shape: "sparkle", drift: "up" },
	starlight: { count: 16, color: "rgba(255, 255, 255, 0.7)", shape: "sparkle", drift: "float" },
	snowfall: { count: 20, color: "rgba(255, 255, 255, 0.5)", shape: "circle", drift: "down" },
	lanterns: { count: 8, color: "rgba(255, 160, 50, 0.6)", shape: "circle", drift: "up" },
};

interface ParticleFieldProps {
	count?: number;
	color?: string;
	shape?: "circle" | "petal" | "sparkle";
	/** Named preset that auto-configures count, color, shape, and drift */
	preset?: ParticlePreset;
	className?: string;
}

interface Particle {
	id: number;
	x: number;
	y: number;
	size: number;
	duration: number;
	delay: number;
	rotate: number;
}

/**
 * Renders a field of animated CSS particles.
 * Petals for Blush Romance, sparkles for Love at Dusk, circles as default.
 */
export function ParticleField({
	count: countProp,
	color: colorProp,
	shape: shapeProp,
	preset,
	className = "",
}: ParticleFieldProps) {
	const prefersReduced = usePrefersReducedMotion();
	const config = preset ? PARTICLE_PRESETS[preset] : null;
	const count = countProp ?? config?.count ?? 12;
	const color = colorProp ?? config?.color ?? "currentColor";
	const shape = shapeProp ?? config?.shape ?? "circle";
	const drift = config?.drift ?? "float";
	const particles = useMemo(
		() =>
			Array.from({ length: count }, (_, i) => ({
				id: i,
				x: Math.random() * 100,
				y: Math.random() * 100,
				size: 4 + Math.random() * 8,
				duration: 6 + Math.random() * 8,
				delay: Math.random() * 5,
				rotate: Math.random() * 360,
			})),
		[count],
	);

	if (prefersReduced) return null;

	return (
		<div
			className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
			aria-hidden="true"
		>
			{particles.map((p) => (
				<ParticleElement key={p.id} particle={p} color={color} shape={shape} drift={drift} />
			))}
		</div>
	);
}

function ParticleElement({
	particle: p,
	color,
	shape,
	drift,
}: {
	particle: Particle;
	color: string;
	shape: "circle" | "petal" | "sparkle";
	drift: "down" | "up" | "float";
}) {
	const shapeStyle =
		shape === "petal"
			? {
					borderRadius: "60% 40% 60% 40%",
					background: color,
					opacity: 0.4,
				}
			: shape === "sparkle"
				? {
						background: "transparent",
						boxShadow: `0 0 ${p.size}px ${p.size / 2}px ${color}`,
						borderRadius: "50%",
						opacity: 0.6,
					}
				: {
						borderRadius: "50%",
						background: color,
						opacity: 0.3,
					};

	return (
		<div
			style={{
				position: "absolute",
				left: `${p.x}%`,
				top: `${p.y}%`,
				width: p.size,
				height: p.size,
				...shapeStyle,
				transform: `rotate(${p.rotate}deg)`,
				animation: `${drift === "down" ? "dm-particle-drift-down" : drift === "up" ? "dm-particle-drift-up" : "dm-particle-float"} ${p.duration}s ${drift === "float" ? "ease-in-out" : "linear"} ${p.delay}s infinite`,
			}}
		/>
	);
}

// ── Parallax wrapper ─────────────────────────────────────────────────

interface ParallaxProps {
	children: ReactNode;
	speed?: number;
	className?: string;
}

/**
 * Simple CSS parallax using scroll position.
 * Speed: 0.5 = half scroll speed (background feel), -0.2 = slight counter-scroll.
 */
export function Parallax({
	children,
	speed = 0.3,
	className = "",
}: ParallaxProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [offset, setOffset] = useState(0);
	const prefersReduced = usePrefersReducedMotion();

	useEffect(() => {
		if (prefersReduced) return;
		const handleScroll = () => {
			if (!ref.current) return;
			const rect = ref.current.getBoundingClientRect();
			const viewHeight = window.innerHeight;
			const progress = (viewHeight - rect.top) / (viewHeight + rect.height);
			setOffset(progress * 100 * speed);
		};
		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();
		return () => window.removeEventListener("scroll", handleScroll);
	}, [speed, prefersReduced]);

	return (
		<div
			ref={ref}
			className={className}
			style={{
				transform: prefersReduced ? "none" : `translateY(${offset}px)`,
				willChange: prefersReduced ? "auto" : "transform",
			}}
		>
			{children}
		</div>
	);
}

// ── SVG path draw animation ──────────────────────────────────────────

interface DrawPathProps {
	d: string;
	stroke?: string;
	strokeWidth?: number;
	duration?: number;
	delay?: number;
	width?: number;
	height?: number;
	viewBox?: string;
	className?: string;
}

/**
 * Animate an SVG path "drawing" effect using stroke-dashoffset.
 */
export function DrawPath({
	d,
	stroke = "currentColor",
	strokeWidth = 1.5,
	duration = 2,
	delay = 0,
	width = 100,
	height = 100,
	viewBox,
	className = "",
}: DrawPathProps) {
	const pathRef = useRef<SVGPathElement>(null);
	const [length, setLength] = useState(0);
	const [isVisible, setIsVisible] = useState(false);
	const svgRef = useRef<SVGSVGElement>(null);
	const prefersReduced = usePrefersReducedMotion();

	useEffect(() => {
		if (pathRef.current) {
			setLength(pathRef.current.getTotalLength());
		}
	}, []);

	useEffect(() => {
		if (prefersReduced) {
			setIsVisible(true);
			return;
		}
		const el = svgRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.unobserve(el);
				}
			},
			{ threshold: 0.3 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [prefersReduced]);

	return (
		<svg
			ref={svgRef}
			width={width}
			height={height}
			viewBox={viewBox ?? `0 0 ${width} ${height}`}
			fill="none"
			className={className}
			aria-hidden="true"
		>
			<path
				ref={pathRef}
				d={d}
				stroke={stroke}
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
				style={{
					strokeDasharray: length,
					strokeDashoffset: isVisible ? 0 : length,
					transition: prefersReduced
						? "none"
						: `stroke-dashoffset ${duration}s ease ${delay}s`,
				}}
			/>
		</svg>
	);
}

// ── Shimmer / gold shimmer effect ────────────────────────────────────

interface ShimmerProps {
	children: ReactNode;
	color?: string;
	className?: string;
}

/**
 * A shimmer overlay that sweeps across the content on scroll.
 */
export function Shimmer({
	children,
	color = "rgba(201, 169, 98, 0.15)",
	className = "",
}: ShimmerProps) {
	const prefersReduced = usePrefersReducedMotion();

	return (
		<div className={`relative overflow-hidden ${className}`}>
			{children}
			{!prefersReduced && (
				<div
					className="pointer-events-none absolute inset-0"
					style={{
						background: `linear-gradient(105deg, transparent 40%, ${color} 50%, transparent 60%)`,
						backgroundSize: "200% 100%",
						animation: "dm-shimmer-sweep 4s ease-in-out infinite",
					}}
					aria-hidden="true"
				/>
			)}
		</div>
	);
}

export type { ParticlePreset };

// ── Hook: prefers-reduced-motion ─────────────────────────────────────

function usePrefersReducedMotion(): boolean {
	const [prefersReduced, setPrefersReduced] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setPrefersReduced(mq.matches);
		const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	return prefersReduced;
}
