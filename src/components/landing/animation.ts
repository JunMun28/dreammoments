export const ANIMATION = {
	ease: {
		default: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
	},
	duration: {
		normal: 0.6,
		slow: 0.8,
		entrance: 0.7,
	},
	stagger: {
		normal: 0.1,
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
