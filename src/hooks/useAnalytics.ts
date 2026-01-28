/**
 * Hook for tracking visitor analytics
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
	markRsvpSubmitted,
	trackView,
	updateSectionsViewed,
} from "@/lib/analytics-server";

/**
 * Get or create a session ID for analytics tracking
 */
function getSessionId(): string {
	const storageKey = "dm_analytics_session";
	let sessionId = sessionStorage.getItem(storageKey);

	if (!sessionId) {
		sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
		sessionStorage.setItem(storageKey, sessionId);
	}

	return sessionId;
}

/**
 * Detect device type from user agent
 */
function detectDeviceType(): "mobile" | "desktop" | "tablet" {
	const ua = navigator.userAgent.toLowerCase();

	if (/ipad|tablet|playbook|silk|(android(?!.*mobi))/i.test(ua)) {
		return "tablet";
	}

	if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
		return "mobile";
	}

	return "desktop";
}

interface UseAnalyticsOptions {
	/** Invitation ID to track */
	invitationId: string;
	/** Whether tracking is enabled */
	enabled?: boolean;
}

interface UseAnalyticsReturn {
	/** Track a section being viewed */
	trackSection: (sectionId: string) => void;
	/** Mark RSVP as submitted */
	markRsvpComplete: () => void;
	/** Current view ID */
	viewId: string | null;
	/** List of tracked sections */
	trackedSections: string[];
}

/**
 * Hook for tracking visitor analytics
 */
export function useAnalytics({
	invitationId,
	enabled = true,
}: UseAnalyticsOptions): UseAnalyticsReturn {
	const [viewId, setViewId] = useState<string | null>(null);
	const [trackedSections, setTrackedSections] = useState<string[]>([]);
	const initializedRef = useRef(false);

	// Initialize tracking on mount
	useEffect(() => {
		if (!enabled || initializedRef.current) return;

		initializedRef.current = true;

		const initTracking = async () => {
			try {
				const sessionId = getSessionId();
				const deviceType = detectDeviceType();
				const referrer = document.referrer || undefined;

				const view = await trackView({
					data: {
						invitationId,
						sessionId,
						deviceType,
						referrer,
					},
				});

				setViewId(view.id);
			} catch (error) {
				console.error("Failed to track view:", error);
			}
		};

		initTracking();
	}, [invitationId, enabled]);

	// Track section view
	const trackSection = useCallback(
		async (sectionId: string) => {
			if (!enabled || !viewId || trackedSections.includes(sectionId)) return;

			const newSections = [...trackedSections, sectionId];
			setTrackedSections(newSections);

			try {
				await updateSectionsViewed({
					data: {
						viewId,
						sectionsViewed: newSections,
					},
				});
			} catch (error) {
				console.error("Failed to track section:", error);
			}
		},
		[viewId, trackedSections, enabled],
	);

	// Mark RSVP complete
	const markRsvpComplete = useCallback(async () => {
		if (!enabled || !viewId) return;

		try {
			await markRsvpSubmitted({ data: { viewId } });
		} catch (error) {
			console.error("Failed to mark RSVP complete:", error);
		}
	}, [viewId, enabled]);

	return {
		trackSection,
		markRsvpComplete,
		viewId,
		trackedSections,
	};
}
