import { useMemo, useRef, useState } from "react";
import type { InvitationContent } from "../../../lib/types";
import type { FieldConfig } from "../../../templates/types";

export type UseEditorStateParams = {
	initialContent: InvitationContent;
	initialVisibility: Record<string, boolean>;
	initialSection: string;
};

export function getValueByPath(
	content: InvitationContent,
	path: string,
): string {
	const parts = path.split(".");
	let current: unknown = content;
	for (const part of parts) {
		if (current == null) return "";
		if (typeof current !== "object") return "";
		current = (current as Record<string, unknown>)[part];
	}
	if (current == null) return "";
	if (typeof current === "string") return current;
	if (typeof current === "number") return String(current);
	if (typeof current === "boolean") return String(current);
	return "";
}

export function setValueByPath(
	content: InvitationContent,
	path: string,
	value: unknown,
): InvitationContent {
	const parts = path.split(".").filter(Boolean);
	if (parts.length === 0) return content;

	const isObjectLike = (input: unknown): input is Record<string, unknown> =>
		typeof input === "object" && input !== null;
	const isArrayIndex = (part: string) => /^\d+$/.test(part);
	const cloneContainer = (
		input: unknown,
		nextPart?: string,
	): Record<string, unknown> | unknown[] => {
		if (Array.isArray(input)) return [...input];
		if (isObjectLike(input)) return { ...input };
		return isArrayIndex(nextPart ?? "") ? [] : {};
	};

	const sourceRoot = content as unknown as Record<string, unknown>;
	const nextRoot = cloneContainer(sourceRoot) as Record<string, unknown>;

	let sourceCursor: unknown = sourceRoot;
	let nextCursor = nextRoot;

	for (let i = 0; i < parts.length - 1; i++) {
		const part = parts[i] as string;
		const nextPart = parts[i + 1] as string;
		const sourceChild = isObjectLike(sourceCursor)
			? (sourceCursor as Record<string, unknown>)[part]
			: undefined;
		const nextChild = cloneContainer(sourceChild, nextPart);
		nextCursor[part] = nextChild;
		sourceCursor = sourceChild;
		nextCursor = nextChild as Record<string, unknown>;
	}

	const lastPart = parts.at(-1) as string;
	nextCursor[lastPart] = value;
	return nextRoot as InvitationContent;
}

export function validateField(field: FieldConfig, value: string): string {
	if (field.required && !value?.trim()) return `${field.label} is required`;
	if (field.type === "date" && value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return "Use YYYY-MM-DD format";
	}
	if (field.id.toLowerCase().includes("email") && value) {
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email";
	}
	return "";
}

export function useEditorState({
	initialContent,
	initialVisibility,
	initialSection,
}: UseEditorStateParams) {
	const [draft, setDraft] = useState<InvitationContent>(initialContent);
	const [sectionVisibility, setSectionVisibility] =
		useState<Record<string, boolean>>(initialVisibility);
	const [activeSection, setActiveSection] = useState<string>(initialSection);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [history, setHistory] = useState<InvitationContent[]>([]);
	const [future, setFuture] = useState<InvitationContent[]>([]);
	const [version, setVersion] = useState(0);
	const historyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastFieldRef = useRef<string>("");

	const canUndo = history.length > 0;
	const canRedo = future.length > 0;

	const pushHistory = (snapshot: InvitationContent) => {
		setHistory((prev) => [...prev.slice(-49), snapshot]);
		setFuture([]);
	};

	const updateDraft = (next: InvitationContent) => {
		pushHistory(draft);
		setDraft(next);
		setVersion((v) => v + 1);
	};

	const handleUndo = () => {
		if (!canUndo) return;
		// Flush any pending debounced history push
		if (historyTimeoutRef.current) {
			clearTimeout(historyTimeoutRef.current);
			historyTimeoutRef.current = null;
		}
		const previous = history[history.length - 1];
		setHistory((prev) => prev.slice(0, -1));
		setFuture((prev) => [draft, ...prev].slice(0, 50));
		setDraft(previous);
		setVersion((v) => v + 1);
	};

	const handleRedo = () => {
		if (!canRedo) return;
		const next = future[0];
		setFuture((prev) => prev.slice(1));
		setHistory((prev) => [...prev.slice(-49), draft]);
		setDraft(next);
		setVersion((v) => v + 1);
	};

	const handleFieldChange = (fieldPath: string, value: string | boolean) => {
		const normalized =
			typeof value === "string" && fieldPath.endsWith("maxPlusOnes")
				? Number(value || 0)
				: value;
		const next = setValueByPath(draft, fieldPath, normalized);

		if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
		if (fieldPath !== lastFieldRef.current) {
			pushHistory(draft);
			lastFieldRef.current = fieldPath;
		} else {
			const snapshotForTimeout = draft;
			const fieldForTimeout = fieldPath;
			historyTimeoutRef.current = setTimeout(() => {
				if (lastFieldRef.current === fieldForTimeout) {
					pushHistory(snapshotForTimeout);
				}
			}, 500);
		}

		setFuture([]);
		setDraft(next);
		setVersion((v) => v + 1);
	};

	const hiddenSections = useMemo(() => {
		const hidden: Record<string, boolean> = {};
		for (const key of Object.keys(sectionVisibility)) {
			hidden[key] = !(sectionVisibility[key] ?? true);
		}
		return hidden;
	}, [sectionVisibility]);

	return {
		draft,
		setDraft,
		activeSection,
		setActiveSection,
		sectionVisibility,
		setSectionVisibility,
		errors,
		setErrors,
		canUndo,
		canRedo,
		updateDraft,
		handleUndo,
		handleRedo,
		handleFieldChange,
		hiddenSections,
		version,
	};
}
