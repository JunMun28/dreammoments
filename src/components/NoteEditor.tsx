import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Note } from "@/contexts/InvitationBuilderContext";

export interface NoteEditorValues {
	title: string;
	description?: string;
}

interface NoteEditorProps {
	/** Note data for editing, undefined for new note */
	note?: Note;
	/** Called on save with form values */
	onSave: (values: NoteEditorValues) => void;
	/** Called when cancel is clicked */
	onCancel: () => void;
	/** Optional: called on every field change for live preview */
	onChange?: (values: NoteEditorValues) => void;
}

/**
 * Form for creating or editing a note.
 * Includes title and description fields.
 *
 * @example
 * ```tsx
 * <NoteEditor
 *   note={existingNote}
 *   onSave={(values) => updateNote(values)}
 *   onCancel={() => setEditing(false)}
 * />
 * ```
 */
export function NoteEditor({
	note,
	onSave,
	onCancel,
	onChange,
}: NoteEditorProps) {
	const titleId = useId();
	const descriptionId = useId();

	const [title, setTitle] = useState(note?.title ?? "");
	const [description, setDescription] = useState(note?.description ?? "");
	const [isSaving, setIsSaving] = useState(false);

	// Notify parent of changes for live preview
	useEffect(() => {
		if (onChange) {
			onChange({ title, description });
		}
	}, [title, description, onChange]);

	const handleSave = async () => {
		if (!title.trim()) {
			return; // Title is required
		}
		setIsSaving(true);
		try {
			onSave({
				title: title.trim(),
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
			data-testid="note-editor"
		>
			<div>
				<Label htmlFor={titleId}>Note Title</Label>
				<Input
					id={titleId}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="e.g., Dress Code, Parking"
					data-testid="note-title-input"
				/>
			</div>

			<div>
				<Label htmlFor={descriptionId}>Description (optional)</Label>
				<Textarea
					id={descriptionId}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Add details..."
					rows={2}
					data-testid="note-description-input"
				/>
			</div>

			<div className="flex gap-2 justify-end">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isSaving}
					data-testid="note-cancel-button"
				>
					Cancel
				</Button>
				<Button
					type="button"
					onClick={handleSave}
					disabled={!isValid || isSaving}
					data-testid="note-save-button"
				>
					{isSaving ? "Saving..." : "Save"}
				</Button>
			</div>
		</div>
	);
}
