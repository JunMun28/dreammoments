import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	ScheduleBlockEditor,
	type ScheduleBlockEditorValues,
} from "@/components/ScheduleBlockEditor";
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
	type ScheduleBlock,
	useInvitationBuilder,
} from "@/contexts/InvitationBuilderContext";
import { formatTime } from "@/lib/format-utils";

interface ScheduleBlockItemProps {
	block: ScheduleBlock;
	onEdit: () => void;
	onDelete: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	isFirst: boolean;
	isLast: boolean;
}

/**
 * Individual schedule block item display
 */
function ScheduleBlockItem({
	block,
	onEdit,
	onDelete,
	onMoveUp,
	onMoveDown,
	isFirst,
	isLast,
}: ScheduleBlockItemProps) {
	return (
		<div
			className="rounded-lg border bg-card p-4"
			data-testid={`schedule-block-${block.id}`}
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
						data-testid={`move-up-${block.id}`}
						aria-label={`Move ${block.title} up`}
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
						data-testid={`move-down-${block.id}`}
						aria-label={`Move ${block.title} down`}
					>
						<ChevronDown className="h-4 w-4" />
					</Button>
				</div>
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-foreground">{block.title}</h4>
					{block.time && (
						<p className="text-sm text-muted-foreground">
							{formatTime(block.time)}
						</p>
					)}
					{block.description && (
						<p className="mt-1 text-sm text-muted-foreground">
							{block.description}
						</p>
					)}
				</div>
				<div className="flex gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={onEdit}
						data-testid={`edit-block-${block.id}`}
						aria-label={`Edit ${block.title}`}
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								data-testid={`delete-block-${block.id}`}
								aria-label={`Delete ${block.title}`}
							>
								<Trash2 className="h-4 w-4 text-destructive" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete Event</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete "{block.title}"? This action
									cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={onDelete}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									data-testid={`confirm-delete-${block.id}`}
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
 * Schedule block list component with add button.
 * Displays wedding timeline events (ceremony, reception, etc.)
 *
 * @example
 * ```tsx
 * <ScheduleBlockList />
 * ```
 */
export function ScheduleBlockList() {
	const {
		invitation,
		addScheduleBlock,
		updateScheduleBlock,
		deleteScheduleBlock,
		moveScheduleBlock,
	} = useInvitationBuilder();
	const blocks = invitation.scheduleBlocks ?? [];

	// Track which block is being edited (null = none, "new" = adding new)
	const [editingId, setEditingId] = useState<string | null>(null);

	// Sort blocks by order
	const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

	const handleAddClick = () => {
		setEditingId("new");
	};

	const handleSaveNew = (values: ScheduleBlockEditorValues) => {
		addScheduleBlock(values);
		setEditingId(null);
	};

	const handleSaveEdit = (id: string, values: ScheduleBlockEditorValues) => {
		updateScheduleBlock(id, values);
		setEditingId(null);
	};

	const handleCancel = () => {
		setEditingId(null);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Schedule</h3>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleAddClick}
					disabled={editingId !== null}
					data-testid="add-schedule-block-button"
				>
					<Plus className="h-4 w-4" />
					Add Event
				</Button>
			</div>

			{/* New block editor */}
			{editingId === "new" && (
				<ScheduleBlockEditor onSave={handleSaveNew} onCancel={handleCancel} />
			)}

			{sortedBlocks.length === 0 && editingId !== "new" ? (
				<p
					className="text-sm text-muted-foreground py-4 text-center"
					data-testid="empty-schedule-message"
				>
					No events added yet. Click "Add Event" to create your wedding
					timeline.
				</p>
			) : (
				<div className="space-y-3" data-testid="schedule-block-list">
					{sortedBlocks.map((block, index) =>
						editingId === block.id ? (
							<ScheduleBlockEditor
								key={block.id}
								block={block}
								onSave={(values) => handleSaveEdit(block.id, values)}
								onCancel={handleCancel}
							/>
						) : (
							<ScheduleBlockItem
								key={block.id}
								block={block}
								onEdit={() => setEditingId(block.id)}
								onDelete={() => deleteScheduleBlock(block.id)}
								onMoveUp={() => moveScheduleBlock(block.id, "up")}
								onMoveDown={() => moveScheduleBlock(block.id, "down")}
								isFirst={index === 0}
								isLast={index === sortedBlocks.length - 1}
							/>
						),
					)}
				</div>
			)}
		</div>
	);
}
