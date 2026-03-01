import { Film, Loader2, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { useLivingPortrait } from "./hooks/useLivingPortrait";

interface LivingPortraitFieldProps {
	invitationId: string;
	token: string;
	heroData: Record<string, unknown>;
	onChange: (fieldPath: string, value: string | boolean) => void;
}

export function LivingPortraitField({
	invitationId,
	token,
	heroData,
	onChange,
}: LivingPortraitFieldProps) {
	const [selectedStyle, setSelectedStyle] = useState<"pixar" | "ghibli">(
		(heroData.avatarStyle as "pixar" | "ghibli") ?? "pixar",
	);

	const {
		step,
		error,
		remaining,
		heroImageUrl,
		avatarImageUrl,
		animatedVideoUrl,
		generateAvatar,
		animateAvatar,
		removeAvatar,
		removeVideo,
	} = useLivingPortrait({ invitationId, token, heroData, onChange });

	const isGeneratingAvatar = step === "generating-avatar";
	const isGeneratingVideo = step === "generating-video";
	const isGenerating = isGeneratingAvatar || isGeneratingVideo;

	return (
		<div className="grid gap-4">
			<div className="flex items-center gap-2">
				<Film
					className="h-4 w-4 text-[color:var(--dm-muted)]"
					aria-hidden="true"
				/>
				<span className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
					Living Portrait
				</span>
			</div>

			{!heroImageUrl && (
				<p className="text-sm text-[color:var(--dm-muted)]">
					Upload a hero photo first to create a living portrait.
				</p>
			)}

			{heroImageUrl && (
				<>
					{/* Step 1: Avatar Generation */}
					<div className="grid gap-3 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] p-4">
						<p className="text-xs font-medium text-[color:var(--dm-ink)]">
							Step 1: Create Avatar
						</p>

						{/* Style selector */}
						<div
							className="flex gap-2"
							role="radiogroup"
							aria-label="Avatar style"
						>
							{(["pixar", "ghibli"] as const).map((style) => (
								<button
									key={style}
									type="button"
									role="radio"
									aria-checked={selectedStyle === style}
									disabled={isGenerating}
									onClick={() => setSelectedStyle(style)}
									className={cn(
										"flex-1 rounded-xl border px-3 py-2 text-sm transition-colors",
										selectedStyle === style
											? "border-[color:var(--dm-primary)] bg-[color:var(--dm-primary)]/10 text-[color:var(--dm-primary)]"
											: "border-[color:var(--dm-border)] text-[color:var(--dm-muted)] hover:border-[color:var(--dm-ink)]/30",
										isGenerating && "opacity-50",
									)}
								>
									{style === "pixar" ? "Pixar 3D" : "Ghibli"}
								</button>
							))}
						</div>

						{/* Generate button */}
						<button
							type="button"
							disabled={isGenerating}
							onClick={() => generateAvatar(selectedStyle)}
							className={cn(
								"inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
								"bg-[color:var(--dm-primary)] text-white hover:bg-[color:var(--dm-primary)]/90",
								"disabled:opacity-50 disabled:cursor-not-allowed",
							)}
						>
							{isGeneratingAvatar ? (
								<>
									<Loader2
										className="h-4 w-4 animate-spin"
										aria-hidden="true"
									/>
									<span>Generating avatar...</span>
								</>
							) : avatarImageUrl ? (
								<>
									<RefreshCw className="h-4 w-4" aria-hidden="true" />
									<span>Regenerate Avatar</span>
								</>
							) : (
								<>
									<Sparkles className="h-4 w-4" aria-hidden="true" />
									<span>Generate Avatar</span>
								</>
							)}
						</button>

						{remaining !== null && (
							<p className="text-xs text-[color:var(--dm-muted)]">
								{remaining} of 8 attempts remaining
							</p>
						)}

						{/* Avatar preview */}
						{avatarImageUrl && (
							<div className="relative">
								<img
									src={avatarImageUrl}
									alt="Generated avatar preview"
									className="w-full rounded-xl object-cover"
								/>
								<button
									type="button"
									onClick={removeAvatar}
									disabled={isGenerating}
									className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
									aria-label="Remove avatar"
								>
									<Trash2 className="h-4 w-4" />
								</button>
							</div>
						)}
					</div>

					{/* Step 2: Video Animation */}
					{avatarImageUrl && (
						<div className="grid gap-3 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] p-4">
							<p className="text-xs font-medium text-[color:var(--dm-ink)]">
								Step 2: Animate
							</p>

							<button
								type="button"
								disabled={isGenerating}
								onClick={animateAvatar}
								className={cn(
									"inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
									"border border-[color:var(--dm-primary)] text-[color:var(--dm-primary)] hover:bg-[color:var(--dm-primary)]/10",
									"disabled:opacity-50 disabled:cursor-not-allowed",
								)}
							>
								{isGeneratingVideo ? (
									<>
										<Loader2
											className="h-4 w-4 animate-spin"
											aria-hidden="true"
										/>
										<span>Generating video...</span>
									</>
								) : animatedVideoUrl ? (
									<>
										<RefreshCw className="h-4 w-4" aria-hidden="true" />
										<span>Regenerate Video</span>
									</>
								) : (
									<>
										<Film className="h-4 w-4" aria-hidden="true" />
										<span>Animate Avatar</span>
									</>
								)}
							</button>

							{isGeneratingVideo && (
								<div className="grid gap-1">
									<div
										className="h-1.5 overflow-hidden rounded-full bg-[color:var(--dm-border)]"
										role="progressbar"
										aria-label="Video generation progress"
									>
										<div
											className="h-full animate-pulse rounded-full bg-[color:var(--dm-primary)]"
											style={{ width: "60%" }}
										/>
									</div>
									<p className="text-xs text-[color:var(--dm-muted)]">
										This may take 30–120 seconds...
									</p>
								</div>
							)}

							{/* Video preview */}
							{animatedVideoUrl && (
								<div className="relative">
									<div className="relative overflow-hidden rounded-xl">
										{/* Show poster frame in editor — no autoplay */}
										<img
											src={avatarImageUrl}
											alt="Video preview (poster frame)"
											className="w-full object-cover"
										/>
										<div className="absolute inset-0 flex items-center justify-center bg-black/20">
											<span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white">
												Video preview
											</span>
										</div>
									</div>
									<button
										type="button"
										onClick={removeVideo}
										disabled={isGenerating}
										className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
										aria-label="Remove video"
									>
										<Trash2 className="h-4 w-4" />
									</button>
								</div>
							)}
						</div>
					)}
				</>
			)}

			{/* Error display */}
			{error && (
				<p className="text-sm text-[color:var(--dm-error)]" role="alert">
					{error}
				</p>
			)}

			{/* Accessibility: always-mounted live region for status updates */}
			<div aria-live="polite" className="sr-only">
				{isGeneratingAvatar && "Generating avatar..."}
				{isGeneratingVideo && "Generating video animation..."}
				{error && `Error: ${error}`}
			</div>
		</div>
	);
}
