import { forwardRef, useId } from "react";
import { cn } from "../../lib/utils";

type InputProps = React.ComponentProps<"input"> & {
	label?: string;
	error?: string;
	helperText?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, label, error, helperText, id, ...props }, ref) => {
		const generatedId = useId();
		const inputId = id ?? generatedId;
		const errorId = error ? `${inputId}-error` : undefined;
		const helperId = helperText ? `${inputId}-helper` : undefined;
		const describedBy =
			[errorId, helperId].filter(Boolean).join(" ") || undefined;

		return (
			<div className="flex flex-col gap-1.5">
				{label && (
					<label
						htmlFor={inputId}
						className="text-sm font-medium text-[color:var(--dm-ink)]"
					>
						{label}
					</label>
				)}
				<input
					ref={ref}
					id={inputId}
					aria-invalid={error ? true : undefined}
					aria-describedby={describedBy}
					className={cn(
						"min-h-[44px] w-full rounded-[var(--radius)] border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-4 text-base text-[color:var(--dm-ink)] placeholder:text-[color:var(--dm-muted)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--dm-focus)] disabled:pointer-events-none disabled:opacity-50",
						error && "border-[color:var(--dm-error)]",
						className,
					)}
					{...props}
				/>
				{error && (
					<p id={errorId} className="text-sm text-[color:var(--dm-error)]">
						{error}
					</p>
				)}
				{helperText && !error && (
					<p id={helperId} className="text-sm text-[color:var(--dm-muted)]">
						{helperText}
					</p>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";

export { Input };
