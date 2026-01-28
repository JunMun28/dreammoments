/**
 * Analytics dashboard for invitation statistics
 */

import {
	CheckCircle,
	Eye,
	Monitor,
	Smartphone,
	Tablet,
	TrendingUp,
	Users,
} from "lucide-react";
import type { AnalyticsSummary } from "@/lib/analytics-server";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";

interface AnalyticsDashboardProps {
	/** Analytics data */
	analytics: AnalyticsSummary;
	/** Loading state */
	isLoading?: boolean;
}

/**
 * Dashboard for displaying invitation analytics
 */
export function AnalyticsDashboard({
	analytics,
	isLoading = false,
}: AnalyticsDashboardProps) {
	if (isLoading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
				))}
			</div>
		);
	}

	const {
		totalViews,
		uniqueSessions,
		deviceBreakdown,
		topReferrers,
		sectionViews,
		rsvpConversion,
		viewsByDay,
	} = analytics;

	return (
		<div className="space-y-6">
			{/* Overview cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<StatCard
					icon={<Eye className="h-4 w-4" />}
					label="Total Views"
					value={totalViews}
				/>
				<StatCard
					icon={<Users className="h-4 w-4" />}
					label="Unique Visitors"
					value={uniqueSessions}
				/>
				<StatCard
					icon={<CheckCircle className="h-4 w-4" />}
					label="RSVPs Submitted"
					value={rsvpConversion.submitted}
				/>
				<StatCard
					icon={<TrendingUp className="h-4 w-4" />}
					label="Conversion Rate"
					value={`${rsvpConversion.rate.toFixed(1)}%`}
				/>
			</div>

			{/* Device breakdown */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-medium">
						Device Breakdown
					</CardTitle>
					<CardDescription>
						How guests are viewing your invitation
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						<DeviceBar
							icon={<Smartphone className="h-4 w-4" />}
							label="Mobile"
							count={deviceBreakdown.mobile}
							total={totalViews}
						/>
						<DeviceBar
							icon={<Monitor className="h-4 w-4" />}
							label="Desktop"
							count={deviceBreakdown.desktop}
							total={totalViews}
						/>
						<DeviceBar
							icon={<Tablet className="h-4 w-4" />}
							label="Tablet"
							count={deviceBreakdown.tablet}
							total={totalViews}
						/>
					</div>
				</CardContent>
			</Card>

			{/* RSVP Funnel */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-medium">RSVP Funnel</CardTitle>
					<CardDescription>Track guest engagement</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span>Viewed Invitation</span>
							<span className="font-medium">{rsvpConversion.viewed}</span>
						</div>
						<Progress value={100} />
						<div className="flex justify-between text-sm">
							<span>Submitted RSVP</span>
							<span className="font-medium">{rsvpConversion.submitted}</span>
						</div>
						<Progress
							value={
								rsvpConversion.viewed > 0
									? (rsvpConversion.submitted / rsvpConversion.viewed) * 100
									: 0
							}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Section engagement */}
			{sectionViews.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">
							Section Engagement
						</CardTitle>
						<CardDescription>Which sections guests viewed most</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{sectionViews.slice(0, 6).map((section) => (
								<div
									key={section.section}
									className="flex justify-between text-sm"
								>
									<span className="capitalize">{section.section}</span>
									<span className="font-medium">{section.count} views</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Top referrers */}
			{topReferrers.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">
							Traffic Sources
						</CardTitle>
						<CardDescription>Where your guests came from</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{topReferrers.slice(0, 5).map((referrer) => (
								<div
									key={referrer.referrer}
									className="flex justify-between text-sm"
								>
									<span className="truncate max-w-[200px]">
										{referrer.referrer === "direct"
											? "Direct / Bookmark"
											: referrer.referrer}
									</span>
									<span className="font-medium">{referrer.count}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Views by day - simple list for now */}
			{viewsByDay.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">
							Recent Activity
						</CardTitle>
						<CardDescription>Views in the last 7 days</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{viewsByDay.slice(-7).map((day) => (
								<div key={day.date} className="flex justify-between text-sm">
									<span>{new Date(day.date).toLocaleDateString()}</span>
									<span className="font-medium">{day.count} views</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

/**
 * Stat card component
 */
function StatCard({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: number | string;
}) {
	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex items-center gap-2 text-muted-foreground mb-1">
					{icon}
					<span className="text-xs">{label}</span>
				</div>
				<p className="text-2xl font-bold">{value}</p>
			</CardContent>
		</Card>
	);
}

/**
 * Device breakdown bar
 */
function DeviceBar({
	icon,
	label,
	count,
	total,
}: {
	icon: React.ReactNode;
	label: string;
	count: number;
	total: number;
}) {
	const percentage = total > 0 ? (count / total) * 100 : 0;

	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between text-sm">
				<div className="flex items-center gap-2">
					{icon}
					<span>{label}</span>
				</div>
				<span className="font-medium">
					{count} ({percentage.toFixed(0)}%)
				</span>
			</div>
			<Progress value={percentage} />
		</div>
	);
}
