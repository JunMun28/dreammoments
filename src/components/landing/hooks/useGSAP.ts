import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function useGSAP(reducedMotion: boolean) {
	const containerRef = useRef<HTMLDivElement>(null);
	const contextRef = useRef<gsap.Context | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		contextRef.current = gsap.context(() => {}, containerRef.current);

		if (reducedMotion) {
			for (const t of ScrollTrigger.getAll()) {
				t.kill();
			}
		}

		return () => {
			contextRef.current?.revert();
		};
	}, [reducedMotion]);

	return { containerRef, context: contextRef };
}
