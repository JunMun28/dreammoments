import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function InspectorSection({
	title,
	children,
	defaultOpen = true,
}: {
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
}) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<div className="border-b border-[color:var(--dm-border)] last:border-b-0">
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--dm-ink-muted)] hover:bg-[color:var(--dm-surface-muted)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--dm-focus)] focus-visible:outline-none"
			>
				{title}
				<ChevronDown
					className={`h-3.5 w-3.5 transition-transform ${open ? "" : "-rotate-90"}`}
					aria-hidden="true"
				/>
			</button>
			{open && <div className="grid gap-3 px-3 pb-3">{children}</div>}
		</div>
	);
}

export function InspectorField({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="grid gap-1">
			<span className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--dm-ink-soft)]">
				{label}
			</span>
			{children}
		</div>
	);
}

export function NumberInput({
	ariaLabel,
	value,
	onChange,
	min,
	max,
	suffix,
}: {
	ariaLabel: string;
	value: string;
	onChange: (value: string) => void;
	min?: number;
	max?: number;
	suffix?: string;
}) {
	return (
		<div className="relative">
			<input
				type="number"
				min={min}
				max={max}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				aria-label={ariaLabel}
				className="w-full rounded-lg border border-[color:var(--dm-border)] px-2 py-1.5 pr-6 text-xs text-[color:var(--dm-ink)] focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)] focus-visible:outline-none"
			/>
			{suffix && (
				<span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[color:var(--dm-ink-soft)]">
					{suffix}
				</span>
			)}
		</div>
	);
}
