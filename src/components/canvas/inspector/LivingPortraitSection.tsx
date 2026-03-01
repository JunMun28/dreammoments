import { Film, Loader2, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLivingPortrait } from "@/components/editor/hooks/useLivingPortrait";
import { cn } from "@/lib/utils";
import { InspectorSection } from "./InspectorSection";

interface LivingPortraitSectionProps {
	invitationId: string;
	token: string;
	/** Current image src from the hero block */
	heroImageUrl: string;
	/** Current avatar URL from block content */
	avatarImageUrl?: string;
	/** Current avatar style from block content */
	avatarStyle?: string;
	/** Current animated video URL from block content */
	animatedVideoUrl?: string;
	/** Called when avatar/video fields change */
	onUpdateContent: (contentPatch: Record<string, unknown>) => void;
}

/**
 * Living Portrait controls for the canvas inspector sidebar.
 * Shown when a hero image block is selected.
 */
export function LivingPortraitSection({
	invitationId,
	token,
	heroImageUrl,
	avatarImageUrl,
	avatarStyle: currentStyle,
	animatedVideoUrl: currentVideoUrl,
	onUpdateContent,
}: LivingPortraitSectionProps) {
	const [selectedStyle, setSelectedStyle] = useState<"pixar" | "ghibli">(
		(currentStyle as "pixar" | "ghibli") ?? "pixar",
	);

	// Bridge the canvas block content to the useLivingPortrait hook
	const heroData: Record<string, unknown> = {
		heroImageUrl,
		avatarImageUrl: avatarImageUrl ?? "",
		avatarStyle: currentStyle ?? "",
		animatedVideoUrl: currentVideoUrl ?? "",
	};

	const handleChange = (fieldPath: string, value: string | boolean) => {
		// fieldPath is like "hero.avatarImageUrl" — extract the field name
		const field = fieldPath.replace("hero.", "");
		if (field === "avatarImageUrl") {
			onUpdateContent({
				avatarImageUrl: value,
				// When avatar changes, also update the main src
				...(value ? { src: value } : {}),
			});
		} else if (field === "avatarStyle") {
			onUpdateContent({ avatarStyle: value });
		} else if (field === "animatedVideoUrl") {
			onUpdateContent({ animatedVideoUrl: value });
		}
	};

	const {
		step,
		error,
		remaining,
		avatarImageUrl: resolvedAvatarUrl,
		animatedVideoUrl: resolvedVideoUrl,
		generateAvatar,
		animateAvatar,
		removeAvatar,
		removeVideo,
	} = useLivingPortrait({
		invitationId,
		token,
		heroData,
		onChange: handleChange,
	});

	const isGeneratingAvatar = step === "generating-avatar";
	const isGeneratingVideo = step === "generating-video";
	const isGenerating = isGeneratingAvatar || isGeneratingVideo;

	if (!heroImageUrl) return null;

	return (
		<InspectorSection title="Living Portrait">
			{/* Style selector */}
			<div className="flex gap-1.5" role="radiogroup" aria-label="Avatar style">
				{(["pixar", "ghibli"] as const).map((style) => (
					<button
						key={style}
						type="button"
						role="radio"
						aria-checked={selectedStyle === style}
						disabled={isGenerating}
						onClick={() => setSelectedStyle(style)}
						className={cn(
							"flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors",
							selectedStyle === style
								? "border-[color:var(--dm-accent-strong)] bg-[color:var(--dm-accent-strong)]/10 text-[color:var(--dm-accent-strong)]"
								: "border-[color:var(--dm-border)] text-[color:var(--dm-ink-muted)] hover:border-[color:var(--dm-ink)]/30",
							isGenerating && "opacity-50",
						)}
					>
						{style === "pixar" ? "Pixar 3D" : "Ghibli"}
					</button>
				))}
			</div>

			{/* Generate Avatar button */}
			<button
				type="button"
				disabled={isGenerating}
				onClick={() => generateAvatar(selectedStyle)}
				className={cn(
					"inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium transition-colors",
					"bg-[color:var(--dm-accent-strong)] text-white hover:bg-[color:var(--dm-accent-strong)]/90",
					"disabled:opacity-50 disabled:cursor-not-allowed",
				)}
			>
				{isGeneratingAvatar ? (
					<>
						<Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
						<span>Generating...</span>
					</>
				) : resolvedAvatarUrl ? (
					<>
						<RefreshCw className="h-3 w-3" aria-hidden="true" />
						<span>Regenerate Avatar</span>
					</>
				) : (
					<>
						<Sparkles className="h-3 w-3" aria-hidden="true" />
						<span>Generate Avatar</span>
					</>
				)}
			</button>

			{remaining !== null && (
				<p className="text-[10px] text-[color:var(--dm-ink-muted)]">
					{remaining} of 8 attempts remaining
				</p>
			)}

			{/* Avatar preview */}
			{resolvedAvatarUrl && (
				<div className="relative">
					<img
						src={resolvedAvatarUrl}
						alt="Generated avatar"
						className="w-full rounded-lg object-cover"
					/>
					<button
						type="button"
						onClick={removeAvatar}
						disabled={isGenerating}
						className="absolute right-1 top-1 rounded-md bg-black/60 p-1 text-white hover:bg-black/80"
						aria-label="Remove avatar"
					>
						<Trash2 className="h-3 w-3" />
					</button>
				</div>
			)}

			{/* Animate button — only show when avatar exists */}
			{resolvedAvatarUrl && (
				<>
					<button
						type="button"
						disabled={isGenerating}
						onClick={animateAvatar}
						className={cn(
							"inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium transition-colors",
							"border border-[color:var(--dm-accent-strong)] text-[color:var(--dm-accent-strong)] hover:bg-[color:var(--dm-accent-strong)]/10",
							"disabled:opacity-50 disabled:cursor-not-allowed",
						)}
					>
						{isGeneratingVideo ? (
							<>
								<Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
								<span>Generating video...</span>
							</>
						) : resolvedVideoUrl ? (
							<>
								<RefreshCw className="h-3 w-3" aria-hidden="true" />
								<span>Regenerate Video</span>
							</>
						) : (
							<>
								<Film className="h-3 w-3" aria-hidden="true" />
								<span>Animate Avatar</span>
							</>
						)}
					</button>

					{isGeneratingVideo && (
						<div className="grid gap-1">
							<div
								className="h-1 overflow-hidden rounded-full bg-[color:var(--dm-border)]"
								role="progressbar"
								aria-label="Video generation progress"
							>
								<div
									className="h-full animate-pulse rounded-full bg-[color:var(--dm-accent-strong)]"
									style={{ width: "60%" }}
								/>
							</div>
							<p className="text-[10px] text-[color:var(--dm-ink-muted)]">
								This may take 30–120 seconds...
							</p>
						</div>
					)}

					{/* Video indicator */}
					{resolvedVideoUrl && (
						<div className="flex items-center justify-between rounded-lg border border-[color:var(--dm-border)] px-2 py-1.5">
							<span className="text-[11px] text-[color:var(--dm-ink-muted)]">
								Video ready
							</span>
							<button
								type="button"
								onClick={removeVideo}
								disabled={isGenerating}
								className="rounded-md p-1 text-[color:var(--dm-ink-muted)] hover:bg-[color:var(--dm-surface-muted)]"
								aria-label="Remove video"
							>
								<Trash2 className="h-3 w-3" />
							</button>
						</div>
					)}
				</>
			)}

			{/* Error */}
			{error && (
				<p className="text-[11px] text-red-500" role="alert">
					{error}
				</p>
			)}

			{/* Live region for a11y */}
			<div aria-live="polite" className="sr-only">
				{isGeneratingAvatar && "Generating avatar..."}
				{isGeneratingVideo && "Generating video animation..."}
				{error && `Error: ${error}`}
			</div>
		</InspectorSection>
	);
}
