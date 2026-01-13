import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { invitations } from "@/db/schema";

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
