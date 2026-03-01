import { useCallback, useEffect, useRef, useState } from "react";
import { updateInvitationFn } from "@/api/invitations";
import type { CanvasDocument } from "@/lib/canvas/types";

const TOKEN_KEY = "dm-auth-token";
const DEBOUNCE_MS = 1200;

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

function getToken(): string | null {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(TOKEN_KEY);
}

export function useCanvasAutoSave({
	invitationId,
	document,
	onError,
}: {
	invitationId: string;
	document: CanvasDocument;
	onError?: (message: string) => void;
}) {
	const [status, setStatus] = useState<SaveStatus>("saved");
	const [savedAt, setSavedAt] = useState<string>("");
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const savingRef = useRef(false);
	const queuedRef = useRef<CanvasDocument | null>(null);
	const latestRef = useRef(document);

	latestRef.current = document;

	const persistNow = useCallback(
		async (nextDoc: CanvasDocument) => {
			if (savingRef.current) {
				queuedRef.current = nextDoc;
				return;
			}
			savingRef.current = true;
			setStatus("saving");
			try {
				const token = getToken();
				if (!token) throw new Error("Not authenticated");

				await updateInvitationFn({
					data: {
						invitationId,
						token,
						content: nextDoc as unknown as Record<string, unknown>,
					},
				});

				setStatus("saved");
				setSavedAt(new Date().toLocaleTimeString());
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Auto-save failed";
				setStatus("error");
				onError?.(message);
			} finally {
				savingRef.current = false;
				const queued = queuedRef.current;
				queuedRef.current = null;
				if (queued) {
					void persistNow(queued);
				}
			}
		},
		[invitationId, onError],
	);

	const markDirty = useCallback(() => {
		setStatus("unsaved");
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			void persistNow(latestRef.current);
		}, DEBOUNCE_MS);
	}, [persistNow]);

	const saveNow = useCallback(
		() => persistNow(latestRef.current),
		[persistNow],
	);

	useEffect(
		() => () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		},
		[],
	);

	return {
		status,
		savedAt,
		markDirty,
		saveNow,
	};
}
