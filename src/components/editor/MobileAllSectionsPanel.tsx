import { useCallback, useState } from "react";
import type { InvitationContent } from "../../lib/types";
import {
	type FieldAiTaskType,
	getSectionLabel,
	type SectionConfig,
} from "../../templates/types";
import { ContextPanelHeader } from "./ContextPanelHeader";
import { FieldRenderer } from "./FieldRenderer";
import { getValueByPath } from "./hooks/useEditorState";
import { getListItems, getListItemsChangeHandler } from "./listFieldHelpers";

type MobileAllSectionsPanelProps = {
	sections: SectionConfig[];
	draft: InvitationContent;
	sectionVisibility: Record<string, boolean>;
	sectionProgress: Record<string, number>;
	errors: Record<string, string>;
	uploadingField: string | null;
	onFieldChange: (fieldPath: string, value: string | boolean) => void;
	onFieldBlur?: (fieldPath: string) => void;
	onImageUpload: (fieldPath: string, file: File) => void;
	onVisibilityChange: (sectionId: string, visible: boolean) => void;
	onAiClick: (sectionId: string, aiType?: FieldAiTaskType) => void;
	scrollContainerRef: React.RefObject<HTMLDivElement | null>;
	/** Currently active section (driven by scroll spy) */
	activeSectionId?: string;
};

export function MobileAllSectionsPanel({
	sections,
	draft,
	sectionVisibility,
	sectionProgress,
	errors,
	uploadingField,
	onFieldChange,
	onFieldBlur,
	onImageUpload,
	onVisibilityChange,
	onAiClick,
	scrollContainerRef,
	activeSectionId,
}: MobileAllSectionsPanelProps) {
	const [scrolled, setScrolled] = useState(false);

	const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		setScrolled(e.currentTarget.scrollTop > 0);
	}, []);

	const activeSection = activeSectionId
		? sections.find((s) => s.id === activeSectionId)
		: undefined;
	const fieldCount = activeSection?.fields.length ?? 0;
	const completion = activeSectionId
		? (sectionProgress[activeSectionId] ?? 0)
		: 0;
	const filledCount = Math.round((completion / 100) * fieldCount);
	const activeSectionLabel = activeSection
		? getSectionLabel(activeSection.id)
		: "";

	return (
		<div
			ref={scrollContainerRef}
			className="dm-scroll-thin flex-1"
			onScroll={handleScroll}
		>
			{/* Sticky sub-header — only after user has scrolled past first section */}
			{scrolled && activeSectionLabel && (
				<div className="sticky top-0 z-10 flex h-7 items-center justify-center border-b border-[color:var(--dm-ink)]/10 bg-white/95 backdrop-blur-sm">
					<span className="text-xs text-[color:var(--dm-ink)]/60">
						{activeSectionLabel} · {filledCount} of {fieldCount} fields
					</span>
				</div>
			)}
			{sections.map((section) => {
				const sectionLabel = getSectionLabel(section.id);
				const isVisible = sectionVisibility[section.id] ?? true;
				const completion = sectionProgress[section.id] ?? 0;

				return (
					<div key={section.id} data-section-form={section.id}>
						<ContextPanelHeader
							sectionId={section.id}
							sectionLabel={sectionLabel}
							visible={isVisible}
							onVisibilityChange={(visible) =>
								onVisibilityChange(section.id, visible)
							}
							onAiClick={() => onAiClick(section.id)}
							completion={completion}
							hasErrors={Object.entries(errors).some(
								([key, val]) => key.startsWith(`${section.id}.`) && !!val,
							)}
						/>

						<div className="px-5 py-4">
							<div className="grid gap-5">
								{section.fields.map((field) => {
									const fieldPath = `${section.id}.${field.id}`;
									const value = getValueByPath(draft, fieldPath);

									return (
										<FieldRenderer
											key={field.id}
											sectionId={section.id}
											field={field}
											value={value}
											onChange={onFieldChange}
											onBlur={onFieldBlur}
											error={errors[fieldPath]}
											uploadingField={uploadingField}
											onImageUpload={onImageUpload}
											listItems={
												field.type === "list"
													? getListItems(draft, section.id)
													: undefined
											}
											onListItemsChange={
												field.type === "list"
													? getListItemsChangeHandler(
															draft,
															section.id,
															onFieldChange,
														)
													: undefined
											}
											onAiClick={
												field.aiTaskType
													? () => onAiClick(section.id, field.aiTaskType)
													: undefined
											}
										/>
									);
								})}

								{section.fields.length === 0 && (
									<p className="py-8 text-center text-sm text-[color:var(--dm-muted)]">
										No editable fields for this section.
									</p>
								)}
							</div>
						</div>
					</div>
				);
			})}

			{/* Spacer so the last section can scroll fully into view */}
			<div className="h-32" />
		</div>
	);
}
