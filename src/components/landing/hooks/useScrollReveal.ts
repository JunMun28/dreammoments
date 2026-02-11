import type { RefObject } from "react";
import { useEffect } from "react";

/**
 * Sets up scroll-reveal for all [data-scroll-reveal] elements on the page.
 * When an element enters the viewport, it gets the "dm-revealed" class added.
 *
 * Uses IntersectionObserver when available and the document is visible,
 * with a scroll-event fallback for hidden tabs or edge cases.
 *
 * Call this once from a top-level landing page component.
 *
 * @param reducedMotion - Whether the user prefers reduced motion
 * @param containerRef - Optional ref to scope the MutationObserver to (instead of document.body)
 */
export function useScrollRevealInit(
	reducedMotion: boolean,
	containerRef?: RefObject<HTMLElement | null>,
) {
	useEffect(() => {
		if (reducedMotion) {
			const targets = document.querySelectorAll("[data-scroll-reveal]");
			for (const el of targets) {
				el.classList.add("dm-revealed");
			}
			return;
		}

		/** Check if an element is within the viewport (with 80px margin). */
		function isInView(el: Element) {
			const rect = el.getBoundingClientRect();
			return rect.top < window.innerHeight - 60 && rect.bottom > 60;
		}

		/** Reveal any [data-scroll-reveal] elements currently in viewport. */
		function checkAll() {
			const targets = document.querySelectorAll(
				"[data-scroll-reveal]:not(.dm-revealed)",
			);
			for (const el of targets) {
				if (isInView(el)) {
					el.classList.add("dm-revealed");
				}
			}
		}

		// Try IntersectionObserver first (most efficient)
		let observer: IntersectionObserver | null = null;
		if (document.visibilityState === "visible") {
			observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							entry.target.classList.add("dm-revealed");
							observer?.unobserve(entry.target);
						}
					}
				},
				{ rootMargin: "-60px" },
			);

			const targets = document.querySelectorAll("[data-scroll-reveal]");
			for (const el of targets) {
				observer.observe(el);
			}
		}

		// Scroll event fallback — handles hidden tabs and hydration edge cases
		const onScroll = () => requestAnimationFrame(checkAll);
		window.addEventListener("scroll", onScroll, { passive: true });

		// Visibility change: when tab becomes visible, reveal anything in view
		const onVisibility = () => {
			if (document.visibilityState === "visible") {
				checkAll();
			}
		};
		document.addEventListener("visibilitychange", onVisibility);

		// Initial check after a brief delay (handles elements already in viewport)
		const timer = setTimeout(checkAll, 100);

		// Watch for dynamically added elements (hydration recovery)
		// Scope to containerRef if provided, otherwise skip MutationObserver
		let mutation: MutationObserver | null = null;
		const observeTarget = containerRef?.current;
		if (observeTarget) {
			mutation = new MutationObserver(() => {
				const newTargets = observeTarget.querySelectorAll(
					"[data-scroll-reveal]:not(.dm-revealed)",
				);
				for (const el of newTargets) {
					if (observer) observer.observe(el);
					if (isInView(el)) el.classList.add("dm-revealed");
				}
			});
			mutation.observe(observeTarget, { childList: true, subtree: true });
		}

		return () => {
			observer?.disconnect();
			mutation?.disconnect();
			window.removeEventListener("scroll", onScroll);
			document.removeEventListener("visibilitychange", onVisibility);
			clearTimeout(timer);
		};
	}, [reducedMotion, containerRef]);
}
