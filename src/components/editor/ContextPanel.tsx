import { ChevronLeft, ChevronRight } from "lucide-react";
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

type ContextPanelProps = {
	sectionId: string;
	sectionConfig?: SectionConfig;
	draft: InvitationContent;
	sectionVisibility: Record<string, boolean>;
	errors: Record<string, string>;
	uploadingField: string | null;
	onFieldChange: (fieldPath: string, value: string | boolean) => void;
	onFieldBlur?: (fieldPath: string) => void;
	onImageUpload: (fieldPath: string, file: File) => void;
	onVisibilityChange: (sectionId: string, visible: boolean) => void;
	onAiClick: (sectionId: string, aiType?: FieldAiTaskType) => void;
	completion: number;
	collapsed?: boolean;
	onToggleCollapse?: () => void;
};

export function ContextPanel({
	sectionId,
	sectionConfig,
	draft,
	sectionVisibility,
	errors,
	uploadingField,
	onFieldChange,
	onFieldBlur,
	onImageUpload,
	onVisibilityChange,
	onAiClick,
	completion,
	collapsed = false,
	onToggleCollapse,
}: ContextPanelProps) {
	const isVisible = sectionVisibility[sectionId] ?? true;
	const sectionLabel = getSectionLabel(sectionConfig?.id ?? sectionId);
	const fields = sectionConfig?.fields ?? [];

	if (collapsed) {
		return (
			<aside className="flex h-full w-10 flex-col items-center border-l border-[color:var(--dm-border)] bg-[color:var(--dm-surface)]">
				<button
					type="button"
					onClick={onToggleCollapse}
					aria-label="Expand editor panel"
					className="mt-3 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[color:var(--dm-muted)] hover:bg-[color:var(--dm-surface-muted)]"
				>
					<ChevronLeft className="h-4 w-4" aria-hidden="true" />
				</button>
			</aside>
		);
	}

	return (
		<aside className="relative flex h-full w-full flex-col bg-[color:var(--dm-surface)]">
			{onToggleCollapse && (
				<button
					type="button"
					onClick={onToggleCollapse}
					aria-label="Collapse editor panel"
					className="absolute -left-5 top-3 z-20 hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] text-[color:var(--dm-muted)] shadow-sm hover:bg-[color:var(--dm-surface-muted)] lg:inline-flex"
				>
					<ChevronRight className="h-3 w-3" aria-hidden="true" />
				</button>
			)}

			<ContextPanelHeader
				sectionId={sectionId}
				sectionLabel={sectionLabel}
				visible={isVisible}
				onVisibilityChange={(visible) => onVisibilityChange(sectionId, visible)}
				onAiClick={() => onAiClick(sectionId)}
				completion={completion}
				hasErrors={Object.entries(errors).some(
					([key, val]) => key.startsWith(`${sectionId}.`) && !!val,
				)}
			/>

			<div
				key={sectionId}
				className="dm-scroll-thin flex-1 px-5 py-4"
				role="tabpanel"
				aria-label={`${sectionLabel} fields`}
			>
				<div className="grid gap-5">
					{fields.map((field) => {
						const fieldPath = `${sectionId}.${field.id}`;
						const value = getValueByPath(draft, fieldPath);

						return (
							<FieldRenderer
								key={field.id}
								sectionId={sectionId}
								field={field}
								value={value}
								onChange={onFieldChange}
								onBlur={onFieldBlur}
								error={errors[fieldPath]}
								uploadingField={uploadingField}
								onImageUpload={onImageUpload}
								listItems={
									field.type === "list"
										? getListItems(draft, sectionId)
										: undefined
								}
								onListItemsChange={
									field.type === "list"
										? getListItemsChangeHandler(draft, sectionId, onFieldChange)
										: undefined
								}
								onAiClick={
									field.aiTaskType
										? () => onAiClick(sectionId, field.aiTaskType)
										: undefined
								}
							/>
						);
					})}

					{fields.length === 0 && (
						<p className="py-8 text-center text-sm text-[color:var(--dm-muted)]">
							No editable fields for this section.
						</p>
					)}
				</div>
			</div>
		</aside>
	);
}
