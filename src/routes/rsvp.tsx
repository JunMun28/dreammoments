import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Calendar, Heart, Loader2 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { type GuestRsvpData, RsvpForm } from "@/components/RsvpForm";
import { TemplatePreview } from "@/components/TemplatePreview";
import { Button } from "@/components/ui/button";
// Type-only imports are safe - erased at compile time
import type { RsvpResponseInput } from "@/lib/rsvp-server";

export const Route = createFileRoute("/rsvp")({
	component: RsvpPage,
});

// Parses token from URL hash in format #t=<TOKEN>
function parseTokenFromHash(): string | null {
	if (typeof window === "undefined") return null;
	const hash = window.location.hash;
	if (!hash.startsWith("#t=")) return null;
	return hash.slice(3); // Remove "#t="
}

interface GuestGroupInfo {
	id: string;
	name: string;
	invitationId: string;
	guests: Array<{ id: string; name: string }>;
}

interface InvitationData {
	partner1Name: string | null;
	partner2Name: string | null;
	weddingDate: string | null; // ISO date string from DB
	weddingTime: string | null;
	venueName: string | null;
	venueAddress: string | null;
	accentColor: string | null;
	fontPairing: string | null;
	heroImageUrl: string | null;
	rsvpDeadline: Date | null; // RSVP deadline
	scheduleBlocks: Array<{
		id: string;
		title: string;
		time?: string;
		description?: string;
		order: number;
	}>;
	notes: Array<{
		id: string;
		title: string;
		description?: string;
		order: number;
	}>;
}

/**
 * Format a deadline date for display.
 * e.g., "January 15, 2026"
 */
function formatDeadline(date: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	}).format(date);
}

/**
 * Check if the deadline has passed.
 * Compares against end of day to give guests until midnight.
 */
function isDeadlinePassed(deadline: Date): boolean {
	const now = new Date();
	const deadlineEnd = new Date(deadline);
	deadlineEnd.setHours(23, 59, 59, 999);
	return now > deadlineEnd;
}

type LoadingState = "loading" | "no-token" | "invalid-token" | "ready";

function RsvpPage() {
	const rsvpSectionId = useId();
	const [loadingState, setLoadingState] = useState<LoadingState>("loading");
	const [guestGroup, setGuestGroup] = useState<GuestGroupInfo | null>(null);
	const [invitation, setInvitation] = useState<InvitationData | null>(null);
	const [guestsWithRsvp, setGuestsWithRsvp] = useState<GuestRsvpData[]>([]);
	// Track hash changes to re-run data loading
	const [currentHash, setCurrentHash] = useState(() =>
		typeof window !== "undefined" ? window.location.hash : "",
	);

	// Listen for hash changes
	useEffect(() => {
		const handleHashChange = () => {
			setCurrentHash(window.location.hash);
			setLoadingState("loading"); // Reset to loading state
		};

		window.addEventListener("hashchange", handleHashChange);
		return () => window.removeEventListener("hashchange", handleHashChange);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: currentHash intentionally triggers re-load on hash change
	useEffect(() => {
		async function loadData() {
			// Dynamic imports to avoid bundling server code on client
			const { validateGuestSession, exchangeRsvpTokenForSession } =
				await import("@/lib/guest-session");
			const { getGuestGroupByToken } = await import("@/lib/guest-server");

			// Step 1: Check for existing session first
			const sessionResult = await validateGuestSession();

			if (sessionResult.valid) {
				// Session exists - load invitation data directly
				await loadInvitationData(sessionResult.invitationId);
				// Also load guest group info for display
				const token = parseTokenFromHash();
				if (token) {
					const group = await getGuestGroupByToken({ data: { token } });
					if (group) {
						setGuestGroup({
							id: group.id,
							name: group.name,
							invitationId: group.invitationId,
							guests: group.guests,
						});
						// Load RSVP status for the group
						await loadRsvpStatus(group.id);
					} else {
						// Session exists but need to get group info another way
						// For now, just use the session's group name
						setGuestGroup({
							id: sessionResult.groupId,
							name: sessionResult.groupName,
							invitationId: sessionResult.invitationId,
							guests: [],
						});
						await loadRsvpStatus(sessionResult.groupId);
					}
				} else {
					// No token in URL but session valid - use session data
					setGuestGroup({
						id: sessionResult.groupId,
						name: sessionResult.groupName,
						invitationId: sessionResult.invitationId,
						guests: [],
					});
					await loadRsvpStatus(sessionResult.groupId);
				}
				return;
			}

			// Step 2: No valid session - check for RSVP token in URL
			const token = parseTokenFromHash();

			if (!token) {
				setLoadingState("no-token");
				return;
			}

			// Step 3: Exchange RSVP token for session cookie
			const exchangeResult = await exchangeRsvpTokenForSession({
				data: { rsvpToken: token },
			});

			if (!exchangeResult.success) {
				setLoadingState("invalid-token");
				return;
			}

			// Step 4: Load invitation data using the group's invitation ID
			await loadInvitationData(exchangeResult.invitationId);

			// Also get full guest group info (with guest names)
			const group = await getGuestGroupByToken({ data: { token } });
			if (group) {
				setGuestGroup({
					id: group.id,
					name: group.name,
					invitationId: group.invitationId,
					guests: group.guests,
				});
				await loadRsvpStatus(group.id);
			} else {
				setGuestGroup({
					id: exchangeResult.groupId,
					name: exchangeResult.groupName,
					invitationId: exchangeResult.invitationId,
					guests: [],
				});
				await loadRsvpStatus(exchangeResult.groupId);
			}
		}

		async function loadInvitationData(invitationId: string) {
			try {
				// Dynamic import to avoid bundling server code on client
				const { getInvitationWithRelations } = await import(
					"@/lib/invitation-server"
				);
				const invitationData = await getInvitationWithRelations({
					data: { invitationId },
				});

				if (!invitationData) {
					setLoadingState("invalid-token");
					return;
				}

				setInvitation(invitationData);
				setLoadingState("ready");
			} catch (error) {
				console.error("Error loading invitation data:", error);
				setLoadingState("invalid-token");
			}
		}

		async function loadRsvpStatus(groupId: string) {
			try {
				// Dynamic import to avoid bundling server code on client
				const { getGroupRsvpStatus } = await import("@/lib/rsvp-server");
				const status = await getGroupRsvpStatus({ data: { groupId } });
				setGuestsWithRsvp(status.guests);
			} catch (error) {
				console.error("Error loading RSVP status:", error);
				// Continue without RSVP data - form will still work
			}
		}

		loadData();
	}, [currentHash]);

	// Handle RSVP submission
	const handleRsvpSubmit = async (responses: RsvpResponseInput[]) => {
		if (!guestGroup) return;

		// Dynamic imports to avoid bundling server code on client
		const { submitRsvp, getGroupRsvpStatus } = await import(
			"@/lib/rsvp-server"
		);

		await submitRsvp({ data: { groupId: guestGroup.id, responses } });

		// Reload RSVP status after submission
		const status = await getGroupRsvpStatus({
			data: { groupId: guestGroup.id },
		});
		setGuestsWithRsvp(status.guests);
	};

	if (loadingState === "loading") {
		return <LoadingView />;
	}

	if (loadingState === "no-token") {
		return <NoTokenView />;
	}

	if (loadingState === "invalid-token") {
		return <InvalidTokenView />;
	}

	if (!invitation || !guestGroup) {
		return <InvalidTokenView />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
			{/* Preview */}
			<main className="px-6 py-12">
				<div className="mx-auto max-w-4xl">
					<TemplatePreview
						partner1Name={invitation.partner1Name ?? undefined}
						partner2Name={invitation.partner2Name ?? undefined}
						weddingDate={
							invitation.weddingDate
								? new Date(invitation.weddingDate)
								: undefined
						}
						weddingTime={invitation.weddingTime ?? undefined}
						venueName={invitation.venueName ?? undefined}
						venueAddress={invitation.venueAddress ?? undefined}
						scheduleBlocks={invitation.scheduleBlocks}
						notes={invitation.notes}
						accentColor={invitation.accentColor ?? undefined}
						fontPairing={invitation.fontPairing ?? undefined}
						heroImageUrl={invitation.heroImageUrl ?? undefined}
						viewportMode="desktop"
					/>
				</div>
			</main>

			{/* RSVP Form Section */}
			<section
				id={rsvpSectionId}
				className="border-t border-stone-200 bg-white/50 px-6 py-12"
			>
				<div className="mx-auto max-w-2xl">
					<div className="text-center mb-8">
						<p className="mb-2 text-sm uppercase tracking-widest text-stone-500">
							You're invited as
						</p>
						<p className="text-xl font-medium text-stone-700">
							{guestGroup.name}
						</p>
					</div>

					<h2 className="text-2xl font-light text-center mb-8 text-stone-800">
						Please Respond
					</h2>

					{/* Deadline display */}
					{invitation.rsvpDeadline && (
						<div className="mb-8 flex items-center justify-center gap-2 text-stone-600">
							<Calendar className="h-4 w-4" />
							<span className="text-sm">
								Please respond by {formatDeadline(invitation.rsvpDeadline)}
							</span>
						</div>
					)}

					{/* RSVP Form or Closed Message */}
					{invitation.rsvpDeadline &&
					isDeadlinePassed(invitation.rsvpDeadline) ? (
						<DeadlinePassedView deadline={invitation.rsvpDeadline} />
					) : (
						<RsvpForm guests={guestsWithRsvp} onSubmit={handleRsvpSubmit} />
					)}
				</div>
			</section>
		</div>
	);
}

function LoadingView() {
	return (
		<output
			className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100"
			aria-live="polite"
		>
			<Loader2
				className="mb-4 h-8 w-8 animate-spin text-rose-400"
				aria-hidden="true"
			/>
			<p className="text-stone-600">Loading invitation...</p>
		</output>
	);
}

function NoTokenView() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100 px-6">
			<Heart className="mb-6 h-12 w-12 text-rose-300" />
			<h1 className="mb-4 text-2xl font-light text-stone-800">
				RSVP Link Required
			</h1>
			<p className="mb-8 max-w-md text-center text-stone-600">
				Please use the RSVP link provided by the couple to view your invitation
				and respond.
			</p>
			<Button variant="outline" asChild>
				<Link to="/">Go to DreamMoments</Link>
			</Button>
		</div>
	);
}

function InvalidTokenView() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100 px-6">
			<AlertCircle className="mb-6 h-12 w-12 text-amber-400" />
			<h1 className="mb-4 text-2xl font-light text-stone-800">
				Invalid or Expired Link
			</h1>
			<p className="mb-8 max-w-md text-center text-stone-600">
				This RSVP link is not valid. Please contact the couple for a new link.
			</p>
			<Button variant="outline" asChild>
				<Link to="/">Go to DreamMoments</Link>
			</Button>
		</div>
	);
}

function DeadlinePassedView({ deadline }: { deadline: Date }) {
	return (
		<div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
			<Calendar className="mx-auto mb-4 h-8 w-8 text-amber-500" />
			<h3 className="mb-2 text-lg font-medium text-stone-800">
				RSVP Period Has Ended
			</h3>
			<p className="text-stone-600">
				The deadline to respond was {formatDeadline(deadline)}.
			</p>
			<p className="mt-2 text-sm text-stone-500">
				Please contact the couple directly if you need to update your response.
			</p>
		</div>
	);
}

export { parseTokenFromHash };
