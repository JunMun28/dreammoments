import {
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { updateInvitationFn } from "../../../api/invitations";
import {
	getInvitationById,
	setInvitationVisibility,
	updateInvitationContent,
} from "../../../lib/data";
import type { InvitationContent } from "../../../lib/types";

export type UseAutoSaveParams = {
	invitationId: string;
	draftRef: RefObject<InvitationContent>;
	visibilityRef: RefObject<Record<string, boolean>>;
	version: number;
	onSaveError?: (message: string) => void;
};

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

const TOKEN_KEY = "dm-auth-token";
const RETRY_DELAYS = [5000, 15000, 30000];
const DEBOUNCE_MS = 2000;
const INTERVAL_MS = 30000;

function getStoredToken(): string | null {
	if (typeof window === "undefined") return null;
	const storage = window.localStorage as
		| {
				getItem?: (key: string) => string | null;
		  }
		| Record<string, unknown>;
	if (
		storage &&
		typeof (storage as { getItem?: unknown }).getItem === "function"
	) {
		return (
			(storage as { getItem: (key: string) => string | null }).getItem(
				TOKEN_KEY,
			) ?? null
		);
	}
	const fallback = (storage as Record<string, unknown>)[TOKEN_KEY];
	return typeof fallback === "string" ? fallback : null;
}

export function useAutoSave({
	invitationId,
	draftRef,
	visibilityRef,
	version,
	onSaveError,
}: UseAutoSaveParams) {
	const [autosaveAt, setAutosaveAt] = useState<string>("");
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
	const [saveError, setSaveError] = useState<string | null>(null);
	const [retriesExhausted, setRetriesExhausted] = useState(false);
	const lastSavedVersionRef = useRef(0);
	const versionRef = useRef(version);
	versionRef.current = version;

	// Save queue: only one save in flight at a time
	const savingRef = useRef(false);
	const queuedVersionRef = useRef<number | null>(null);

	const saveNowRef = useRef<() => Promise<void>>(null);
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const intervalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const retryCountRef = useRef(0);
	const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const hasUnsavedChanges = version !== lastSavedVersionRef.current;

	// Reset the interval timer so it counts a full INTERVAL_MS from now.
	// This prevents debounce + interval from firing within seconds of each other.
	const resetIntervalTimer = useCallback(() => {
		if (intervalTimerRef.current) {
			clearInterval(intervalTimerRef.current);
		}
		intervalTimerRef.current = setInterval(() => {
			saveNowRef.current?.();
		}, INTERVAL_MS);
	}, []);

	const saveNow = useCallback(async () => {
		const currentVersion = versionRef.current;

		// Nothing to save
		if (currentVersion === lastSavedVersionRef.current) return;

		// If a save is already in flight, queue the latest version and bail
		if (savingRef.current) {
			queuedVersionRef.current = currentVersion;
			return;
		}

		savingRef.current = true;
		queuedVersionRef.current = null;
		setSaveStatus("saving");
		setSaveError(null);
		setRetriesExhausted(false);

		if (retryTimerRef.current) {
			clearTimeout(retryTimerRef.current);
			retryTimerRef.current = null;
		}

		try {
			// Always persist locally first
			updateInvitationContent(invitationId, draftRef.current);
			setInvitationVisibility(invitationId, visibilityRef.current);

			const token = getStoredToken();
			if (token) {
				await updateInvitationFn({
					data: {
						invitationId,
						token,
						content: draftRef.current as unknown as Record<string, unknown>,
						sectionVisibility: visibilityRef.current,
					},
				});
			}

			// Save succeeded: update bookkeeping
			lastSavedVersionRef.current = versionRef.current;
			retryCountRef.current = 0;
			setAutosaveAt(new Date().toLocaleTimeString());
			setSaveStatus("saved");
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to save changes";
			setSaveError(message);
			setSaveStatus("error");
			onSaveError?.(message);

			if (retryCountRef.current < RETRY_DELAYS.length) {
				const delay = RETRY_DELAYS[retryCountRef.current];
				retryCountRef.current += 1;
				retryTimerRef.current = setTimeout(() => {
					saveNowRef.current?.();
				}, delay);
			} else {
				// All retries exhausted - show persistent error
				setRetriesExhausted(true);
			}
		} finally {
			savingRef.current = false;

			// If changes were queued while we were saving, save again
			if (queuedVersionRef.current !== null) {
				queuedVersionRef.current = null;
				saveNowRef.current?.();
			}
		}
	}, [invitationId, draftRef, visibilityRef, onSaveError]);

	saveNowRef.current = saveNow;

	const retrySave = useCallback(() => {
		retryCountRef.current = 0;
		setRetriesExhausted(false);
		setSaveError(null);
		void saveNowRef.current?.();
	}, []);

	const revertToLastSaved = useCallback(() => {
		const invitation = getInvitationById(invitationId);

		if (invitation?.content) {
			Object.assign(draftRef.current, invitation.content);
		}
		if (invitation?.sectionVisibility) {
			Object.assign(visibilityRef.current, invitation.sectionVisibility);
		}

		// Mark as saved since we reverted to last-saved state
		lastSavedVersionRef.current = versionRef.current;
		retryCountRef.current = 0;
		setRetriesExhausted(false);
		setSaveError(null);
		setSaveStatus("saved");
	}, [invitationId, draftRef, visibilityRef]);

	const markDirty = useCallback(() => {
		if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
		debounceTimerRef.current = setTimeout(() => {
			saveNowRef.current?.();
			// Reset interval so it doesn't fire right after debounce
			resetIntervalTimer();
		}, DEBOUNCE_MS);
	}, [resetIntervalTimer]);

	// 30-second interval auto-save
	useEffect(() => {
		intervalTimerRef.current = setInterval(() => {
			saveNowRef.current?.();
		}, INTERVAL_MS);
		return () => {
			if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
		};
	}, []);

	// Clean up timers
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
			if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
		};
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!hasUnsavedChanges) return;
		setSaveStatus("unsaved");
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			updateInvitationContent(invitationId, draftRef.current);
			setInvitationVisibility(invitationId, visibilityRef.current);

			const token = getStoredToken();
			if (token && navigator.sendBeacon) {
				const payload = JSON.stringify({
					invitationId,
					token,
					content: draftRef.current,
					sectionVisibility: visibilityRef.current,
				});
				navigator.sendBeacon(
					"/api/invitations/save",
					new Blob([payload], { type: "application/json" }),
				);
			}

			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [hasUnsavedChanges, invitationId, draftRef, visibilityRef]);

	return {
		autosaveAt,
		hasUnsavedChanges,
		markDirty,
		saveNow,
		retrySave,
		revertToLastSaved,
		saveStatus,
		saveError,
		retriesExhausted,
	};
}
