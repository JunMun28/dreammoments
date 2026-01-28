/**
 * CE-029: Canvas Element Animations
 *
 * Animation configuration types and CSS keyframe generators for canvas elements.
 * Animations are stored as custom Fabric.js object properties and played when
 * the invitation is viewed.
 */

/**
 * Animation type options
 */
export type AnimationType =
	| "none"
	| "fadeIn"
	| "slideUp"
	| "slideDown"
	| "slideLeft"
	| "slideRight"
	| "zoomIn"
	| "bounce"
	| "rotate";

/**
 * Easing function options
 */
export type EasingType = "linear" | "ease" | "easeIn" | "easeOut" | "easeInOut";

/**
 * Animation transform origin (9-point grid)
 */
export type AnimationOrigin =
	| "top-left"
	| "top-center"
	| "top-right"
	| "center-left"
	| "center"
	| "center-right"
	| "bottom-left"
	| "bottom-center"
	| "bottom-right";

/**
 * Animation configuration for a canvas element
 */
export interface AnimationConfig {
	type: AnimationType;
	duration: number; // 0.1-5 seconds
	delay: number; // 0-10 seconds
	easing: EasingType;
	loop: boolean;
	origin: AnimationOrigin;
}

/**
 * Animation type with label for UI display
 */
interface AnimationTypeOption {
	value: AnimationType;
	label: string;
}

/**
 * Easing option with label for UI display
 */
interface EasingOption {
	value: EasingType;
	label: string;
}

/**
 * Available animation types with display labels
 */
export const ANIMATION_TYPES: AnimationTypeOption[] = [
	{ value: "none", label: "None" },
	{ value: "fadeIn", label: "Fade In" },
	{ value: "slideUp", label: "Slide Up" },
	{ value: "slideDown", label: "Slide Down" },
	{ value: "slideLeft", label: "Slide Left" },
	{ value: "slideRight", label: "Slide Right" },
	{ value: "zoomIn", label: "Zoom In" },
	{ value: "bounce", label: "Bounce" },
	{ value: "rotate", label: "Rotate" },
];

/**
 * Available easing options with display labels
 */
export const EASING_OPTIONS: EasingOption[] = [
	{ value: "linear", label: "Linear" },
	{ value: "ease", label: "Ease" },
	{ value: "easeIn", label: "Ease In" },
	{ value: "easeOut", label: "Ease Out" },
	{ value: "easeInOut", label: "Ease In Out" },
];

/**
 * Animation origin option with label for UI display
 */
interface AnimationOriginOption {
	value: AnimationOrigin;
	label: string;
}

/**
 * Available animation origins (9-point grid)
 */
export const ANIMATION_ORIGINS: AnimationOriginOption[] = [
	{ value: "top-left", label: "Top Left" },
	{ value: "top-center", label: "Top Center" },
	{ value: "top-right", label: "Top Right" },
	{ value: "center-left", label: "Center Left" },
	{ value: "center", label: "Center" },
	{ value: "center-right", label: "Center Right" },
	{ value: "bottom-left", label: "Bottom Left" },
	{ value: "bottom-center", label: "Bottom Center" },
	{ value: "bottom-right", label: "Bottom Right" },
];

/**
 * Default animation configuration for new elements
 */
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
	type: "none",
	duration: 0.5,
	delay: 0,
	easing: "easeOut",
	loop: false,
	origin: "center",
};

/**
 * Convert easing type to CSS timing function
 */
function easingToCSS(easing: EasingType): string {
	switch (easing) {
		case "linear":
			return "linear";
		case "ease":
			return "ease";
		case "easeIn":
			return "ease-in";
		case "easeOut":
			return "ease-out";
		case "easeInOut":
			return "ease-in-out";
		default:
			return "ease";
	}
}

/**
 * Convert animation origin to CSS transform-origin value
 */
export function originToCSS(origin: AnimationOrigin): string {
	switch (origin) {
		case "top-left":
			return "top left";
		case "top-center":
			return "top center";
		case "top-right":
			return "top right";
		case "center-left":
			return "center left";
		case "center":
			return "center center";
		case "center-right":
			return "center right";
		case "bottom-left":
			return "bottom left";
		case "bottom-center":
			return "bottom center";
		case "bottom-right":
			return "bottom right";
		default:
			return "center center";
	}
}

/**
 * Generate CSS animation string from animation config
 *
 * @param config - Animation configuration
 * @returns CSS animation property value string, or empty string for "none"
 */
export function getAnimationCSS(config: AnimationConfig): string {
	if (config.type === "none") {
		return "";
	}

	const timingFunction = easingToCSS(config.easing);
	const iterationCount = config.loop ? "infinite" : "1";
	const fillMode = config.loop ? "none" : "forwards";

	// Build animation shorthand: name duration timing-function delay iteration-count fill-mode
	const parts = [
		config.type,
		`${config.duration}s`,
		timingFunction,
		`${config.delay}s`,
		iterationCount,
		fillMode,
	];

	return `animation: ${parts.join(" ")};`;
}
