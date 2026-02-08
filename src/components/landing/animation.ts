/** Shared animation constants and variant patterns for landing page sections. */

export const ANIMATION = {
	ease: {
		default: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
		out: [0, 0, 0.2, 1] as [number, number, number, number],
		inOut: [0.42, 0, 0.58, 1] as [number, number, number, number],
	},
	duration: {
		fast: 0.3,
		normal: 0.6,
		slow: 0.8,
		entrance: 0.7,
	},
	stagger: {
		fast: 0.06,
		normal: 0.1,
		slow: 0.15,
	},
	viewport: {
		once: true,
		margin: "-80px" as const,
	},
} as const;

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

export const containerReveal = {
	hidden: {},
	visible: {
		transition: { staggerChildren: ANIMATION.stagger.normal },
	},
};

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
