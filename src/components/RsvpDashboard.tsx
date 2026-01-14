import { CheckCircle, Clock, Users, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "./ui/progress";

// ============================================================================
// TYPES
// ============================================================================

export interface GroupSummary {
	id: string;
	name: string;
	rsvpToken: string;
	guestCount: number;
	totalAttending: number;
	totalDeclined: number;
	totalPending: number;
}

export interface RsvpSummaryData {
	totalInvited: number;
	totalAttending: number;
	totalDeclined: number;
	totalPending: number;
	groups: GroupSummary[];
}

interface RsvpDashboardProps {
	summary: RsvpSummaryData;
	isLoading?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Calculate percentage, rounding to whole number.
 * Returns 0 if total is 0 to avoid division by zero.
 */
export function calculatePercentage(value: number, total: number): number {
	if (total === 0) return 0;
	return Math.round((value / total) * 100);
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
	label: string;
	value: number;
	percentage: number;
	color: "green" | "red" | "yellow" | "blue";
	icon: React.ReactNode;
}

function StatCard({ label, value, percentage, color, icon }: StatCardProps) {
	const colorClasses = {
		green: "text-green-600 bg-green-50",
		red: "text-red-600 bg-red-50",
		yellow: "text-yellow-600 bg-yellow-50",
		blue: "text-blue-600 bg-blue-50",
	};

	const progressColors = {
		green: "[&>div]:bg-green-500",
		red: "[&>div]:bg-red-500",
		yellow: "[&>div]:bg-yellow-500",
		blue: "[&>div]:bg-blue-500",
	};

	return (
		<div className="rounded-lg border bg-card p-4">
			<div className="flex items-center gap-3">
				<div className={cn("rounded-lg p-2", colorClasses[color])}>{icon}</div>
				<div className="flex-1">
					<p className="text-2xl font-bold">{value}</p>
					<p className="text-sm text-muted-foreground">{label}</p>
				</div>
				<div className="text-right">
					<p className="text-lg font-semibold">{percentage}%</p>
				</div>
			</div>
			<Progress
				value={percentage}
				className={cn("mt-3 h-2", progressColors[color])}
			/>
		</div>
	);
}

// ============================================================================
// GROUP ROW COMPONENT
// ============================================================================

interface GroupRowProps {
	group: GroupSummary;
}

function GroupRow({ group }: GroupRowProps) {
	const attendingPct = calculatePercentage(
		group.totalAttending,
		group.guestCount,
	);
	const declinedPct = calculatePercentage(
		group.totalDeclined,
		group.guestCount,
	);
	const pendingPct = calculatePercentage(group.totalPending, group.guestCount);

	return (
		<div className="flex items-center gap-4 border-b py-3 last:border-b-0">
			<div className="flex-1">
				<p className="font-medium">{group.name}</p>
				<p className="text-sm text-muted-foreground">
					{group.guestCount} guests
				</p>
			</div>
			<div className="flex items-center gap-6 text-sm">
				<div className="flex items-center gap-1 text-green-600">
					<CheckCircle className="h-4 w-4" />
					<span>{group.totalAttending}</span>
					<span className="text-muted-foreground">({attendingPct}%)</span>
				</div>
				<div className="flex items-center gap-1 text-red-600">
					<XCircle className="h-4 w-4" />
					<span>{group.totalDeclined}</span>
					<span className="text-muted-foreground">({declinedPct}%)</span>
				</div>
				<div className="flex items-center gap-1 text-yellow-600">
					<Clock className="h-4 w-4" />
					<span>{group.totalPending}</span>
					<span className="text-muted-foreground">({pendingPct}%)</span>
				</div>
			</div>
		</div>
	);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * RSVP Dashboard component displaying summary statistics.
 * Shows total invited, attending, declined, and pending counts
 * with visual progress bars and per-group breakdown.
 */
export function RsvpDashboard({ summary, isLoading }: RsvpDashboardProps) {
	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<p className="text-muted-foreground">Loading RSVP data...</p>
			</div>
		);
	}

	const { totalInvited, totalAttending, totalDeclined, totalPending, groups } =
		summary;

	const attendingPct = calculatePercentage(totalAttending, totalInvited);
	const declinedPct = calculatePercentage(totalDeclined, totalInvited);
	const pendingPct = calculatePercentage(totalPending, totalInvited);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">RSVP Overview</h2>
				<p className="text-sm text-muted-foreground">
					{totalInvited} guests invited
				</p>
			</div>

			{/* Summary stats grid */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					label="Invited"
					value={totalInvited}
					percentage={100}
					color="blue"
					icon={<Users className="h-5 w-5" />}
				/>
				<StatCard
					label="Attending"
					value={totalAttending}
					percentage={attendingPct}
					color="green"
					icon={<CheckCircle className="h-5 w-5" />}
				/>
				<StatCard
					label="Declined"
					value={totalDeclined}
					percentage={declinedPct}
					color="red"
					icon={<XCircle className="h-5 w-5" />}
				/>
				<StatCard
					label="Pending"
					value={totalPending}
					percentage={pendingPct}
					color="yellow"
					icon={<Clock className="h-5 w-5" />}
				/>
			</div>

			{/* Group breakdown */}
			{groups.length > 0 && (
				<div className="rounded-lg border bg-card p-4">
					<h3 className="mb-4 font-medium">Response by Group</h3>
					<div className="space-y-1">
						{groups.map((group) => (
							<GroupRow key={group.id} group={group} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}
