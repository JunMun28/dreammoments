import { useCallback, useEffect, useRef, useState } from "react";
import {
	getAnimationStatusFn,
	removeAnimationFn,
	submitAnimationFn,
} from "@/api/ai-animation";
import { generateAvatarFn, removeAvatarFn } from "@/api/ai-avatar";
import { getStringProp } from "@/lib/hero-content";

export type LivingPortraitStep =
	| "idle"
	| "generating-avatar"
	| "generating-video";

interface UseLivingPortraitOptions {
	invitationId: string;
	token: string;
	heroData: Record<string, unknown>;
	onChange: (fieldPath: string, value: string | boolean) => void;
}

export function useLivingPortrait({
	invitationId,
	token,
	heroData,
	onChange,
}: UseLivingPortraitOptions) {
	const [step, setStep] = useState<LivingPortraitStep>("idle");
	const [error, setError] = useState<string | null>(null);
	const [remaining, setRemaining] = useState<number | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

	// videoJobId is only used for internal tracking, not rendered — use ref
	const videoJobIdRef = useRef<string | null>(null);

	// Ref-based mutex to prevent double-clicks
	const generatingRef = useRef(false);
	const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const heroImageUrl = getStringProp(heroData, "heroImageUrl");
	const avatarImageUrl =
		getStringProp(heroData, "avatarImageUrl") ?? avatarPreview;
	const avatarStyle = getStringProp(heroData, "avatarStyle");
	const animatedVideoUrl = getStringProp(heroData, "animatedVideoUrl");

	// Clean up polling on unmount
	useEffect(() => {
		return () => {
			if (pollTimerRef.current) {
				clearTimeout(pollTimerRef.current);
			}
		};
	}, []);

	const generateAvatar = useCallback(
		async (style: "pixar" | "ghibli") => {
			if (generatingRef.current) return;
			generatingRef.current = true;
			setStep("generating-avatar");
			setError(null);

			try {
				const result = await generateAvatarFn({
					data: { invitationId, style, token },
				});

				if (result && typeof result === "object" && "error" in result) {
					setError(String((result as { error: string }).error));
					setStep("idle");
					return;
				}

				const typed = result as {
					avatarImageUrl: string;
					remaining: number;
				};

				// Show preview immediately
				setAvatarPreview(typed.avatarImageUrl);
				setRemaining(typed.remaining);

				// Apply to content via handleFieldChange
				onChange("hero.avatarImageUrl", typed.avatarImageUrl);
				onChange("hero.avatarStyle", style);

				// If there was a video, clear it since avatar changed
				if (animatedVideoUrl) {
					onChange("hero.animatedVideoUrl", "");
				}

				setStep("idle");
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to generate avatar. Please try again.",
				);
				setStep("idle");
			} finally {
				generatingRef.current = false;
			}
		},
		[invitationId, token, onChange, animatedVideoUrl],
	);

	const pollVideoStatus = useCallback(
		async (jobId: string, attempt = 0) => {
			try {
				const result = await getAnimationStatusFn({
					data: { jobId, token },
				});

				if (result && typeof result === "object" && "error" in result) {
					setError(String((result as { error: string }).error));
					setStep("idle");
					videoJobIdRef.current = null;
					return;
				}

				const status = result as {
					status: "processing" | "completed" | "failed";
					animatedVideoUrl?: string;
				};

				if (status.status === "completed" && status.animatedVideoUrl) {
					onChange("hero.animatedVideoUrl", status.animatedVideoUrl);
					setStep("idle");
					videoJobIdRef.current = null;
					return;
				}

				if (status.status === "failed") {
					setError(
						"Video generation failed. The avatar will be used as your hero image instead.",
					);
					setStep("idle");
					videoJobIdRef.current = null;
					return;
				}

				// Timeout after 120 polling attempts (~4–10 minutes)
				if (attempt >= 120) {
					setError("Video generation timed out. Please try again.");
					setStep("idle");
					videoJobIdRef.current = null;
					return;
				}

				// Still processing — poll again with backoff
				const delay = attempt < 15 ? 2000 : 5000;
				pollTimerRef.current = setTimeout(
					() => pollVideoStatus(jobId, attempt + 1),
					delay,
				);
			} catch {
				// Retry on transient errors, up to a point
				if (attempt < 60) {
					pollTimerRef.current = setTimeout(
						() => pollVideoStatus(jobId, attempt + 1),
						5000,
					);
				} else {
					setError("Video generation timed out. Please try again.");
					setStep("idle");
					videoJobIdRef.current = null;
				}
			}
		},
		[token, onChange],
	);

	const animateAvatar = useCallback(async () => {
		if (generatingRef.current) return;
		if (!avatarImageUrl) return;
		generatingRef.current = true;
		setStep("generating-video");
		setError(null);

		try {
			const result = await submitAnimationFn({
				data: { invitationId, token },
			});

			if (result && typeof result === "object" && "error" in result) {
				setError(String((result as { error: string }).error));
				setStep("idle");
				return;
			}

			const typed = result as {
				jobId: string;
				remaining: number;
			};

			videoJobIdRef.current = typed.jobId;
			setRemaining(typed.remaining);

			// Start polling
			pollVideoStatus(typed.jobId);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to start video generation. Please try again.",
			);
			setStep("idle");
		} finally {
			generatingRef.current = false;
		}
	}, [invitationId, token, avatarImageUrl, pollVideoStatus]);

	const removeAvatar = useCallback(async () => {
		try {
			await removeAvatarFn({ data: { invitationId, token } });
		} catch {
			// Fall through — clear UI state regardless
		}
		onChange("hero.avatarImageUrl", "");
		onChange("hero.avatarStyle", "");
		if (animatedVideoUrl) {
			onChange("hero.animatedVideoUrl", "");
		}
		setAvatarPreview(null);
	}, [invitationId, token, onChange, animatedVideoUrl]);

	const removeVideo = useCallback(async () => {
		try {
			await removeAnimationFn({ data: { invitationId, token } });
		} catch {
			// Fall through — clear UI state regardless
		}
		onChange("hero.animatedVideoUrl", "");
		if (pollTimerRef.current) {
			clearTimeout(pollTimerRef.current);
			pollTimerRef.current = null;
		}
		videoJobIdRef.current = null;
		setStep("idle");
	}, [invitationId, token, onChange]);

	return {
		step,
		error,
		remaining,
		heroImageUrl,
		avatarImageUrl,
		avatarStyle,
		animatedVideoUrl,
		generateAvatar,
		animateAvatar,
		removeAvatar,
		removeVideo,
	};
}
