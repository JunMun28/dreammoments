import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

export function useCountUp(
	targetValue: number,
	options?: { duration?: number; suffix?: string; reducedMotion?: boolean },
) {
	const ref = useRef<HTMLElement>(null);
	const [hasAnimated, setHasAnimated] = useState(false);

	const duration = options?.duration ?? 2;
	const suffix = options?.suffix ?? "";
	const reducedMotion = options?.reducedMotion ?? false;

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		if (reducedMotion) {
			el.textContent = `${targetValue}${suffix}`;
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting && !hasAnimated) {
						setHasAnimated(true);
						const obj = { val: 0 };
						gsap.to(obj, {
							val: targetValue,
							duration,
							ease: "power2.out",
							snap: { val: 1 },
							onUpdate: () => {
								el.textContent = `${obj.val}${suffix}`;
							},
						});
						observer.disconnect();
					}
				}
			},
			{ threshold: 0.5 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [targetValue, duration, suffix, reducedMotion, hasAnimated]);

	return ref;
}
