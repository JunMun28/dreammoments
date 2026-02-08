import { useCallback, useEffect, useState } from "react";
import {
	type AnalyticsData,
	type AnalyticsPeriod,
	getAnalyticsFn,
} from "../../api/analytics";

interface AnalyticsPanelProps {
	invitationId: string;
}

export function AnalyticsPanel({ invitationId }: AnalyticsPanelProps) {
	const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
	const [data, setData] = useState<AnalyticsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchAnalytics = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const token =
				typeof window !== "undefined"
					? window.localStorage.getItem("dm-auth-token")
					: null;
			if (!token) {
				setError("Not authenticated");
				return;
			}
			const result = await getAnalyticsFn({
				data: { token, invitationId, period },
			});
			if ("error" in result) {
				setError(result.error);
			} else {
				setData(result);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load analytics");
		} finally {
			setLoading(false);
		}
	}, [invitationId, period]);

	useEffect(() => {
		fetchAnalytics();
	}, [fetchAnalytics]);

	if (loading) {
		return <AnalyticsSkeleton />;
	}

	if (error) {
		return (
			<div className="rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4">
				<p className="text-sm text-[color:var(--dm-error)]">{error}</p>
			</div>
		);
	}

	if (!data) return null;

	return (
		<div className="space-y-4">
			{/* Period selector */}
			<div className="flex items-center justify-between">
				<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
					Analytics
				</p>
				<div className="flex rounded-full border border-[color:var(--dm-border)]">
					{(["7d", "30d", "all"] as const).map((p) => (
						<button
							key={p}
							type="button"
							onClick={() => setPeriod(p)}
							className={`px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors first:rounded-l-full last:rounded-r-full ${
								period === p
									? "bg-[color:var(--dm-accent-strong)] text-[color:var(--dm-on-accent)]"
									: "text-[color:var(--dm-muted)] hover:text-[color:var(--dm-ink)]"
							}`}
						>
							{p === "all" ? "All" : p}
						</button>
					))}
				</div>
			</div>

			{/* Summary cards */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<SummaryCard label="Total Views" value={data.totalViews} />
				<SummaryCard label="Unique Views" value={data.uniqueViews} />
				<SummaryCard label="RSVPs" value={data.rsvpSummary.total} />
				<SummaryCard
					label="Attending"
					value={data.rsvpSummary.attending}
					accent
				/>
			</div>

			{/* RSVP breakdown */}
			<RsvpBreakdown rsvp={data.rsvpSummary} />

			{/* Views over time (bar chart) */}
			{data.viewsByDay.length > 0 && (
				<ViewsChart viewsByDay={data.viewsByDay} />
			)}

			{/* Device breakdown */}
			<DeviceBreakdown devices={data.deviceBreakdown} total={data.totalViews} />

			{/* Top referrers */}
			{data.topReferrers.length > 0 && (
				<ReferrerList referrers={data.topReferrers} />
			)}
		</div>
	);
}

// ── Sub-components ──────────────────────────────────────────────────

function SummaryCard({
	label,
	value,
	accent,
}: {
	label: string;
	value: number;
	accent?: boolean;
}) {
	return (
		<div className="rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4">
			<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
				{label}
			</p>
			<p
				className={`mt-2 text-lg font-semibold tabular-nums ${
					accent ? "text-[#22c55e]" : "text-[color:var(--dm-ink)]"
				}`}
			>
				{value}
			</p>
		</div>
	);
}

function RsvpBreakdown({ rsvp }: { rsvp: AnalyticsData["rsvpSummary"] }) {
	if (rsvp.total === 0) return null;

	const segments = [
		{
			label: "Attending",
			count: rsvp.attending,
			color: "#22c55e",
		},
		{
			label: "Not attending",
			count: rsvp.notAttending,
			color: "#ef4444",
		},
		{
			label: "Pending",
			count: rsvp.pending,
			color: "var(--dm-border)",
		},
	];

	return (
		<div className="rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4">
			<p className="mb-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
				RSVP Breakdown
			</p>
			{/* Stacked bar */}
			<div className="flex h-3 overflow-hidden rounded-full bg-[color:var(--dm-surface-muted)]">
				{segments.map((seg) =>
					seg.count > 0 ? (
						<div
							key={seg.label}
							style={{
								width: `${(seg.count / rsvp.total) * 100}%`,
								backgroundColor: seg.color,
							}}
							title={`${seg.label}: ${seg.count}`}
						/>
					) : null,
				)}
			</div>
			{/* Legend */}
			<div className="mt-3 flex flex-wrap gap-4">
				{segments.map((seg) => (
					<div key={seg.label} className="flex items-center gap-2">
						<div
							className="h-2.5 w-2.5 rounded-full"
							style={{ backgroundColor: seg.color }}
						/>
						<span className="text-xs text-[color:var(--dm-muted)]">
							{seg.label}: {seg.count}
							{rsvp.total > 0 && (
								<span className="ml-1 opacity-60">
									({Math.round((seg.count / rsvp.total) * 100)}%)
								</span>
							)}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

function ViewsChart({
	viewsByDay,
}: {
	viewsByDay: AnalyticsData["viewsByDay"];
}) {
	const max = Math.max(...viewsByDay.map((d) => d.count), 1);

	return (
		<div className="rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4">
			<p className="mb-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
				Views Over Time
			</p>
			<div className="flex items-end gap-1" style={{ height: 80 }}>
				{viewsByDay.map((day) => (
					<div
						key={day.date}
						className="group relative flex-1"
						style={{ height: "100%" }}
					>
						<div
							className="absolute bottom-0 w-full rounded-t bg-[color:var(--dm-peach)]"
							style={{
								height: `${Math.max((day.count / max) * 100, 4)}%`,
							}}
						/>
						{/* Tooltip on hover */}
						<div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[color:var(--dm-ink)] px-2 py-1 text-[10px] text-[color:var(--dm-on-accent)] opacity-0 group-hover:opacity-100">
							{day.date}: {day.count}
						</div>
					</div>
				))}
			</div>
			{/* Date labels (first and last) */}
			{viewsByDay.length > 1 && (
				<div className="mt-1 flex justify-between">
					<span className="text-[10px] text-[color:var(--dm-muted)]">
						{viewsByDay[0].date.slice(5)}
					</span>
					<span className="text-[10px] text-[color:var(--dm-muted)]">
						{viewsByDay[viewsByDay.length - 1].date.slice(5)}
					</span>
				</div>
			)}
		</div>
	);
}

function DeviceBreakdown({
	devices,
	total,
}: {
	devices: AnalyticsData["deviceBreakdown"];
	total: number;
}) {
	if (total === 0) return null;

	const items = [
		{ label: "Desktop", count: devices.desktop },
		{ label: "Mobile", count: devices.mobile },
		{ label: "Tablet", count: devices.tablet },
	].filter((d) => d.count > 0);

	if (items.length === 0) return null;

	return (
		<div className="rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4">
			<p className="mb-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
				Device Breakdown
			</p>
			<div className="space-y-2">
				{items.map((item) => {
					const pct = Math.round((item.count / total) * 100);
					return (
						<div key={item.label}>
							<div className="flex items-center justify-between text-xs">
								<span className="text-[color:var(--dm-ink)]">{item.label}</span>
								<span className="tabular-nums text-[color:var(--dm-muted)]">
									{item.count} ({pct}%)
								</span>
							</div>
							<div className="mt-1 h-2 overflow-hidden rounded-full bg-[color:var(--dm-surface-muted)]">
								<div
									className="h-full rounded-full bg-[color:var(--dm-peach)]"
									style={{ width: `${pct}%` }}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function ReferrerList({
	referrers,
}: {
	referrers: AnalyticsData["topReferrers"];
}) {
	return (
		<div className="rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4">
			<p className="mb-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
				Top Referrers
			</p>
			<div className="space-y-2">
				{referrers.map((ref) => (
					<div
						key={ref.referrer}
						className="flex items-center justify-between text-xs"
					>
						<span className="max-w-[200px] truncate text-[color:var(--dm-ink)]">
							{ref.referrer}
						</span>
						<span className="tabular-nums text-[color:var(--dm-muted)]">
							{ref.count}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

// ── Skeleton ────────────────────────────────────────────────────────

function AnalyticsSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="h-4 w-20 animate-pulse rounded bg-[color:var(--dm-border)]" />
				<div className="h-7 w-32 animate-pulse rounded-full bg-[color:var(--dm-border)]" />
			</div>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="h-20 animate-pulse rounded-2xl bg-[color:var(--dm-border)]"
					/>
				))}
			</div>
			<div className="h-24 animate-pulse rounded-2xl bg-[color:var(--dm-border)]" />
			<div className="h-28 animate-pulse rounded-2xl bg-[color:var(--dm-border)]" />
		</div>
	);
}
