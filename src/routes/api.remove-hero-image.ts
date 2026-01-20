import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
// Note: drizzle-orm and db are dynamically imported in handlers
// to avoid bundling for the client

export const Route = createFileRoute("/api/remove-hero-image")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const body = await request.json();
					const { invitationId } = body as { invitationId?: string };

					if (!invitationId) {
						return json(
							{ error: "Missing required field: invitationId" },
							{ status: 400 },
						);
					}

					// Dynamic imports to avoid bundling for client
					const { eq } = await import("drizzle-orm");
					const { db } = await import("@/db/index");
					const { invitations } = await import("@/db/schema");

					const result = await db
						.update(invitations)
						.set({
							heroImageUrl: null,
							updatedAt: new Date(),
						})
						.where(eq(invitations.id, invitationId))
						.returning({ id: invitations.id });

					if (result.length === 0) {
						return json({ error: "Invitation not found" }, { status: 404 });
					}

					return json({ success: true });
				} catch (error) {
					console.error("Remove hero image error:", error);
					return json({ error: "Failed to remove image" }, { status: 500 });
				}
			},
		},
	},
});
