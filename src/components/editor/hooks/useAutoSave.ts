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
};

export type SaveStatus = "saved" | "saving" | "unsaved";

export function useAutoSave({
	invitationId,
	draftRef,
	visibilityRef,
}: UseAutoSaveParams) {
	const [autosaveAt, setAutosaveAt] = useState<string>("");
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
	const lastSavedSnapshotRef = useRef<string>(JSON.stringify(draftRef.current));

	const hasUnsavedChanges =
		JSON.stringify(draftRef.current) !== lastSavedSnapshotRef.current;

	const saveNow = useCallback(() => {
		setSaveStatus("saving");
		updateInvitationContent(invitationId, draftRef.current);
		setInvitationVisibility(invitationId, visibilityRef.current);
		lastSavedSnapshotRef.current = JSON.stringify(draftRef.current);
		setAutosaveAt(new Date().toLocaleTimeString());
		setSaveStatus("saved");
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
	};
}
