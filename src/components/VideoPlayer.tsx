/**
 * Video player component for wedding invitation videos
 * Supports both uploaded videos and YouTube embeds
 */

import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { extractYouTubeId } from "@/lib/schemas/video-schemas";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface VideoPlayerProps {
	/** Video URL (either direct or YouTube URL) */
	videoUrl: string;
	/** Video source type */
	videoSource: "upload" | "youtube";
	/** Accent color for controls */
	accentColor?: string;
	/** Whether the theme is dark */
	isDark?: boolean;
	/** Custom class name */
	className?: string;
}

/**
 * Video player with support for uploaded videos and YouTube embeds
 */
export function VideoPlayer({
	videoUrl,
	videoSource,
	isDark = false,
	className,
}: VideoPlayerProps) {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);

	// Toggle play/pause for uploaded videos
	const togglePlay = useCallback(() => {
		if (!videoRef.current) return;

		if (isPlaying) {
			videoRef.current.pause();
			setIsPlaying(false);
		} else {
			videoRef.current.play();
			setIsPlaying(true);
		}
	}, [isPlaying]);

	// Toggle mute for uploaded videos
	const toggleMute = useCallback(() => {
		if (!videoRef.current) return;

		videoRef.current.muted = !isMuted;
		setIsMuted(!isMuted);
	}, [isMuted]);

	// Toggle fullscreen
	const toggleFullscreen = useCallback(() => {
		if (!videoRef.current) return;

		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			videoRef.current.requestFullscreen();
		}
	}, []);

	// YouTube embed
	if (videoSource === "youtube") {
		const videoId = extractYouTubeId(videoUrl);
		if (!videoId) {
			return (
				<div
					className={cn(
						"flex items-center justify-center p-8 bg-gray-100 rounded-lg",
						className,
					)}
				>
					<p className="text-gray-500">Invalid YouTube URL</p>
				</div>
			);
		}

		return (
			<div
				className={cn(
					"relative aspect-video rounded-lg overflow-hidden",
					className,
				)}
			>
				<iframe
					src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
					title="Wedding video"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					className="absolute inset-0 w-full h-full"
				/>
			</div>
		);
	}

	// Uploaded video player
	return (
		<div className={cn("relative rounded-lg overflow-hidden group", className)}>
			<video
				ref={videoRef}
				src={videoUrl}
				className="w-full aspect-video object-cover"
				onEnded={() => setIsPlaying(false)}
				onClick={togglePlay}
			>
				<track kind="captions" />
			</video>

			{/* Controls overlay */}
			<div
				className={cn(
					"absolute inset-0 flex items-center justify-center transition-opacity",
					isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100",
					isDark ? "bg-black/30" : "bg-black/20",
				)}
			>
				<Button
					variant="ghost"
					size="icon"
					className="h-16 w-16 rounded-full bg-white/20 hover:bg-white/30 text-white"
					onClick={togglePlay}
				>
					{isPlaying ? (
						<Pause className="h-8 w-8" />
					) : (
						<Play className="h-8 w-8 ml-1" />
					)}
				</Button>
			</div>

			{/* Bottom controls */}
			<div
				className={cn(
					"absolute bottom-0 left-0 right-0 p-3 flex items-center justify-end gap-2 transition-opacity",
					isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100",
					isDark
						? "bg-gradient-to-t from-black/50"
						: "bg-gradient-to-t from-black/30",
				)}
			>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-white hover:bg-white/20"
					onClick={toggleMute}
				>
					{isMuted ? (
						<VolumeX className="h-4 w-4" />
					) : (
						<Volume2 className="h-4 w-4" />
					)}
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-white hover:bg-white/20"
					onClick={toggleFullscreen}
				>
					<Maximize className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
