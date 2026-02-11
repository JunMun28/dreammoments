import type { InvitationContent } from "../../lib/types";
import { listFieldMap } from "./listFieldMap";

/**
 * Extract list items (the first array-valued property) from a section's data.
 */
export function getListItems(
	draft: InvitationContent,
	sectionId: string,
): Array<Record<string, unknown>> | undefined {
	if (!listFieldMap[sectionId]) return undefined;

	const sectionData = draft[sectionId as keyof InvitationContent] as
		| Record<string, unknown>
		| undefined;
	if (!sectionData) return undefined;

	const arrayKey = Object.keys(sectionData).find((k) =>
		Array.isArray(sectionData[k]),
	);
	if (!arrayKey) return undefined;

	return (sectionData[arrayKey] as Array<Record<string, unknown>>) ?? [];
}

/**
 * Find the array key in a section's data so callers can build a field path for updates.
 */
export function findSectionArrayKey(
	draft: InvitationContent,
	sectionId: string,
): string | undefined {
	const sectionData = draft[sectionId as keyof InvitationContent] as
		| Record<string, unknown>
		| undefined;
	if (!sectionData) return undefined;

	return Object.keys(sectionData).find((k) => Array.isArray(sectionData[k]));
}

/**
 * Create a handler that serializes list items and writes them back via onFieldChange.
 */
export function getListItemsChangeHandler(
	draft: InvitationContent,
	sectionId: string,
	onFieldChange: (fieldPath: string, value: string | boolean) => void,
): ((items: Array<Record<string, unknown>>) => void) | undefined {
	const arrayKey = findSectionArrayKey(draft, sectionId);
	if (!arrayKey) return undefined;

	return (items) => {
		onFieldChange(`${sectionId}.${arrayKey}`, JSON.stringify(items));
	};
}
