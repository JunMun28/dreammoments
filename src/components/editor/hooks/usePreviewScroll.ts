import { useCallback, useEffect, useRef } from "react";

export type UsePreviewScrollParams = {
	previewRef: React.RefObject<HTMLDivElement | null>;
	onActiveSectionChange: (sectionId: string) => void;
};

export function usePreviewScroll({
	previewRef,
	onActiveSectionChange,
}: UsePreviewScrollParams) {
	const isScrollingRef = useRef(false);

	useEffect(() => {
		const root = previewRef.current;
		if (!root) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (isScrollingRef.current) return;
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const sectionId = entry.target.getAttribute("data-section");
						if (sectionId) {
							onActiveSectionChange(sectionId);
						}
					}
				}
			},
			{ root, threshold: 0.4 },
		);

		const sections = root.querySelectorAll<HTMLElement>("[data-section]");
		for (const section of sections) {
			observer.observe(section);
		}

		return () => observer.disconnect();
	}, [previewRef, onActiveSectionChange]);

	const scrollToSection = useCallback(
		(sectionId: string) => {
			const root = previewRef.current;
			if (!root) return;

			const target = root.querySelector<HTMLElement>(
				`[data-section="${sectionId}"]`,
			);
			if (!target) return;

			isScrollingRef.current = true;
			target.scrollIntoView({ behavior: "smooth", block: "start" });

			// Reset programmatic scrolling flag after animation completes
			const timer = setTimeout(() => {
				isScrollingRef.current = false;
			}, 600);

			return () => clearTimeout(timer);
		},
		[previewRef],
	);

	return { scrollToSection };
}
