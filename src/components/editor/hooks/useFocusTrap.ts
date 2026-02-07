import { type RefObject, useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
	'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Traps focus within a container element while enabled.
 * Re-queries focusable elements on each Tab keydown so dynamic content is handled.
 * Restores focus to the previously active element when disabled.
 */
export function useFocusTrap(
	containerRef: RefObject<HTMLElement | null>,
	options: { enabled: boolean; onEscape?: () => void },
) {
	const previousFocusRef = useRef<Element | null>(null);
	const onEscapeRef = useRef(options.onEscape);
	useEffect(() => {
		onEscapeRef.current = options.onEscape;
	});

	useEffect(() => {
		if (!options.enabled) return;

		// Store the element that was focused before the trap activated
		previousFocusRef.current = document.activeElement;

		// Move focus into the container on next tick so the DOM is ready
		const raf = requestAnimationFrame(() => {
			const container = containerRef.current;
			if (!container) return;
			const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
			if (focusable.length > 0) {
				focusable[0].focus();
			} else {
				// If no focusable children, make the container itself focusable
				container.setAttribute("tabindex", "-1");
				container.focus();
			}
		});

		return () => cancelAnimationFrame(raf);
	}, [options.enabled, containerRef]);

	useEffect(() => {
		if (!options.enabled) return;

		function handler(e: KeyboardEvent) {
			const container = containerRef.current;
			if (!container) return;

			if (e.key === "Escape") {
				e.preventDefault();
				onEscapeRef.current?.();
				return;
			}

			if (e.key !== "Tab") return;

			// Re-query focusable elements on each Tab press to handle dynamic content
			const focusable = Array.from(
				container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
			);
			if (focusable.length === 0) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (e.shiftKey) {
				// Shift+Tab: wrap from first to last
				if (document.activeElement === first) {
					e.preventDefault();
					last.focus();
				}
			} else {
				// Tab: wrap from last to first
				if (document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		}

		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [options.enabled, containerRef]);

	// Restore focus when the trap is disabled
	useEffect(() => {
		if (options.enabled) return;

		const previousElement = previousFocusRef.current;
		if (previousElement && previousElement instanceof HTMLElement) {
			previousElement.focus();
		}
		previousFocusRef.current = null;
	}, [options.enabled]);
}
