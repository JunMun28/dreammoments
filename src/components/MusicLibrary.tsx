/**
 * Music selection panel for builder
 */

import { Check, Music, Pause, Play } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
	categoryNames,
	formatDuration,
	getAllCategories,
	getTracksByCategory,
	type MusicCategory,
	type MusicTrack,
	musicLibrary,
} from "@/lib/music-library";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";

interface MusicLibraryProps {
	/** Currently selected music URL */
	selectedUrl?: string | null;
	/** Music settings */
	settings?: {
		autoplay?: boolean;
		loop?: boolean;
		volume?: number;
	};
	/** Callback when music is selected */
	onSelect: (url: string | null) => void;
	/** Callback when settings change */
	onSettingsChange: (settings: {
		autoplay?: boolean;
		loop?: boolean;
		volume?: number;
	}) => void;
}

/**
 * Music library panel for selecting background music
 */
export function MusicLibrary({
	selectedUrl,
	settings = { autoplay: false, loop: true, volume: 0.7 },
	onSelect,
	onSettingsChange,
}: MusicLibraryProps) {
	const [activeCategory, setActiveCategory] = useState<MusicCategory | "all">(
		"all",
	);
	const [previewingTrack, setPreviewingTrack] = useState<string | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// Get tracks for current category
	const tracks =
		activeCategory === "all"
			? musicLibrary
			: getTracksByCategory(activeCategory);

	// Preview a track
	const togglePreview = useCallback(
		(track: MusicTrack) => {
			if (previewingTrack === track.id) {
				// Stop preview
				audioRef.current?.pause();
				setPreviewingTrack(null);
			} else {
				// Start preview
				if (audioRef.current) {
					audioRef.current.pause();
				}
				const audio = new Audio(track.url);
				audio.volume = settings.volume ?? 0.7;
				audio.play().catch(() => {});
				audioRef.current = audio;
				setPreviewingTrack(track.id);

				// Auto-stop after 30 seconds
				setTimeout(() => {
					if (previewingTrack === track.id) {
						audio.pause();
						setPreviewingTrack(null);
					}
				}, 30000);
			}
		},
		[previewingTrack, settings.volume],
	);

	// Select a track
	const selectTrack = useCallback(
		(track: MusicTrack) => {
			onSelect(track.url);
			// Stop any preview
			audioRef.current?.pause();
			setPreviewingTrack(null);
		},
		[onSelect],
	);

	// Clear selection
	const clearSelection = useCallback(() => {
		onSelect(null);
	}, [onSelect]);

	return (
		<div className="space-y-4">
			{/* Settings */}
			<div className="space-y-3 rounded-lg border p-3">
				<div className="flex items-center justify-between">
					<Label htmlFor="autoplay" className="text-sm">
						Auto-play
					</Label>
					<Switch
						id="autoplay"
						checked={settings.autoplay ?? false}
						onCheckedChange={(checked) =>
							onSettingsChange({ ...settings, autoplay: checked })
						}
					/>
				</div>
				<div className="flex items-center justify-between">
					<Label htmlFor="loop" className="text-sm">
						Loop
					</Label>
					<Switch
						id="loop"
						checked={settings.loop ?? true}
						onCheckedChange={(checked) =>
							onSettingsChange({ ...settings, loop: checked })
						}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="volume" className="text-sm">
						Volume
					</Label>
					<Slider
						id="volume"
						min={0}
						max={1}
						step={0.1}
						value={[settings.volume ?? 0.7]}
						onValueChange={([value]) =>
							onSettingsChange({ ...settings, volume: value })
						}
					/>
				</div>
			</div>

			{/* Category tabs */}
			<div className="flex flex-wrap gap-1">
				<Button
					variant={activeCategory === "all" ? "default" : "outline"}
					size="sm"
					onClick={() => setActiveCategory("all")}
				>
					All
				</Button>
				{getAllCategories().map((category) => (
					<Button
						key={category}
						variant={activeCategory === category ? "default" : "outline"}
						size="sm"
						onClick={() => setActiveCategory(category)}
					>
						{categoryNames[category]}
					</Button>
				))}
			</div>

			{/* Selected track indicator */}
			{selectedUrl && (
				<div className="flex items-center justify-between rounded-lg bg-primary/10 p-2">
					<div className="flex items-center gap-2">
						<Music className="h-4 w-4 text-primary" />
						<span className="text-sm font-medium">Music selected</span>
					</div>
					<Button variant="ghost" size="sm" onClick={clearSelection}>
						Remove
					</Button>
				</div>
			)}

			{/* Track list */}
			<ScrollArea className="h-[300px]">
				<div className="space-y-2">
					{tracks.map((track) => (
						<div
							key={track.id}
							className={cn(
								"flex items-center justify-between rounded-lg border p-2 transition-colors",
								selectedUrl === track.url && "border-primary bg-primary/5",
							)}
						>
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={() => togglePreview(track)}
								>
									{previewingTrack === track.id ? (
										<Pause className="h-4 w-4" />
									) : (
										<Play className="h-4 w-4" />
									)}
								</Button>
								<div>
									<p className="text-sm font-medium">{track.title}</p>
									<p className="text-xs text-muted-foreground">
										{track.artist} • {formatDuration(track.duration)}
									</p>
								</div>
							</div>
							<Button
								variant={selectedUrl === track.url ? "default" : "outline"}
								size="sm"
								onClick={() => selectTrack(track)}
							>
								{selectedUrl === track.url ? (
									<>
										<Check className="mr-1 h-3 w-3" />
										Selected
									</>
								) : (
									"Select"
								)}
							</Button>
						</div>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}
