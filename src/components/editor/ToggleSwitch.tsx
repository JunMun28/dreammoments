import { cn } from "../../lib/utils";

type ToggleSwitchProps = {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	id?: string;
};

export function ToggleSwitch({
	label,
	checked,
	onChange,
	id,
}: ToggleSwitchProps) {
	return (
		<div className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-4 py-3">
			<span className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
				{label}
			</span>
			<button
				id={id}
				type="button"
				role="switch"
				aria-checked={checked}
				aria-label={label}
				onClick={() => onChange(!checked)}
				className={cn(
					"relative inline-flex h-7 w-12 min-w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)]/60",
					checked
						? "bg-[color:var(--dm-accent-strong)]"
						: "bg-[color:var(--dm-border)]",
				)}
			>
				<span
					aria-hidden="true"
					className={cn(
						"pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
						checked ? "translate-x-6" : "translate-x-1",
					)}
				/>
			</button>
		</div>
	);
}

export default ToggleSwitch;
