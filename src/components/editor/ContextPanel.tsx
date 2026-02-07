import { ChevronLeft, ChevronRight } from "lucide-react";
import type { InvitationContent } from "../../lib/types";
import { cn } from "../../lib/utils";
import type { SectionConfig } from "../../templates/types";
import { ContextPanelHeader } from "./ContextPanelHeader";
import { FieldRenderer } from "./FieldRenderer";
import { getValueByPath, listFieldMap } from "./hooks/useEditorState";

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
	onAiClick: (sectionId: string) => void;
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
	const sectionLabel =
		sectionConfig?.id?.replace(/^\w/, (c) => c.toUpperCase()) ?? sectionId;
	const fields = sectionConfig?.fields ?? [];

	if (collapsed) {
		return (
			<aside className="flex h-full w-10 flex-col items-center border-l border-[color:var(--dm-border)] bg-[color:var(--dm-surface)]">
				<button
					type="button"
					onClick={onToggleCollapse}
					aria-label="Expand editor panel"
					className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-xl text-[color:var(--dm-muted)] hover:bg-[color:var(--dm-surface-muted)]"
				>
					<ChevronLeft className="h-4 w-4" aria-hidden="true" />
				</button>
			</aside>
		);
	}

	return (
		<aside
			className={cn(
				"relative flex h-full flex-col border-l border-[color:var(--dm-border)] bg-[color:var(--dm-surface)]",
				"w-full md:w-[320px] lg:w-[380px]",
			)}
		>
			{/* Collapse button */}
			{onToggleCollapse && (
				<button
					type="button"
					onClick={onToggleCollapse}
					aria-label="Collapse editor panel"
					className="absolute -left-3 top-5 z-20 hidden h-6 w-6 items-center justify-center rounded-full border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] text-[color:var(--dm-muted)] shadow-sm hover:bg-[color:var(--dm-surface-muted)] lg:inline-flex"
				>
					<ChevronRight className="h-3 w-3" aria-hidden="true" />
				</button>
			)}

			{/* Header */}
			<ContextPanelHeader
				sectionId={sectionId}
				sectionLabel={sectionLabel}
				visible={isVisible}
				onVisibilityChange={(visible) => onVisibilityChange(sectionId, visible)}
				onAiClick={() => onAiClick(sectionId)}
				completion={completion}
			/>

			{/* Scrollable fields */}
			<div
				className="flex-1 overflow-y-auto px-5 py-4"
				role="tabpanel"
				aria-label={`${sectionLabel} fields`}
			>
				<div className="grid gap-5">
					{fields.map((field) => {
						const fieldPath = `${sectionId}.${field.id}`;
						const value = getValueByPath(draft, fieldPath);
						const listConfig = listFieldMap[sectionId];
						const listItems =
							field.type === "list" && listConfig
								? (((
										draft[sectionId as keyof InvitationContent] as Record<
											string,
											unknown
										>
									)?.[
										Object.keys(
											(draft[sectionId as keyof InvitationContent] as Record<
												string,
												unknown
											>) ?? {},
										).find((k) =>
											Array.isArray(
												(
													draft[sectionId as keyof InvitationContent] as Record<
														string,
														unknown
													>
												)?.[k],
											),
										) ?? ""
									] as Array<Record<string, unknown>>) ?? [])
								: undefined;

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
								listItems={listItems}
								onListItemsChange={
									field.type === "list"
										? (items) => {
												// Find the array key in the section
												const sectionData = draft[
													sectionId as keyof InvitationContent
												] as Record<string, unknown> | undefined;
												if (!sectionData) return;
												const arrayKey = Object.keys(sectionData).find((k) =>
													Array.isArray(sectionData[k]),
												);
												if (arrayKey) {
													onFieldChange(
														`${sectionId}.${arrayKey}`,
														JSON.stringify(items),
													);
												}
											}
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

export default ContextPanel;
