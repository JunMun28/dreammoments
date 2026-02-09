import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

export function useStrokeDraw(options: {
	pathRef: React.RefObject<SVGPathElement | null>;
	triggerRef: React.RefObject<HTMLElement | null>;
	scrub?: number;
	reducedMotion?: boolean;
}) {
	const { pathRef, triggerRef, scrub = 0.8, reducedMotion = false } = options;

	useEffect(() => {
		const path = pathRef.current;
		const trigger = triggerRef.current;
		if (!path || !trigger) return;

		const length = path.getTotalLength();
		path.style.strokeDasharray = `${length}`;

		if (reducedMotion) {
			path.style.strokeDashoffset = "0";
			return;
		}

		path.style.strokeDashoffset = `${length}`;

		const tween = gsap.to(path, {
			strokeDashoffset: 0,
			ease: "none",
			scrollTrigger: {
				trigger,
				start: "top 80%",
				end: "bottom 60%",
				scrub,
			},
		});

		return () => {
			tween.kill();
			for (const st of ScrollTrigger.getAll().filter(
				(st) => st.trigger === trigger,
			)) {
				st.kill();
			}
		};
	}, [pathRef, triggerRef, scrub, reducedMotion]);
}
