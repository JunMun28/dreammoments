import { cn } from "@/lib/utils";

interface DoubleHappinessProps {
	size: string;
	opacity: number;
	color?: string;
	className?: string;
}

export function DoubleHappiness({
	size,
	opacity,
	color = "var(--dm-gold)",
	className,
}: DoubleHappinessProps) {
	return (
		<span
			className={cn(
				"font-['Noto_Serif_SC'] font-black select-none pointer-events-none",
				className,
			)}
			style={{
				fontSize: size,
				opacity,
				color,
				lineHeight: 1,
			}}
			aria-hidden="true"
		>
			囍
		</span>
	);
}
