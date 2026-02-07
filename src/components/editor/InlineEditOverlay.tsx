import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { cn } from "../../lib/utils";

type InlineEditOverlayProps = {
	fieldPath: string;
	value: string;
	rect: DOMRect | null;
	isMobile: boolean;
	onChange: (value: string) => void;
	onSave: () => void;
	onCancel: () => void;
};

const POPOVER_MAX_WIDTH = 320;
const POPOVER_GAP = 8;
const VIEWPORT_PADDING = 12;

function formatFieldLabel(fieldPath: string): string {
	const parts = fieldPath.split(".");
	const last = parts[parts.length - 1] ?? fieldPath;
	return last
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (c) => c.toUpperCase())
		.trim();
}

export default function InlineEditOverlay({
	fieldPath,
	value,
	rect,
	isMobile,
	onChange,
	onSave,
	onCancel,
}: InlineEditOverlayProps) {
	const popoverRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const [position, setPosition] = useState<{
		top: number;
		left: number;
		arrowUp: boolean;
	} | null>(null);

	const isMultiline = value.length > 60 || value.includes("\n");
	const label = formatFieldLabel(fieldPath);
	const shouldRender = !isMobile && rect != null;

	// Position the popover relative to the element rect
	useLayoutEffect(() => {
		if (!shouldRender || !rect) return;

		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		const estimatedHeight = isMultiline ? 200 : 160;

		const spaceBelow = viewportHeight - rect.bottom - POPOVER_GAP;
		const spaceAbove = rect.top - POPOVER_GAP;
		const placeBelow =
			spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove;

		const top = placeBelow
			? rect.bottom + POPOVER_GAP
			: rect.top - POPOVER_GAP - estimatedHeight;

		const elementCenter = rect.left + rect.width / 2;
		let left = elementCenter - POPOVER_MAX_WIDTH / 2;
		left = Math.max(VIEWPORT_PADDING, left);
		left = Math.min(viewportWidth - POPOVER_MAX_WIDTH - VIEWPORT_PADDING, left);

		setPosition({ top, left, arrowUp: !placeBelow });
	}, [rect, isMultiline, shouldRender]);

	// Focus the input on mount
	useEffect(() => {
		if (!shouldRender) return;
		const timer = setTimeout(() => {
			inputRef.current?.focus();
			inputRef.current?.select();
		}, 50);
		return () => clearTimeout(timer);
	}, [shouldRender]);

	// Close on Escape
	useEffect(() => {
		if (!shouldRender) return;
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				event.preventDefault();
				onCancel();
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onCancel, shouldRender]);

	// Close on click outside
	useEffect(() => {
		if (!shouldRender) return;
		function handleClickOutside(event: MouseEvent) {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(event.target as Node)
			) {
				onCancel();
			}
		}
		const timer = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside);
		}, 100);
		return () => {
			clearTimeout(timer);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [onCancel, shouldRender]);

	// Focus trap
	const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
		if (event.key === "Tab" && popoverRef.current) {
			const focusable = popoverRef.current.querySelectorAll<HTMLElement>(
				'textarea, button, [tabindex]:not([tabindex="-1"])',
			);
			if (focusable.length === 0) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last?.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first?.focus();
			}
		}
	}, []);

	if (!shouldRender || !position) return null;

	return (
		<div
			ref={popoverRef}
			role="dialog"
			aria-label={`Edit ${label}`}
			onKeyDown={handleKeyDown}
			className={cn(
				"fixed z-80 w-full rounded-2xl border bg-[var(--dm-surface,#fff)] p-4 shadow-xl",
				"border-[var(--dm-border,#e5e5e5)]",
			)}
			style={{
				top: position.top,
				left: position.left,
				maxWidth: POPOVER_MAX_WIDTH,
				zIndex: 80,
			}}
		>
			{/* Arrow */}
			<div
				className={cn(
					"absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border bg-[var(--dm-surface,#fff)]",
					"border-[var(--dm-border,#e5e5e5)]",
					position.arrowUp
						? "bottom-[-7px] border-l-0 border-t-0"
						: "top-[-7px] border-b-0 border-r-0",
				)}
			/>

			{/* Label */}
			<p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--dm-muted,#888)]">
				{label}
			</p>

			{/* Input */}
			<textarea
				ref={inputRef}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.shiftKey && !isMultiline) {
						e.preventDefault();
						onSave();
					}
				}}
				rows={isMultiline ? 3 : 1}
				className={cn(
					"w-full resize-none rounded-xl border px-3 py-2 text-sm",
					"border-[var(--dm-border,#e5e5e5)] bg-[var(--dm-bg,#fafafa)]",
					"text-[var(--dm-ink,#1a1a1a)]",
					"placeholder:text-[var(--dm-muted,#888)]",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-peach)]/30",
				)}
			/>

			{/* Buttons */}
			<div className="mt-3 flex items-center justify-end gap-2">
				<button
					type="button"
					onClick={onCancel}
					className={cn(
						"min-h-[44px] rounded-xl border px-4 py-2 text-xs font-medium",
						"border-[var(--dm-border,#e5e5e5)] text-[var(--dm-ink,#1a1a1a)]",
						"hover:bg-[var(--dm-bg,#fafafa)]",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-peach)]/30",
					)}
				>
					Cancel
				</button>
				<button
					type="button"
					onClick={onSave}
					className={cn(
						"min-h-[44px] rounded-xl px-4 py-2 text-xs font-medium text-white",
						"bg-[var(--dm-peach,#e8a87c)]",
						"hover:opacity-90",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-peach)]/30",
					)}
				>
					Apply
				</button>
			</div>
		</div>
	);
}
