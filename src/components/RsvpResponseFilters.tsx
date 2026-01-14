import { Search } from "lucide-react";
import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { GuestResponseRow, GuestResponseStatus } from "@/lib/rsvp-server";

// ============================================================================
// TYPES
// ============================================================================

export type RsvpStatusFilter = GuestResponseStatus | "all";

export interface RsvpFilterState {
	status: RsvpStatusFilter;
	groupId: string; // "all" or specific group ID
	searchQuery: string;
}

export interface GroupOption {
	id: string;
	name: string;
}

export interface RsvpResponseFiltersProps {
	filters: RsvpFilterState;
	onFiltersChange: (filters: RsvpFilterState) => void;
	groups: GroupOption[];
	resultCount?: number;
	totalCount?: number;
}

// ============================================================================
// FILTER LOGIC
// ============================================================================

/**
 * Filter responses based on the current filter state.
 * Supports filtering by status, group, and name search.
 * Filters are combined (AND logic).
 */
export function filterResponses(
	responses: GuestResponseRow[],
	filters: RsvpFilterState,
): GuestResponseRow[] {
	const { status, groupId, searchQuery } = filters;
	const normalizedSearch = searchQuery.trim().toLowerCase();

	return responses.filter((response) => {
		// Status filter
		if (status !== "all" && response.status !== status) {
			return false;
		}

		// Group filter
		if (groupId !== "all" && response.groupId !== groupId) {
			return false;
		}

		// Search filter (name)
		if (
			normalizedSearch &&
			!response.guestName.toLowerCase().includes(normalizedSearch)
		) {
			return false;
		}

		return true;
	});
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * RSVP Response Filters component.
 * Provides filter controls for status, group, and name search.
 */
export function RsvpResponseFilters({
	filters,
	onFiltersChange,
	groups,
	resultCount,
	totalCount,
}: RsvpResponseFiltersProps) {
	const id = useId();
	const searchId = `${id}-search`;
	const statusId = `${id}-status`;
	const groupFilterId = `${id}-group`;

	const handleStatusChange = (value: string) => {
		onFiltersChange({
			...filters,
			status: value as RsvpStatusFilter,
		});
	};

	const handleGroupChange = (value: string) => {
		onFiltersChange({
			...filters,
			groupId: value,
		});
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onFiltersChange({
			...filters,
			searchQuery: e.target.value,
		});
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end">
				{/* Search input */}
				<div className="flex-1">
					<Label htmlFor={searchId} className="sr-only">
						Search
					</Label>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id={searchId}
							type="text"
							placeholder="Search by name..."
							value={filters.searchQuery}
							onChange={handleSearchChange}
							className="pl-9"
						/>
					</div>
				</div>

				{/* Status filter */}
				<div className="w-full sm:w-40">
					<Label htmlFor={statusId} className="sr-only">
						Status
					</Label>
					<Select value={filters.status} onValueChange={handleStatusChange}>
						<SelectTrigger id={statusId} aria-label="Status">
							<SelectValue placeholder="All Statuses" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							<SelectItem value="attending">Attending</SelectItem>
							<SelectItem value="declined">Declined</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Group filter */}
				<div className="w-full sm:w-40">
					<Label htmlFor={groupFilterId} className="sr-only">
						Group
					</Label>
					<Select value={filters.groupId} onValueChange={handleGroupChange}>
						<SelectTrigger id={groupFilterId} aria-label="Group">
							<SelectValue placeholder="All Groups" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Groups</SelectItem>
							{groups.map((group) => (
								<SelectItem key={group.id} value={group.id}>
									{group.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Result count */}
			{resultCount !== undefined && totalCount !== undefined && (
				<p className="text-sm text-muted-foreground">
					Showing {resultCount} of {totalCount} guests
				</p>
			)}
		</div>
	);
}
