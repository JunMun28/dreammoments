import { cn } from "../../lib/utils";

type SkeletonProps = {
	className?: string;
	variant?: "text" | "circular" | "rectangular" | "rounded";
	width?: string | number;
	height?: string | number;
};

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

export default Skeleton;
