import {
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { updateInvitationFn } from "../../../api/invitations";
import {
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

function getStoredToken(): string | null {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(TOKEN_KEY);
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
	const lastSavedVersionRef = useRef(0);
	const versionRef = useRef(version);
	versionRef.current = version;
	const savingRef = useRef(false);
	const saveNowRef = useRef<() => Promise<void>>(null);

	const hasUnsavedChanges = version !== lastSavedVersionRef.current;

	const saveNow = useCallback(async () => {
		if (versionRef.current === lastSavedVersionRef.current) return;
		if (savingRef.current) return;

		savingRef.current = true;
		setSaveStatus("saving");
		setSaveError(null);
		try {
			// Optimistic localStorage write (immediate feedback)
			updateInvitationContent(invitationId, draftRef.current);
			setInvitationVisibility(invitationId, visibilityRef.current);

			// Persist to database if authenticated
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

			lastSavedVersionRef.current = versionRef.current;
			setAutosaveAt(new Date().toLocaleTimeString());
			setSaveStatus("saved");
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to save changes";
			setSaveError(message);
			setSaveStatus("error");
			onSaveError?.(message);
		} finally {
			savingRef.current = false;
		}
	}, [invitationId, draftRef, visibilityRef, onSaveError]);

	saveNowRef.current = saveNow;

	useEffect(() => {
		const interval = window.setInterval(() => {
			saveNowRef.current?.();
		}, 30000);
		return () => window.clearInterval(interval);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!hasUnsavedChanges) return;
		setSaveStatus("unsaved");
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [hasUnsavedChanges]);

	return {
		autosaveAt,
		hasUnsavedChanges,
		saveNow,
		saveStatus,
		saveError,
	};
}
