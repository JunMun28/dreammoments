import {
	Calendar,
	ImageIcon,
	MapPin,
	MessageCircle,
	Phone,
	Video,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Supported floating action button types
 */
export type FloatingActionType =
	| "rsvp"
	| "phone"
	| "navigation"
	| "video"
	| "album"
	| "blessing";

/**
 * Position options for the floating button
 */
export type FloatingActionPosition =
	| "bottom-right"
	| "bottom-left"
	| "top-right"
	| "top-left";

interface FloatingActionButtonProps {
	/** Type of action button */
	type: FloatingActionType;
	/** Position on screen */
	position?: FloatingActionPosition;
	/** Action URL or callback */
	href?: string;
	/** onClick callback for custom actions */
	onClick?: () => void;
	/** Custom accent color */
	accentColor?: string;
	/** Custom label (optional) */
	label?: string;
	/** Whether to show the label */
	showLabel?: boolean;
	/** Custom icon (overrides default) */
	icon?: ReactNode;
	/** Pulse animation for attention */
	pulse?: boolean;
	/** Additional className */
	className?: string;
}

/** Default icons for each action type */
const ACTION_ICONS: Record<FloatingActionType, ReactNode> = {
	rsvp: <Calendar className="h-5 w-5" />,
	phone: <Phone className="h-5 w-5" />,
	navigation: <MapPin className="h-5 w-5" />,
	video: <Video className="h-5 w-5" />,
	album: <ImageIcon className="h-5 w-5" />,
	blessing: <MessageCircle className="h-5 w-5" />,
};

/** Default labels for each action type */
const ACTION_LABELS: Record<FloatingActionType, string> = {
	rsvp: "RSVP",
	phone: "Call",
	navigation: "Directions",
	video: "Video",
	album: "Gallery",
	blessing: "Blessings",
};

/** Position classes for fixed positioning */
const POSITION_CLASSES: Record<FloatingActionPosition, string> = {
	"bottom-right": "bottom-4 right-4",
	"bottom-left": "bottom-4 left-4",
	"top-right": "top-4 right-4",
	"top-left": "top-4 left-4",
};

/**
 * G3: Floating Action Button
 *
 * A floating action button that can be positioned at corners of the viewport.
 * Supports RSVP, Phone, Navigation, Video, Album, and Blessing actions.
 */
export function FloatingActionButton({
	type,
	position = "bottom-right",
	href,
	onClick,
	accentColor = "#b76e79",
	label,
	showLabel = false,
	icon,
	pulse = false,
	className,
}: FloatingActionButtonProps) {
	const displayLabel = label || ACTION_LABELS[type];
	const displayIcon = icon || ACTION_ICONS[type];

	const buttonStyle: CSSProperties = {
		backgroundColor: accentColor,
		boxShadow: `0 4px 14px ${accentColor}40`,
	};

	const content = (
		<>
			{displayIcon}
			{showLabel && (
				<span className="ml-2 text-sm font-medium">{displayLabel}</span>
			)}
		</>
	);

	const buttonClasses = cn(
		"fixed z-50 flex items-center justify-center rounded-full text-white transition-all duration-200",
		"hover:scale-110 hover:shadow-lg active:scale-95",
		showLabel ? "px-4 py-3" : "h-12 w-12",
		POSITION_CLASSES[position],
		pulse && "animate-pulse",
		className,
	);

	// If href is provided, render as anchor
	if (href) {
		return (
			<a
				href={href}
				target={type === "navigation" ? "_blank" : undefined}
				rel={type === "navigation" ? "noopener noreferrer" : undefined}
				className={buttonClasses}
				style={buttonStyle}
				aria-label={displayLabel}
				data-testid={`fab-${type}`}
			>
				{content}
			</a>
		);
	}

	// Otherwise render as button
	return (
		<button
			type="button"
			onClick={onClick}
			className={buttonClasses}
			style={buttonStyle}
			aria-label={displayLabel}
			data-testid={`fab-${type}`}
		>
			{content}
		</button>
	);
}

/**
 * Container for multiple floating action buttons
 */
interface FloatingActionGroupProps {
	/** Floating buttons to render */
	children: ReactNode;
	/** Position of the group */
	position?: FloatingActionPosition;
	/** Gap between buttons in pixels */
	gap?: number;
	/** Direction to stack buttons */
	direction?: "horizontal" | "vertical";
	/** Additional className */
	className?: string;
}

/**
 * Groups multiple floating action buttons in a stack
 */
export function FloatingActionGroup({
	children,
	position = "bottom-right",
	gap = 12,
	direction = "vertical",
	className,
}: FloatingActionGroupProps) {
	const isVertical = direction === "vertical";

	return (
		<div
			className={cn(
				"fixed z-50 flex",
				isVertical ? "flex-col" : "flex-row",
				POSITION_CLASSES[position],
				className,
			)}
			style={{ gap }}
			data-testid="fab-group"
		>
			{children}
		</div>
	);
}

/**
 * Simplified floating button for use within FloatingActionGroup
 * (removes fixed positioning since group handles it)
 */
interface FloatingActionItemProps
	extends Omit<FloatingActionButtonProps, "position" | "className"> {
	className?: string;
}

export function FloatingActionItem({
	type,
	href,
	onClick,
	accentColor = "#b76e79",
	label,
	showLabel = false,
	icon,
	pulse = false,
	className,
}: FloatingActionItemProps) {
	const displayLabel = label || ACTION_LABELS[type];
	const displayIcon = icon || ACTION_ICONS[type];

	const buttonStyle: CSSProperties = {
		backgroundColor: accentColor,
		boxShadow: `0 4px 14px ${accentColor}40`,
	};

	const content = (
		<>
			{displayIcon}
			{showLabel && (
				<span className="ml-2 text-sm font-medium">{displayLabel}</span>
			)}
		</>
	);

	const buttonClasses = cn(
		"flex items-center justify-center rounded-full text-white transition-all duration-200",
		"hover:scale-110 hover:shadow-lg active:scale-95",
		showLabel ? "px-4 py-3" : "h-12 w-12",
		pulse && "animate-pulse",
		className,
	);

	if (href) {
		return (
			<a
				href={href}
				target={type === "navigation" ? "_blank" : undefined}
				rel={type === "navigation" ? "noopener noreferrer" : undefined}
				className={buttonClasses}
				style={buttonStyle}
				aria-label={displayLabel}
				data-testid={`fab-${type}`}
			>
				{content}
			</a>
		);
	}

	return (
		<button
			type="button"
			onClick={onClick}
			className={buttonClasses}
			style={buttonStyle}
			aria-label={displayLabel}
			data-testid={`fab-${type}`}
		>
			{content}
		</button>
	);
}
