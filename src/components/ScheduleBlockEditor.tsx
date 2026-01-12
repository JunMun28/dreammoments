import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";
import type { ScheduleBlock } from "@/contexts/InvitationBuilderContext";

export interface ScheduleBlockEditorValues {
	title: string;
	time?: string;
	description?: string;
}

interface ScheduleBlockEditorProps {
	/** Block data for editing, undefined for new block */
	block?: ScheduleBlock;
	/** Called on save with form values */
	onSave: (values: ScheduleBlockEditorValues) => void;
	/** Called when cancel is clicked */
	onCancel: () => void;
	/** Optional: called on every field change for live preview */
	onChange?: (values: ScheduleBlockEditorValues) => void;
}

/**
 * Form for creating or editing a schedule block.
 * Includes title, time picker, and description fields.
 *
 * @example
 * ```tsx
 * <ScheduleBlockEditor
 *   block={existingBlock}
 *   onSave={(values) => updateBlock(values)}
 *   onCancel={() => setEditing(false)}
 * />
 * ```
 */
export function ScheduleBlockEditor({
	block,
	onSave,
	onCancel,
	onChange,
}: ScheduleBlockEditorProps) {
	const titleId = useId();
	const timeId = useId();
	const descriptionId = useId();

	const [title, setTitle] = useState(block?.title ?? "");
	const [time, setTime] = useState<string | undefined>(block?.time);
	const [description, setDescription] = useState(block?.description ?? "");
	const [isSaving, setIsSaving] = useState(false);

	// Notify parent of changes for live preview
	useEffect(() => {
		if (onChange) {
			onChange({ title, time, description });
		}
	}, [title, time, description, onChange]);

	const handleSave = async () => {
		if (!title.trim()) {
			return; // Title is required
		}
		setIsSaving(true);
		try {
			onSave({
				title: title.trim(),
				time,
				description: description.trim() || undefined,
			});
		} finally {
			setIsSaving(false);
		}
	};

	const isValid = title.trim().length > 0;

	return (
		<div
			className="rounded-lg border bg-card p-4 space-y-4"
			data-testid="schedule-block-editor"
		>
			<div>
				<Label htmlFor={titleId}>Event Title</Label>
				<Input
					id={titleId}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="e.g., Ceremony, Reception"
					data-testid="block-title-input"
				/>
			</div>

			<div>
				<Label htmlFor={timeId}>Time</Label>
				<TimePicker
					value={time}
					onChange={setTime}
					data-testid="block-time-picker"
				/>
			</div>

			<div>
				<Label htmlFor={descriptionId}>Description (optional)</Label>
				<Textarea
					id={descriptionId}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Add location or other details..."
					rows={2}
					data-testid="block-description-input"
				/>
			</div>

			<div className="flex gap-2 justify-end">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isSaving}
					data-testid="block-cancel-button"
				>
					Cancel
				</Button>
				<Button
					type="button"
					onClick={handleSave}
					disabled={!isValid || isSaving}
					data-testid="block-save-button"
				>
					{isSaving ? "Saving..." : "Save"}
				</Button>
			</div>
		</div>
	);
}
