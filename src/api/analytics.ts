import { createServerFn } from "@tanstack/react-start";
import { and, eq, gte } from "drizzle-orm";
import { z } from "zod";

import { getDbOrNull, isProduction, schema } from "@/db/index";
import {
	getAnalytics as localGetAnalytics,
	getDeviceBreakdown as localGetDeviceBreakdown,
	getInvitationById as localGetInvitationById,
	listGuests as localListGuests,
} from "@/lib/data";
import { requireAuth } from "@/lib/server-auth";

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
		(data: { token: string; invitationId: string; period?: string }) => {
			const result = getAnalyticsSchema.safeParse(data);
			if (!result.success) {
				throw new Error(result.error.issues[0].message);
			}
			return result.data;
		},
	)
	.handler(async ({ data }): Promise<AnalyticsData | { error: string }> => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
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

			// Fetch views with period filter
			const viewConditions = [
				eq(schema.invitationViews.invitationId, data.invitationId),
			];
			if (periodStart) {
				viewConditions.push(gte(schema.invitationViews.viewedAt, periodStart));
			}

			const views = await db
				.select()
				.from(schema.invitationViews)
				.where(and(...viewConditions));

			// Total and unique views
			const totalViews = views.length;
			const uniqueHashes = new Set(views.map((v) => v.visitorHash));
			const uniqueViews = uniqueHashes.size;

			// Views by day
			const dayMap = new Map<string, number>();
			for (const view of views) {
				const date = view.viewedAt.toISOString().slice(0, 10);
				dayMap.set(date, (dayMap.get(date) ?? 0) + 1);
			}
			const viewsByDay = Array.from(dayMap.entries())
				.map(([date, count]) => ({ date, count }))
				.sort((a, b) => a.date.localeCompare(b.date));

			// Device breakdown
			const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };
			for (const view of views) {
				const device = (view.deviceType ??
					"desktop") as keyof typeof deviceBreakdown;
				if (device in deviceBreakdown) {
					deviceBreakdown[device]++;
				}
			}

			// Top referrers
			const refMap = new Map<string, number>();
			for (const view of views) {
				const ref = view.referrer?.trim();
				if (ref) {
					refMap.set(ref, (refMap.get(ref) ?? 0) + 1);
				}
			}
			const topReferrers = Array.from(refMap.entries())
				.map(([referrer, count]) => ({ referrer, count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 10);

			// RSVP summary from guests table
			const guests = await db
				.select()
				.from(schema.guests)
				.where(eq(schema.guests.invitationId, data.invitationId));

			const rsvpSummary = {
				attending: 0,
				notAttending: 0,
				pending: 0,
				total: guests.length,
			};
			for (const guest of guests) {
				if (guest.attendance === "attending") rsvpSummary.attending++;
				else if (guest.attendance === "not_attending")
					rsvpSummary.notAttending++;
				else rsvpSummary.pending++;
			}

			return {
				totalViews,
				uniqueViews,
				rsvpSummary,
				viewsByDay,
				deviceBreakdown,
				topReferrers,
			};
		}

		if (isProduction()) {
			throw new Error("Database required in production");
		}

		// Dev-only localStorage fallback
		console.warn(
			"[Analytics] getAnalytics: using localStorage fallback (no DATABASE_URL)",
		);

		const invitation = localGetInvitationById(data.invitationId);
		if (!invitation) {
			return { error: "Invitation not found" };
		}
		if (invitation.userId !== userId) {
			return { error: "Access denied" };
		}

		const localAnalytics = localGetAnalytics(data.invitationId);
		const localDevices = localGetDeviceBreakdown(data.invitationId);
		const localGuests = localListGuests(data.invitationId);

		const rsvpSummary = {
			attending: localGuests.filter((g) => g.attendance === "attending").length,
			notAttending: localGuests.filter((g) => g.attendance === "not_attending")
				.length,
			pending: localGuests.filter((g) => !g.attendance).length,
			total: localGuests.length,
		};

		return {
			totalViews: localAnalytics.totalViews,
			uniqueViews: localAnalytics.uniqueVisitors,
			rsvpSummary,
			viewsByDay: localAnalytics.viewsByDay.map((d) => ({
				date: d.date,
				count: d.views,
			})),
			deviceBreakdown: {
				mobile: localDevices.mobile ?? 0,
				desktop: localDevices.desktop ?? 0,
				tablet: localDevices.tablet ?? 0,
			},
			topReferrers: [],
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
