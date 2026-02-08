import { beforeEach, describe, expect, test } from "vitest";
import {
	addGuest,
	createInvitation,
	createUser,
	deleteInvitation,
	detectDeviceType,
	exportGuestsCsv,
	getAnalytics,
	getCurrentUser,
	getCurrentUserId,
	getDeviceBreakdown,
	getDietarySummary,
	getInvitationById,
	getInvitationBySlug,
	importGuests,
	listGuests,
	listInvitationsByUser,
	publishInvitation,
	recordAiGeneration,
	setCurrentUserId,
	setInvitationSlug,
	setInvitationVisibility,
	submitRsvp,
	trackInvitationView,
	unpublishInvitation,
	updateGuest,
	updateInvitation,
	updateInvitationContent,
	updateUser,
	updateUserPlan,
} from "../lib/data";
import { getStore, setStore } from "../lib/store";

describe("data module", () => {
	beforeEach(() => {
		// Reset store before each test
		setStore({
			users: [],
			invitations: [],
			guests: [],
			views: [],
			aiGenerations: [],
			payments: [],
			sessions: {},
			passwords: {},
			rateLimits: {},
		});
	});

	describe("User management", () => {
		test("createUser creates a new user", () => {
			const user = createUser({
				email: "test@example.com",
				name: "Test User",
				authProvider: "email",
			});

			expect(user.email).toBe("test@example.com");
			expect(user.name).toBe("Test User");
			expect(user.authProvider).toBe("email");
			expect(user.plan).toBe("free");
			expect(user.id).toBeDefined();
			expect(user.createdAt).toBeDefined();
			expect(user.updatedAt).toBeDefined();
		});

		test("createUser returns existing user if email already exists", () => {
			const user1 = createUser({
				email: "existing@example.com",
				name: "Original",
				authProvider: "email",
			});

			const user2 = createUser({
				email: "existing@example.com",
				name: "Duplicate",
				authProvider: "google",
			});

			expect(user1.id).toBe(user2.id);
		});

		test("getCurrentUserId returns empty string when no session", () => {
			expect(getCurrentUserId()).toBe("");
		});

		test("setCurrentUserId sets the current user", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			expect(getCurrentUserId()).toBe(user.id);
		});

		test("getCurrentUser returns undefined when no session", () => {
			setCurrentUserId(null);
			expect(getCurrentUser()).toBeUndefined();
		});

		test("getCurrentUser returns user when session exists", () => {
			const user = createUser({
				email: "test@example.com",
				name: "Test User",
				authProvider: "email",
			});

			const current = getCurrentUser();
			expect(current).toBeDefined();
			expect(current?.id).toBe(user.id);
		});

		test("updateUser updates user fields", () => {
			const user = createUser({
				email: "test@example.com",
				name: "Original",
				authProvider: "email",
			});

			updateUser(user.id, { name: "Updated" });

			const current = getCurrentUser();
			expect(current?.name).toBe("Updated");
		});

		test("updateUserPlan updates user plan", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			updateUserPlan(user.id, "premium");

			const current = getCurrentUser();
			expect(current?.plan).toBe("premium");
		});
	});

	describe("Invitation management", () => {
		test("createInvitation creates an invitation", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");

			expect(invitation.userId).toBe(user.id);
			expect(invitation.templateId).toBe("blush-romance");
			expect(invitation.status).toBe("draft");
			expect(invitation.content).toBeDefined();
			expect(invitation.content.hero).toBeDefined();
			expect(invitation.slug).toBeDefined();
		});

		test("listInvitationsByUser returns user's invitations", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			createInvitation(user.id, "blush-romance");
			createInvitation(user.id, "love-at-dusk");

			const invitations = listInvitationsByUser(user.id);
			expect(invitations).toHaveLength(2);
		});

		test("getInvitationById returns correct invitation", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const created = createInvitation(user.id, "blush-romance");
			const found = getInvitationById(created.id);

			expect(found?.id).toBe(created.id);
		});

		test("getInvitationById returns undefined for non-existent", () => {
			const found = getInvitationById("non-existent");
			expect(found).toBeUndefined();
		});

		test("getInvitationBySlug returns correct invitation", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const created = createInvitation(user.id, "blush-romance");
			const found = getInvitationBySlug(created.slug);

			expect(found?.id).toBe(created.id);
		});

		test("updateInvitation updates invitation fields", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			const updated = updateInvitation(invitation.id, { title: "New Title" });

			expect(updated?.title).toBe("New Title");
		});

		test("updateInvitationContent updates content", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			const newContent = { ...invitation.content, hero: { ...invitation.content.hero, partnerOneName: "Updated" } };
			const updated = updateInvitationContent(invitation.id, newContent);

			expect(updated?.content.hero.partnerOneName).toBe("Updated");
		});

		test("publishInvitation publishes an invitation", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			const published = publishInvitation(invitation.id);

			expect(published?.status).toBe("published");
			expect(published?.publishedAt).toBeDefined();
		});

		test("unpublishInvitation unpublishes an invitation", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			publishInvitation(invitation.id);
			const unpublished = unpublishInvitation(invitation.id);

			expect(unpublished?.status).toBe("draft");
			expect(unpublished?.publishedAt).toBeUndefined();
		});

		test("deleteInvitation removes invitation", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			deleteInvitation(invitation.id);

			const found = getInvitationById(invitation.id);
			expect(found).toBeUndefined();
		});

		test("setInvitationSlug updates slug", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			const updated = setInvitationSlug(invitation.id, "custom-slug");

			expect(updated?.slug).toBe("custom-slug");
		});

		test("setInvitationVisibility updates visibility", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			const updated = setInvitationVisibility(invitation.id, { hero: false, rsvp: true });

			expect(updated?.sectionVisibility.hero).toBe(false);
			expect(updated?.sectionVisibility.rsvp).toBe(true);
		});
	});

	describe("Guest management", () => {
		test("addGuest adds a guest", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			const guest = addGuest(invitation.id, { name: "John Doe" });

			expect(guest.name).toBe("John Doe");
			expect(guest.invitationId).toBe(invitation.id);
			expect(guest.guestCount).toBe(1);
		});

		test("submitRsvp adds guest RSVP", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			const guest = submitRsvp(
				invitation.id,
				{ name: "Jane Doe", attendance: "attending" },
				"visitor-123",
			);

			expect(guest.name).toBe("Jane Doe");
			expect(guest.attendance).toBe("attending");
		});

		test("submitRsvp throws for non-existent invitation", () => {
			expect(() => {
				submitRsvp("non-existent", { name: "Test" }, "visitor-123");
			}).toThrow("Invitation not found");
		});

		test("submitRsvp throws when guest count exceeds limit", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			expect(() => {
				submitRsvp(
					invitation.id,
					{ name: "Test", guestCount: 100 },
					"visitor-123",
				);
			}).toThrow("Guest count exceeds limit");
		});

		test("updateGuest updates guest fields", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			const guest = addGuest(invitation.id, { name: "Original" });
			updateGuest(guest.id, { name: "Updated" });

			const guests = listGuests(invitation.id);
			expect(guests[0].name).toBe("Updated");
		});

		test("listGuests returns all guests for invitation", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			addGuest(invitation.id, { name: "Guest 1" });
			addGuest(invitation.id, { name: "Guest 2" });

			const guests = listGuests(invitation.id);
			expect(guests).toHaveLength(2);
		});

		test("listGuests filters by attendance", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			addGuest(invitation.id, { name: "Guest 1", attendance: "attending" });
			addGuest(invitation.id, { name: "Guest 2", attendance: "not_attending" });
			addGuest(invitation.id, { name: "Guest 3" });

			const attending = listGuests(invitation.id, "attending");
			expect(attending).toHaveLength(1);
			expect(attending[0].name).toBe("Guest 1");

			const pending = listGuests(invitation.id, "pending");
			expect(pending).toHaveLength(1);
			expect(pending[0].name).toBe("Guest 3");
		});

		test("importGuests imports multiple guests", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			const guests = importGuests(invitation.id, [
				{ name: "Guest 1", email: "guest1@example.com" },
				{ name: "Guest 2", relationship: "Friend" },
			]);

			expect(guests).toHaveLength(2);
			expect(guests[0].name).toBe("Guest 1");
			expect(guests[1].name).toBe("Guest 2");
		});

		test("getDietarySummary aggregates dietary requirements", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			addGuest(invitation.id, { name: "Guest 1", dietaryRequirements: "Vegetarian" });
			addGuest(invitation.id, { name: "Guest 2", dietaryRequirements: "Vegetarian" });
			addGuest(invitation.id, { name: "Guest 3", dietaryRequirements: "This is a very long dietary requirement that exceeds the limit" });

			const summary = getDietarySummary(invitation.id);
			expect(summary.summary["Vegetarian"]).toBe(2);
			expect(summary.notes.length).toBe(1);
		});

		test("exportGuestsCsv generates valid CSV", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			addGuest(invitation.id, { name: "John Doe", attendance: "attending", guestCount: 2 });

			const csv = exportGuestsCsv(invitation.id);
			expect(csv).toContain("name,attendance,guest_count,dietary,message");
			expect(csv).toContain("John Doe");
			expect(csv).toContain("attending");
			expect(csv).toContain("2");
		});
	});

	describe("Analytics", () => {
		test("detectDeviceType detects mobile", () => {
			expect(detectDeviceType("Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)")).toBe("mobile");
			expect(detectDeviceType("Mozilla/5.0 (Android 10; Mobile)")).toBe("mobile");
		});

		test("detectDeviceType detects tablet", () => {
			expect(detectDeviceType("Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)")).toBe("tablet");
		});

		test("detectDeviceType defaults to desktop", () => {
			expect(detectDeviceType("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
			expect(detectDeviceType("")).toBe("desktop");
		});

		test("trackInvitationView creates a view", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			const view = trackInvitationView(invitation.id, "Mozilla/5.0", "https://referrer.com");

			expect(view.invitationId).toBe(invitation.id);
			expect(view.userAgent).toBe("Mozilla/5.0");
			expect(view.referrer).toBe("https://referrer.com");
			expect(view.visitorHash).toBeDefined();
			expect(view.deviceType).toBe("desktop");
		});

		test("getAnalytics returns correct data", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			trackInvitationView(invitation.id, "Mozilla/5.0");
			trackInvitationView(invitation.id, "Mozilla/5.0 (iPhone)");

			const analytics = getAnalytics(invitation.id);
			expect(analytics.totalViews).toBe(2);
			expect(analytics.uniqueVisitors).toBe(2);
			expect(analytics.viewsByDay.length).toBeGreaterThan(0);
		});

		test("getDeviceBreakdown returns device counts", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			trackInvitationView(invitation.id, "Mozilla/5.0 (iPhone)");
			trackInvitationView(invitation.id, "Mozilla/5.0 (iPhone)");
			trackInvitationView(invitation.id, "Mozilla/5.0 (iPad)");
			trackInvitationView(invitation.id, "Mozilla/5.0 (Windows)");

			const breakdown = getDeviceBreakdown(invitation.id);
			expect(breakdown.mobile).toBe(2);
			expect(breakdown.tablet).toBe(1);
			expect(breakdown.desktop).toBe(1);
		});
	});

	describe("AI Generation", () => {
		test("recordAiGeneration creates a generation record", () => {
			const user = createUser({
				email: "test@example.com",
				authProvider: "email",
			});

			const invitation = createInvitation(user.id, "blush-romance");
			const generation = recordAiGeneration(
				invitation.id,
				"story",
				"Generate a love story",
				{ milestones: [] },
			);

			expect(generation.invitationId).toBe(invitation.id);
			expect(generation.sectionId).toBe("story");
			expect(generation.prompt).toBe("Generate a love story");
			expect(generation.accepted).toBe(false);
		});
	});
});
