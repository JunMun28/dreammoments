import { cn } from "../../lib/utils";

type SkeletonProps = {
	className?: string;
	variant?: "text" | "circular" | "rectangular" | "rounded";
	width?: string | number;
	height?: string | number;
};

/**
 * Skeleton component for loading placeholders.
 * Uses animate-pulse with --dm-muted color for shimmer effect.
 */
export function Skeleton({
	className,
	variant = "rectangular",
	width,
	height,
}: SkeletonProps) {
	const variantClasses = {
		text: "rounded",
		circular: "rounded-full",
		rectangular: "",
		rounded: "rounded-2xl",
	};

	return (
		<div
			className={cn(
				"animate-pulse bg-[color:var(--dm-muted)]/20",
				variantClasses[variant],
				className,
			)}
			style={{
				width: typeof width === "number" ? `${width}px` : width,
				height: typeof height === "number" ? `${height}px` : height,
			}}
			aria-hidden="true"
		/>
	);
}

/**
 * SkeletonText - Simulates text lines with varying widths
 */
export function SkeletonText({
	lines = 3,
	className,
}: {
	lines?: number;
	className?: string;
}) {
	// Create varied widths for more natural appearance
	const widths = ["100%", "92%", "85%", "78%", "95%"];

	return (
		<div className={cn("space-y-2", className)} aria-hidden="true">
			{Array.from({ length: lines }).map((_, i) => (
				<Skeleton
					key={`skeleton-line-${i}`}
					variant="text"
					className="h-4"
					width={widths[i % widths.length]}
				/>
			))}
		</div>
	);
}

/**
 * SkeletonCard - Reusable card skeleton for template previews
 */
export function SkeletonCard({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"rounded-[3rem] overflow-hidden border border-[color:var(--dm-border)]",
				className,
			)}
			aria-hidden="true"
		>
			<Skeleton variant="rectangular" className="aspect-3/4 w-full" />
			<div className="p-4 space-y-3">
				<Skeleton variant="text" className="h-6 w-3/4 mx-auto" />
				<Skeleton variant="text" className="h-4 w-1/2 mx-auto" />
			</div>
		</div>
	);
}

/**
 * SkeletonImage - Image placeholder with aspect ratio support
 */
export function SkeletonImage({
	className,
	aspectRatio = "aspect-video",
}: {
	className?: string;
	aspectRatio?: string;
}) {
	return (
		<Skeleton
			variant="rounded"
			className={cn(aspectRatio, "w-full", className)}
		/>
	);
}

export default Skeleton;
