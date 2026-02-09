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

interface UseSlugValidationOptions {
	invitationId: string;
}

export function useSlugValidation({ invitationId }: UseSlugValidationOptions) {
	const [slugValue, setSlugValueState] = useState("");
	const [slugError, setSlugError] = useState("");
	const [slugAvailability, setSlugAvailability] =
		useState<SlugAvailability>("idle");
	const slugCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);
		};
	}, []);

	const setSlugValue = useCallback(
		(value: string) => {
			const normalized = value.toLowerCase().replace(/\s+/g, "-");
			setSlugValueState(normalized);

			if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);

			const error = validateSlug(normalized);
			setSlugError(error);

			if (error || !normalized) {
				setSlugAvailability("idle");
				return;
			}

			setSlugAvailability("checking");
			slugCheckTimer.current = setTimeout(() => {
				const token = window.localStorage.getItem("dm-auth-token");
				if (!token) return;
				void checkSlugAvailabilityFn({
					data: { token, slug: normalized, invitationId },
				})
					.then((result: { available: boolean }) => {
						setSlugAvailability(result.available ? "available" : "taken");
					})
					.catch(() => {
						setSlugAvailability("idle");
					});
			}, 400);
		},
		[invitationId],
	);

	const reset = useCallback((initialSlug: string) => {
		setSlugValueState(initialSlug);
		setSlugError("");
		setSlugAvailability("idle");
	}, []);

	const slugIsValid =
		!slugError &&
		(slugAvailability === "available" || slugAvailability === "idle");

	return {
		slugValue,
		slugError,
		slugAvailability,
		slugIsValid,
		setSlugValue,
		reset,
	};
}
