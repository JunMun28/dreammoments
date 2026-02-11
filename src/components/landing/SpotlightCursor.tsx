import { useCallback, useEffect, useRef, useState } from "react";

interface SpotlightCursorProps {
	className?: string;
	containerRef?: React.RefObject<HTMLElement | null>;
}

export function SpotlightCursor({
	className,
	containerRef,
}: SpotlightCursorProps) {
	const spotRef = useRef<HTMLDivElement>(null);
	const [isDesktop, setIsDesktop] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const rafRef = useRef<number>(0);
	const lastMoveRef = useRef<number>(0);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const mq = window.matchMedia("(pointer: fine)");
		setIsDesktop(mq.matches);
		const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	// IntersectionObserver to hide spotlight when hero is not visible
	useEffect(() => {
		if (!containerRef?.current || !isDesktop) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				setIsVisible(entry.isIntersecting);
			},
			{ threshold: 0 },
		);
		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [containerRef, isDesktop]);

	const handleMove = useCallback(
		(e: MouseEvent) => {
			const now = performance.now();
			if (now - lastMoveRef.current < 16) return;
			lastMoveRef.current = now;
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			rafRef.current = requestAnimationFrame(() => {
				if (!spotRef.current || !containerRef?.current) return;
				const rect = containerRef.current.getBoundingClientRect();
				const x = e.clientX - rect.left - 300;
				const y = e.clientY - rect.top - 300;
				spotRef.current.style.transform = `translate(${x}px, ${y}px)`;
			});
		},
		[containerRef],
	);

	useEffect(() => {
		if (!isDesktop || !isVisible || typeof window === "undefined") return;
		window.addEventListener("mousemove", handleMove, { passive: true });
		return () => {
			window.removeEventListener("mousemove", handleMove);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [isDesktop, isVisible, handleMove]);

	if (!isDesktop || !isVisible) return null;

	return (
		<div
			ref={spotRef}
			className={className}
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: 600,
				height: 600,
				borderRadius: "50%",
				background:
					"radial-gradient(circle, rgba(200,64,64,0.06) 0%, transparent 70%)",
				pointerEvents: "none",
				zIndex: 0,
				willChange: "transform",
			}}
			aria-hidden="true"
		/>
	);
}
