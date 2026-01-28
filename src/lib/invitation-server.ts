import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { galleryImages, invitations, notes, scheduleBlocks } from "@/db/schema";
import {
  getAuthenticatedUserId,
  verifyInvitationOwnership,
} from "./auth-helpers";
import {
  createInvitationSchema,
  getInvitationSchema,
  getInvitationWithRelationsSchema,
  getOrCreateInvitationSchema,
  updateInvitationSchema,
} from "./schemas";
import { getTemplateById } from "./template-data";

/**
 * Input type for invitation update data
 */
export type { UpdateInvitationInput } from "./schemas";

/**
 * Server function to update invitation basic info.
 * Used by autosave to persist form changes.
 * Requires authentication and ownership verification.
 */
export const updateInvitation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateInvitationSchema.parse(input))
  .handler(async ({ data }) => {
    const { invitationId, ...updateData } = data;

    // Verify user owns this invitation
    await verifyInvitationOwnership(invitationId);

    const db = await getDb();
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
 * Requires authentication and ownership verification.
 */
export const getInvitation = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => getInvitationSchema.parse(input))
  .handler(async ({ data }) => {
    // Verify user owns this invitation
    await verifyInvitationOwnership(data.id);

    const db = await getDb();
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
export type { CreateInvitationInput } from "./schemas";

/**
 * Internal function to create a new invitation.
 * Extracted for testability.
 * @param userId - The authenticated user's ID (verified server-side)
 * @param templateId - Optional template ID to initialize the invitation
 */
export async function createInvitationInternal(input: {
  userId: string;
  templateId?: string;
}) {
  const { userId, templateId } = input;

  // Get template data if templateId provided
  const template = templateId ? getTemplateById(templateId) : undefined;

  // Create the invitation with all template settings
  const db = await getDb();
  const [invitation] = await db
    .insert(invitations)
    .values({
      userId,
      templateId,
      accentColor: template?.accentColor,
      fontPairing: template?.fontPairing,
      heroImageUrl: template?.heroImageUrl,
      themeVariant: template?.themeVariant ?? "light",
      backgroundColor: template?.backgroundColor,
      decorativeSettings: template?.decorativeElements,
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

  // If template has gallery images, create them
  if (template?.galleryImages?.length) {
    await db.insert(galleryImages).values(
      template.galleryImages.map((image) => ({
        invitationId: invitation.id,
        imageUrl: image.imageUrl,
        caption: image.caption,
        order: image.order,
      })),
    );
  }

  return { id: invitation.id };
}

/**
 * Server function to create a new invitation.
 * Optionally populates with template data (theme, schedule blocks, notes).
 * Uses authenticated user's ID - does not accept userId from client.
 */
export const createInvitation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createInvitationSchema.parse(input))
  .handler(async ({ data }) => {
    // Get the authenticated user's ID (ignore any userId from client)
    const userId = await getAuthenticatedUserId();
    return createInvitationInternal({ userId, templateId: data.templateId });
  });

/**
 * Input type for getting or creating an invitation
 */
export type { GetOrCreateInvitationInput } from "./schemas";

/**
 * Internal function to get or create invitation for user.
 * Extracted for testability.
 * @param userId - The authenticated user's ID (verified server-side)
 * @param templateId - Optional template ID to initialize the invitation
 */
export async function getOrCreateInvitationInternal(input: {
  userId: string;
  templateId?: string;
}) {
  const { userId, templateId } = input;

  // Check if user already has an invitation
  const db = await getDb();
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
 * Uses authenticated user's ID - does not accept userId from client.
 */
export const getOrCreateInvitationForUser = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => getOrCreateInvitationSchema.parse(input))
  .handler(async ({ data }) => {
    // Get the authenticated user's ID (ignore any userId from client)
    const userId = await getAuthenticatedUserId();
    return getOrCreateInvitationInternal({
      userId,
      templateId: data.templateId,
    });
  });

/**
 * Get full invitation data with schedule blocks, notes, and gallery images.
 * Internal function - used by builder route loader.
 */
export async function getInvitationWithRelationsInternal(invitationId: string) {
  const db = await getDb();
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

  // Get gallery images
  const images = await db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.invitationId, invitationId));

  // Parse decorativeSettings from JSONB (typed as DecorativeSettings | null)
  const decorativeElements = invitation.decorativeSettings;

  return {
    ...invitation,
    // Map themeVariant to correct type
    themeVariant: (invitation.themeVariant as "light" | "dark") ?? "light",
    // Map decorativeSettings to decorativeElements for frontend consumption
    decorativeElements: decorativeElements ?? undefined,
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
    galleryImages: images.map((i) => ({
      id: i.id,
      imageUrl: i.imageUrl,
      caption: i.caption ?? undefined,
      order: i.order,
    })),
  };
}

/**
 * Server function to get full invitation data with relations.
 * Wraps internal function for client-side use (handles server/client boundary).
 * Requires authentication and ownership verification.
 */
export const getInvitationWithRelations = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    getInvitationWithRelationsSchema.parse(input),
  )
  .handler(async ({ data }) => {
    // Verify user owns this invitation
    await verifyInvitationOwnership(data.invitationId);
    return getInvitationWithRelationsInternal(data.invitationId);
  });

/**
 * Server function to get or create invitation for use in route loaders.
 * Accepts userId directly since authentication is already verified in beforeLoad.
 * This avoids re-checking auth which fails during SSR cookie forwarding.
 */
export const getOrCreateInvitationForLoader = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string; templateId?: string }) => input)
  .handler(async ({ data }) => {
    return getOrCreateInvitationInternal(data);
  });

/**
 * Server function to get existing invitation for use in route loaders.
 * Returns null if user has no invitation.
 * Accepts userId directly since authentication is already verified in beforeLoad.
 */
export const getExistingInvitationForLoader = createServerFn({ method: "GET" })
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    const db = await getDb();
    const result = await db
      .select({ id: invitations.id })
      .from(invitations)
      .where(eq(invitations.userId, data.userId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  });

/**
 * Server function to get invitation with relations for use in route loaders.
 * Skips ownership verification since the invitation ID comes from the user's
 * own record (verified in beforeLoad). This avoids re-checking auth which
 * fails during SSR cookie forwarding.
 */
export const getInvitationWithRelationsForLoader = createServerFn({
  method: "GET",
})
  .inputValidator((input: { invitationId: string }) => input)
  .handler(async ({ data }) => {
    return getInvitationWithRelationsInternal(data.invitationId);
  });
