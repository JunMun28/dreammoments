import { NoteEditor, type NoteEditorValues } from "@/components/NoteEditor";
import { ListEditor } from "@/components/ui/list-editor";
import {
	type Note,
	useInvitationBuilder,
} from "@/contexts/InvitationBuilderContext";

/**
 * Render the content of a note item (displayed when not editing).
 */
function NoteItemContent({ note }: { note: Note }) {
	return (
		<>
			<h4 className="font-medium text-foreground">{note.title}</h4>
			{note.description && (
				<p className="mt-1 text-sm text-muted-foreground">{note.description}</p>
			)}
		</>
	);
}

/**
 * Note list component with add button.
 * Displays wedding notes/FAQ items (dress code, kids policy, etc.)
 *
 * @example
 * ```tsx
 * <NoteList />
 * ```
 */
export function NoteList() {
	const { invitation, addNote, updateNote, deleteNote, moveNote } =
		useInvitationBuilder();
	const notes = invitation.notes ?? [];

	return (
		<ListEditor<Note, NoteEditorValues>
			items={notes}
			onAdd={addNote}
			onUpdate={updateNote}
			onDelete={deleteNote}
			onMove={moveNote}
			renderItem={(note) => <NoteItemContent note={note} />}
			renderEditor={(note, onSave, onCancel) => (
				<NoteEditor note={note} onSave={onSave} onCancel={onCancel} />
			)}
			title="Notes & FAQ"
			addButtonLabel="Add Note"
			deleteDialogTitle="Delete Note"
			getDeleteDialogDescription={(note) =>
				`Are you sure you want to delete "${note.title}"? This action cannot be undone.`
			}
			emptyMessage='No notes added yet. Click "Add Note" to add dress code, parking info, or other details.'
			testIdPrefix="note"
		/>
	);
}
