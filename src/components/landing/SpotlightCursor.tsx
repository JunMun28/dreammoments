import { useCallback, useEffect, useRef, useState } from "react";

interface SpotlightCursorProps {
	className?: string;
}

export function SpotlightCursor({ className }: SpotlightCursorProps) {
	const spotRef = useRef<HTMLDivElement>(null);
	const [isDesktop, setIsDesktop] = useState(false);
	const rafRef = useRef<number>(0);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const mq = window.matchMedia("(pointer: fine)");
		setIsDesktop(mq.matches);
		const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	const handleMove = useCallback((e: MouseEvent) => {
		if (rafRef.current) cancelAnimationFrame(rafRef.current);
		rafRef.current = requestAnimationFrame(() => {
			if (!spotRef.current) return;
			spotRef.current.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
		});
	}, []);

	useEffect(() => {
		if (!isDesktop || typeof window === "undefined") return;
		window.addEventListener("mousemove", handleMove, { passive: true });
		return () => {
			window.removeEventListener("mousemove", handleMove);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [isDesktop, handleMove]);

	if (!isDesktop) return null;

	return (
		<div
			ref={spotRef}
			className={className}
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: 600,
				height: 600,
				borderRadius: "50%",
				background:
					"radial-gradient(circle, rgba(232,24,64,0.07) 0%, transparent 70%)",
				pointerEvents: "none",
				zIndex: 0,
				willChange: "transform",
			}}
			aria-hidden="true"
		/>
	);
}
