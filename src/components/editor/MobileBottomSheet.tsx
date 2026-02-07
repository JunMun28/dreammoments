import {
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { cn } from "../../lib/utils";

export type MobileBottomSheetProps = {
	open: boolean;
	onClose: () => void;
	title?: string;
	children: ReactNode;
	/** Height of the sheet: "auto" | "half" | "full" */
	height?: "auto" | "half" | "full";
	/** Snap points as percentage of viewport height */
	snapPoints?: number[];
	/** Initial snap point index (default: 1) */
	initialSnap?: number;
	/** Controlled snap point index - overrides internal state when provided */
	activeSnapIndex?: number;
	/** Callback when snap point changes */
	onSnapChange?: (snapIndex: number) => void;
};

const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 0.5;

export default function MobileBottomSheet({
	open,
	onClose,
	title,
	children,
	height = "half",
	snapPoints,
	initialSnap = 1,
	activeSnapIndex,
	onSnapChange,
}: MobileBottomSheetProps) {
	const titleId = useId();
	const sheetRef = useRef<HTMLDivElement>(null);
	const backdropRef = useRef<HTMLDivElement>(null);
	const dragStartY = useRef(0);
	const dragCurrentY = useRef(0);
	const dragStartTime = useRef(0);
	const [isDragging, setIsDragging] = useState(false);
	const [translateY, setTranslateY] = useState(0);
	const [isClosing, setIsClosing] = useState(false);
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
	const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnap);

	const hasSnaps = snapPoints && snapPoints.length > 0;
	const currentSnapPercent = hasSnaps
		? (snapPoints[currentSnapIndex] ?? snapPoints[0])
		: undefined;

	// Check for reduced motion preference
	useEffect(() => {
		if (typeof window === "undefined") return;
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		setPrefersReducedMotion(mediaQuery.matches);
		const handler = (e: MediaQueryListEvent) =>
			setPrefersReducedMotion(e.matches);
		mediaQuery.addEventListener("change", handler);
		return () => mediaQuery.removeEventListener("change", handler);
	}, []);

	// Reset snap index when opened
	useEffect(() => {
		if (open) {
			setCurrentSnapIndex(initialSnap);
		}
	}, [open, initialSnap]);

	// Sync with controlled activeSnapIndex
	useEffect(() => {
		if (
			activeSnapIndex != null &&
			hasSnaps &&
			activeSnapIndex < (snapPoints?.length ?? 0)
		) {
			setCurrentSnapIndex(activeSnapIndex);
		}
	}, [activeSnapIndex, hasSnaps, snapPoints?.length]);

	// Focus trap
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run only when open changes; handleClose is stable via useCallback
	useEffect(() => {
		if (!open || !sheetRef.current) return;

		const sheet = sheetRef.current;
		const focusableElements = sheet.querySelectorAll<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
		);
		const firstFocusable = focusableElements[0];
		const lastFocusable = focusableElements[focusableElements.length - 1];

		// Focus first element when opened
		firstFocusable?.focus();

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				handleClose();
				return;
			}

			if (e.key !== "Tab") return;

			if (e.shiftKey) {
				if (document.activeElement === firstFocusable) {
					e.preventDefault();
					lastFocusable?.focus();
				}
			} else {
				if (document.activeElement === lastFocusable) {
					e.preventDefault();
					firstFocusable?.focus();
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open]);

	// Prevent body scroll when sheet is open
	useEffect(() => {
		if (!open) return;
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, [open]);

	const handleClose = useCallback(() => {
		if (prefersReducedMotion) {
			onClose();
			return;
		}
		setIsClosing(true);
		setTimeout(() => {
			setIsClosing(false);
			setTranslateY(0);
			onClose();
		}, 300);
	}, [onClose, prefersReducedMotion]);

	// Find nearest snap point given a delta in pixels
	const findNearestSnap = useCallback(
		(deltaY: number): number | null => {
			if (!hasSnaps) return null;

			const viewportHeight = window.innerHeight;
			const currentHeightPx =
				(viewportHeight * (currentSnapPercent ?? 50)) / 100;
			const targetHeightPx = currentHeightPx - deltaY; // negative delta = drag up = taller
			const targetPercent = (targetHeightPx / viewportHeight) * 100;

			let nearestIndex = 0;
			let nearestDistance = Number.POSITIVE_INFINITY;

			for (let i = 0; i < snapPoints.length; i++) {
				const distance = Math.abs(snapPoints[i] - targetPercent);
				if (distance < nearestDistance) {
					nearestDistance = distance;
					nearestIndex = i;
				}
			}

			return nearestIndex;
		},
		[hasSnaps, snapPoints, currentSnapPercent],
	);

	// Touch handlers for drag-to-resize / drag-to-dismiss
	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		const touch = e.touches[0];
		dragStartY.current = touch.clientY;
		dragCurrentY.current = touch.clientY;
		dragStartTime.current = Date.now();
		setIsDragging(true);
	}, []);

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (!isDragging) return;
			const touch = e.touches[0];
			dragCurrentY.current = touch.clientY;

			if (hasSnaps) {
				// Allow dragging in both directions for snap points
				const deltaY = touch.clientY - dragStartY.current;
				setTranslateY(deltaY);
			} else {
				// Original behavior: only allow dragging down
				const deltaY = Math.max(0, touch.clientY - dragStartY.current);
				setTranslateY(deltaY);
			}
		},
		[isDragging, hasSnaps],
	);

	const handleTouchEnd = useCallback(() => {
		if (!isDragging) return;
		setIsDragging(false);

		const deltaY = dragCurrentY.current - dragStartY.current;
		const deltaTime = Date.now() - dragStartTime.current;
		const velocity = deltaY / deltaTime;

		if (hasSnaps) {
			// Check if we should dismiss (dragged below lowest snap by threshold)
			const viewportHeight = window.innerHeight;
			const lowestSnapPercent = Math.min(...snapPoints);
			const lowestSnapPx = (viewportHeight * lowestSnapPercent) / 100;
			const currentHeightPx =
				(viewportHeight * (currentSnapPercent ?? 50)) / 100;
			const newHeightPx = currentHeightPx - deltaY;

			if (
				newHeightPx < lowestSnapPx - SWIPE_THRESHOLD ||
				(deltaY > 0 && velocity > VELOCITY_THRESHOLD)
			) {
				setTranslateY(0);
				handleClose();
				return;
			}

			// Snap to nearest snap point
			const nearestIndex = findNearestSnap(deltaY);
			if (nearestIndex !== null) {
				setCurrentSnapIndex(nearestIndex);
				onSnapChange?.(nearestIndex);
			}
			setTranslateY(0);
		} else {
			// Original dismiss behavior
			if (deltaY > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
				handleClose();
			} else {
				setTranslateY(0);
			}
		}
	}, [
		isDragging,
		handleClose,
		hasSnaps,
		snapPoints,
		currentSnapPercent,
		findNearestSnap,
		onSnapChange,
	]);

	// Handle backdrop click
	const handleBackdropClick = useCallback(
		(e: React.MouseEvent) => {
			if (e.target === backdropRef.current) {
				handleClose();
			}
		},
		[handleClose],
	);

	if (!open && !isClosing) return null;

	// Compute height class
	let heightStyle: string | undefined;
	if (hasSnaps) {
		heightStyle = `${currentSnapPercent}vh`;
	}

	const heightClass = hasSnaps
		? ""
		: height === "full"
			? "max-h-[90vh]"
			: height === "half"
				? "max-h-[60vh]"
				: "max-h-[80vh]";

	const transitionClass = prefersReducedMotion
		? ""
		: isDragging
			? ""
			: "transition-all duration-300 ease-out";

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: Escape key handled via document keydown listener in focus trap effect
		<div
			ref={backdropRef}
			className={cn(
				"fixed inset-0 z-50 flex items-end justify-center",
				"bg-black/40 backdrop-blur-sm",
				prefersReducedMotion
					? ""
					: isClosing
						? "animate-out fade-out duration-300"
						: "animate-in fade-in duration-300",
			)}
			onClick={handleBackdropClick}
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? titleId : undefined}
		>
			<div
				ref={sheetRef}
				className={cn(
					"flex w-full flex-col rounded-t-3xl bg-[color:var(--dm-surface)] shadow-xl",
					"border-t border-x border-[color:var(--dm-border)]",
					heightClass,
					transitionClass,
					prefersReducedMotion
						? ""
						: isClosing
							? "animate-out slide-out-to-bottom duration-300"
							: "animate-in slide-in-from-bottom duration-300",
				)}
				style={{
					transform: `translateY(${translateY}px)`,
					...(heightStyle ? { height: heightStyle } : {}),
				}}
			>
				{/* Drag handle */}
				<button
					type="button"
					className="flex shrink-0 cursor-grab touch-none items-center justify-center border-none bg-transparent py-3 active:cursor-grabbing"
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
					aria-label="Drag to resize or dismiss"
					onClick={handleClose}
				>
					<div className="h-1.5 w-12 rounded-full bg-[color:var(--dm-border)]" />
				</button>

				{/* Header */}
				{title && (
					<div className="shrink-0 border-b border-[color:var(--dm-border)] px-5 pb-4">
						<div className="flex items-center justify-between">
							<h2
								id={titleId}
								className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]"
							>
								{title}
							</h2>
							<button
								type="button"
								onClick={handleClose}
								className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--dm-border)] text-[color:var(--dm-muted)] transition-colors hover:bg-[color:var(--dm-surface-muted)]"
								aria-label="Close"
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
								>
									<path d="M18 6L6 18" />
									<path d="M6 6l12 12" />
								</svg>
							</button>
						</div>
					</div>
				)}

				{/* Content */}
				<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-4">
					{children}
				</div>
			</div>
		</div>
	);
}
