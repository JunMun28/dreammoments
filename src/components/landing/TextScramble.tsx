import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

interface TextScrambleProps {
	text: string;
	duration?: number;
	className?: string;
	style?: React.CSSProperties;
	triggerOnMount?: boolean;
	reducedMotion?: boolean;
}

const CJK_POOL = "福禄寿喜财吉祥如意和平安乐永结同心百年好合天长地久鸾凤";

export interface TextScrambleHandle {
	trigger: () => void;
}

export const TextScramble = forwardRef<TextScrambleHandle, TextScrambleProps>(
	function TextScramble(
		{ text, className, style, triggerOnMount = false, reducedMotion = false },
		ref,
	) {
		const [display, setDisplay] = useState(text);
		const frameRef = useRef(0);
		const isMountedRef = useRef(true);

		const trigger = useCallback(() => {
			if (reducedMotion) {
				setDisplay(text);
				return;
			}

			const chars = text.split("");
			const stagger = 150;
			const cycleInterval = 80;
			const cyclesPerChar = 5;
			const totalDuration =
				(chars.length - 1) * stagger + cyclesPerChar * cycleInterval;

			let start: number | null = null;

			const animate = (timestamp: number) => {
				if (!isMountedRef.current) return;
				if (!start) start = timestamp;
				const elapsed = timestamp - start;

				const result = chars.map((char, i) => {
					const charStart = i * stagger;
					const charEnd = charStart + cyclesPerChar * cycleInterval;

					if (elapsed < charStart) {
						return CJK_POOL[Math.floor(Math.random() * CJK_POOL.length)];
					}
					if (elapsed >= charEnd) {
						return char;
					}
					return CJK_POOL[Math.floor(Math.random() * CJK_POOL.length)];
				});

				setDisplay(result.join(""));

				if (elapsed < totalDuration) {
					frameRef.current = requestAnimationFrame(animate);
				} else {
					setDisplay(text);
				}
			};

			frameRef.current = requestAnimationFrame(animate);
		}, [text, reducedMotion]);

		useImperativeHandle(ref, () => ({ trigger }), [trigger]);

		useEffect(() => {
			isMountedRef.current = true;
			if (triggerOnMount && !reducedMotion) {
				trigger();
			}
			return () => {
				isMountedRef.current = false;
				if (frameRef.current) cancelAnimationFrame(frameRef.current);
			};
		}, [triggerOnMount, reducedMotion, trigger]);

		return (
			<span className={className} style={style}>
				{display}
			</span>
		);
	},
);
