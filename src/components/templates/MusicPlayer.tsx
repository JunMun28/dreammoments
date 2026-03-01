import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MusicPlayerProps {
	audioUrl: string;
	className?: string;
}

export function MusicPlayer({ audioUrl, className }: MusicPlayerProps) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);

	const toggle = () => {
		const audio = audioRef.current;
		if (!audio) return;
		if (isPlaying) {
			audio.pause();
		} else {
			audio.play().catch(() => {
				// Browser autoplay policy blocked playback
			});
		}
		setIsPlaying(!isPlaying);
	};

	return (
		<div
			className={cn("fixed bottom-5 right-5 z-40", className)}
			style={{ pointerEvents: "auto" }}
		>
			{/* biome-ignore lint/a11y/useMediaCaption: background music has no dialogue to caption */}
			<audio ref={audioRef} src={audioUrl} loop preload="none" />
			<button
				type="button"
				onClick={toggle}
				aria-label={
					isPlaying ? "Pause background music" : "Play background music"
				}
				className="flex items-center justify-center rounded-full"
				style={{
					width: 48,
					height: 48,
					background: "#FFF8F0",
					border: "2px solid rgba(212,168,67,0.3)",
					boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
					cursor: "pointer",
				}}
			>
				<span
					className={cn("dh-music-spin", !isPlaying && "paused")}
					aria-hidden="true"
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<svg
						width={28}
						height={28}
						viewBox="0 0 28 28"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<title>Vinyl disc</title>
						<circle
							cx={14}
							cy={14}
							r={13}
							stroke="#2B1216"
							strokeWidth={1}
							fill="#2B1216"
						/>
						<circle
							cx={14}
							cy={14}
							r={10}
							stroke="rgba(212,168,67,0.3)"
							strokeWidth={0.5}
							fill="none"
						/>
						<circle
							cx={14}
							cy={14}
							r={7}
							stroke="rgba(212,168,67,0.2)"
							strokeWidth={0.5}
							fill="none"
						/>
						<circle cx={14} cy={14} r={4} fill="#D4A843" />
						<circle cx={14} cy={14} r={2} fill="#FFF8F0" />
					</svg>
				</span>
			</button>
		</div>
	);
}
