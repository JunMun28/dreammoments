import { describe, expect, test } from "vitest";
import {
	createInvitationSchema,
	deleteInvitationSchema,
	exportGuestsSchema,
	getPublicInvitationSchema,
	guestImportItemSchema,
	guestImportSchema,
	listGuestsSchema,
	publishInvitationSchema,
	submitRsvpSchema,
	trackViewSchema,
	unpublishInvitationSchema,
	updateGuestSchema,
	updateInvitationSchema,
} from "../lib/validation";

describe("createInvitationSchema", () => {
	test("accepts valid input", () => {
		const result = createInvitationSchema.safeParse({
			userId: "user-123",
			templateId: "template-456",
		});
		expect(result.success).toBe(true);
	});

	test("rejects empty userId", () => {
		const result = createInvitationSchema.safeParse({
			userId: "",
			templateId: "template-456",
		});
		expect(result.success).toBe(false);
	});

	test("rejects missing userId", () => {
		const result = createInvitationSchema.safeParse({
			templateId: "template-456",
		});
		expect(result.success).toBe(false);
	});

	test("rejects empty templateId", () => {
		const result = createInvitationSchema.safeParse({
			userId: "user-123",
			templateId: "",
		});
		expect(result.success).toBe(false);
	});
});

describe("updateInvitationSchema", () => {
	test("accepts valid minimal input", () => {
		const result = updateInvitationSchema.safeParse({
			invitationId: "inv-123",
			userId: "user-456",
		});
		expect(result.success).toBe(true);
	});

	test("accepts valid full input", () => {
		const result = updateInvitationSchema.safeParse({
			invitationId: "inv-123",
			userId: "user-456",
			title: "My Wedding",
			content: { hero: { partnerOneName: "John" } },
			sectionVisibility: { hero: true, rsvp: false },
			designOverrides: { color: "#fff" },
			status: "published",
		});
		expect(result.success).toBe(true);
	});

	test("rejects invalid status", () => {
		const result = updateInvitationSchema.safeParse({
			invitationId: "inv-123",
			userId: "user-456",
			status: "invalid-status",
		});
		expect(result.success).toBe(false);
	});

	test("accepts all valid statuses", () => {
		for (const status of ["draft", "published", "archived"]) {
			const result = updateInvitationSchema.safeParse({
				invitationId: "inv-123",
				userId: "user-456",
				status,
			});
			expect(result.success).toBe(true);
		}
	});
});

describe("publishInvitationSchema", () => {
	test("accepts valid minimal input", () => {
		const result = publishInvitationSchema.safeParse({
			invitationId: "inv-123",
			userId: "user-456",
		});
		expect(result.success).toBe(true);
	});

	test("accepts with optional slug", () => {
		const result = publishInvitationSchema.safeParse({
			invitationId: "inv-123",
			userId: "user-456",
			slug: "my-wedding",
		});
		expect(result.success).toBe(true);
	});

	test("accepts with randomize flag", () => {
		const result = publishInvitationSchema.safeParse({
			invitationId: "inv-123",
			userId: "user-456",
			randomize: true,
		});
		expect(result.success).toBe(true);
	});
});

describe("deleteInvitationSchema", () => {
	test("accepts valid input", () => {
		const result = deleteInvitationSchema.safeParse({
			invitationId: "inv-123",
			userId: "user-456",
		});
		expect(result.success).toBe(true);
	});
});

describe("unpublishInvitationSchema", () => {
	test("accepts valid input", () => {
		const result = unpublishInvitationSchema.safeParse({
			invitationId: "inv-123",
			userId: "user-456",
		});
		expect(result.success).toBe(true);
	});
});

describe("submitRsvpSchema", () => {
	test("accepts valid minimal input", () => {
		const result = submitRsvpSchema.safeParse({
			invitationId: "inv-123",
			name: "John Doe",
			visitorKey: "visitor-789",
		});
		expect(result.success).toBe(true);
	});

	test("accepts valid full input", () => {
		const result = submitRsvpSchema.safeParse({
			invitationId: "inv-123",
			name: "John Doe",
			email: "john@example.com",
			phone: "+1234567890",
			relationship: "Friend",
			attendance: "attending",
			guestCount: 2,
			dietaryRequirements: "Vegetarian",
			message: "Excited to attend!",
			visitorKey: "visitor-789",
		});
		expect(result.success).toBe(true);
	});

	test("rejects invalid email", () => {
		const result = submitRsvpSchema.safeParse({
			invitationId: "inv-123",
			name: "John Doe",
			email: "not-an-email",
			visitorKey: "visitor-789",
		});
		expect(result.success).toBe(false);
	});

	test("rejects empty name", () => {
		const result = submitRsvpSchema.safeParse({
			invitationId: "inv-123",
			name: "",
			visitorKey: "visitor-789",
		});
		expect(result.success).toBe(false);
	});

	test("rejects invalid attendance", () => {
		const result = submitRsvpSchema.safeParse({
			invitationId: "inv-123",
			name: "John Doe",
			attendance: "maybe",
			visitorKey: "visitor-789",
		});
		expect(result.success).toBe(false);
	});

	test("accepts all valid attendance values", () => {
		for (const attendance of ["attending", "not_attending", "undecided"]) {
			const result = submitRsvpSchema.safeParse({
				invitationId: "inv-123",
				name: "John Doe",
				attendance,
				visitorKey: "visitor-789",
			});
			expect(result.success).toBe(true);
		}
	});

	test("rejects guestCount below 1", () => {
		const result = submitRsvpSchema.safeParse({
			invitationId: "inv-123",
			name: "John Doe",
			guestCount: 0,
			visitorKey: "visitor-789",
		});
		expect(result.success).toBe(false);
	});

	test("rejects guestCount above 20", () => {
		const result = submitRsvpSchema.safeParse({
			invitationId: "inv-123",
			name: "John Doe",
			guestCount: 21,
			visitorKey: "visitor-789",
		});
		expect(result.success).toBe(false);
	});

	test("defaults guestCount to 1", () => {
		const result = submitRsvpSchema.safeParse({
			invitationId: "inv-123",
			name: "John Doe",
			visitorKey: "visitor-789",
		});
		if (result.success) {
			expect(result.data.guestCount).toBe(1);
		}
	});

	test("rejects message over 500 chars", () => {
		const result = submitRsvpSchema.safeParse({
			invitationId: "inv-123",
			name: "John Doe",
			message: "a".repeat(501),
			visitorKey: "visitor-789",
		});
		expect(result.success).toBe(false);
	});
});

describe("updateGuestSchema", () => {
	test("accepts valid minimal input", () => {
		const result = updateGuestSchema.safeParse({
			guestId: "guest-123",
			userId: "user-456",
			invitationId: "inv-789",
		});
		expect(result.success).toBe(true);
	});

	test("accepts valid full input", () => {
		const result = updateGuestSchema.safeParse({
			guestId: "guest-123",
			userId: "user-456",
			invitationId: "inv-789",
			name: "Updated Name",
			email: "updated@example.com",
			phone: "+9876543210",
			relationship: "Family",
			attendance: "not_attending",
			guestCount: 3,
			dietaryRequirements: "Vegan",
			message: "Sorry can't make it",
		});
		expect(result.success).toBe(true);
	});
});

describe("guestImportItemSchema", () => {
	test("accepts valid minimal input", () => {
		const result = guestImportItemSchema.safeParse({
			name: "John Doe",
		});
		expect(result.success).toBe(true);
	});

	test("accepts valid full input", () => {
		const result = guestImportItemSchema.safeParse({
			name: "John Doe",
			email: "john@example.com",
			phone: "+1234567890",
			relationship: "Friend",
		});
		expect(result.success).toBe(true);
	});

	test("rejects empty name", () => {
		const result = guestImportItemSchema.safeParse({
			name: "",
			email: "john@example.com",
		});
		expect(result.success).toBe(false);
	});

	test("rejects invalid email", () => {
		const result = guestImportItemSchema.safeParse({
			name: "John Doe",
			email: "not-an-email",
		});
		expect(result.success).toBe(false);
	});
});

describe("guestImportSchema", () => {
	test("accepts valid input", () => {
		const result = guestImportSchema.safeParse({
			invitationId: "inv-123",
			userId: "user-456",
			guests: [{ name: "John Doe" }, { name: "Jane Doe" }],
		});
		expect(result.success).toBe(true);
	});

	test("rejects empty guests array", () => {
		const result = guestImportSchema.safeParse({
			invitationId: "inv-123",
			userId: "user-456",
			guests: [],
		});
		expect(result.success).toBe(false);
	});

	test("rejects guests with invalid items", () => {
		const result = guestImportSchema.safeParse({
			invitationId: "inv-123",
			userId: "user-456",
			guests: [{ name: "Valid" }, { name: "" }],
		});
		expect(result.success).toBe(false);
	});
});

describe("listGuestsSchema", () => {
	test("accepts valid minimal input", () => {
		const result = listGuestsSchema.safeParse({
			invitationId: "inv-123",
			userId: "user-456",
		});
		expect(result.success).toBe(true);
	});

	test("accepts valid filter", () => {
		for (const filter of ["attending", "not_attending", "undecided", "pending"]) {
			const result = listGuestsSchema.safeParse({
				invitationId: "inv-123",
				userId: "user-456",
				filter,
			});
			expect(result.success).toBe(true);
		}
	});

	test("rejects invalid filter", () => {
		const result = listGuestsSchema.safeParse({
			invitationId: "inv-123",
			userId: "user-456",
			filter: "invalid",
		});
		expect(result.success).toBe(false);
	});
});

describe("exportGuestsSchema", () => {
	test("accepts valid input", () => {
		const result = exportGuestsSchema.safeParse({
			invitationId: "inv-123",
			userId: "user-456",
		});
		expect(result.success).toBe(true);
	});
});

describe("getPublicInvitationSchema", () => {
	test("accepts valid input", () => {
		const result = getPublicInvitationSchema.safeParse({
			slug: "my-wedding",
		});
		expect(result.success).toBe(true);
	});

	test("rejects empty slug", () => {
		const result = getPublicInvitationSchema.safeParse({
			slug: "",
		});
		expect(result.success).toBe(false);
	});
});

describe("trackViewSchema", () => {
	test("accepts valid minimal input", () => {
		const result = trackViewSchema.safeParse({
			invitationId: "inv-123",
		});
		expect(result.success).toBe(true);
	});

	test("accepts valid full input", () => {
		const result = trackViewSchema.safeParse({
			invitationId: "inv-123",
			userAgent: "Mozilla/5.0",
			referrer: "https://example.com",
		});
		expect(result.success).toBe(true);
	});

	test("defaults userAgent to empty string", () => {
		const result = trackViewSchema.safeParse({
			invitationId: "inv-123",
		});
		if (result.success) {
			expect(result.data.userAgent).toBe("");
		}
	});
});
