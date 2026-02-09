import { cn } from "../../lib/utils";

type LoadingSpinnerProps = {
	size?: "sm" | "md" | "lg";
	className?: string;
	label?: string;
};

export function LoadingSpinner({
	size = "md",
	className,
	label = "Loading",
}: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: "h-4 w-4 border-[2px]",
		md: "h-6 w-6 border-[2px]",
		lg: "h-8 w-8 border-[3px]",
	};

	return (
		<div
			role="status"
			aria-label={label}
			className={cn("inline-flex items-center justify-center", className)}
		>
			<div
				className={cn(
					"animate-spin rounded-full border-[color:var(--dm-accent-strong)] border-t-transparent",
					sizeClasses[size],
				)}
			/>
			<span className="sr-only">{label}</span>
		</div>
	);
}

export function FullPageLoader({
	message = "Loading...",
}: {
	message?: string;
}) {
	return (
		<div className="min-h-screen bg-[color:var(--dm-bg)] flex items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				<LoadingSpinner size="lg" />
				<p className="text-sm text-[color:var(--dm-muted)] animate-pulse">
					{message}
				</p>
			</div>
		</div>
	);
}

export default LoadingSpinner;
