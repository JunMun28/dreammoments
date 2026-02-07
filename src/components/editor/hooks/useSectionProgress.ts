import { useMemo } from "react";
import type { InvitationContent } from "../../../lib/types";
import type { SectionConfig } from "../../../templates/types";
import { getValueByPath } from "./useEditorState";

export type UseSectionProgressParams = {
	sections: SectionConfig[];
	content: InvitationContent;
	sectionVisibility: Record<string, boolean>;
};

function getListForSection(
	sectionId: string,
	content: InvitationContent,
): unknown[] | null {
	const section = (content as unknown as Record<string, unknown>)[sectionId];
	if (!section || typeof section !== "object") return null;

	const sectionObj = section as Record<string, unknown>;

	if (sectionId === "story" && Array.isArray(sectionObj.milestones)) {
		return sectionObj.milestones;
	}
	if (sectionId === "schedule" && Array.isArray(sectionObj.events)) {
		return sectionObj.events;
	}
	if (sectionId === "faq" && Array.isArray(sectionObj.items)) {
		return sectionObj.items;
	}
	if (sectionId === "gallery" && Array.isArray(sectionObj.photos)) {
		return sectionObj.photos;
	}
	if (sectionId === "entourage" && Array.isArray(sectionObj.members)) {
		return sectionObj.members;
	}
	return null;
}

export function useSectionProgress({
	sections,
	content,
	sectionVisibility,
}: UseSectionProgressParams): Record<string, number> {
	return useMemo(() => {
		const progress: Record<string, number> = {};

		for (const section of sections) {
			const isVisible = sectionVisibility[section.id] ?? true;
			if (!isVisible) {
				progress[section.id] = 0;
				continue;
			}

			const fields = section.fields;
			if (fields.length === 0) {
				progress[section.id] = 100;
				continue;
			}

			let filledCount = 0;
			let totalCount = 0;

			for (const field of fields) {
				if (field.type === "list") {
					const list = getListForSection(section.id, content);
					totalCount += 1;
					if (list && list.length > 0) {
						filledCount += 1;
					}
				} else {
					totalCount += 1;
					const value = getValueByPath(content, `${section.id}.${field.id}`);
					if (value.trim() !== "") {
						filledCount += 1;
					}
				}
			}

			progress[section.id] =
				totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 100;
		}

		return progress;
	}, [sections, content, sectionVisibility]);
}
