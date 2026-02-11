import { Loader2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
	src: string;
	label?: string;
	className?: string;
}

function VolumeIcon({ muted, volume }: { muted: boolean; volume: number }) {
	if (muted || volume === 0) return <VolumeX size={16} />;
	return <Volume2 size={16} />;
}

function PlayIcon({
	buffering,
	playing,
}: { buffering: boolean; playing: boolean }) {
	if (buffering) return <Loader2 size={20} className="animate-spin" />;
	if (playing) return <Pause size={20} />;
	return <Play size={20} />;
}

export default function AudioPlayer({
	src,
	label,
	className,
}: AudioPlayerProps) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [isBuffering, setIsBuffering] = useState(false);
	const [volume, setVolume] = useState(0.7);
	const [showVolume, setShowVolume] = useState(false);
	const hideTimeout = useRef<ReturnType<typeof setTimeout>>(null);

	const togglePlay = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			const audio = audioRef.current;
			if (!audio) return;
			if (isPlaying) {
				audio.pause();
			} else {
				audio.play().catch(() => {});
			}
		},
		[isPlaying],
	);

	const toggleMute = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			const audio = audioRef.current;
			if (!audio) return;
			const next = !isMuted;
			audio.muted = next;
			setIsMuted(next);
		},
		[isMuted],
	);

	const handleVolumeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const audio = audioRef.current;
			const val = Number.parseFloat(e.target.value);
			setVolume(val);
			if (audio) {
				audio.volume = val;
				audio.muted = val === 0;
			}
			setIsMuted(val === 0);
		},
		[],
	);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const onPlay = () => setIsPlaying(true);
		const onPause = () => setIsPlaying(false);
		const onWaiting = () => setIsBuffering(true);
		const onCanPlay = () => setIsBuffering(false);

		audio.addEventListener("play", onPlay);
		audio.addEventListener("pause", onPause);
		audio.addEventListener("waiting", onWaiting);
		audio.addEventListener("canplaythrough", onCanPlay);

		return () => {
			audio.removeEventListener("play", onPlay);
			audio.removeEventListener("pause", onPause);
			audio.removeEventListener("waiting", onWaiting);
			audio.removeEventListener("canplaythrough", onCanPlay);
			if (hideTimeout.current) clearTimeout(hideTimeout.current);
		};
	}, []);

	useEffect(() => {
		if (!showVolume) return;
		const handleTouchOutside = (e: TouchEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setShowVolume(false);
			}
		};
		document.addEventListener("touchstart", handleTouchOutside);
		return () => document.removeEventListener("touchstart", handleTouchOutside);
	}, [showVolume]);

	const handleMouseEnter = useCallback(() => {
		if (hideTimeout.current) clearTimeout(hideTimeout.current);
		setShowVolume(true);
	}, []);

	const handleMouseLeave = useCallback(() => {
		hideTimeout.current = setTimeout(() => setShowVolume(false), 300);
	}, []);

	const toggleVolumeTray = useCallback((event: React.MouseEvent) => {
		event.stopPropagation();
		setShowVolume((prev) => !prev);
	}, []);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: hover events for desktop volume tray
		<div
			ref={containerRef}
			className={cn(
				"fixed bottom-6 right-4 sm:bottom-20 sm:right-6 z-50 flex items-center gap-2",
				className,
			)}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{/* biome-ignore lint/a11y/useMediaCaption: background music, no captions needed */}
			<audio ref={audioRef} src={src} preload="metadata" loop />

			<div
				role="group"
				aria-label="Adjust music volume"
				className={cn(
					"dm-audio-volume-tray flex items-center gap-2 rounded-full px-3 py-2",
					"backdrop-blur-md",
					showVolume ? "dm-audio-volume-visible" : "dm-audio-volume-hidden",
				)}
				onClick={(e) => e.stopPropagation()}
				onKeyDown={() => {}}
				style={{
					background: "rgba(255, 255, 255, 0.15)",
					border: "1px solid rgba(255, 255, 255, 0.2)",
				}}
			>
				<button
					type="button"
					onClick={toggleMute}
					aria-label={isMuted ? "Unmute" : "Mute"}
					className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
				>
					<VolumeIcon muted={isMuted} volume={volume} />
				</button>
				<input
					type="range"
					min="0"
					max="1"
					step="0.01"
					value={isMuted ? 0 : volume}
					onChange={handleVolumeChange}
					aria-label="Adjust music volume"
					className="dm-audio-slider h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/30"
				/>
				{label ? (
					<span className="max-w-[120px] truncate text-xs text-white/70">
						{label}
					</span>
				) : null}
			</div>

			<button
				type="button"
				onClick={toggleVolumeTray}
				aria-label="Toggle volume controls"
				className={cn(
					"flex h-10 w-10 items-center justify-center rounded-full",
					"text-white/70 hover:text-white backdrop-blur-md",
					"focus-visible:outline focus-visible:outline-2 focus-visible:outline-white",
				)}
				style={{
					background: "rgba(0, 0, 0, 0.35)",
					border: "1px solid rgba(255, 255, 255, 0.15)",
				}}
			>
				<VolumeIcon muted={isMuted} volume={volume} />
			</button>

			<button
				type="button"
				onClick={togglePlay}
				aria-label={isPlaying ? "Pause music" : "Play music"}
				className={cn(
					"dm-audio-play-btn flex h-12 w-12 items-center justify-center rounded-full",
					"text-white shadow-lg backdrop-blur-md",
					"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
				)}
				style={{
					background: "rgba(0, 0, 0, 0.5)",
					border: "1px solid rgba(255, 255, 255, 0.2)",
				}}
			>
				<PlayIcon buffering={isBuffering} playing={isPlaying} />
			</button>
		</div>
	);
}
