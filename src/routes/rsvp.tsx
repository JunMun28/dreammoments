import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Heart, Loader2 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { type GuestRsvpData, RsvpForm } from "@/components/RsvpForm";
import { TemplatePreview } from "@/components/TemplatePreview";
import { Button } from "@/components/ui/button";
import { getGuestGroupByToken } from "@/lib/guest-server";
import {
	exchangeRsvpTokenForSession,
	validateGuestSession,
} from "@/lib/guest-session";
import { getInvitationWithRelations } from "@/lib/invitation-server";
import {
	getGroupRsvpStatus,
	type RsvpResponseInput,
	submitRsvp,
} from "@/lib/rsvp-server";

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

type LoadingState = "loading" | "no-token" | "invalid-token" | "ready";

function RsvpPage() {
	const rsvpSectionId = useId();
	const [loadingState, setLoadingState] = useState<LoadingState>("loading");
	const [guestGroup, setGuestGroup] = useState<GuestGroupInfo | null>(null);
	const [invitation, setInvitation] = useState<InvitationData | null>(null);
	const [guestsWithRsvp, setGuestsWithRsvp] = useState<GuestRsvpData[]>([]);

	useEffect(() => {
		async function loadData() {
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
				const invitationData = await getInvitationWithRelations(invitationId);

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
				const status = await getGroupRsvpStatus({ data: { groupId } });
				setGuestsWithRsvp(status.guests);
			} catch (error) {
				console.error("Error loading RSVP status:", error);
				// Continue without RSVP data - form will still work
			}
		}

		loadData();
	}, []);

	// Handle RSVP submission
	const handleRsvpSubmit = async (responses: RsvpResponseInput[]) => {
		if (!guestGroup) return;

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

					<RsvpForm guests={guestsWithRsvp} onSubmit={handleRsvpSubmit} />
				</div>
			</section>
		</div>
	);
}

function LoadingView() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100">
			<Loader2 className="mb-4 h-8 w-8 animate-spin text-rose-400" />
			<p className="text-stone-600">Loading invitation...</p>
		</div>
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

export { parseTokenFromHash };
