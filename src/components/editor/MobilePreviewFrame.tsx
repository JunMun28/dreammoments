import { Smartphone } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobilePreviewFrameProps {
	/** Content to display inside the frame */
	children: ReactNode;
	/** Whether to show the phone frame (default: false) */
	showFrame?: boolean;
	/** Frame color variant */
	variant?: "dark" | "light" | "gold";
	/** Additional className for the wrapper */
	className?: string;
}

/** Phone frame dimensions matching common mobile viewport */
const FRAME_CONFIG = {
	/** Bezel width around the screen */
	bezelWidth: 12,
	/** Top notch height */
	notchHeight: 24,
	/** Corner radius of the phone frame */
	frameRadius: 36,
	/** Corner radius of the screen */
	screenRadius: 24,
	/** Bottom home indicator height */
	homeIndicatorHeight: 4,
} as const;

/** Frame color variants */
const FRAME_COLORS = {
	dark: {
		frame: "bg-stone-900",
		bezel: "bg-stone-800",
		notch: "bg-stone-900",
		homeIndicator: "bg-stone-600",
		reflection: "from-white/5 to-transparent",
	},
	light: {
		frame: "bg-stone-200",
		bezel: "bg-stone-100",
		notch: "bg-stone-300",
		homeIndicator: "bg-stone-400",
		reflection: "from-white/20 to-transparent",
	},
	gold: {
		frame: "bg-gradient-to-b from-amber-200 via-amber-300 to-amber-200",
		bezel: "bg-amber-100",
		notch: "bg-amber-400",
		homeIndicator: "bg-amber-500",
		reflection: "from-white/30 to-transparent",
	},
} as const;

/**
 * G2: Mobile Preview Frame
 *
 * Wraps content in a phone-shaped frame to preview how the invitation
 * will appear on mobile devices. Toggle with showFrame prop.
 */
export function MobilePreviewFrame({
	children,
	showFrame = false,
	variant = "dark",
	className,
}: MobilePreviewFrameProps) {
	if (!showFrame) {
		return <>{children}</>;
	}

	const colors = FRAME_COLORS[variant];

	return (
		<div
			className={cn("relative inline-flex flex-col items-center", className)}
			data-testid="mobile-preview-frame"
		>
			{/* Phone frame outer shell */}
			<div
				className={cn("relative overflow-hidden shadow-2xl", colors.frame)}
				style={{
					borderRadius: FRAME_CONFIG.frameRadius,
					padding: FRAME_CONFIG.bezelWidth,
				}}
			>
				{/* Side buttons (volume, power) */}
				<div
					className="absolute left-0 top-24 h-8 w-1 rounded-l-sm bg-stone-700"
					aria-hidden="true"
				/>
				<div
					className="absolute left-0 top-36 h-12 w-1 rounded-l-sm bg-stone-700"
					aria-hidden="true"
				/>
				<div
					className="absolute left-0 top-52 h-12 w-1 rounded-l-sm bg-stone-700"
					aria-hidden="true"
				/>
				<div
					className="absolute right-0 top-32 h-16 w-1 rounded-r-sm bg-stone-700"
					aria-hidden="true"
				/>

				{/* Screen area */}
				<div
					className={cn("relative overflow-hidden", colors.bezel)}
					style={{
						borderRadius: FRAME_CONFIG.screenRadius,
					}}
				>
					{/* Top notch/dynamic island */}
					<div
						className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 items-center justify-center"
						style={{
							width: 120,
							height: FRAME_CONFIG.notchHeight,
						}}
						aria-hidden="true"
					>
						<div
							className={cn("h-6 w-24 rounded-full", colors.notch)}
							style={{ marginTop: 4 }}
						/>
					</div>

					{/* Screen content wrapper with safe area padding */}
					<div
						className="relative bg-white"
						style={{
							paddingTop: FRAME_CONFIG.notchHeight + 4,
							paddingBottom: FRAME_CONFIG.homeIndicatorHeight + 8,
						}}
					>
						{children}
					</div>

					{/* Home indicator bar */}
					<div
						className="absolute bottom-2 left-1/2 -translate-x-1/2"
						style={{
							width: 134,
							height: FRAME_CONFIG.homeIndicatorHeight,
						}}
						aria-hidden="true"
					>
						<div
							className={cn("h-full w-full rounded-full", colors.homeIndicator)}
						/>
					</div>

					{/* Glass reflection effect */}
					<div
						className={cn(
							"pointer-events-none absolute inset-0 bg-gradient-to-br",
							colors.reflection,
						)}
						style={{ borderRadius: FRAME_CONFIG.screenRadius }}
						aria-hidden="true"
					/>
				</div>
			</div>
		</div>
	);
}

/**
 * Toggle button for mobile preview frame
 */
interface MobilePreviewToggleProps {
	/** Whether the frame is currently shown */
	isActive: boolean;
	/** Callback when toggled */
	onToggle: () => void;
	/** Additional className */
	className?: string;
}

export function MobilePreviewToggle({
	isActive,
	onToggle,
	className,
}: MobilePreviewToggleProps) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className={cn(
				"flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
				isActive
					? "bg-blue-100 text-blue-700"
					: "bg-stone-100 text-stone-600 hover:bg-stone-200",
				className,
			)}
			aria-pressed={isActive}
			aria-label={isActive ? "Hide phone frame" : "Show phone frame"}
		>
			<Smartphone className="h-4 w-4" />
			<span>Phone Preview</span>
		</button>
	);
}
