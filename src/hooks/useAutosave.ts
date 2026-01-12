import { useCallback, useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutosaveOptions<T> {
	/** The data to autosave */
	data: T;
	/** Function to save the data (e.g., server function call) */
	onSave: (data: T) => Promise<void>;
	/** Debounce delay in milliseconds (default: 1000) */
	delay?: number;
	/** Whether autosave is enabled (default: true) */
	enabled?: boolean;
}

interface UseAutosaveReturn {
	/** Current autosave status */
	status: AutosaveStatus;
	/** Error message if status is "error" */
	error: string | null;
	/** Manually trigger save (bypasses debounce) */
	saveNow: () => Promise<void>;
	/** Reset status to idle */
	reset: () => void;
}

/**
 * Hook to automatically save data with debounce.
 * Tracks saving state and errors for UI feedback.
 *
 * @example
 * ```tsx
 * const { status, error } = useAutosave({
 *   data: formValues,
 *   onSave: async (values) => {
 *     await updateInvitation({ data: { invitationId, ...values } });
 *   },
 *   delay: 1000,
 * });
 * ```
 */
export function useAutosave<T>({
	data,
	onSave,
	delay = 1000,
	enabled = true,
}: UseAutosaveOptions<T>): UseAutosaveReturn {
	const [status, setStatus] = useState<AutosaveStatus>("idle");
	const [error, setError] = useState<string | null>(null);

	// Track the latest data for save
	const dataRef = useRef(data);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isFirstRender = useRef(true);

	// Update ref when data changes
	useEffect(() => {
		dataRef.current = data;
	}, [data]);

	const performSave = useCallback(async () => {
		setStatus("saving");
		setError(null);

		try {
			await onSave(dataRef.current);
			setStatus("saved");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to save";
			setError(message);
			setStatus("error");
		}
	}, [onSave]);

	const saveNow = useCallback(async () => {
		// Clear any pending debounced save
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		await performSave();
	}, [performSave]);

	const reset = useCallback(() => {
		setStatus("idle");
		setError(null);
	}, []);

	// Debounced save effect - `data` is intentionally in deps to trigger re-debounce on change
	// biome-ignore lint/correctness/useExhaustiveDependencies: data triggers effect, ref captures latest value
	useEffect(() => {
		// Skip first render to avoid saving initial values
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		if (!enabled) {
			return;
		}

		// Clear existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// Set new debounced save
		timeoutRef.current = setTimeout(() => {
			performSave();
		}, delay);

		// Cleanup on unmount or data change
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [data, delay, enabled, performSave]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return {
		status,
		error,
		saveNow,
		reset,
	};
}
