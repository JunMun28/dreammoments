import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	setInvitationVisibility,
	updateInvitationContent,
} from "../../../lib/data";
import type { InvitationContent } from "../../../lib/types";

export type UseAutoSaveParams = {
	invitationId: string;
	draftRef: React.RefObject<InvitationContent>;
	visibilityRef: React.RefObject<Record<string, boolean>>;
	version: number;
};

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export function useAutoSave({
	invitationId,
	draftRef,
	visibilityRef,
	version,
}: UseAutoSaveParams) {
	const [autosaveAt, setAutosaveAt] = useState<string>("");
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
	const [saveError, setSaveError] = useState<string | null>(null);
	const lastSavedVersionRef = useRef(0);
	const versionRef = useRef(version);
	versionRef.current = version;

	const hasUnsavedChanges = version !== lastSavedVersionRef.current;

	const saveNow = useCallback(() => {
		if (versionRef.current === lastSavedVersionRef.current) return;
		setSaveStatus("saving");
		setSaveError(null);
		try {
			updateInvitationContent(invitationId, draftRef.current);
			setInvitationVisibility(invitationId, visibilityRef.current);
			lastSavedVersionRef.current = versionRef.current;
			setAutosaveAt(new Date().toLocaleTimeString());
			setSaveStatus("saved");
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to save changes";
			setSaveError(message);
			setSaveStatus("error");
		}
	}, [invitationId, draftRef, visibilityRef]);

	useEffect(() => {
		const interval = window.setInterval(() => {
			saveNow();
		}, 30000);
		return () => window.clearInterval(interval);
	}, [saveNow]);

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
