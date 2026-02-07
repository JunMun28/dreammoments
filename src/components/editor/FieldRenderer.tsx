import type { ChangeEvent } from "react";
import { cn } from "../../lib/utils";
import type { FieldConfig } from "../../templates/types";
import { ImageUploadField } from "./ImageUploadField";
import { ListFieldEditor } from "./ListFieldEditor";
import { ToggleSwitch } from "./ToggleSwitch";

type FieldRendererProps = {
	sectionId: string;
	field: FieldConfig;
	value: string;
	onChange: (fieldPath: string, value: string | boolean) => void;
	onBlur?: (fieldPath: string) => void;
	error?: string;
	uploadingField?: string | null;
	onImageUpload?: (fieldPath: string, file: File) => void;
	listItems?: Array<Record<string, unknown>>;
	onListItemsChange?: (items: Array<Record<string, unknown>>) => void;
};

export function FieldRenderer({
	sectionId,
	field,
	value,
	onChange,
	onBlur,
	error,
	uploadingField,
	onImageUpload,
	listItems,
	onListItemsChange,
}: FieldRendererProps) {
	const fieldPath = `${sectionId}.${field.id}`;

	if (field.type === "list") {
		if (!onListItemsChange) return null;
		return (
			<ListFieldEditor
				sectionId={sectionId}
				items={listItems ?? []}
				onItemsChange={onListItemsChange}
			/>
		);
	}

	if (field.type === "toggle") {
		const checked = value === "true";
		return (
			<ToggleSwitch
				label={field.label}
				checked={checked}
				onChange={(nextChecked) => onChange(fieldPath, nextChecked)}
			/>
		);
	}

	if (field.type === "image") {
		const isUploading = uploadingField === fieldPath;
		return (
			<ImageUploadField
				fieldPath={fieldPath}
				label={field.label}
				value={value}
				isUploading={isUploading}
				onUpload={onImageUpload ?? (() => {})}
				onRemove={(path) => onChange(path, "")}
			/>
		);
	}

	const inputId = fieldPath.replace(/\./g, "-");

	const handleChange = (
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		onChange(fieldPath, event.target.value);
	};

	const handleBlur = () => {
		onBlur?.(fieldPath);
	};

	const sharedProps = {
		value,
		onChange: handleChange,
		onBlur: handleBlur,
		name: fieldPath,
		autoComplete: "off" as const,
	};

	return (
		<div
			className={cn(
				"grid gap-2",
				error && "border-l-2 border-[color:var(--dm-error)] pl-3",
			)}
		>
			<label
				htmlFor={inputId}
				className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]"
			>
				{field.label}
				{field.required && (
					<span className="ml-0.5 text-[color:var(--dm-error)]" aria-hidden="true">*</span>
				)}
			</label>
			{field.type === "textarea" ? (
				<textarea
					{...sharedProps}
					id={inputId}
					className="min-h-[110px] w-full rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 py-3 text-base text-[color:var(--dm-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)]/60"
				/>
			) : (
				<input
					{...sharedProps}
					id={inputId}
					type={
						field.type === "date"
							? "date"
							: field.type === "time"
								? "time"
								: "text"
					}
					className="h-11 w-full rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 text-base text-[color:var(--dm-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)]/60"
				/>
			)}
			{error ? (
				<output className="text-[11px] text-dm-error" aria-live="polite">
					{error}
				</output>
			) : null}
		</div>
	);
}

export default FieldRenderer;
