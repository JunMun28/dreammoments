import { cn } from "@/lib/utils";

interface GoldRuleProps {
	className?: string;
}

export function GoldRule({ className }: GoldRuleProps) {
	return (
		<div className={cn("dm-gold-rule w-full", className)} aria-hidden="true" />
	);
}
