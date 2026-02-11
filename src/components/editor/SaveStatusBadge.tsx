import { cn } from "../../lib/utils";

type SaveStatusBadgeProps = {
	status: "saved" | "saving" | "unsaved" | "error";
	autosaveAt?: string;
	onRetry?: () => void;
	onRevert?: () => void;
	retriesExhausted?: boolean;
	isLocalOnly?: boolean;
};

export function SaveStatusBadge({
	status,
	autosaveAt,
	onRetry,
	onRevert,
	retriesExhausted,
	isLocalOnly,
}: SaveStatusBadgeProps) {
	// Persistent error banner when all retries are exhausted
	if (status === "error" && retriesExhausted) {
		return (
			<div
				role="alert"
				className="flex flex-col gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300"
			>
				<div className="flex items-center gap-1.5">
					<span
						className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500"
						aria-hidden="true"
					/>
					<span className="font-medium">Changes couldn't be saved</span>
				</div>
				<p className="text-[11px] leading-snug opacity-80">
					Your work is stored locally.
				</p>
				<div className="flex items-center gap-2">
					{onRetry && (
						<button
							type="button"
							onClick={onRetry}
							className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400"
						>
							Retry Now
						</button>
					)}
					{onRevert && (
						<button
							type="button"
							onClick={onRevert}
							className="rounded-lg border border-red-300 px-2.5 py-1 text-[11px] font-medium hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900/40"
						>
							Revert to Last Saved
						</button>
					)}
				</div>
			</div>
		);
	}

	return (
		<span
			aria-live="polite"
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] tracking-wide",
				status === "saved" &&
					"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
				status === "saving" &&
					"bg-[color:var(--dm-accent-strong)]/10 text-[color:var(--dm-accent-strong)]",
				status === "unsaved" &&
					"bg-amber-500/10 text-amber-600 dark:text-amber-400",
				status === "error" && "bg-red-500/10 text-red-600 dark:text-red-400",
			)}
		>
			{status === "saved" && (
				<>
					<span
						className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
						aria-hidden="true"
					/>
					{isLocalOnly
						? "Saved locally"
						: `Saved${autosaveAt ? ` at ${autosaveAt}` : ""}`}
				</>
			)}
			{status === "saving" && (
				<>
					<span
						className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
						aria-hidden="true"
					/>
					Saving...
				</>
			)}
			{status === "unsaved" && (
				<>
					<span
						className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
						aria-hidden="true"
					/>
					Unsaved changes
				</>
			)}
			{status === "error" && (
				<>
					<span
						className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500"
						aria-hidden="true"
					/>
					Save failed
					{onRetry && (
						<button
							type="button"
							onClick={onRetry}
							className="ml-1 underline underline-offset-2 hover:no-underline"
						>
							Retry
						</button>
					)}
				</>
			)}
		</span>
	);
}
