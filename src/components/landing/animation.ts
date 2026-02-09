// ─── Motion (Framer Motion / motion/react) Presets ───

export const ANIMATION = {
	ease: {
		default: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
		smooth: [0.4, 0, 0.2, 1] as [number, number, number, number],
	},
	duration: {
		fast: 0.4,
		normal: 0.6,
		slow: 0.8,
		entrance: 0.7,
	},
	stagger: {
		fast: 0.08,
		normal: 0.1,
		slow: 0.15,
	},
	viewport: {
		once: true,
		margin: "-80px" as const,
	},
} as const;

// Section reveal: generic fade-up for elements that don't need GSAP
export const sectionReveal = {
	hidden: { opacity: 0, y: 24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: ANIMATION.duration.entrance,
			ease: ANIMATION.ease.default,
		},
	},
};

// Container for staggered children
export const containerReveal = {
	hidden: {},
	visible: {
		transition: { staggerChildren: ANIMATION.stagger.normal },
	},
};

// Child item for staggered reveal
export const childReveal = {
	hidden: { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: ANIMATION.duration.normal,
			ease: ANIMATION.ease.default,
		},
	},
};

// Mockup / card entrance
export const mockupReveal = {
	hidden: { opacity: 0, scale: 0.96 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: ANIMATION.duration.slow,
			ease: ANIMATION.ease.default,
		},
	},
};

// Card hover state (Motion)
export const cardHover = {
	scale: 1.02,
	y: -8,
	transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
};

// ─── GSAP Presets ───

export const GSAP_EASE = {
	// Entrances
	entrance: "power3.out",
	entranceDramatic: "power4.out",
	entranceSoft: "power2.out",

	// Exits
	exit: "power2.in",

	// Continuous / scrubbed
	scrub: "none",

	// Emphasis
	bounce: "back.out(1.2)",

	// Transitions
	transition: "power2.inOut",
	transitionSlow: "power3.inOut",

	// Oscillation
	float: "sine.inOut",
} as const;

// ─── GSAP Section Configs ───

export const GSAP_HERO = {
	clipReveal: { duration: 0.6, ease: GSAP_EASE.entrance },
	lineReveal: { duration: 0.7, ease: GSAP_EASE.entrance, stagger: 0.12 },
	accentScale: { duration: 0.8, ease: GSAP_EASE.bounce },
	bodyFade: { duration: 0.5, ease: GSAP_EASE.entranceSoft, stagger: 0.1 },
	cardRise: { duration: 1.0, ease: GSAP_EASE.entranceDramatic },
} as const;

export const GSAP_SECTIONS = {
	statCountUp: { duration: 2.0, ease: GSAP_EASE.entranceSoft },
	wordReveal: {
		duration: 0.3,
		ease: GSAP_EASE.entranceSoft,
		stagger: 0.05,
	},
	cardStagger: {
		duration: 0.6,
		ease: GSAP_EASE.entranceSoft,
		stagger: 0.15,
	},
	stepEntrance: { duration: 0.6, ease: GSAP_EASE.entrance },
	featureStagger: {
		duration: 0.6,
		ease: GSAP_EASE.entranceSoft,
		stagger: 0.1,
	},
	priceCountUp: { duration: 1.8, ease: GSAP_EASE.entranceSoft },
	strokeDraw: {
		duration: 0.6,
		ease: GSAP_EASE.transition,
		stagger: 0.12,
	},
	xiSettle: { duration: 1.5, ease: GSAP_EASE.entranceSoft },
	goldRuleDraw: { duration: 0.8, ease: GSAP_EASE.entranceSoft },
	clipWipe: { ease: GSAP_EASE.scrub },
} as const;

// ─── V4 Vivid Celebration Presets ───

export const GSAP_MESH = {
	drift: { duration: 20, ease: GSAP_EASE.float },
	driftRange: 40,
} as const;

export const GSAP_TRACING_BEAM = {
	dotTravel: { ease: GSAP_EASE.scrub },
	glowPulse: { duration: 1.5, ease: GSAP_EASE.float },
} as const;

export const GSAP_GRADIENT = {
	entrance: { duration: 0.8, ease: GSAP_EASE.entranceSoft },
} as const;

// ─── ScrollTrigger Defaults ───

export const ST_DEFAULTS = {
	/** One-shot trigger at 80% viewport */
	oneShot: {
		start: "top 80%",
		toggleActions: "play none none none" as const,
	},
	/** Scrubbed reveal, bidirectional */
	scrubReveal: (start = "top 75%", end = "top 40%", scrub = 0.5) => ({
		start,
		end,
		scrub,
	}),
	/** Step entrance: trigger per element */
	stepEntrance: {
		start: "top 85%",
		end: "top 55%",
		scrub: 0.3,
	},
} as const;
