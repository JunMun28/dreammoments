import { Check, Copy, Loader2, Sparkles, Wand2, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { AiSuggestionCard } from "./AiSuggestionCard";
import type { AiTaskType } from "./hooks/useAiAssistant";
import { useFocusTrap } from "./hooks/useFocusTrap";
import MobileBottomSheet from "./MobileBottomSheet";

export type AiAssistantDrawerProps = {
	open: boolean;
	sectionId: string;
	prompt: string;
	type: AiTaskType;
	result?: Record<string, unknown>;
	error?: string;
	generating: boolean;
	remainingAi: number;
	aiGenerationsUsed: number;
	planLimit: number;
	isMobile: boolean;
	onClose: () => void;
	onPromptChange: (prompt: string) => void;
	onTypeChange: (type: AiTaskType) => void;
	onGenerate: () => void;
	onApply: () => void;
	onCancelGeneration?: () => void;
};

const AI_TASK_OPTIONS: Array<{ value: AiTaskType; label: string }> = [
	{ value: "schedule", label: "Schedule" },
	{ value: "faq", label: "FAQ" },
	{ value: "story", label: "Story" },
	{ value: "tagline", label: "Tagline" },
	{ value: "translate", label: "Translate" },
	{ value: "style", label: "Style" },
];

const SUGGESTED_PROMPTS: Record<string, string[]> = {
	schedule: [
		"Create a timeline for a garden ceremony and dinner reception",
		"Generate a schedule for a Chinese tea ceremony followed by a banquet",
	],
	story: [
		"Write our love story from first meeting to the proposal",
		"Create a timeline of milestones in our relationship",
	],
	tagline: [
		"Write a romantic tagline for our wedding invitation",
		"Create a poetic headline that captures our love story",
	],
	faq: [
		"Generate common wedding FAQ questions and answers",
		"Create FAQ items about dress code, parking, and gifts",
	],
	translate: [
		"Translate the announcement text to Mandarin Chinese",
		"Translate to Bahasa Malaysia",
	],
	style: [
		"Create a warm, golden sunset color palette",
		"Design a soft blush pink and sage green theme",
	],
};

function DrawerContent({
	sectionId,
	prompt,
	type,
	result,
	error,
	generating,
	remainingAi,
	aiGenerationsUsed,
	planLimit,
	onClose,
	onPromptChange,
	onTypeChange,
	onGenerate,
	onApply,
	onCancelGeneration,
}: Omit<AiAssistantDrawerProps, "open" | "isMobile">) {
	const promptId = useId();
	const nearLimit = remainingAi <= 2 && remainingAi > 0;
	const atLimit = remainingAi === 0;
	const [confirmApply, setConfirmApply] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleCopyResult = useCallback(() => {
		if (!result) return;
		const text = JSON.stringify(result, null, 2);
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [result]);

	const suggestedPrompts = SUGGESTED_PROMPTS[type] ?? SUGGESTED_PROMPTS.tagline;

	const handleApplyConfirm = () => {
		setConfirmApply(false);
		onApply();
	};

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="flex shrink-0 items-center justify-between border-b border-[color:var(--dm-border)] px-5 py-4">
				<div className="flex items-center gap-2">
					<Sparkles
						className="h-4 w-4 text-[color:var(--dm-accent-strong)]"
						aria-hidden="true"
					/>
					<h2 className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
						AI Assistant &mdash; {sectionId}
					</h2>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--dm-border)] text-[color:var(--dm-muted)] transition-colors hover:bg-[color:var(--dm-surface-muted)]"
					aria-label="Close AI assistant"
				>
					<X className="h-5 w-5" aria-hidden="true" />
				</button>
			</div>

			{/* Scrollable body */}
			<div className="dm-scroll-thin min-h-0 flex-1 space-y-5 overscroll-contain p-5">
				{/* Quota warning on open */}
				{nearLimit && (
					<div className="rounded-2xl border border-[color:var(--dm-peach)] bg-[color:var(--dm-peach)]/5 px-4 py-3">
						<p className="text-xs font-medium text-[color:var(--dm-peach)]">
							Only {remainingAi} AI generation{remainingAi !== 1 ? "s" : ""}{" "}
							remaining.{" "}
							<a
								href="/dashboard?upgrade=true"
								className="underline underline-offset-2"
							>
								Upgrade for more
							</a>
						</p>
					</div>
				)}
				{atLimit && (
					<div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3">
						<p className="text-xs font-medium text-red-600">
							AI generation limit reached.{" "}
							<a
								href="/dashboard?upgrade=true"
								className="underline underline-offset-2"
							>
								Upgrade to Premium
							</a>
						</p>
					</div>
				)}

				{/* Task selector pills */}
				<div>
					<p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
						Task
					</p>
					<div className="flex flex-wrap gap-2">
						{AI_TASK_OPTIONS.map((option) => (
							<button
								key={option.value}
								type="button"
								aria-pressed={type === option.value}
								onClick={() => onTypeChange(option.value)}
								className={cn(
									"min-h-11 rounded-full px-4 text-xs uppercase tracking-[0.15em] transition-colors",
									type === option.value
										? "bg-[color:var(--dm-accent-strong)] text-[color:var(--dm-on-accent)]"
										: "border border-[color:var(--dm-border)] text-[color:var(--dm-muted)] hover:bg-[color:var(--dm-surface-muted)]",
								)}
							>
								{option.label}
							</button>
						))}
					</div>
				</div>

				{/* Prompt input */}
				<div>
					<label
						htmlFor={promptId}
						className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[color:var(--dm-muted)]"
					>
						Prompt
					</label>
					<textarea
						id={promptId}
						value={prompt}
						onChange={(e) => onPromptChange(e.target.value)}
						placeholder="Describe what you want..."
						autoComplete="off"
						className="min-h-[120px] w-full rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-4 py-3 text-sm text-[color:var(--dm-ink)] placeholder:text-[color:var(--dm-muted)]"
					/>
					{!prompt.trim() && !generating && !result && (
						<div className="mt-2 flex flex-wrap gap-2">
							{suggestedPrompts.map((suggestion) => (
								<button
									key={suggestion}
									type="button"
									onClick={() => onPromptChange(suggestion)}
									className="rounded-full border border-[color:var(--dm-border)] px-3 py-1.5 text-[11px] text-[color:var(--dm-muted)] transition-colors hover:bg-[color:var(--dm-surface-muted)] hover:text-[color:var(--dm-ink)]"
								>
									{suggestion}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Generate / Cancel button */}
				{generating ? (
					<div className="flex gap-2">
						<button
							type="button"
							disabled
							className={cn(
								"flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-xs uppercase tracking-[0.2em]",
								"bg-[color:var(--dm-accent-strong)] text-[color:var(--dm-on-accent)] opacity-50",
							)}
						>
							<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
							Generating...
						</button>
						{onCancelGeneration && (
							<button
								type="button"
								onClick={onCancelGeneration}
								className="flex min-h-11 items-center justify-center rounded-full border border-[color:var(--dm-border)] px-4 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)] transition-colors hover:bg-[color:var(--dm-surface-muted)]"
							>
								Cancel
							</button>
						)}
					</div>
				) : (
					<button
						type="button"
						onClick={onGenerate}
						disabled={!prompt.trim() || remainingAi === 0}
						className={cn(
							"flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-xs uppercase tracking-[0.2em] transition-colors",
							"bg-[color:var(--dm-accent-strong)] text-[color:var(--dm-on-accent)]",
							"disabled:cursor-not-allowed disabled:opacity-50",
						)}
					>
						<Wand2 className="h-4 w-4" aria-hidden="true" />
						Generate
					</button>
				)}

				{/* Loading skeleton */}
				{generating && !result && (
					<div
						className="space-y-3"
						role="status"
						aria-busy="true"
						aria-label="Generating AI content"
					>
						<div className="animate-pulse space-y-3 rounded-2xl border border-[color:var(--dm-border)] p-4">
							<div className="h-3 w-3/4 rounded-full bg-[color:var(--dm-border)]" />
							<div className="h-3 w-full rounded-full bg-[color:var(--dm-border)]" />
							<div className="h-3 w-5/6 rounded-full bg-[color:var(--dm-border)]" />
							<div className="h-3 w-2/3 rounded-full bg-[color:var(--dm-border)]" />
						</div>
					</div>
				)}

				{/* Error display */}
				{error && (
					<output className="block text-xs text-dm-error" aria-live="polite">
						{error}
					</output>
				)}

				{/* Result preview */}
				{result && (
					<div className="space-y-3">
						<div className="flex items-start justify-between gap-2">
							<div className="min-w-0 flex-1">
								<AiSuggestionCard type={type} result={result} />
							</div>
							<button
								type="button"
								onClick={handleCopyResult}
								className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--dm-border)] text-[color:var(--dm-muted)] transition-colors hover:bg-[color:var(--dm-surface-muted)]"
								aria-label="Copy result to clipboard"
								title="Copy to clipboard"
							>
								{copied ? (
									<Check
										className="h-4 w-4 text-[#22c55e]"
										aria-hidden="true"
									/>
								) : (
									<Copy className="h-4 w-4" aria-hidden="true" />
								)}
							</button>
						</div>
						{confirmApply ? (
							<div className="space-y-2 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] p-4">
								<p className="text-xs font-medium text-[color:var(--dm-ink)]">
									This will update your{" "}
									{type === "style" ? "design theme" : sectionId} section.
									Continue?
								</p>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={handleApplyConfirm}
										className={cn(
											"flex min-h-11 flex-1 items-center justify-center rounded-full px-4 text-xs uppercase tracking-[0.2em]",
											"bg-[color:var(--dm-accent-strong)] text-[color:var(--dm-on-accent)]",
										)}
									>
										Confirm
									</button>
									<button
										type="button"
										onClick={() => setConfirmApply(false)}
										className="flex min-h-11 flex-1 items-center justify-center rounded-full border border-[color:var(--dm-border)] px-4 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]"
									>
										Cancel
									</button>
								</div>
							</div>
						) : (
							<button
								type="button"
								onClick={() => setConfirmApply(true)}
								disabled={generating}
								className={cn(
									"flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-xs uppercase tracking-[0.2em] transition-colors",
									"bg-[color:var(--dm-accent-strong)] text-[color:var(--dm-on-accent)]",
									"disabled:cursor-not-allowed disabled:opacity-50",
								)}
							>
								Apply to Invitation
							</button>
						)}
					</div>
				)}
			</div>

			{/* Footer: usage counter */}
			<div className="shrink-0 border-t border-[color:var(--dm-border)] px-5 py-3">
				<p className="text-center text-[10px] uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
					{aiGenerationsUsed}/{planLimit} AI generations used
				</p>
				{nearLimit && (
					<p className="mt-1 text-center text-[10px] tracking-[0.1em] text-[color:var(--dm-peach)]">
						Running low &mdash;{" "}
						<a
							href="/dashboard?upgrade=true"
							className="underline underline-offset-2"
						>
							Upgrade for more
						</a>
					</p>
				)}
				{atLimit && (
					<p className="mt-1 text-center text-[10px] tracking-[0.1em] text-dm-error">
						Limit reached &mdash;{" "}
						<a
							href="/dashboard?upgrade=true"
							className="underline underline-offset-2"
						>
							Upgrade to Premium
						</a>
					</p>
				)}
			</div>
		</div>
	);
}

export function AiAssistantDrawer(props: AiAssistantDrawerProps) {
	const { open, isMobile, onClose, generating, onCancelGeneration } = props;
	const drawerRef = useRef<HTMLDivElement>(null);
	const [isClosing, setIsClosing] = useState(false);

	const handleClose = useCallback(() => {
		if (generating) {
			onCancelGeneration?.();
		}
		setIsClosing(true);
		setTimeout(() => {
			setIsClosing(false);
			onClose();
		}, 300);
	}, [onClose, generating, onCancelGeneration]);

	// Focus trap for desktop drawer (delegates to shared hook)
	useFocusTrap(drawerRef, {
		enabled: open && !isMobile,
		onEscape: handleClose,
	});

	// Prevent body scroll when desktop drawer is open
	useEffect(() => {
		if (!open || isMobile) return;
		const original = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = original;
		};
	}, [open, isMobile]);

	const handleBackdropPointerDown = useCallback(
		(e: React.PointerEvent) => {
			if (e.target === e.currentTarget) {
				handleClose();
			}
		},
		[handleClose],
	);

	if (!open && !isClosing) return null;

	// Mobile: use MobileBottomSheet
	if (isMobile) {
		return (
			<MobileBottomSheet
				open={open}
				onClose={onClose}
				title="AI Assistant"
				height="full"
			>
				<DrawerContent {...props} />
			</MobileBottomSheet>
		);
	}

	// Desktop: right-side drawer with backdrop
	return (
		<div
			className={cn(
				"fixed inset-0 z-50 flex justify-end",
				isClosing ? "pointer-events-none" : "",
			)}
			onPointerDown={handleBackdropPointerDown}
			role="dialog"
			aria-modal="true"
			aria-label={`AI Assistant - ${props.sectionId}`}
		>
			{/* Backdrop */}
			<div
				className={cn(
					"absolute inset-0 bg-black/30 backdrop-blur-sm",
					isClosing
						? "animate-out fade-out duration-300"
						: "animate-in fade-in duration-300",
				)}
			/>

			{/* Drawer panel */}
			<div
				ref={drawerRef}
				className={cn(
					"relative z-10 flex h-full w-[480px] max-w-full flex-col bg-[color:var(--dm-surface)] shadow-xl",
					isClosing
						? "animate-out slide-out-to-right duration-300"
						: "animate-in slide-in-from-right duration-300",
				)}
			>
				<DrawerContent {...props} onClose={handleClose} />
			</div>
		</div>
	);
}
