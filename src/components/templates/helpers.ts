import type { KeyboardEvent, MouseEvent } from "react";
import type { RsvpPayload, TemplateRenderMode } from "./types";

export function parseAttendance(
	value: FormDataEntryValue | null,
): RsvpPayload["attendance"] {
	const candidate = String(value ?? "attending");
	if (
		candidate === "attending" ||
		candidate === "not_attending" ||
		candidate === "undecided"
	) {
		return candidate;
	}
	return "attending";
}

export function makeEditableProps(
	mode: TemplateRenderMode,
	onInlineEdit?: (fieldPath: string, element?: HTMLElement) => void,
) {
	return (fieldPath: string, className: string) => ({
		onClick:
			mode === "editor"
				? (event: MouseEvent<HTMLElement>) =>
						onInlineEdit?.(fieldPath, event.currentTarget)
				: undefined,
		onKeyDown:
			mode === "editor"
				? (event: KeyboardEvent<HTMLElement>) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							onInlineEdit?.(fieldPath, event.currentTarget);
						}
					}
				: undefined,
		role: mode === "editor" ? ("button" as const) : undefined,
		tabIndex: mode === "editor" ? 0 : undefined,
		className: mode === "editor" ? `${className} dm-editable` : className,
	});
}
