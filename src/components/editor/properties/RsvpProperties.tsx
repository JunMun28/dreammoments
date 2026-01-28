import { useCallback, useEffect, useMemo, useState } from "react";
import { CsvExportButton } from "@/components/CsvExportButton";
import {
	RsvpDashboard,
	type RsvpSummaryData,
} from "@/components/RsvpDashboard";
import { RsvpDeadlineSection } from "@/components/RsvpDeadlineSection";
import {
	filterResponses,
	type RsvpFilterState,
	RsvpResponseFilters,
} from "@/components/RsvpResponseFilters";
import { RsvpResponseTable } from "@/components/RsvpResponseTable";
import { useInvitationBuilder } from "@/contexts/InvitationBuilderContext";
import type { GuestResponseRow } from "@/lib/rsvp-server";

/**
 * Properties panel header component
 */
function PanelHeader({ title }: { title: string }) {
	return (
		<div className="border-b bg-stone-50 px-4 py-3">
			<h3 className="font-semibold text-stone-800">{title}</h3>
		</div>
	);
}

/**
 * RSVP properties panel.
 * Includes deadline settings, dashboard, and response table.
 */
export function RsvpProperties() {
	const { invitation, updateInvitation } = useInvitationBuilder();
	const [summary, setSummary] = useState<RsvpSummaryData | null>(null);
	const [responses, setResponses] = useState<GuestResponseRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [filters, setFilters] = useState<RsvpFilterState>({
		status: "all",
		groupId: "all",
		searchQuery: "",
	});

	const handleDeadlineChange = useCallback(
		(deadline: Date | undefined) => {
			updateInvitation({ rsvpDeadline: deadline });
		},
		[updateInvitation],
	);

	// Load RSVP data
	useEffect(() => {
		async function loadData() {
			if (!invitation.id) return;

			setIsLoading(true);
			try {
				const { getInvitationRsvpSummary, getInvitationGuestResponses } =
					await import("@/lib/rsvp-server");

				const [summaryData, responsesData] = await Promise.all([
					getInvitationRsvpSummary({ data: { invitationId: invitation.id } }),
					getInvitationGuestResponses({
						data: { invitationId: invitation.id },
					}),
				]);

				setSummary(summaryData);
				setResponses(responsesData);
			} catch (error) {
				console.error("Failed to load RSVP data:", error);
			} finally {
				setIsLoading(false);
			}
		}

		loadData();
	}, [invitation.id]);

	// Extract unique groups for filter dropdown
	const groups = useMemo(() => {
		const groupMap = new Map<string, { id: string; name: string }>();
		for (const response of responses) {
			if (!groupMap.has(response.groupId)) {
				groupMap.set(response.groupId, {
					id: response.groupId,
					name: response.groupName,
				});
			}
		}
		return Array.from(groupMap.values());
	}, [responses]);

	const filteredResponses = useMemo(
		() => filterResponses(responses, filters),
		[responses, filters],
	);

	const emptySummary: RsvpSummaryData = {
		totalInvited: 0,
		totalAttending: 0,
		totalDeclined: 0,
		totalPending: 0,
		groups: [],
	};

	return (
		<div className="flex h-full flex-col">
			<PanelHeader title="RSVP Management" />

			<div className="flex-1 space-y-6 overflow-y-auto p-4">
				{/* Deadline Settings */}
				<div className="space-y-2">
					<h4 className="text-sm font-medium text-stone-700">RSVP Deadline</h4>
					<RsvpDeadlineSection
						value={invitation.rsvpDeadline}
						onChange={handleDeadlineChange}
					/>
				</div>

				{/* Dashboard Summary */}
				<div className="space-y-2">
					<h4 className="text-sm font-medium text-stone-700">Summary</h4>
					<RsvpDashboard
						summary={summary ?? emptySummary}
						isLoading={isLoading}
					/>
				</div>

				{/* Response Table */}
				<div className="space-y-2">
					<h4 className="text-sm font-medium text-stone-700">Responses</h4>
					<RsvpResponseFilters
						filters={filters}
						onFiltersChange={setFilters}
						groups={groups}
						resultCount={filteredResponses.length}
						totalCount={responses.length}
					/>
					<div className="flex justify-end">
						<CsvExportButton responses={filteredResponses} />
					</div>
					<RsvpResponseTable
						responses={filteredResponses}
						isLoading={isLoading}
					/>
				</div>
			</div>
		</div>
	);
}
