import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { NoteEditor, type NoteEditorValues } from "@/components/NoteEditor";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	type Note,
	useInvitationBuilder,
} from "@/contexts/InvitationBuilderContext";

interface NoteItemProps {
	note: Note;
	onEdit: () => void;
	onDelete: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	isFirst: boolean;
	isLast: boolean;
}

/**
 * Individual note item display
 */
function NoteItem({
	note,
	onEdit,
	onDelete,
	onMoveUp,
	onMoveDown,
	isFirst,
	isLast,
}: NoteItemProps) {
	return (
		<div
			className="rounded-lg border bg-card p-4"
			data-testid={`note-${note.id}`}
		>
			<div className="flex items-start justify-between gap-2">
				{/* Reorder buttons */}
				<div className="flex flex-col gap-0.5">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={onMoveUp}
						disabled={isFirst}
						data-testid={`move-up-${note.id}`}
						aria-label={`Move ${note.title} up`}
					>
						<ChevronUp className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={onMoveDown}
						disabled={isLast}
						data-testid={`move-down-${note.id}`}
						aria-label={`Move ${note.title} down`}
					>
						<ChevronDown className="h-4 w-4" />
					</Button>
				</div>
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-foreground">{note.title}</h4>
					{note.description && (
						<p className="mt-1 text-sm text-muted-foreground">
							{note.description}
						</p>
					)}
				</div>
				<div className="flex gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={onEdit}
						data-testid={`edit-note-${note.id}`}
						aria-label={`Edit ${note.title}`}
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								data-testid={`delete-note-${note.id}`}
								aria-label={`Delete ${note.title}`}
							>
								<Trash2 className="h-4 w-4 text-destructive" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete Note</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete "{note.title}"? This action
									cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={onDelete}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									data-testid={`confirm-delete-${note.id}`}
								>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
		</div>
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

	// Track which note is being edited (null = none, "new" = adding new)
	const [editingId, setEditingId] = useState<string | null>(null);

	// Sort notes by order
	const sortedNotes = [...notes].sort((a, b) => a.order - b.order);

	const handleAddClick = () => {
		setEditingId("new");
	};

	const handleSaveNew = (values: NoteEditorValues) => {
		addNote(values);
		setEditingId(null);
	};

	const handleSaveEdit = (id: string, values: NoteEditorValues) => {
		updateNote(id, values);
		setEditingId(null);
	};

	const handleCancel = () => {
		setEditingId(null);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Notes & FAQ</h3>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleAddClick}
					disabled={editingId !== null}
					data-testid="add-note-button"
				>
					<Plus className="h-4 w-4" />
					Add Note
				</Button>
			</div>

			{/* New note editor */}
			{editingId === "new" && (
				<NoteEditor onSave={handleSaveNew} onCancel={handleCancel} />
			)}

			{sortedNotes.length === 0 && editingId !== "new" ? (
				<p
					className="text-sm text-muted-foreground py-4 text-center"
					data-testid="empty-notes-message"
				>
					No notes added yet. Click "Add Note" to add dress code, parking info,
					or other details.
				</p>
			) : (
				<div className="space-y-3" data-testid="note-list">
					{sortedNotes.map((note, index) =>
						editingId === note.id ? (
							<NoteEditor
								key={note.id}
								note={note}
								onSave={(values) => handleSaveEdit(note.id, values)}
								onCancel={handleCancel}
							/>
						) : (
							<NoteItem
								key={note.id}
								note={note}
								onEdit={() => setEditingId(note.id)}
								onDelete={() => deleteNote(note.id)}
								onMoveUp={() => moveNote(note.id, "up")}
								onMoveDown={() => moveNote(note.id, "down")}
								isFirst={index === 0}
								isLast={index === sortedNotes.length - 1}
							/>
						),
					)}
				</div>
			)}
		</div>
	);
}
