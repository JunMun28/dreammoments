import { useCallback, useEffect, useRef, useState } from "react";
import { getAnimationStatusFn, submitAnimationFn } from "@/api/ai-animation";
import { generateAvatarFn } from "@/api/ai-avatar";

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
	const [videoJobId, setVideoJobId] = useState<string | null>(null);

	// Ref-based mutex to prevent double-clicks
	const generatingRef = useRef(false);
	const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const heroImageUrl = heroData.heroImageUrl as string | undefined;
	const avatarImageUrl =
		(heroData.avatarImageUrl as string | undefined) ?? avatarPreview;
	const avatarStyle = heroData.avatarStyle as string | undefined;
	const animatedVideoUrl = heroData.animatedVideoUrl as string | undefined;

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

				if ("error" in result) {
					setError(String(result.error));
					setStep("idle");
					return;
				}

				const { avatarImageUrl: url, remaining: rem } = result as {
					avatarImageUrl: string;
					remaining: number;
				};

				// Show preview immediately
				setAvatarPreview(url);
				setRemaining(rem);

				// Apply to content via handleFieldChange
				onChange("hero.avatarImageUrl", url);
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

				if ("error" in result) {
					setError(String(result.error));
					setStep("idle");
					setVideoJobId(null);
					return;
				}

				const status = result as {
					status: "processing" | "completed" | "failed";
					animatedVideoUrl?: string;
				};

				if (status.status === "completed" && status.animatedVideoUrl) {
					onChange("hero.animatedVideoUrl", status.animatedVideoUrl);
					setStep("idle");
					setVideoJobId(null);
					return;
				}

				if (status.status === "failed") {
					setError(
						"Video generation failed. The avatar will be used as your hero image instead.",
					);
					setStep("idle");
					setVideoJobId(null);
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
					setVideoJobId(null);
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

			if ("error" in result) {
				setError(String(result.error));
				setStep("idle");
				return;
			}

			const { jobId, remaining: rem } = result as {
				jobId: string;
				remaining: number;
			};

			setVideoJobId(jobId);
			setRemaining(rem);

			// Start polling
			pollVideoStatus(jobId);
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

	const removeAvatar = useCallback(() => {
		onChange("hero.avatarImageUrl", "");
		onChange("hero.avatarStyle", "");
		if (animatedVideoUrl) {
			onChange("hero.animatedVideoUrl", "");
		}
		setAvatarPreview(null);
	}, [onChange, animatedVideoUrl]);

	const removeVideo = useCallback(() => {
		onChange("hero.animatedVideoUrl", "");
		if (pollTimerRef.current) {
			clearTimeout(pollTimerRef.current);
			pollTimerRef.current = null;
		}
		setVideoJobId(null);
		setStep("idle");
	}, [onChange]);

	return {
		step,
		error,
		remaining,
		heroImageUrl,
		avatarImageUrl,
		avatarStyle,
		animatedVideoUrl,
		videoJobId,
		generateAvatar,
		animateAvatar,
		removeAvatar,
		removeVideo,
	};
}
