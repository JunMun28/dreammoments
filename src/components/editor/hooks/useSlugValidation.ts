import { useCallback, useEffect, useRef, useState } from "react";
import { checkSlugAvailabilityFn } from "@/api/invitations";

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const SLUG_MIN = 3;
const SLUG_MAX = 50;
const RESERVED_SLUGS = new Set([
	"admin",
	"api",
	"auth",
	"dashboard",
	"editor",
	"upgrade",
	"invite",
	"login",
	"signup",
	"settings",
	"help",
	"support",
	"about",
	"privacy",
	"terms",
]);

export const SLUG_RULES =
	"Use lowercase letters, numbers, and hyphens. 3\u201360 characters. Must start and end with a letter or number.";

export type SlugAvailability = "idle" | "checking" | "available" | "taken";

export function validateSlug(slug: string): string {
	if (!slug) return "";
	if (slug.length < SLUG_MIN)
		return `Slug must be at least ${SLUG_MIN} characters`;
	if (slug.length > SLUG_MAX)
		return `Slug must be at most ${SLUG_MAX} characters`;
	if (!SLUG_REGEX.test(slug))
		return "Only lowercase letters, numbers, and hyphens allowed. Must start and end with a letter or number.";
	if (RESERVED_SLUGS.has(slug)) return `"${slug}" is a reserved word`;
	return "";
}

/** Suggest alternative slugs when a reserved word is entered */
export function suggestAlternatives(
	slug: string,
	coupleNames?: string,
): string[] {
	const suggestions: string[] = [];
	const year = new Date().getFullYear();
	if (coupleNames) {
		const nameSlug = coupleNames
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
		if (nameSlug.length >= SLUG_MIN) {
			suggestions.push(`${nameSlug}-wedding`);
		}
	}
	suggestions.push(`${slug}-${year}`);
	suggestions.push(`${slug}-wedding`);
	return suggestions;
}

/** Generate a slug automatically from couple names in the invitation content */
export function generateSlugFromNames(
	groomName?: string,
	brideName?: string,
): string {
	const parts = [groomName, brideName].filter(Boolean);
	if (parts.length === 0) return "";
	return parts
		.join("-and-")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

interface UseSlugValidationOptions {
	invitationId: string;
}

export function useSlugValidation({ invitationId }: UseSlugValidationOptions) {
	const [slugValue, setSlugValueState] = useState("");
	const [slugError, setSlugError] = useState("");
	const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);
	const [slugAvailability, setSlugAvailability] =
		useState<SlugAvailability>("idle");
	const slugCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const slugCheckVersion = useRef(0);

	useEffect(() => {
		return () => {
			if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);
		};
	}, []);

	const setSlugValue = useCallback(
		(value: string, coupleNames?: string) => {
			const normalized = value.toLowerCase().replace(/\s+/g, "-");
			setSlugValueState(normalized);

			if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);

			const error = validateSlug(normalized);
			setSlugError(error);

			// Generate suggestions for reserved words
			if (RESERVED_SLUGS.has(normalized)) {
				setSlugSuggestions(suggestAlternatives(normalized, coupleNames));
			} else {
				setSlugSuggestions([]);
			}

			if (error || !normalized) {
				setSlugAvailability("idle");
				return;
			}

			setSlugAvailability("checking");
			slugCheckVersion.current += 1;
			const currentVersion = slugCheckVersion.current;
			slugCheckTimer.current = setTimeout(() => {
				const token = window.localStorage.getItem("dm-auth-token");
				if (!token) return;
				void checkSlugAvailabilityFn({
					data: { token, slug: normalized, invitationId },
				})
					.then((result: { available: boolean }) => {
						// Only apply if this is still the latest request
						if (currentVersion !== slugCheckVersion.current) return;
						setSlugAvailability(result.available ? "available" : "taken");
					})
					.catch(() => {
						if (currentVersion !== slugCheckVersion.current) return;
						setSlugAvailability("idle");
					});
			}, 200);
		},
		[invitationId],
	);

	const reset = useCallback((initialSlug: string) => {
		setSlugValueState(initialSlug);
		setSlugError("");
		setSlugSuggestions([]);
		setSlugAvailability("idle");
	}, []);

	const slugIsValid =
		!slugError &&
		slugValue.trim() !== "" &&
		(slugAvailability === "available" || slugAvailability === "idle");

	return {
		slugValue,
		slugError,
		slugSuggestions,
		slugAvailability,
		slugIsValid,
		setSlugValue,
		reset,
	};
}
