import { useCallback, useEffect, useRef, useState } from "react";

const PLACEHOLDER_PHOTO =
	"https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80";

interface HeroMediaProps {
	heroImageUrl?: string;
	avatarImageUrl?: string;
	animatedVideoUrl?: string;
	mode?: "editor" | "preview" | "public";
}

/**
 * Renders the hero background media with waterfall fallback:
 * 1. animatedVideoUrl → poster-first progressive video loading
 * 2. avatarImageUrl → static image with Ken Burns
 * 3. heroImageUrl → static image with Ken Burns (current behavior)
 * 4. Unsplash placeholder
 *
 * Respects prefers-reduced-motion and viewport-gated playback.
 * In editor mode, shows poster frame with badge instead of autoplay.
 */
export function HeroMedia({
	heroImageUrl,
	avatarImageUrl,
	animatedVideoUrl,
	mode = "public",
}: HeroMediaProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [videoReady, setVideoReady] = useState(false);
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	// Determine the best poster image
	const posterUrl = avatarImageUrl || heroImageUrl || PLACEHOLDER_PHOTO;
	const displayUrl = heroImageUrl || PLACEHOLDER_PHOTO;

	// Check reduced motion preference (client-side only)
	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setPrefersReducedMotion(mq.matches);
		const handler = (e: MediaQueryListEvent) =>
			setPrefersReducedMotion(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	// Viewport-gated playback: pause when off-screen
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-observe when video src changes or becomes ready
	useEffect(() => {
		const video = videoRef.current;
		const container = containerRef.current;
		if (!video || !container || mode === "editor") return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					video.play().catch(() => {});
				} else {
					video.pause();
				}
			},
			{ threshold: 0.25 },
		);

		observer.observe(container);
		return () => observer.disconnect();
	}, [mode, animatedVideoUrl, videoReady]);

	const handleVideoReady = useCallback(() => {
		setVideoReady(true);
	}, []);

	const handleImgError = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement>) => {
			const img = e.target as HTMLImageElement;
			if (!img.dataset.fallback) {
				img.dataset.fallback = "true";
				img.src = PLACEHOLDER_PHOTO;
			}
		},
		[],
	);

	const shouldShowVideo =
		animatedVideoUrl && mode !== "editor" && !prefersReducedMotion;

	return (
		<div ref={containerRef} className="absolute inset-0">
			{/* Poster image — always render as LCP element */}
			<img
				src={avatarImageUrl || displayUrl}
				alt=""
				fetchPriority="high"
				decoding="async"
				className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
					shouldShowVideo && videoReady
						? "dh-ken-burns opacity-0"
						: "dh-ken-burns"
				}`}
				onError={handleImgError}
			/>

			{/* Video element — cross-fades in when ready */}
			{shouldShowVideo && (
				<video
					ref={videoRef}
					src={animatedVideoUrl}
					poster={posterUrl}
					autoPlay
					muted
					loop
					playsInline
					preload="metadata"
					onCanPlayThrough={handleVideoReady}
					className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
						videoReady ? "opacity-100" : "opacity-0"
					}`}
				/>
			)}

			{/* Editor mode: show badge over poster */}
			{animatedVideoUrl && mode === "editor" && (
				<div className="absolute inset-0 flex items-center justify-center">
					<span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white">
						Video preview
					</span>
				</div>
			)}
		</div>
	);
}
