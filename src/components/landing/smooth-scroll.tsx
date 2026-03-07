"use client";

import { type ReactNode, useEffect } from "react";

export function SmoothScroll({ children }: { children: ReactNode }): ReactNode {
	useEffect(() => {
		function handleAnchorClick(e: MouseEvent) {
			const target = e.target as HTMLElement;
			const anchor = target.closest('a[href^="#"]');
			if (!anchor) return;

			const href = anchor.getAttribute("href");
			if (!href) return;

			e.preventDefault();
			const base = `${window.location.pathname}${window.location.search}`;

			if (href === "#") {
				window.scrollTo({ top: 0, behavior: "smooth" });
				window.history.replaceState(null, "", base);
				return;
			}

			if (href === "#contact") {
				window.scrollTo({
					top: document.body.scrollHeight,
					behavior: "smooth",
				});
				window.history.replaceState(null, "", `${base}${href}`);
				return;
			}

			const element = document.querySelector(href);
			if (!element) return;

			element.scrollIntoView({ behavior: "smooth", block: "start" });
			window.history.replaceState(null, "", `${base}${href}`);
		}

		document.addEventListener("click", handleAnchorClick);
		return () => document.removeEventListener("click", handleAnchorClick);
	}, []);

	return <>{children}</>;
}
