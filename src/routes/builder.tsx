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
}

export const Route = createFileRoute("/builder")({
	component: BuilderPage,
	validateSearch: (search: Record<string, unknown>): BuilderSearch => ({
		template: typeof search.template === "string" ? search.template : undefined,
	}),
	loaderDeps: ({ search }) => ({ template: search.template }),
	beforeLoad: async ({ search }) => {
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

		return { user: result.data.user };
	},
	loader: async ({ context, deps }) => {
		const { user } = context;
		const { template } = deps;

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

		return { invitation };
	},
});

function BuilderPage() {
	const { invitation } = useLoaderData({ from: "/builder" });

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
