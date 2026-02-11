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
}: MobileAllSectionsPanelProps) {
	return (
		<div ref={scrollContainerRef} className="dm-scroll-thin flex-1">
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
