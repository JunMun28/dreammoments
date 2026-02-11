import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
	children: React.ReactNode;
	className?: string;
	variant?: "warm" | "gold" | "dark";
}

/**
 * Aurora gradient wrapper. The base `.dm-aurora-bg::before` in styles.css
 * provides the default "warm" gradients. For gold/dark, an overlay div
 * replaces the gradient stack without fighting the pseudo-element.
 */

const VARIANT_GRADIENTS: Record<"gold" | "dark", string> = {
	gold: [
		"radial-gradient(ellipse 80% 50% at 20% 40%, rgba(168,176,138,0.10) 0%, transparent 60%)",
		"radial-gradient(ellipse 60% 70% at 80% 20%, rgba(212,184,122,0.08) 0%, transparent 50%)",
		"radial-gradient(ellipse 70% 60% at 50% 90%, rgba(194,115,85,0.04) 0%, transparent 55%)",
	].join(", "),
	dark: [
		"radial-gradient(ellipse 80% 50% at 20% 40%, rgba(194,115,85,0.06) 0%, transparent 60%)",
		"radial-gradient(ellipse 60% 70% at 80% 20%, rgba(168,176,138,0.05) 0%, transparent 50%)",
		"radial-gradient(ellipse 70% 60% at 50% 90%, rgba(212,184,122,0.04) 0%, transparent 55%)",
	].join(", "),
};

export function AuroraBackground({
	children,
	className,
	variant = "warm",
}: AuroraBackgroundProps) {
	return (
		<div className={cn("dm-aurora-bg", className)} data-aurora={variant}>
			{variant !== "warm" && (
				<div
					className="pointer-events-none absolute inset-0 z-[-1]"
					style={{ background: VARIANT_GRADIENTS[variant] }}
					aria-hidden="true"
				/>
			)}
			{children}
		</div>
	);
}
