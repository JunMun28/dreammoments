import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewportMode = "mobile" | "desktop";

interface ViewportToggleProps {
	value: ViewportMode;
	onChange: (mode: ViewportMode) => void;
	className?: string;
}

/**
 * Toggle button group for switching between mobile and desktop viewport modes.
 * Used in the invitation preview to simulate different device sizes.
 */
export function ViewportToggle({
	value,
	onChange,
	className,
}: ViewportToggleProps) {
	const handleClick = (mode: ViewportMode) => {
		if (mode !== value) {
			onChange(mode);
		}
	};

	return (
		<div
			className={cn(
				"inline-flex items-center rounded-lg bg-muted p-1",
				className,
			)}
		>
			<button
				type="button"
				onClick={() => handleClick("mobile")}
				className={cn(
					"flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
					value === "mobile"
						? "bg-background text-foreground shadow-sm"
						: "text-muted-foreground hover:text-foreground",
				)}
				aria-label="Mobile view"
			>
				<Smartphone className="h-4 w-4" />
				<span className="sr-only sm:not-sr-only">Mobile</span>
			</button>
			<button
				type="button"
				onClick={() => handleClick("desktop")}
				className={cn(
					"flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
					value === "desktop"
						? "bg-background text-foreground shadow-sm"
						: "text-muted-foreground hover:text-foreground",
				)}
				aria-label="Desktop view"
			>
				<Monitor className="h-4 w-4" />
				<span className="sr-only sm:not-sr-only">Desktop</span>
			</button>
		</div>
	);
}
