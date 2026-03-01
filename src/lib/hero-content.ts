// ── Shared types and utilities for hero/living-portrait content ───────

export interface HeroContent {
	heroImageUrl?: string;
	avatarImageUrl?: string;
	avatarStyle?: string;
	animatedVideoUrl?: string;
}

export const SECTION_HERO_AVATAR = "hero-avatar";
export const SECTION_HERO_ANIMATION = "hero-animation";

/** Type-safe string property access for JSONB-backed Records. */
export function getStringProp(
	obj: Record<string, unknown>,
	key: string,
): string | undefined {
	const val = obj[key];
	return typeof val === "string" && val !== "" ? val : undefined;
}

/** Extract typed hero fields from a full invitation content object. */
export function parseHeroContent(
	content: Record<string, unknown>,
): HeroContent {
	const hero = content?.hero;
	if (!hero || typeof hero !== "object") return {};

	const h = hero as Record<string, unknown>;
	return {
		heroImageUrl: getStringProp(h, "heroImageUrl"),
		avatarImageUrl: getStringProp(h, "avatarImageUrl"),
		avatarStyle: getStringProp(h, "avatarStyle"),
		animatedVideoUrl: getStringProp(h, "animatedVideoUrl"),
	};
}
