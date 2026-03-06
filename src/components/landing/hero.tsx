"use client";

import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * CSS-animated blur-in text.
 * Each character gets a staggered animation delay via inline `--i` custom property.
 */
function BlurText({ text, delay = 0 }: { text: string; delay?: number }) {
	const words = text.split(" ");
	let charCount = 0;

	return (
		<span className="inline-flex flex-wrap justify-center">
			{words.map((word, wordIndex) => (
				<span key={wordIndex} className="inline-flex mr-[0.25em]">
					{word.split("").map((char, charIndex) => {
						const i = charCount++;
						return (
							<span
								key={charIndex}
								className="dm-blur-char inline-block"
								style={
									{
										"--i": `${delay + i * 0.03}s`,
									} as React.CSSProperties
								}
							>
								{char}
							</span>
						);
					})}
				</span>
			))}
		</span>
	);
}

/** Tiny heart SVG for floating particles */
function HeartParticle({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
		</svg>
	);
}

interface Particle {
	id: number;
	type: "heart" | "dot" | "sparkle";
	x: string;
	y: string;
	size: number;
	driftX: string;
	driftY: string;
	duration: string;
	delay: string;
	color: string;
}

const particles: Particle[] = [
	{
		id: 1,
		type: "heart",
		x: "12%",
		y: "25%",
		size: 14,
		driftX: "30px",
		driftY: "-140px",
		duration: "7s",
		delay: "0s",
		color: "#F9A8D4",
	},
	{
		id: 2,
		type: "dot",
		x: "85%",
		y: "35%",
		size: 6,
		driftX: "-20px",
		driftY: "-100px",
		duration: "5s",
		delay: "1s",
		color: "#CA8A04",
	},
	{
		id: 3,
		type: "sparkle",
		x: "75%",
		y: "70%",
		size: 10,
		driftX: "15px",
		driftY: "-130px",
		duration: "8s",
		delay: "2s",
		color: "#CA8A04",
	},
	{
		id: 4,
		type: "heart",
		x: "22%",
		y: "72%",
		size: 11,
		driftX: "-25px",
		driftY: "-110px",
		duration: "6s",
		delay: "0.5s",
		color: "#DB2777",
	},
	{
		id: 5,
		type: "dot",
		x: "45%",
		y: "85%",
		size: 5,
		driftX: "10px",
		driftY: "-90px",
		duration: "5.5s",
		delay: "3s",
		color: "#F9A8D4",
	},
	{
		id: 6,
		type: "sparkle",
		x: "8%",
		y: "55%",
		size: 8,
		driftX: "35px",
		driftY: "-120px",
		duration: "7.5s",
		delay: "1.5s",
		color: "#CA8A04",
	},
	{
		id: 7,
		type: "heart",
		x: "90%",
		y: "60%",
		size: 12,
		driftX: "-15px",
		driftY: "-150px",
		duration: "9s",
		delay: "0.8s",
		color: "#F9A8D4",
	},
	{
		id: 8,
		type: "dot",
		x: "60%",
		y: "20%",
		size: 4,
		driftX: "-10px",
		driftY: "-80px",
		duration: "6.5s",
		delay: "2.5s",
		color: "#DB2777",
	},
	{
		id: 9,
		type: "sparkle",
		x: "35%",
		y: "15%",
		size: 7,
		driftX: "20px",
		driftY: "-100px",
		duration: "6s",
		delay: "4s",
		color: "#CA8A04",
	},
	{
		id: 10,
		type: "heart",
		x: "55%",
		y: "80%",
		size: 9,
		driftX: "-30px",
		driftY: "-120px",
		duration: "7s",
		delay: "1.2s",
		color: "#DB2777",
	},
];

function ParticleElement({ p }: { p: Particle }) {
	const style = {
		left: p.x,
		top: p.y,
		"--drift-x": p.driftX,
		"--drift-y": p.driftY,
		"--duration": p.duration,
		"--p-delay": p.delay,
		color: p.color,
	} as React.CSSProperties;

	if (p.type === "heart") {
		return (
			<div className="dm-particle absolute pointer-events-none" style={style}>
				<HeartParticle
					className="opacity-40"
					{...{ style: { width: p.size, height: p.size } }}
				/>
			</div>
		);
	}
	if (p.type === "dot") {
		return (
			<div
				className="dm-particle absolute rounded-full opacity-50 pointer-events-none"
				style={{
					...style,
					width: p.size,
					height: p.size,
					backgroundColor: p.color,
				}}
			/>
		);
	}
	// sparkle — a 4-point star
	return (
		<div className="dm-particle absolute pointer-events-none" style={style}>
			<svg
				width={p.size}
				height={p.size}
				viewBox="0 0 24 24"
				fill="currentColor"
				className="opacity-50"
				aria-hidden="true"
			>
				<path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
			</svg>
		</div>
	);
}

/** Floating invitation card with 3D tilt on hover */
function InvitationCard({
	isFlipped,
	onFlip,
}: {
	isFlipped: boolean;
	onFlip: () => void;
}) {
	const cardRef = useRef<HTMLDivElement>(null);
	const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
	const [isHovering, setIsHovering] = useState(false);
	const rafRef = useRef<number | null>(null);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (isFlipped) return;
			const rect = cardRef.current?.getBoundingClientRect();
			if (!rect) return;
			const x = (e.clientX - rect.left) / rect.width - 0.5;
			const y = (e.clientY - rect.top) / rect.height - 0.5;

			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
			rafRef.current = requestAnimationFrame(() => {
				setTilt({ rotateX: -y * 20, rotateY: x * 20 });
				rafRef.current = null;
			});
		},
		[isFlipped],
	);

	const handleMouseEnter = () => setIsHovering(true);
	const handleMouseLeave = () => {
		setIsHovering(false);
		setTilt({ rotateX: 0, rotateY: 0 });
	};

	useEffect(() => {
		return () => {
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
		};
	}, []);

	return (
		<div
			ref={cardRef}
			role="button"
			tabIndex={0}
			aria-label="Flip invitation card to see RSVP preview"
			className={`dm-card-enter relative w-[280px] h-[400px] sm:w-[340px] sm:h-[480px] cursor-pointer ${!isHovering && !isFlipped ? "dm-card-float" : ""}`}
			style={
				{
					perspective: "1200px",
					"--delay": "0.4s",
				} as React.CSSProperties
			}
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={onFlip}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onFlip();
				}
			}}
		>
			<div
				className="relative w-full h-full transition-transform duration-500 ease-out"
				style={{
					transformStyle: "preserve-3d",
					transform: isFlipped
						? "rotateY(180deg)"
						: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
				}}
			>
				{/* Front — invitation preview */}
				<div
					className="absolute inset-0 rounded-2xl overflow-hidden border border-border"
					style={{
						backfaceVisibility: "hidden",
						boxShadow: `${tilt.rotateY * 0.8}px ${8 + tilt.rotateX * 0.5}px 40px -8px rgba(131,24,67,0.18)`,
					}}
				>
					<div className="h-full bg-white flex flex-col">
						{/* Photo area */}
						<div className="relative h-[55%] overflow-hidden">
							<img
								src="/img/mock-project1.webp"
								alt="Wedding preview"
								className="w-full h-full object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
						</div>

						{/* Card content */}
						<div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 -mt-6 relative">
							<p className="font-script text-2xl sm:text-3xl text-[#831843]">
								Wei Lin & Jason
							</p>
							<div className="flex items-center gap-2 mt-2">
								<span className="h-px w-6 bg-[#CA8A04]/50" />
								<HeartParticle className="w-3 h-3 text-[#CA8A04]" />
								<span className="h-px w-6 bg-[#CA8A04]/50" />
							</div>
							<p className="font-heading text-sm sm:text-base text-[#9D4C6E] mt-2">
								December 28, 2026
							</p>
							<p className="text-xs text-[#9D4C6E]/70 mt-1">
								The Majestic Hotel, Kuala Lumpur
							</p>
							<div className="mt-4 px-5 py-1.5 rounded-full bg-[#CA8A04]/10 border border-[#CA8A04]/30">
								<span className="text-xs font-medium text-[#CA8A04]">RSVP</span>
							</div>
						</div>
					</div>
				</div>

				{/* Back — RSVP confirmation */}
				<div
					className="absolute inset-0 rounded-2xl overflow-hidden border border-border shadow-soft"
					style={{
						backfaceVisibility: "hidden",
						transform: "rotateY(180deg)",
					}}
				>
					<div className="h-full bg-white flex flex-col items-center justify-center px-8 text-center">
						<div className="w-14 h-14 rounded-full bg-[#CA8A04]/10 flex items-center justify-center mb-4">
							<svg
								className="w-7 h-7 text-[#CA8A04]"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M20 6L9 17l-5-5" />
							</svg>
						</div>
						<p className="font-heading text-xl text-[#831843] font-semibold">
							You're attending!
						</p>
						<p className="text-sm text-[#9D4C6E] mt-2 leading-relaxed">
							Thank you for confirming. We can't wait to celebrate with you.
						</p>
						<div className="mt-6 flex items-center gap-2">
							<HeartParticle className="w-4 h-4 text-[#DB2777]" />
							<span className="font-script text-lg text-[#DB2777]">
								See you there
							</span>
							<HeartParticle className="w-4 h-4 text-[#DB2777]" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function Hero() {
	const [isFlipped, setIsFlipped] = useState(false);
	const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleFlip = () => {
		if (isFlipped) return;
		setIsFlipped(true);
		flipTimeoutRef.current = setTimeout(() => setIsFlipped(false), 2500);
	};

	useEffect(() => {
		return () => {
			if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
		};
	}, []);

	return (
		// biome-ignore lint/correctness/useUniqueElementIds: stable hash target for in-page navigation
		<section
			id="hero"
			className="relative w-full min-h-svh overflow-hidden bg-background"
		>
			{/* Floating particles — behind card */}
			<div className="absolute inset-0 pointer-events-none" aria-hidden="true">
				{particles.map((p) => (
					<ParticleElement key={p.id} p={p} />
				))}
			</div>

			{/* Content */}
			<div className="relative z-10 min-h-svh flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center py-24 sm:py-28">
				{/* Eyebrow */}
				<p
					className="dm-fade-in text-xs sm:text-sm uppercase tracking-[0.3em] text-muted-foreground font-medium mb-6 sm:mb-8"
					style={{ "--delay": "0s" } as React.CSSProperties}
				>
					Digital Wedding Invitations
				</p>

				{/* Headline */}
				<h1 className="text-foreground leading-[1.05] tracking-tight">
					<span className="font-heading font-medium text-[clamp(2rem,5vw,4.5rem)] block">
						<BlurText text="Your love story," delay={0.1} />
					</span>
					<span className="font-script text-[clamp(2.5rem,8vw,7rem)] block mt-1">
						<BlurText text="beautifully told" delay={0.45} />
					</span>
				</h1>

				{/* Floating invitation card */}
				<div className="mt-8 sm:mt-12">
					<InvitationCard isFlipped={isFlipped} onFlip={handleFlip} />
				</div>

				{/* CTAs */}
				<div
					className="dm-fade-in-up mt-8 sm:mt-10 flex flex-col items-center gap-3"
					style={{ "--delay": "1s" } as React.CSSProperties}
				>
					<Link
						to="/editor/new"
						search={{ template: "double-happiness" }}
						className="px-8 sm:px-10 py-3.5 sm:py-4 bg-gold hover:opacity-90 rounded-full text-white text-sm sm:text-base font-semibold tracking-wide transition-all duration-300 hover:shadow-[0_8px_32px_rgba(202,138,4,0.35)] hover:-translate-y-0.5 active:translate-y-0"
					>
						Start Creating
					</Link>
					<button
						type="button"
						onClick={handleFlip}
						className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium tracking-wide cursor-pointer"
					>
						See it in action
					</button>
				</div>
			</div>

			{/* Scroll indicator */}
			<div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-10">
				<a
					href="#projects"
					className="dm-fade-in flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
					style={{ "--delay": "1.4s" } as React.CSSProperties}
					aria-label="Scroll to templates"
				>
					<ChevronDown className="w-5 h-5 dm-bounce" />
				</a>
			</div>
		</section>
	);
}
