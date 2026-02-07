import { z } from "zod";

// ── Invitation schemas ──────────────────────────────────────────────

export const createInvitationSchema = z.object({
	userId: z.string().min(1, "userId is required"),
	templateId: z.string().min(1, "templateId is required"),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export const updateInvitationSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	userId: z.string().min(1, "userId is required"),
	title: z.string().optional(),
	content: z.record(z.string(), z.unknown()).optional(),
	sectionVisibility: z.record(z.string(), z.boolean()).optional(),
	designOverrides: z.record(z.string(), z.unknown()).optional(),
	status: z.enum(["draft", "published", "archived"]).optional(),
});

export type UpdateInvitationInput = z.infer<typeof updateInvitationSchema>;

export const publishInvitationSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	userId: z.string().min(1, "userId is required"),
	slug: z.string().optional(),
	randomize: z.boolean().optional(),
});

export type PublishInvitationInput = z.infer<typeof publishInvitationSchema>;

export const deleteInvitationSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	userId: z.string().min(1, "userId is required"),
});

export type DeleteInvitationInput = z.infer<typeof deleteInvitationSchema>;

export const unpublishInvitationSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	userId: z.string().min(1, "userId is required"),
});

export type UnpublishInvitationInput = z.infer<
	typeof unpublishInvitationSchema
>;

// ── RSVP / Guest schemas ────────────────────────────────────────────

export const submitRsvpSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email").optional(),
	phone: z.string().optional(),
	relationship: z.string().optional(),
	attendance: z.enum(["attending", "not_attending", "undecided"]).optional(),
	guestCount: z.number().int().min(1).max(20).default(1),
	dietaryRequirements: z.string().optional(),
	message: z.string().max(500).optional(),
	visitorKey: z.string().min(1, "visitorKey is required"),
});

export type SubmitRsvpInput = z.infer<typeof submitRsvpSchema>;

export const updateGuestSchema = z.object({
	guestId: z.string().min(1, "guestId is required"),
	userId: z.string().min(1, "userId is required"),
	invitationId: z.string().min(1, "invitationId is required"),
	name: z.string().optional(),
	email: z.string().email("Invalid email").optional(),
	phone: z.string().optional(),
	relationship: z.string().optional(),
	attendance: z.enum(["attending", "not_attending", "undecided"]).optional(),
	guestCount: z.number().int().min(1).max(20).optional(),
	dietaryRequirements: z.string().optional(),
	message: z.string().max(500).optional(),
});

export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;

export const guestImportItemSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email").optional(),
	phone: z.string().optional(),
	relationship: z.string().optional(),
});

export const guestImportSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	userId: z.string().min(1, "userId is required"),
	guests: z.array(guestImportItemSchema).min(1, "At least one guest required"),
});

export type GuestImportInput = z.infer<typeof guestImportSchema>;

export const listGuestsSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	userId: z.string().min(1, "userId is required"),
	filter: z
		.enum(["attending", "not_attending", "undecided", "pending"])
		.optional(),
});

export type ListGuestsInput = z.infer<typeof listGuestsSchema>;

export const exportGuestsSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	userId: z.string().min(1, "userId is required"),
});

export type ExportGuestsInput = z.infer<typeof exportGuestsSchema>;

// ── Public schemas ──────────────────────────────────────────────────

export const getPublicInvitationSchema = z.object({
	slug: z.string().min(1, "slug is required"),
});

export type GetPublicInvitationInput = z.infer<
	typeof getPublicInvitationSchema
>;

export const trackViewSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	userAgent: z.string().default(""),
	referrer: z.string().optional(),
});

export type TrackViewInput = z.infer<typeof trackViewSchema>;
