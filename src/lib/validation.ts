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

export const deleteGuestSchema = z.object({
	guestId: z.string().min(1, "guestId is required"),
	invitationId: z.string().min(1, "invitationId is required"),
	userId: z.string().min(1, "userId is required"),
});

export type DeleteGuestInput = z.infer<typeof deleteGuestSchema>;

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
	search: z.string().optional(),
	relationship: z.string().optional(),
});

export type ListGuestsInput = z.infer<typeof listGuestsSchema>;

export const bulkUpdateGuestsSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	userId: z.string().min(1, "userId is required"),
	updates: z
		.array(
			z.object({
				guestId: z.string().min(1, "guestId is required"),
				name: z.string().optional(),
				attendance: z
					.enum(["attending", "not_attending", "undecided"])
					.optional(),
				guestCount: z.number().int().min(1).max(20).optional(),
				dietaryRequirements: z.string().optional(),
			}),
		)
		.min(1)
		.max(100),
});

export type BulkUpdateGuestsInput = z.infer<typeof bulkUpdateGuestsSchema>;

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
	visitorKey: z.string().min(1).optional(),
});

export type TrackViewInput = z.infer<typeof trackViewSchema>;

// ── AI schemas ─────────────────────────────────────────────────────

export const listAiGenerationsSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	token: z.string().min(1, "Token is required"),
});

export type ListAiGenerationsInput = z.infer<typeof listAiGenerationsSchema>;

// ── Invitation content schema ───────────────────────────────────────

export const invitationContentSchema = z.object({
	hero: z.object({
		partnerOneName: z.string(),
		partnerTwoName: z.string(),
		tagline: z.string(),
		date: z.string(),
		heroImageUrl: z.string().optional(),
		avatarImageUrl: z.string().optional(),
		avatarStyle: z.enum(["pixar", "ghibli"]).optional(),
		animatedVideoUrl: z.string().optional(),
	}),
	announcement: z.object({
		title: z.string(),
		message: z.string(),
		formalText: z.string(),
	}),
	couple: z.object({
		partnerOne: z.object({
			fullName: z.string(),
			bio: z.string(),
			photoUrl: z.string().optional(),
		}),
		partnerTwo: z.object({
			fullName: z.string(),
			bio: z.string(),
			photoUrl: z.string().optional(),
		}),
	}),
	story: z.object({
		milestones: z.array(
			z.object({
				date: z.string(),
				title: z.string(),
				description: z.string(),
				photoUrl: z.string().optional(),
			}),
		),
	}),
	gallery: z.object({
		photos: z.array(
			z.object({
				url: z.string(),
				caption: z.string().optional(),
			}),
		),
	}),
	schedule: z.object({
		events: z.array(
			z.object({
				time: z.string(),
				title: z.string(),
				description: z.string(),
				icon: z.string().optional(),
			}),
		),
	}),
	venue: z.object({
		name: z.string(),
		address: z.string(),
		coordinates: z.object({
			lat: z.number(),
			lng: z.number(),
		}),
		directions: z.string(),
		parkingInfo: z.string().optional(),
	}),
	entourage: z.object({
		members: z.array(
			z.object({
				role: z.string(),
				name: z.string(),
			}),
		),
	}),
	registry: z.object({
		title: z.string(),
		note: z.string(),
	}),
	rsvp: z.object({
		deadline: z.string(),
		allowPlusOnes: z.boolean(),
		maxPlusOnes: z.number(),
		dietaryOptions: z.array(z.string()),
		customMessage: z.string(),
	}),
	faq: z.object({
		items: z.array(
			z.object({
				question: z.string(),
				answer: z.string(),
			}),
		),
	}),
	footer: z.object({
		message: z.string(),
		socialLinks: z
			.object({
				instagram: z.string().optional(),
				hashtag: z.string().optional(),
			})
			.optional(),
	}),
	details: z.object({
		scheduleSummary: z.string(),
		venueSummary: z.string(),
	}),
	calendar: z.object({
		dateLabel: z.string(),
		message: z.string(),
	}),
	countdown: z.object({
		targetDate: z.string(),
	}),
	gift: z
		.object({
			paymentUrl: z.string(),
			paymentMethod: z.enum(["duitnow", "paynow", "tng"]),
			recipientName: z.string().optional(),
		})
		.optional(),
	musicUrl: z.string().optional(),
});

export type InvitationContentInput = z.infer<typeof invitationContentSchema>;
