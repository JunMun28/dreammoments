import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { GuestResponseRow, GuestResponseStatus } from "@/lib/rsvp-server";

// ============================================================================
// TYPES
// ============================================================================

export interface RsvpResponseTableProps {
	responses: GuestResponseRow[];
	isLoading?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format a date for display in the response table.
 * Returns em-dash for null dates.
 */
export function formatResponseDate(date: Date | null): string {
	if (!date) return "—";
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}

/**
 * Get the badge variant for a given status.
 */
export function getStatusBadgeVariant(
	status: GuestResponseStatus,
): "success" | "destructive" | "secondary" {
	switch (status) {
		case "attending":
			return "success";
		case "declined":
			return "destructive";
		case "pending":
			return "secondary";
	}
}

/**
 * Format status for display (capitalize first letter).
 */
function formatStatus(status: GuestResponseStatus): string {
	return status.charAt(0).toUpperCase() + status.slice(1);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * RSVP Response Table component displaying detailed guest response information.
 * Shows guest name, group, status, headcount, meal preference, and response date.
 */
export function RsvpResponseTable({
	responses,
	isLoading,
}: RsvpResponseTableProps) {
	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<p className="text-muted-foreground">Loading responses...</p>
			</div>
		);
	}

	if (responses.length === 0) {
		return (
			<div className="flex items-center justify-center py-8">
				<p className="text-muted-foreground">
					No guests to display. Add guests to see their responses here.
				</p>
			</div>
		);
	}

	return (
		<div className="rounded-lg border bg-card">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[180px]">Guest</TableHead>
						<TableHead className="w-[120px]">Group</TableHead>
						<TableHead className="w-[100px]">Status</TableHead>
						<TableHead className="w-[90px]">Headcount</TableHead>
						<TableHead className="w-[120px]">Meal</TableHead>
						<TableHead className="w-[160px]">Responded</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{responses.map((response) => (
						<TableRow key={response.guestId}>
							{/* Guest name with dietary notes */}
							<TableCell className="font-medium">
								<div>
									<span>{response.guestName}</span>
									{response.dietaryNotes && (
										<p className="text-xs text-muted-foreground mt-0.5">
											{response.dietaryNotes}
										</p>
									)}
								</div>
							</TableCell>

							{/* Group */}
							<TableCell>
								<Badge variant="outline">{response.groupName}</Badge>
							</TableCell>

							{/* Status */}
							<TableCell>
								<Badge variant={getStatusBadgeVariant(response.status)}>
									{formatStatus(response.status)}
								</Badge>
							</TableCell>

							{/* Headcount with plus-one info */}
							<TableCell>
								{response.status === "attending" ? (
									<div>
										<span className="font-medium">{response.headcount}</span>
										{response.plusOneCount > 0 && (
											<p className="text-xs text-muted-foreground">
												+{response.plusOneCount} guest
												{response.plusOneCount > 1 ? "s" : ""}
											</p>
										)}
									</div>
								) : (
									<span className="text-muted-foreground">—</span>
								)}
							</TableCell>

							{/* Meal preference */}
							<TableCell>
								{response.mealPreference ? (
									<span>{response.mealPreference}</span>
								) : (
									<span className="text-muted-foreground">—</span>
								)}
							</TableCell>

							{/* Response date */}
							<TableCell className="text-sm text-muted-foreground">
								{formatResponseDate(response.respondedAt)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
