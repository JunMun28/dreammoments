import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";
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
import { sortByOrder } from "@/lib/list-utils";

/**
 * Base type constraint for list items.
 * Items must have id and order for tracking and sorting.
 */
export interface ListItem {
	id: string;
	order: number;
}

/**
 * Actions available for each item in the list.
 */
export interface ItemActions {
	onEdit: () => void;
	onDelete: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	isFirst: boolean;
	isLast: boolean;
}

/**
 * Props for the ListEditor component.
 */
export interface ListEditorProps<T extends ListItem, TValues> {
	/** Array of items to display */
	items: T[];
	/** Add a new item */
	onAdd: (values: TValues) => void;
	/** Update an existing item */
	onUpdate: (id: string, values: TValues) => void;
	/** Delete an item */
	onDelete: (id: string) => void;
	/** Move an item up or down */
	onMove: (id: string, direction: "up" | "down") => void;
	/** Render the display view for an item (when not editing) */
	renderItem: (item: T) => ReactNode;
	/** Render the editor for an item (or new item if item is undefined) */
	renderEditor: (
		item: T | undefined,
		onSave: (values: TValues) => void,
		onCancel: () => void,
	) => ReactNode;
	/** Title for the list section */
	title: string;
	/** Label for the add button */
	addButtonLabel: string;
	/** Title for the delete confirmation dialog */
	deleteDialogTitle: string;
	/** Function to generate delete dialog description from item */
	getDeleteDialogDescription: (item: T) => string;
	/** Message shown when list is empty */
	emptyMessage: string;
	/** Test ID prefix for generated test IDs */
	testIdPrefix: string;
}

/**
 * Props for the ListItem display component (internal).
 */
interface ListItemDisplayProps<T extends ListItem> {
	item: T;
	actions: ItemActions;
	renderContent: (item: T) => ReactNode;
	deleteDialogTitle: string;
	deleteDialogDescription: string;
	testIdPrefix: string;
}

/**
 * Internal component for rendering a single list item with action buttons.
 */
function ListItemDisplay<T extends ListItem>({
	item,
	actions,
	renderContent,
	deleteDialogTitle,
	deleteDialogDescription,
	testIdPrefix,
}: ListItemDisplayProps<T>) {
	return (
		<div
			className="rounded-lg border bg-card p-4"
			data-testid={`${testIdPrefix}-${item.id}`}
		>
			<div className="flex items-start justify-between gap-2">
				{/* Reorder buttons */}
				<div className="flex flex-col gap-0.5">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={actions.onMoveUp}
						disabled={actions.isFirst}
						data-testid={`move-up-${item.id}`}
						aria-label="Move up"
					>
						<ChevronUp className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={actions.onMoveDown}
						disabled={actions.isLast}
						data-testid={`move-down-${item.id}`}
						aria-label="Move down"
					>
						<ChevronDown className="h-4 w-4" />
					</Button>
				</div>

				{/* Item content */}
				<div className="flex-1 min-w-0">{renderContent(item)}</div>

				{/* Edit and delete buttons */}
				<div className="flex gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={actions.onEdit}
						data-testid={`edit-${testIdPrefix}-${item.id}`}
						aria-label="Edit"
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								data-testid={`delete-${testIdPrefix}-${item.id}`}
								aria-label="Delete"
							>
								<Trash2 className="h-4 w-4 text-destructive" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>{deleteDialogTitle}</AlertDialogTitle>
								<AlertDialogDescription>
									{deleteDialogDescription}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={actions.onDelete}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									data-testid={`confirm-delete-${item.id}`}
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
 * Generic list editor component with add/edit/delete/reorder functionality.
 *
 * This component provides a consistent UI pattern for managing lists of items
 * with the following features:
 * - Add new items via a form
 * - Edit existing items inline
 * - Delete items with confirmation dialog
 * - Reorder items with up/down buttons
 *
 * @example
 * ```tsx
 * <ListEditor
 *   items={scheduleBlocks}
 *   onAdd={addScheduleBlock}
 *   onUpdate={updateScheduleBlock}
 *   onDelete={deleteScheduleBlock}
 *   onMove={moveScheduleBlock}
 *   renderItem={(block) => (
 *     <div>
 *       <h4>{block.title}</h4>
 *       <p>{block.time}</p>
 *     </div>
 *   )}
 *   renderEditor={(block, onSave, onCancel) => (
 *     <ScheduleBlockEditor block={block} onSave={onSave} onCancel={onCancel} />
 *   )}
 *   title="Schedule"
 *   addButtonLabel="Add Event"
 *   deleteDialogTitle="Delete Event"
 *   getDeleteDialogDescription={(block) => `Delete "${block.title}"?`}
 *   emptyMessage="No events yet"
 *   testIdPrefix="schedule-block"
 * />
 * ```
 */
export function ListEditor<T extends ListItem, TValues>({
	items,
	onAdd,
	onUpdate,
	onDelete,
	onMove,
	renderItem,
	renderEditor,
	title,
	addButtonLabel,
	deleteDialogTitle,
	getDeleteDialogDescription,
	emptyMessage,
	testIdPrefix,
}: ListEditorProps<T, TValues>) {
	// Track which item is being edited (null = none, "new" = adding new)
	const [editingId, setEditingId] = useState<string | null>(null);

	// Sort items by order
	const sortedItems = sortByOrder(items);

	const handleAddClick = () => {
		setEditingId("new");
	};

	const handleSaveNew = (values: TValues) => {
		onAdd(values);
		setEditingId(null);
	};

	const handleSaveEdit = (id: string, values: TValues) => {
		onUpdate(id, values);
		setEditingId(null);
	};

	const handleCancel = () => {
		setEditingId(null);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">{title}</h3>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleAddClick}
					disabled={editingId !== null}
					data-testid={`add-${testIdPrefix}-button`}
				>
					<Plus className="h-4 w-4" />
					{addButtonLabel}
				</Button>
			</div>

			{/* New item editor */}
			{editingId === "new" &&
				renderEditor(undefined, handleSaveNew, handleCancel)}

			{sortedItems.length === 0 && editingId !== "new" ? (
				<p
					className="text-sm text-muted-foreground py-4 text-center"
					data-testid={`empty-${testIdPrefix}-message`}
				>
					{emptyMessage}
				</p>
			) : (
				<div className="space-y-3" data-testid={`${testIdPrefix}-list`}>
					{sortedItems.map((item, index) =>
						editingId === item.id ? (
							<div key={item.id}>
								{renderEditor(
									item,
									(values) => handleSaveEdit(item.id, values),
									handleCancel,
								)}
							</div>
						) : (
							<ListItemDisplay
								key={item.id}
								item={item}
								renderContent={renderItem}
								actions={{
									onEdit: () => setEditingId(item.id),
									onDelete: () => onDelete(item.id),
									onMoveUp: () => onMove(item.id, "up"),
									onMoveDown: () => onMove(item.id, "down"),
									isFirst: index === 0,
									isLast: index === sortedItems.length - 1,
								}}
								deleteDialogTitle={deleteDialogTitle}
								deleteDialogDescription={getDeleteDialogDescription(item)}
								testIdPrefix={testIdPrefix}
							/>
						),
					)}
				</div>
			)}
		</div>
	);
}
