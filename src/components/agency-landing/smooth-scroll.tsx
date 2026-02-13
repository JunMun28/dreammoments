"use client";

import Lenis from "lenis";
import { type ReactNode, useEffect } from "react";

const ENABLE_SMOOTH_SCROLL = true;

const LENIS_OPTIONS = {
	duration: 1.6,
	easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
	orientation: "vertical" as const,
	gestureOrientation: "vertical" as const,
	smoothWheel: true,
	wheelMultiplier: 1,
	touchMultiplier: 2,
};

export function SmoothScroll({ children }: { children: ReactNode }): ReactNode {
	useEffect(() => {
		if (!ENABLE_SMOOTH_SCROLL) return;

		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		if (prefersReducedMotion) return;

		const lenis = new Lenis(LENIS_OPTIONS);

		function raf(time: number) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);

		function handleAnchorClick(e: MouseEvent) {
			const target = e.target as HTMLElement;
			const anchor = target.closest('a[href^="#"]');
			if (!anchor) return;

			const href = anchor.getAttribute("href");
			if (!href) return;

			e.preventDefault();
			const base = `${window.location.pathname}${window.location.search}`;

			if (href === "#") {
				lenis.scrollTo(0, { offset: 0 });
				window.history.replaceState(null, "", base);
				return;
			}

			if (href === "#contact") {
				lenis.scrollTo("bottom", { offset: 0 });
				window.history.replaceState(null, "", `${base}${href}`);
				return;
			}

			const element = document.querySelector(href);
			if (!element) return;

			lenis.scrollTo(element as HTMLElement, { offset: -100 });
			window.history.replaceState(null, "", `${base}${href}`);
		}

		document.addEventListener("click", handleAnchorClick);

		return () => {
			document.removeEventListener("click", handleAnchorClick);
			lenis.destroy();
		};
	}, []);

	return <>{children}</>;
}
