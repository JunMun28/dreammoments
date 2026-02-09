import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface HongbaoBadgeProps {
	label?: string;
	className?: string;
}

/**
 * Hongbao (red envelope) badge for the premium pricing card.
 *
 * Vermillion background pill with gold text and a small envelope-flap
 * detail rendered via a `::before`-style rotated square beneath the pill.
 * Includes a Crown icon from lucide-react.
 *
 * Positioned absolutely — the parent card must be `position: relative`.
 */
export function HongbaoBadge({
	label = "Most Popular",
	className,
}: HongbaoBadgeProps) {
	return (
		<div
			className={cn(
				"absolute -top-4 left-1/2 -translate-x-1/2 z-10",
				className,
			)}
		>
			{/* Envelope flap (triangle beneath the pill) */}
			<span
				className="absolute -bottom-1 right-3 h-2.5 w-2.5 rotate-45"
				style={{ background: "var(--dm-crimson-deep, #A8182E)" }}
				aria-hidden="true"
			/>
			{/* Pill badge */}
			<span
				className="relative inline-flex items-center gap-1.5 rounded-lg px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] shadow-md"
				style={{
					background: "var(--dm-crimson, #D42040)",
					color: "var(--dm-gold, #D4AF37)",
				}}
			>
				<Crown aria-hidden="true" className="h-3.5 w-3.5" />
				{label}
			</span>
		</div>
	);
}
