import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { invitations } from "@/db/schema";

/**
 * Input type for invitation update data
 */
export interface UpdateInvitationInput {
	invitationId: string;
	partner1Name?: string;
	partner2Name?: string;
	weddingDate?: string | null; // ISO date string "YYYY-MM-DD"
	weddingTime?: string | null; // "HH:mm" format
	venueName?: string | null;
	venueAddress?: string | null;
}

/**
 * Server function to update invitation basic info.
 * Used by autosave to persist form changes.
 */
export const updateInvitation = createServerFn({ method: "POST" })
	.inputValidator((input: UpdateInvitationInput) => input)
	.handler(async ({ data }) => {
		const { invitationId, ...updateData } = data;

		const result = await db
			.update(invitations)
			.set({
				...updateData,
				updatedAt: new Date(),
			})
			.where(eq(invitations.id, invitationId))
			.returning({ id: invitations.id });

		if (result.length === 0) {
			throw new Error("Invitation not found");
		}

		return { success: true, id: result[0].id };
	});

/**
 * Server function to get an invitation by ID.
 */
export const getInvitation = createServerFn({ method: "GET" })
	.inputValidator((input: { id: string }) => input)
	.handler(async ({ data }) => {
		const result = await db
			.select()
			.from(invitations)
			.where(eq(invitations.id, data.id))
			.limit(1);

		if (result.length === 0) {
			return null;
		}

		return result[0];
	});
