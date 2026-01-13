import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { invitations, notes, scheduleBlocks } from "@/db/schema";
import { getTemplateById } from "./template-data";

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

/**
 * Input type for creating a new invitation
 */
export interface CreateInvitationInput {
	userId: string;
	templateId?: string;
}

/**
 * Internal function to create a new invitation.
 * Extracted for testability.
 */
export async function createInvitationInternal(input: CreateInvitationInput) {
	const { userId, templateId } = input;

	// Get template data if templateId provided
	const template = templateId ? getTemplateById(templateId) : undefined;

	// Create the invitation
	const [invitation] = await db
		.insert(invitations)
		.values({
			userId,
			templateId,
			accentColor: template?.accentColor,
			fontPairing: template?.fontPairing,
		})
		.returning({ id: invitations.id });

	// If template has schedule blocks, create them
	if (template?.preview.scheduleBlocks.length) {
		await db.insert(scheduleBlocks).values(
			template.preview.scheduleBlocks.map((block) => ({
				invitationId: invitation.id,
				title: block.title,
				time: block.time,
				description: block.description,
				order: block.order,
			})),
		);
	}

	// If template has notes, create them
	if (template?.preview.notes.length) {
		await db.insert(notes).values(
			template.preview.notes.map((note) => ({
				invitationId: invitation.id,
				title: note.title,
				description: note.description,
				order: note.order,
			})),
		);
	}

	return { id: invitation.id };
}

/**
 * Server function to create a new invitation.
 * Optionally populates with template data (theme, schedule blocks, notes).
 */
export const createInvitation = createServerFn({ method: "POST" })
	.inputValidator((input: CreateInvitationInput) => input)
	.handler(async ({ data }) => {
		return createInvitationInternal(data);
	});

/**
 * Input type for getting or creating an invitation
 */
export interface GetOrCreateInvitationInput {
	userId: string;
	templateId?: string;
}

/**
 * Internal function to get or create invitation for user.
 * Extracted for testability.
 */
export async function getOrCreateInvitationInternal(
	input: GetOrCreateInvitationInput,
) {
	const { userId, templateId } = input;

	// Check if user already has an invitation
	const existingResult = await db
		.select()
		.from(invitations)
		.where(eq(invitations.userId, userId))
		.limit(1);

	if (existingResult.length > 0) {
		return { id: existingResult[0].id, isNew: false };
	}

	// Create new invitation with template if provided
	const result = await createInvitationInternal({ userId, templateId });

	return { id: result.id, isNew: true };
}

/**
 * Server function to get a user's existing invitation or create a new one.
 * For MVP, each user has one invitation (can be extended later).
 */
export const getOrCreateInvitationForUser = createServerFn({ method: "POST" })
	.inputValidator((input: GetOrCreateInvitationInput) => input)
	.handler(async ({ data }) => {
		return getOrCreateInvitationInternal(data);
	});

/**
 * Get full invitation data with schedule blocks and notes.
 * Used by builder route to load invitation with related data.
 */
export async function getInvitationWithRelations(invitationId: string) {
	const result = await db
		.select()
		.from(invitations)
		.where(eq(invitations.id, invitationId))
		.limit(1);

	if (result.length === 0) {
		return null;
	}

	const invitation = result[0];

	// Get schedule blocks
	const blocks = await db
		.select()
		.from(scheduleBlocks)
		.where(eq(scheduleBlocks.invitationId, invitationId));

	// Get notes
	const invitationNotes = await db
		.select()
		.from(notes)
		.where(eq(notes.invitationId, invitationId));

	return {
		...invitation,
		scheduleBlocks: blocks.map((b) => ({
			id: b.id,
			title: b.title,
			time: b.time ?? undefined,
			description: b.description ?? undefined,
			order: b.order,
		})),
		notes: invitationNotes.map((n) => ({
			id: n.id,
			title: n.title,
			description: n.description ?? undefined,
			order: n.order,
		})),
	};
}
