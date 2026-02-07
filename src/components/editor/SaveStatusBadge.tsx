import { cn } from "../../lib/utils";

type SaveStatusBadgeProps = {
	status: "saved" | "saving" | "unsaved";
	autosaveAt?: string;
};

export function SaveStatusBadge({ status, autosaveAt }: SaveStatusBadgeProps) {
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
			)}
		>
			{status === "saved" && (
				<>
					<span
						className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
						aria-hidden="true"
					/>
					Saved{autosaveAt ? ` at ${autosaveAt}` : ""}
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
		</span>
	);
}

export default SaveStatusBadge;
