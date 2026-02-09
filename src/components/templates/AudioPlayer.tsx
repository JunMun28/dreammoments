import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
	src: string;
	label?: string;
	className?: string;
}

export default function AudioPlayer({
	src,
	label,
	className,
}: AudioPlayerProps) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [volume, setVolume] = useState(0.7);
	const [showVolume, setShowVolume] = useState(false);
	const hideTimeout = useRef<ReturnType<typeof setTimeout>>(null);

	const togglePlay = useCallback(() => {
		const audio = audioRef.current;
		if (!audio) return;
		if (isPlaying) {
			audio.pause();
		} else {
			audio.play().catch(() => {
				// Browser blocked autoplay, stay paused
			});
		}
	}, [isPlaying]);

	const toggleMute = useCallback(() => {
		const audio = audioRef.current;
		if (!audio) return;
		const next = !isMuted;
		audio.muted = next;
		setIsMuted(next);
	}, [isMuted]);

	const handleVolumeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const val = Number.parseFloat(e.target.value);
			setVolume(val);
			if (audioRef.current) {
				audioRef.current.volume = val;
			}
			if (val === 0) {
				setIsMuted(true);
				if (audioRef.current) audioRef.current.muted = true;
			} else if (isMuted) {
				setIsMuted(false);
				if (audioRef.current) audioRef.current.muted = false;
			}
		},
		[isMuted],
	);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const onPlay = () => setIsPlaying(true);
		const onPause = () => setIsPlaying(false);
		const onEnded = () => setIsPlaying(false);

		audio.addEventListener("play", onPlay);
		audio.addEventListener("pause", onPause);
		audio.addEventListener("ended", onEnded);

		return () => {
			audio.removeEventListener("play", onPlay);
			audio.removeEventListener("pause", onPause);
			audio.removeEventListener("ended", onEnded);
		};
	}, []);

	useEffect(() => {
		return () => {
			if (hideTimeout.current) clearTimeout(hideTimeout.current);
		};
	}, []);

	const handleMouseEnter = useCallback(() => {
		if (hideTimeout.current) clearTimeout(hideTimeout.current);
		setShowVolume(true);
	}, []);

	const handleMouseLeave = useCallback(() => {
		hideTimeout.current = setTimeout(() => setShowVolume(false), 300);
	}, []);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: mouse events are decorative (show/hide volume slider on hover)
		<div
			className={cn(
				"fixed bottom-6 right-6 flex items-center gap-2",
				className,
			)}
			style={{ zIndex: "var(--dm-z-dropdown)" } as React.CSSProperties}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{/* biome-ignore lint/a11y/useMediaCaption: background music, no captions needed */}
			<audio ref={audioRef} src={src} preload="metadata" />

			{/* Volume controls - slide in from right */}
			<div
				className={cn(
					"dm-audio-volume-tray flex items-center gap-2 rounded-full px-3 py-2",
					"backdrop-blur-md",
					showVolume ? "dm-audio-volume-visible" : "dm-audio-volume-hidden",
				)}
				style={
					{
						background: "rgba(255, 255, 255, 0.15)",
						border: "1px solid rgba(255, 255, 255, 0.2)",
					} as React.CSSProperties
				}
			>
				<button
					type="button"
					onClick={toggleMute}
					aria-label={isMuted ? "Unmute" : "Mute"}
					className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
				>
					{isMuted || volume === 0 ? (
						<VolumeX size={16} />
					) : (
						<Volume2 size={16} />
					)}
				</button>
				<input
					type="range"
					min="0"
					max="1"
					step="0.01"
					value={isMuted ? 0 : volume}
					onChange={handleVolumeChange}
					aria-label="Volume"
					className="dm-audio-slider h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/30"
				/>
				{label ? (
					<span className="max-w-[120px] truncate text-xs text-white/70">
						{label}
					</span>
				) : null}
			</div>

			{/* Play/Pause button */}
			<button
				type="button"
				onClick={togglePlay}
				aria-label={isPlaying ? "Pause music" : "Play music"}
				className={cn(
					"dm-audio-play-btn flex h-12 w-12 items-center justify-center rounded-full",
					"text-white shadow-lg backdrop-blur-md",
					"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
				)}
				style={
					{
						background: "rgba(0, 0, 0, 0.5)",
						border: "1px solid rgba(255, 255, 255, 0.2)",
					} as React.CSSProperties
				}
			>
				{isPlaying ? <Pause size={20} /> : <Play size={20} />}
			</button>
		</div>
	);
}
