import { useMemo, useState } from "react";
import type { InvitationContent } from "../../../lib/types";
import type { FieldConfig } from "../../../templates/types";

export type UseEditorStateParams = {
	initialContent: InvitationContent;
	initialVisibility: Record<string, boolean>;
	initialSection: string;
};

export const listFieldMap: Record<
	string,
	{ label: string; fields: Array<{ key: string; label: string }> }
> = {
	story: {
		label: "Milestones",
		fields: [
			{ key: "date", label: "Date" },
			{ key: "title", label: "Title" },
			{ key: "description", label: "Description" },
		],
	},
	schedule: {
		label: "Events",
		fields: [
			{ key: "time", label: "Time" },
			{ key: "title", label: "Title" },
			{ key: "description", label: "Description" },
		],
	},
	faq: {
		label: "FAQ Items",
		fields: [
			{ key: "question", label: "Question" },
			{ key: "answer", label: "Answer" },
		],
	},
	gallery: {
		label: "Gallery",
		fields: [
			{ key: "url", label: "Image URL" },
			{ key: "caption", label: "Caption" },
		],
	},
	entourage: {
		label: "Entourage",
		fields: [
			{ key: "role", label: "Role" },
			{ key: "name", label: "Name" },
		],
	},
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
	const next = structuredClone(content);
	const parts = path.split(".");
	let current = next as unknown as Record<string, unknown>;
	parts.slice(0, -1).forEach((part) => {
		const existing = current[part];
		if (existing == null || typeof existing !== "object") {
			current[part] = {};
		}
		current = current[part] as Record<string, unknown>;
	});
	current[parts.at(-1) as string] = value;
	return next;
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

	const canUndo = history.length > 0;
	const canRedo = future.length > 0;

	const updateDraft = (next: InvitationContent) => {
		setHistory((prev) => [...prev.slice(-19), draft]);
		setFuture([]);
		setDraft(next);
	};

	const handleUndo = () => {
		if (!canUndo) return;
		const previous = history[history.length - 1];
		setHistory((prev) => prev.slice(0, -1));
		setFuture((prev) => [draft, ...prev].slice(0, 20));
		setDraft(previous);
	};

	const handleRedo = () => {
		if (!canRedo) return;
		const next = future[0];
		setFuture((prev) => prev.slice(1));
		setHistory((prev) => [...prev.slice(-19), draft]);
		setDraft(next);
	};

	const handleFieldChange = (fieldPath: string, value: string | boolean) => {
		const normalized =
			typeof value === "string" && fieldPath.endsWith("maxPlusOnes")
				? Number(value || 0)
				: value;
		const next = setValueByPath(draft, fieldPath, normalized);
		updateDraft(next);
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
	};
}
