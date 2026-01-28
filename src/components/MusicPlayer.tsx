/**
 * Floating music player component for background audio
 */

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface MusicPlayerProps {
	/** URL of the audio file */
	audioUrl: string;
	/** Whether to auto-play (requires user interaction first on mobile) */
	autoPlay?: boolean;
	/** Whether to loop the audio */
	loop?: boolean;
	/** Initial volume (0-1) */
	volume?: number;
	/** Accent color for styling */
	accentColor?: string;
	/** Whether the theme is dark */
	isDark?: boolean;
}

/**
 * Floating music player with play/pause and volume controls
 */
export function MusicPlayer({
	audioUrl,
	autoPlay = false,
	loop = true,
	volume = 0.7,
	accentColor = "#b76e79",
	isDark = false,
}: MusicPlayerProps) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [hasInteracted, setHasInteracted] = useState(false);

	// Initialize audio element
	useEffect(() => {
		const audio = new Audio(audioUrl);
		audio.loop = loop;
		audio.volume = volume;
		audioRef.current = audio;

		// Handle audio end
		audio.addEventListener("ended", () => {
			if (!loop) {
				setIsPlaying(false);
			}
		});

		return () => {
			audio.pause();
			audio.src = "";
		};
	}, [audioUrl, loop, volume]);

	// Handle autoplay after user interaction
	useEffect(() => {
		if (autoPlay && hasInteracted && audioRef.current) {
			audioRef.current.play().catch(() => {
				// Autoplay may fail due to browser restrictions
			});
			setIsPlaying(true);
		}
	}, [autoPlay, hasInteracted]);

	// Toggle play/pause
	const togglePlay = useCallback(() => {
		if (!audioRef.current) return;

		setHasInteracted(true);

		if (isPlaying) {
			audioRef.current.pause();
			setIsPlaying(false);
		} else {
			audioRef.current.play().catch(() => {
				// Handle play failure
			});
			setIsPlaying(true);
		}
	}, [isPlaying]);

	// Toggle mute
	const toggleMute = useCallback(() => {
		if (!audioRef.current) return;

		if (isMuted) {
			audioRef.current.volume = volume;
			setIsMuted(false);
		} else {
			audioRef.current.volume = 0;
			setIsMuted(true);
		}
	}, [isMuted, volume]);

	return (
		<div
			className={cn(
				"fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full px-3 py-2 shadow-lg backdrop-blur-md",
				isDark ? "bg-black/50" : "bg-white/80",
			)}
		>
			<Button
				variant="ghost"
				size="icon"
				className={cn(
					"h-8 w-8 rounded-full",
					isDark
						? "text-white hover:bg-white/20"
						: "text-gray-800 hover:bg-gray-200",
				)}
				onClick={togglePlay}
				style={{ color: isPlaying ? accentColor : undefined }}
			>
				{isPlaying ? (
					<Pause className="h-4 w-4" />
				) : (
					<Play className="h-4 w-4" />
				)}
			</Button>

			<Button
				variant="ghost"
				size="icon"
				className={cn(
					"h-8 w-8 rounded-full",
					isDark
						? "text-white hover:bg-white/20"
						: "text-gray-800 hover:bg-gray-200",
				)}
				onClick={toggleMute}
			>
				{isMuted ? (
					<VolumeX className="h-4 w-4" />
				) : (
					<Volume2 className="h-4 w-4" />
				)}
			</Button>

			{/* Playing indicator */}
			{isPlaying && (
				<div className="flex items-center gap-0.5">
					{[0, 1, 2].map((i) => (
						<div
							key={i}
							className="w-0.5 rounded-full animate-pulse"
							style={{
								backgroundColor: accentColor,
								height: `${8 + Math.random() * 8}px`,
								animationDelay: `${i * 0.15}s`,
							}}
						/>
					))}
				</div>
			)}
		</div>
	);
}
