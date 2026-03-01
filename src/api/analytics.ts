import { createServerFn } from "@tanstack/react-start";
import {
	and,
	count,
	countDistinct,
	eq,
	gte,
	isNotNull,
	sql,
} from "drizzle-orm";
import { z } from "zod";

import { getDbOrNull, schema } from "@/db/index";
import { requireAuth } from "@/lib/server-auth";
import { parseInput } from "./validate";

// ── Analytics schema ────────────────────────────────────────────────

const getAnalyticsSchema = z.object({
	token: z.string().min(1, "Token is required"),
	invitationId: z.string().min(1, "invitationId is required"),
	period: z.enum(["7d", "30d", "all"]).default("30d"),
});

export type AnalyticsPeriod = "7d" | "30d" | "all";

export interface AnalyticsData {
	totalViews: number;
	uniqueViews: number;
	rsvpSummary: {
		attending: number;
		notAttending: number;
		pending: number;
		total: number;
	};
	viewsByDay: Array<{ date: string; count: number }>;
	deviceBreakdown: {
		mobile: number;
		desktop: number;
		tablet: number;
	};
	topReferrers: Array<{ referrer: string; count: number }>;
}

// ── Get analytics ───────────────────────────────────────────────────

export const getAnalyticsFn = createServerFn({
	method: "GET",
})
	.inputValidator(
		(data: { token: string; invitationId: string; period?: string }) =>
			parseInput(getAnalyticsSchema, data),
	)
	.handler(async ({ data }): Promise<AnalyticsData | { error: string }> => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();
		if (!db) throw new Error("Database connection required");

		// Verify ownership
		const invRows = await db
			.select({ userId: schema.invitations.userId })
			.from(schema.invitations)
			.where(eq(schema.invitations.id, data.invitationId));

		if (invRows.length === 0) {
			return { error: "Invitation not found" };
		}
		if (invRows[0].userId !== userId) {
			return { error: "Access denied" };
		}

		// Calculate period filter date
		const periodStart = getPeriodStart(data.period);

		// Build shared WHERE conditions for view queries
		const viewConditions = [
			eq(schema.invitationViews.invitationId, data.invitationId),
		];
		if (periodStart) {
			viewConditions.push(gte(schema.invitationViews.viewedAt, periodStart));
		}
		const viewWhere = and(...viewConditions);

		// Run all aggregation queries in parallel
		const [
			totalViewsResult,
			uniqueViewsResult,
			viewsByDayResult,
			deviceResult,
			referrerResult,
			rsvpResult,
		] = await Promise.all([
			// Total views
			db
				.select({ value: count() })
				.from(schema.invitationViews)
				.where(viewWhere),

			// Unique views (distinct visitor hashes)
			db
				.select({
					value: countDistinct(schema.invitationViews.visitorHash),
				})
				.from(schema.invitationViews)
				.where(viewWhere),

			// Views by day
			db
				.select({
					date: sql<string>`date_trunc('day', ${schema.invitationViews.viewedAt})::date::text`,
					count: count(),
				})
				.from(schema.invitationViews)
				.where(viewWhere)
				.groupBy(sql`date_trunc('day', ${schema.invitationViews.viewedAt})`)
				.orderBy(sql`date_trunc('day', ${schema.invitationViews.viewedAt})`),

			// Device breakdown
			db
				.select({
					deviceType: schema.invitationViews.deviceType,
					count: count(),
				})
				.from(schema.invitationViews)
				.where(viewWhere)
				.groupBy(schema.invitationViews.deviceType),

			// Top referrers
			db
				.select({
					referrer: schema.invitationViews.referrer,
					count: count(),
				})
				.from(schema.invitationViews)
				.where(
					and(...viewConditions, isNotNull(schema.invitationViews.referrer)),
				)
				.groupBy(schema.invitationViews.referrer)
				.orderBy(sql`count(*) desc`)
				.limit(10),

			// RSVP summary from guests table
			db
				.select({
					attendance: schema.guests.attendance,
					count: count(),
				})
				.from(schema.guests)
				.where(eq(schema.guests.invitationId, data.invitationId))
				.groupBy(schema.guests.attendance),
		]);

		const totalViews = totalViewsResult[0]?.value ?? 0;
		const uniqueViews = uniqueViewsResult[0]?.value ?? 0;

		const viewsByDay = viewsByDayResult.map((row) => ({
			date: row.date,
			count: row.count,
		}));

		const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };
		for (const row of deviceResult) {
			const device = (row.deviceType ??
				"desktop") as keyof typeof deviceBreakdown;
			if (device in deviceBreakdown) {
				deviceBreakdown[device] = row.count;
			}
		}

		const topReferrers = referrerResult
			.filter(
				(row): row is { referrer: string; count: number } =>
					row.referrer !== null,
			)
			.map((row) => ({
				referrer: row.referrer,
				count: row.count,
			}));

		const rsvpSummary = {
			attending: 0,
			notAttending: 0,
			pending: 0,
			total: 0,
		};
		for (const row of rsvpResult) {
			rsvpSummary.total += row.count;
			if (row.attendance === "attending") rsvpSummary.attending = row.count;
			else if (row.attendance === "not_attending")
				rsvpSummary.notAttending = row.count;
			else rsvpSummary.pending += row.count;
		}

		return {
			totalViews,
			uniqueViews,
			rsvpSummary,
			viewsByDay,
			deviceBreakdown,
			topReferrers,
		};
	});

// ── Helpers ─────────────────────────────────────────────────────────

function getPeriodStart(period: string): Date | null {
	const now = new Date();
	switch (period) {
		case "7d":
			return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		case "30d":
			return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
		default:
			return null;
	}
}
