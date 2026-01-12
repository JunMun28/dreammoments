import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	type ScheduleBlock,
	useInvitationBuilder,
} from "@/contexts/InvitationBuilderContext";

/**
 * Format time from 24-hour to 12-hour display
 */
export function formatBlockTime(time: string | undefined): string {
	if (!time) return "";
	const [hoursStr, minutesStr] = time.split(":");
	const hours = Number.parseInt(hoursStr, 10);
	const minutes = minutesStr || "00";
	const period = hours >= 12 ? "PM" : "AM";
	const displayHours = hours % 12 || 12;
	return `${displayHours}:${minutes} ${period}`;
}

interface ScheduleBlockItemProps {
	block: ScheduleBlock;
}

/**
 * Individual schedule block item display
 */
function ScheduleBlockItem({ block }: ScheduleBlockItemProps) {
	return (
		<div
			className="rounded-lg border bg-card p-4"
			data-testid={`schedule-block-${block.id}`}
		>
			<div className="flex items-start justify-between gap-2">
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-foreground">{block.title}</h4>
					{block.time && (
						<p className="text-sm text-muted-foreground">
							{formatBlockTime(block.time)}
						</p>
					)}
					{block.description && (
						<p className="mt-1 text-sm text-muted-foreground">
							{block.description}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

interface ScheduleBlockListProps {
	/** Callback when add button is clicked */
	onAddClick?: () => void;
}

/**
 * Schedule block list component with add button.
 * Displays wedding timeline events (ceremony, reception, etc.)
 *
 * @example
 * ```tsx
 * <ScheduleBlockList onAddClick={() => setShowAddForm(true)} />
 * ```
 */
export function ScheduleBlockList({ onAddClick }: ScheduleBlockListProps) {
	const { invitation, addScheduleBlock } = useInvitationBuilder();
	const blocks = invitation.scheduleBlocks ?? [];

	// Sort blocks by order
	const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

	const handleAddClick = () => {
		if (onAddClick) {
			onAddClick();
		} else {
			// Default behavior: add a new empty block
			addScheduleBlock({ title: "New Event" });
		}
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
					data-testid="add-schedule-block-button"
				>
					<Plus className="h-4 w-4" />
					Add Event
				</Button>
			</div>

			{sortedBlocks.length === 0 ? (
				<p
					className="text-sm text-muted-foreground py-4 text-center"
					data-testid="empty-schedule-message"
				>
					No events added yet. Click "Add Event" to create your wedding
					timeline.
				</p>
			) : (
				<div className="space-y-3" data-testid="schedule-block-list">
					{sortedBlocks.map((block) => (
						<ScheduleBlockItem key={block.id} block={block} />
					))}
				</div>
			)}
		</div>
	);
}
