import { useCallback, useEffect, useRef, useState } from "react";

/** Minimum duration in seconds */
const MIN_DURATION = 1;

/** Maximum duration in seconds */
const MAX_DURATION = 300;

/** Default duration in seconds */
const DEFAULT_DURATION = 60;

/** Update interval in milliseconds */
const UPDATE_INTERVAL = 16; // ~60fps

interface UseAutoScrollOptions {
	/** Initial duration in seconds (default: 60) */
	initialDuration?: number;
	/** Callback when progress updates */
	onProgress?: (progress: number) => void;
}

interface UseAutoScrollReturn {
	/** Whether auto-scroll is currently playing */
	isPlaying: boolean;
	/** Current scroll progress (0 to 1) */
	progress: number;
	/** Current duration in seconds */
	duration: number;
	/** Start auto-scroll */
	play: () => void;
	/** Pause auto-scroll */
	pause: () => void;
	/** Toggle play/pause */
	toggle: () => void;
	/** Reset progress to 0 and stop */
	reset: () => void;
	/** Set duration (clamped to 1-300 seconds) */
	setDuration: (duration: number) => void;
}

/**
 * CE-028: Hook for managing auto-scroll animation
 * Provides play/pause controls and progress tracking for smooth scrolling
 */
export function useAutoScroll(
	options: UseAutoScrollOptions = {},
): UseAutoScrollReturn {
	const { initialDuration = DEFAULT_DURATION, onProgress } = options;

	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const [duration, setDurationState] = useState(
		Math.max(MIN_DURATION, Math.min(MAX_DURATION, initialDuration)),
	);

	// Refs for animation loop
	const startTimeRef = useRef<number | null>(null);
	const progressAtPauseRef = useRef(0);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Cleanup interval on unmount
	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	// Animation loop
	useEffect(() => {
		if (!isPlaying) {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			return;
		}

		// Start the animation
		startTimeRef.current = Date.now();
		const startProgress = progressAtPauseRef.current;

		intervalRef.current = setInterval(() => {
			const elapsed = (Date.now() - (startTimeRef.current || 0)) / 1000;
			const totalDuration = duration;
			const remainingDuration = totalDuration * (1 - startProgress);
			const newProgress =
				startProgress + (elapsed / remainingDuration) * (1 - startProgress);

			if (newProgress >= 1) {
				setProgress(1);
				setIsPlaying(false);
				progressAtPauseRef.current = 1;
				onProgress?.(1);
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
					intervalRef.current = null;
				}
			} else {
				setProgress(newProgress);
				onProgress?.(newProgress);
			}
		}, UPDATE_INTERVAL);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [isPlaying, duration, onProgress]);

	const play = useCallback(() => {
		setIsPlaying(true);
	}, []);

	const pause = useCallback(() => {
		progressAtPauseRef.current = progress;
		setIsPlaying(false);
	}, [progress]);

	const toggle = useCallback(() => {
		if (isPlaying) {
			progressAtPauseRef.current = progress;
			setIsPlaying(false);
		} else {
			setIsPlaying(true);
		}
	}, [isPlaying, progress]);

	const reset = useCallback(() => {
		setIsPlaying(false);
		setProgress(0);
		progressAtPauseRef.current = 0;
		startTimeRef.current = null;
	}, []);

	const setDuration = useCallback((newDuration: number) => {
		const clamped = Math.max(MIN_DURATION, Math.min(MAX_DURATION, newDuration));
		setDurationState(clamped);
	}, []);

	return {
		isPlaying,
		progress,
		duration,
		play,
		pause,
		toggle,
		reset,
		setDuration,
	};
}
