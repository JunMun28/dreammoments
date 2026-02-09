import { useCallback, useEffect, useRef } from "react";

export function use3DTilt(options?: {
	maxRotation?: number;
	reducedMotion?: boolean;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const maxRotation = options?.maxRotation ?? 6;
	const reducedMotion = options?.reducedMotion ?? false;
	const rafRef = useRef<number>(0);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			const el = ref.current;
			if (!el) return;

			cancelAnimationFrame(rafRef.current);
			rafRef.current = requestAnimationFrame(() => {
				const rect = el.getBoundingClientRect();
				const x = (e.clientX - rect.left) / rect.width - 0.5;
				const y = (e.clientY - rect.top) / rect.height - 0.5;
				el.style.transform = `perspective(800px) rotateX(${-y * maxRotation}deg) rotateY(${x * maxRotation}deg)`;
			});
		},
		[maxRotation],
	);

	const handleMouseLeave = useCallback(() => {
		const el = ref.current;
		if (!el) return;
		cancelAnimationFrame(rafRef.current);
		el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
		el.style.transition = "transform 0.5s ease-out";
		setTimeout(() => {
			if (el) el.style.transition = "";
		}, 500);
	}, []);

	useEffect(() => {
		const el = ref.current;
		if (!el || reducedMotion) return;

		// Only enable on desktop with fine pointer
		const isDesktop = window.matchMedia("(pointer: fine)").matches;
		if (!isDesktop) return;

		el.addEventListener("mousemove", handleMouseMove);
		el.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			cancelAnimationFrame(rafRef.current);
			el.removeEventListener("mousemove", handleMouseMove);
			el.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, [reducedMotion, handleMouseMove, handleMouseLeave]);

	return ref;
}
