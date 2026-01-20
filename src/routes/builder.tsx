import {
	createFileRoute,
	redirect,
	useLoaderData,
} from "@tanstack/react-router";
import { InvitationBuilder } from "@/components/InvitationBuilder";
import type { InvitationData } from "@/contexts/InvitationBuilderContext";
import { getSession } from "@/lib/auth";
import {
	getInvitationWithRelations,
	getOrCreateInvitationInternal,
	updateInvitation,
} from "@/lib/invitation-server";
import { syncUserFromNeonAuth } from "@/lib/user-sync";

interface BuilderSearch {
	template?: string;
	devBypass?: boolean;
}

export const Route = createFileRoute("/builder")({
	component: BuilderPage,
	validateSearch: (search: Record<string, unknown>): BuilderSearch => ({
		template: typeof search.template === "string" ? search.template : undefined,
		devBypass: search.devBypass === "true" || search.devBypass === true,
	}),
	loaderDeps: ({ search }) => ({
		template: search.template,
		devBypass: search.devBypass,
	}),
	beforeLoad: async ({ search }) => {
		// Dev bypass for UI testing - skip auth check
		if (search.devBypass) {
			return { user: null, devBypass: true };
		}

		// Check authentication
		const result = await getSession();

		if (!result.data?.user) {
			// Redirect to login, preserving template param if present
			const loginParams = search.template
				? { template: search.template }
				: undefined;
			throw redirect({
				to: "/login",
				search: loginParams,
			});
		}

		return { user: result.data.user, devBypass: false };
	},
	loader: async ({ context, deps }) => {
		const { user, devBypass } = context;
		const { template } = deps;

		// Dev bypass: return mock invitation data for UI testing
		if (devBypass) {
			const mockInvitation = {
				id: "mock-invitation-id",
				partner1Name: "Sarah",
				partner2Name: "Michael",
				weddingDate: new Date("2025-06-15").toISOString(),
				weddingTime: "15:00",
				venueName: "Rose Garden Estate",
				venueAddress: "123 Garden Lane, Beverly Hills, CA 90210",
				templateId: template ?? "classic-romance",
				accentColor: "#c084fc",
				fontPairing: "playfair-lato",
				heroImageUrl: null,
				scheduleBlocks: [
					{
						id: "sb-1",
						title: "Ceremony",
						time: "15:00",
						description: "Exchange of vows",
						order: 0,
					},
					{
						id: "sb-2",
						title: "Cocktail Hour",
						time: "16:00",
						description: "Drinks and appetizers",
						order: 1,
					},
					{
						id: "sb-3",
						title: "Reception",
						time: "17:00",
						description: "Dinner and dancing",
						order: 2,
					},
				],
				notes: [
					{ id: "note-1", content: "Black tie optional", order: 0 },
					{ id: "note-2", content: "Please RSVP by May 1st", order: 1 },
				],
			};
			return { invitation: mockInvitation, devBypass: true };
		}

		// User is guaranteed to exist when not in dev bypass mode (beforeLoad would have redirected)
		if (!user) {
			throw new Error("User should exist when not in dev bypass mode");
		}

		// Sync user to local database (in case this is their first visit to builder)
		const localUser = await syncUserFromNeonAuth({
			neonAuthId: user.id,
			email: user.email,
		});

		// Get or create invitation for user
		const { id: invitationId } = await getOrCreateInvitationInternal({
			userId: localUser.id,
			templateId: template,
		});

		// Load full invitation data with schedule blocks and notes
		const invitation = await getInvitationWithRelations(invitationId);

		if (!invitation) {
			throw new Error("Failed to load invitation");
		}

		return { invitation, devBypass: false };
	},
});

function BuilderPage() {
	const { invitation, devBypass } = useLoaderData({ from: "/builder" });

	// Convert DB invitation to InvitationData format
	const initialData: InvitationData = {
		id: invitation.id,
		partner1Name: invitation.partner1Name ?? "",
		partner2Name: invitation.partner2Name ?? "",
		weddingDate: invitation.weddingDate
			? new Date(invitation.weddingDate)
			: undefined,
		weddingTime: invitation.weddingTime ?? undefined,
		venueName: invitation.venueName ?? undefined,
		venueAddress: invitation.venueAddress ?? undefined,
		templateId: invitation.templateId ?? undefined,
		accentColor: invitation.accentColor ?? undefined,
		fontPairing: invitation.fontPairing ?? undefined,
		heroImageUrl: invitation.heroImageUrl ?? undefined,
		scheduleBlocks: invitation.scheduleBlocks,
		notes: invitation.notes,
	};

	const handleSave = async (data: InvitationData) => {
		// In dev bypass mode, skip actual save (mock data only)
		if (devBypass) {
			console.log("[Dev Bypass] Save skipped - mock data mode");
			return;
		}

		await updateInvitation({
			data: {
				invitationId: data.id,
				partner1Name: data.partner1Name || undefined,
				partner2Name: data.partner2Name || undefined,
				weddingDate: data.weddingDate
					? data.weddingDate.toISOString().split("T")[0]
					: null,
				weddingTime: data.weddingTime ?? null,
				venueName: data.venueName ?? null,
				venueAddress: data.venueAddress ?? null,
			},
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
			<div className="mx-auto max-w-7xl px-6 py-8">
				<InvitationBuilder initialData={initialData} onSave={handleSave} />
			</div>
		</div>
	);
}
