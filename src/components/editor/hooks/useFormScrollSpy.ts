import { useCallback, useEffect, useRef } from "react";

export type UseFormScrollSpyParams = {
	scrollContainerRef: React.RefObject<HTMLDivElement | null>;
	onActiveSectionChange: (sectionId: string) => void;
	enabled?: boolean;
};

export function useFormScrollSpy({
	scrollContainerRef,
	onActiveSectionChange,
	enabled = true,
}: UseFormScrollSpyParams) {
	const isProgrammaticScrollRef = useRef(false);

	useEffect(() => {
		if (!enabled) return;
		const container = scrollContainerRef.current;
		if (!container) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (isProgrammaticScrollRef.current) return;
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const sectionId = entry.target.getAttribute("data-section-form");
						if (sectionId) {
							onActiveSectionChange(sectionId);
						}
					}
				}
			},
			{
				root: container,
				rootMargin: "-10% 0px -60% 0px",
			},
		);

		const sections = container.querySelectorAll<HTMLElement>(
			"[data-section-form]",
		);
		for (const section of sections) {
			observer.observe(section);
		}

		return () => observer.disconnect();
	}, [scrollContainerRef, onActiveSectionChange, enabled]);

	const scrollToFormSection = useCallback(
		(sectionId: string) => {
			const container = scrollContainerRef.current;
			if (!container) return;

			const target = container.querySelector<HTMLElement>(
				`[data-section-form="${sectionId}"]`,
			);
			if (!target) return;

			isProgrammaticScrollRef.current = true;
			target.scrollIntoView({ behavior: "smooth", block: "start" });

			const timer = setTimeout(() => {
				isProgrammaticScrollRef.current = false;
			}, 600);

			return () => clearTimeout(timer);
		},
		[scrollContainerRef],
	);

	return { scrollToFormSection };
}
