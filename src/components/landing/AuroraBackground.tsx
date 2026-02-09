import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
	children: React.ReactNode;
	className?: string;
	variant?: "warm" | "gold" | "dark";
}

/**
 * Aurora gradient wrapper. Renders 3 stacked radial gradient layers via
 * a `::before` pseudo-element (`.dm-aurora-bg` in styles.css).
 *
 * Variants override the parent's `data-aurora` attribute so CSS can
 * adjust gradient colours without extra JS.
 *
 * - warm  (default): crimson + gold + rose  — Hero, Footer bookend
 * - gold:  gold-weighted gradients          — Pricing accent
 * - dark:  crimson + gold on dark surface   — Final CTA
 */
export function AuroraBackground({
	children,
	className,
	variant = "warm",
}: AuroraBackgroundProps) {
	// Each variant supplies its own gradient stack as an inline style on a
	// dedicated pseudo-host element. The base `.dm-aurora-bg::before` in
	// styles.css is the default "warm" set; for gold/dark we override via
	// a nested absolutely-positioned div so we don't fight the pseudo.
	const gradientsByVariant: Record<string, string> = {
		warm: [
			"radial-gradient(ellipse 80% 50% at 20% 40%, rgba(212,32,64,0.08) 0%, transparent 60%)",
			"radial-gradient(ellipse 60% 70% at 80% 20%, rgba(212,175,55,0.06) 0%, transparent 50%)",
			"radial-gradient(ellipse 70% 60% at 50% 90%, rgba(217,95,90,0.05) 0%, transparent 55%)",
		].join(", "),
		gold: [
			"radial-gradient(ellipse 80% 50% at 20% 40%, rgba(212,175,55,0.10) 0%, transparent 60%)",
			"radial-gradient(ellipse 60% 70% at 80% 20%, rgba(212,175,55,0.08) 0%, transparent 50%)",
			"radial-gradient(ellipse 70% 60% at 50% 90%, rgba(212,32,64,0.04) 0%, transparent 55%)",
		].join(", "),
		dark: [
			"radial-gradient(ellipse 80% 50% at 20% 40%, rgba(212,32,64,0.06) 0%, transparent 60%)",
			"radial-gradient(ellipse 60% 70% at 80% 20%, rgba(212,175,55,0.05) 0%, transparent 50%)",
			"radial-gradient(ellipse 70% 60% at 50% 90%, rgba(212,32,64,0.04) 0%, transparent 55%)",
		].join(", "),
	};

	return (
		<div className={cn("dm-aurora-bg", className)} data-aurora={variant}>
			{/* Override gradient when variant !== "warm" (the CSS default) */}
			{variant !== "warm" && (
				<div
					className="pointer-events-none absolute inset-0 z-[-1]"
					style={{ background: gradientsByVariant[variant] }}
					aria-hidden="true"
				/>
			)}
			{children}
		</div>
	);
}
