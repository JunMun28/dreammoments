import { cn } from "@/lib/utils";

interface GradientTextProps {
	children: React.ReactNode;
	gradient?: string;
	className?: string;
}

export function GradientText({
	children,
	gradient = "linear-gradient(135deg, var(--dm-crimson-bold), var(--dm-gold-bold))",
	className,
}: GradientTextProps) {
	return (
		<span
			className={cn("dm-gradient-text", className)}
			style={{ backgroundImage: gradient }}
		>
			{children}
		</span>
	);
}
