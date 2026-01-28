/**
 * Server functions for visitor analytics tracking
 */

import { createServerFn } from "@tanstack/react-start";
import { and, eq, gte, lte } from "drizzle-orm";
import { getDb } from "@/db/index";
import { invitationViews } from "@/db/schema";
import { verifyInvitationOwnership } from "./auth-helpers";
import {
	getAnalyticsSchema,
	markRsvpSubmittedSchema,
	trackViewSchema,
	updateSectionsViewedSchema,
} from "./schemas";

export interface ViewData {
	id: string;
	invitationId: string;
	sessionId: string;
	deviceType: string | null;
	referrer: string | null;
	sectionsViewed: string[] | null;
	rsvpSubmitted: boolean;
	viewedAt: Date | null;
}

export interface AnalyticsSummary {
	totalViews: number;
	uniqueSessions: number;
	deviceBreakdown: {
		mobile: number;
		desktop: number;
		tablet: number;
		unknown: number;
	};
	topReferrers: { referrer: string; count: number }[];
	sectionViews: { section: string; count: number }[];
	rsvpConversion: {
		viewed: number;
		submitted: number;
		rate: number;
	};
	viewsByDay: { date: string; count: number }[];
}

// ------------ Internal functions (for testing) ------------

/**
 * Track a page view (public - guests trigger this)
 */
export async function trackViewInternal(data: {
	invitationId: string;
	sessionId: string;
	deviceType?: string;
	referrer?: string;
	sectionsViewed?: string[];
	rsvpSubmitted?: boolean;
}): Promise<ViewData> {
	const db = await getDb();

	const [newView] = await db
		.insert(invitationViews)
		.values({
			invitationId: data.invitationId,
			sessionId: data.sessionId,
			deviceType: data.deviceType || null,
			referrer: data.referrer || null,
			sectionsViewed: data.sectionsViewed || null,
			rsvpSubmitted: data.rsvpSubmitted || false,
		})
		.returning();

	return {
		id: newView.id,
		invitationId: newView.invitationId,
		sessionId: newView.sessionId,
		deviceType: newView.deviceType,
		referrer: newView.referrer,
		sectionsViewed: newView.sectionsViewed,
		rsvpSubmitted: newView.rsvpSubmitted,
		viewedAt: newView.viewedAt,
	};
}

/**
 * Update sections viewed for an existing view
 */
export async function updateSectionsViewedInternal(data: {
	viewId: string;
	sectionsViewed: string[];
}): Promise<ViewData | null> {
	const db = await getDb();

	const [updated] = await db
		.update(invitationViews)
		.set({ sectionsViewed: data.sectionsViewed })
		.where(eq(invitationViews.id, data.viewId))
		.returning();

	if (!updated) return null;

	return {
		id: updated.id,
		invitationId: updated.invitationId,
		sessionId: updated.sessionId,
		deviceType: updated.deviceType,
		referrer: updated.referrer,
		sectionsViewed: updated.sectionsViewed,
		rsvpSubmitted: updated.rsvpSubmitted,
		viewedAt: updated.viewedAt,
	};
}

/**
 * Mark RSVP as submitted for a view
 */
export async function markRsvpSubmittedInternal(
	viewId: string,
): Promise<ViewData | null> {
	const db = await getDb();

	const [updated] = await db
		.update(invitationViews)
		.set({ rsvpSubmitted: true })
		.where(eq(invitationViews.id, viewId))
		.returning();

	if (!updated) return null;

	return {
		id: updated.id,
		invitationId: updated.invitationId,
		sessionId: updated.sessionId,
		deviceType: updated.deviceType,
		referrer: updated.referrer,
		sectionsViewed: updated.sectionsViewed,
		rsvpSubmitted: updated.rsvpSubmitted,
		viewedAt: updated.viewedAt,
	};
}

/**
 * Get analytics summary for an invitation (couple only)
 */
export async function getAnalyticsInternal(data: {
	invitationId: string;
	startDate?: string;
	endDate?: string;
}): Promise<AnalyticsSummary> {
	const db = await getDb();

	// Build where conditions
	const conditions = [eq(invitationViews.invitationId, data.invitationId)];

	if (data.startDate) {
		conditions.push(gte(invitationViews.viewedAt, new Date(data.startDate)));
	}
	if (data.endDate) {
		conditions.push(lte(invitationViews.viewedAt, new Date(data.endDate)));
	}

	// Get all views for this invitation
	const views = await db
		.select()
		.from(invitationViews)
		.where(and(...conditions));

	// Calculate total views
	const totalViews = views.length;

	// Calculate unique sessions
	const uniqueSessions = new Set(views.map((v) => v.sessionId)).size;

	// Calculate device breakdown
	const deviceBreakdown = {
		mobile: views.filter((v) => v.deviceType === "mobile").length,
		desktop: views.filter((v) => v.deviceType === "desktop").length,
		tablet: views.filter((v) => v.deviceType === "tablet").length,
		unknown: views.filter((v) => !v.deviceType).length,
	};

	// Calculate top referrers
	const referrerCounts = new Map<string, number>();
	for (const view of views) {
		const referrer = view.referrer || "direct";
		referrerCounts.set(referrer, (referrerCounts.get(referrer) || 0) + 1);
	}
	const topReferrers = Array.from(referrerCounts.entries())
		.map(([referrer, count]) => ({ referrer, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 10);

	// Calculate section views
	const sectionCounts = new Map<string, number>();
	for (const view of views) {
		if (view.sectionsViewed) {
			for (const section of view.sectionsViewed) {
				sectionCounts.set(section, (sectionCounts.get(section) || 0) + 1);
			}
		}
	}
	const sectionViews = Array.from(sectionCounts.entries())
		.map(([section, count]) => ({ section, count }))
		.sort((a, b) => b.count - a.count);

	// Calculate RSVP conversion
	const rsvpSubmitted = views.filter((v) => v.rsvpSubmitted).length;
	const rsvpConversion = {
		viewed: totalViews,
		submitted: rsvpSubmitted,
		rate: totalViews > 0 ? (rsvpSubmitted / totalViews) * 100 : 0,
	};

	// Calculate views by day
	const dayMap = new Map<string, number>();
	for (const view of views) {
		if (view.viewedAt) {
			const dateStr = view.viewedAt.toISOString().split("T")[0];
			dayMap.set(dateStr, (dayMap.get(dateStr) || 0) + 1);
		}
	}
	const viewsByDay = Array.from(dayMap.entries())
		.map(([date, count]) => ({ date, count }))
		.sort((a, b) => a.date.localeCompare(b.date));

	return {
		totalViews,
		uniqueSessions,
		deviceBreakdown,
		topReferrers,
		sectionViews,
		rsvpConversion,
		viewsByDay,
	};
}

// ------------ Server Functions ------------

/**
 * Track a page view (public - guests trigger this)
 */
export const trackView = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => trackViewSchema.parse(input))
	.handler(async ({ data }) => {
		// No auth required - this is public tracking
		return trackViewInternal(data);
	});

/**
 * Update sections viewed for an existing view
 */
export const updateSectionsViewed = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => updateSectionsViewedSchema.parse(input))
	.handler(async ({ data }) => {
		// No auth required - this is public tracking
		return updateSectionsViewedInternal(data);
	});

/**
 * Mark RSVP as submitted for a view
 */
export const markRsvpSubmitted = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => markRsvpSubmittedSchema.parse(input))
	.handler(async ({ data }) => {
		// No auth required - this is public tracking
		return markRsvpSubmittedInternal(data.viewId);
	});

/**
 * Get analytics summary for an invitation (couple only)
 */
export const getAnalytics = createServerFn({ method: "GET" })
	.inputValidator((input: unknown) => getAnalyticsSchema.parse(input))
	.handler(async ({ data }) => {
		await verifyInvitationOwnership(data.invitationId);
		return getAnalyticsInternal(data);
	});
