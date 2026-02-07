import { Loader2, Sparkles, Wand2, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { AiSuggestionCard } from "./AiSuggestionCard";
import type { AiTaskType } from "./hooks/useAiAssistant";
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
	isMobile: boolean;
	onClose: () => void;
	onPromptChange: (prompt: string) => void;
	onTypeChange: (type: AiTaskType) => void;
	onGenerate: () => void;
	onApply: () => void;
};

const AI_TASK_OPTIONS: Array<{ value: AiTaskType; label: string }> = [
	{ value: "schedule", label: "Schedule" },
	{ value: "faq", label: "FAQ" },
	{ value: "story", label: "Story" },
	{ value: "tagline", label: "Tagline" },
	{ value: "translate", label: "Translate" },
	{ value: "style", label: "Style" },
];

function DrawerContent({
	sectionId,
	prompt,
	type,
	result,
	error,
	generating,
	remainingAi,
	onClose,
	onPromptChange,
	onTypeChange,
	onGenerate,
	onApply,
}: Omit<AiAssistantDrawerProps, "open" | "isMobile">) {
	const promptId = useId();
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
					disabled={generating}
					className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--dm-border)] text-[color:var(--dm-muted)] transition-colors hover:bg-[color:var(--dm-surface-muted)] disabled:opacity-50"
					aria-label="Close AI assistant"
				>
					<X className="h-5 w-5" aria-hidden="true" />
				</button>
			</div>

			{/* Scrollable body */}
			<div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5">
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
				</div>

				{/* Generate button */}
				<button
					type="button"
					onClick={onGenerate}
					disabled={generating || !prompt.trim()}
					className={cn(
						"flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-xs uppercase tracking-[0.2em] transition-colors",
						"bg-[color:var(--dm-accent-strong)] text-[color:var(--dm-on-accent)]",
						"disabled:cursor-not-allowed disabled:opacity-50",
					)}
				>
					{generating ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
							Generating...
						</>
					) : (
						<>
							<Wand2 className="h-4 w-4" aria-hidden="true" />
							Generate
						</>
					)}
				</button>

				{/* Error display */}
				{error && (
					<output className="block text-xs text-[#b91c1c]" aria-live="polite">
						{error}
					</output>
				)}

				{/* Result preview */}
				{result && (
					<div className="space-y-3">
						<AiSuggestionCard type={type} result={result} />
						<button
							type="button"
							onClick={onApply}
							disabled={generating}
							className={cn(
								"flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-xs uppercase tracking-[0.2em] transition-colors",
								"bg-[color:var(--dm-accent-strong)] text-[color:var(--dm-on-accent)]",
								"disabled:cursor-not-allowed disabled:opacity-50",
							)}
						>
							Apply to Invitation
						</button>
					</div>
				)}
			</div>

			{/* Footer: remaining badge */}
			<div className="shrink-0 border-t border-[color:var(--dm-border)] px-5 py-3">
				<p className="text-center text-[10px] uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
					{remainingAi} generation{remainingAi !== 1 ? "s" : ""} remaining
				</p>
			</div>
		</div>
	);
}

export function AiAssistantDrawer(props: AiAssistantDrawerProps) {
	const { open, isMobile, onClose, generating } = props;
	const drawerRef = useRef<HTMLDivElement>(null);
	const [isClosing, setIsClosing] = useState(false);

	const handleClose = useCallback(() => {
		if (generating) return;
		setIsClosing(true);
		setTimeout(() => {
			setIsClosing(false);
			onClose();
		}, 300);
	}, [onClose, generating]);

	// Close on Escape for desktop
	useEffect(() => {
		if (!open || isMobile) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape" && !generating) {
				e.preventDefault();
				handleClose();
			}
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [open, isMobile, generating, handleClose]);

	// Full focus trap for desktop drawer
	useEffect(() => {
		if (!open || isMobile || !drawerRef.current) return;
		const drawer = drawerRef.current;
		const focusable = drawer.querySelectorAll<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
		);
		const first = focusable[0];
		first?.focus();

		const handleTabKey = (e: KeyboardEvent) => {
			if (e.key !== "Tab" || !drawerRef.current) return;
			const currentFocusable = drawerRef.current.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
			);
			if (currentFocusable.length === 0) return;

			const firstEl = currentFocusable[0];
			const lastEl = currentFocusable[currentFocusable.length - 1];

			if (e.shiftKey && document.activeElement === firstEl) {
				e.preventDefault();
				lastEl?.focus();
			} else if (!e.shiftKey && document.activeElement === lastEl) {
				e.preventDefault();
				firstEl?.focus();
			}
		};
		document.addEventListener("keydown", handleTabKey);
		return () => document.removeEventListener("keydown", handleTabKey);
	}, [open, isMobile]);

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
			if (e.target === e.currentTarget && !generating) {
				handleClose();
			}
		},
		[handleClose, generating],
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
