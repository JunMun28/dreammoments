import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TemplateData } from "./template-data";

// Mock drizzle/db - use vi.hoisted to define mocks that can be referenced in vi.mock
const { mockInsert, mockSelect, mockUpdate, mockTransaction } = vi.hoisted(
	() => ({
		mockInsert: vi.fn(),
		mockSelect: vi.fn(),
		mockUpdate: vi.fn(),
		mockTransaction: vi.fn(),
	}),
);

vi.mock("@/db/index", () => ({
	db: {
		insert: mockInsert,
		select: mockSelect,
		update: mockUpdate,
		transaction: mockTransaction,
	},
}));

vi.mock("@/db/schema", () => ({
	invitations: { id: "invitations.id", userId: "invitations.userId" },
	scheduleBlocks: {
		id: "scheduleBlocks.id",
		invitationId: "scheduleBlocks.invitationId",
	},
	notes: { id: "notes.id", invitationId: "notes.invitationId" },
}));

vi.mock("drizzle-orm", () => ({
	eq: vi.fn((a, b) => ({ eq: [a, b] })),
}));

// Mock template-data
vi.mock("./template-data", () => ({
	getTemplateById: vi.fn(),
}));

import { db } from "@/db/index";
import {
	createInvitationInternal,
	getOrCreateInvitationInternal,
} from "./invitation-server";
import { getTemplateById } from "./template-data";

describe("createInvitationInternal", () => {
	const mockUserId = "user-123";
	const mockInvitationId = "inv-456";

	beforeEach(() => {
		vi.clearAllMocks();
		// Set up transaction to call callback with mock tx
		mockTransaction.mockImplementation(async (callback) => {
			const tx = {
				insert: mockInsert,
				select: mockSelect,
				update: mockUpdate,
			};
			return await callback(tx);
		});
	});

	describe("without template", () => {
		it("creates a blank invitation for user", async () => {
			const mockReturning = vi
				.fn()
				.mockResolvedValue([{ id: mockInvitationId }]);
			const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
			(db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
				values: mockValues,
			});

			const result = await createInvitationInternal({ userId: mockUserId });

			expect(db.insert).toHaveBeenCalled();
			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: mockUserId,
				}),
			);
			expect(result).toEqual({ id: mockInvitationId });
		});
	});

	describe("with template", () => {
		const mockTemplate: TemplateData = {
			id: "classic-elegance",
			name: "Classic Elegance",
			description: "Timeless design",
			accentColor: "#b76e79",
			fontPairing: "classic",
			preview: {
				partner1Name: "Sarah",
				partner2Name: "Michael",
				weddingDate: new Date("2026-06-15"),
				weddingTime: "16:00",
				venueName: "The Grand Ballroom",
				venueAddress: "123 Elegant Avenue, New York, NY 10001",
				scheduleBlocks: [
					{
						id: "ce-1",
						title: "Ceremony",
						time: "16:00",
						description: "Join us",
						order: 0,
					},
				],
				notes: [
					{
						id: "ce-n1",
						title: "Dress Code",
						description: "Black tie",
						order: 0,
					},
				],
			},
		};

		it("creates invitation with template theme data", async () => {
			(getTemplateById as ReturnType<typeof vi.fn>).mockReturnValue(
				mockTemplate,
			);
			const mockReturning = vi
				.fn()
				.mockResolvedValue([{ id: mockInvitationId }]);
			const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
			(db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
				values: mockValues,
			});

			const result = await createInvitationInternal({
				userId: mockUserId,
				templateId: "classic-elegance",
			});

			expect(getTemplateById).toHaveBeenCalledWith("classic-elegance");
			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: mockUserId,
					templateId: "classic-elegance",
					accentColor: "#b76e79",
					fontPairing: "classic",
				}),
			);
			expect(result).toEqual({ id: mockInvitationId });
		});

		it("creates schedule blocks from template", async () => {
			(getTemplateById as ReturnType<typeof vi.fn>).mockReturnValue(
				mockTemplate,
			);
			const mockInvitationReturning = vi
				.fn()
				.mockResolvedValue([{ id: mockInvitationId }]);
			const mockScheduleReturning = vi.fn().mockResolvedValue([]);
			const mockInvitationValues = vi
				.fn()
				.mockReturnValue({ returning: mockInvitationReturning });
			const mockScheduleValues = vi
				.fn()
				.mockReturnValue({ returning: mockScheduleReturning });

			let insertCallCount = 0;
			(db.insert as ReturnType<typeof vi.fn>).mockImplementation(() => {
				insertCallCount++;
				if (insertCallCount === 1) {
					return { values: mockInvitationValues };
				}
				return { values: mockScheduleValues };
			});

			await createInvitationInternal({
				userId: mockUserId,
				templateId: "classic-elegance",
			});

			// Second insert should be for schedule blocks
			expect(db.insert).toHaveBeenCalledTimes(3); // invitation + schedule + notes
		});

		it("creates notes from template", async () => {
			(getTemplateById as ReturnType<typeof vi.fn>).mockReturnValue(
				mockTemplate,
			);
			const mockReturning = vi
				.fn()
				.mockResolvedValue([{ id: mockInvitationId }]);
			const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
			(db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
				values: mockValues,
			});

			await createInvitationInternal({
				userId: mockUserId,
				templateId: "classic-elegance",
			});

			// Third insert should be for notes
			expect(db.insert).toHaveBeenCalledTimes(3);
		});

		it("handles unknown template gracefully", async () => {
			(getTemplateById as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
			const mockReturning = vi
				.fn()
				.mockResolvedValue([{ id: mockInvitationId }]);
			const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
			(db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
				values: mockValues,
			});

			const result = await createInvitationInternal({
				userId: mockUserId,
				templateId: "unknown-template",
			});

			// Should still create invitation, just without template data
			expect(mockValues).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: mockUserId,
					templateId: "unknown-template",
				}),
			);
			expect(result).toEqual({ id: mockInvitationId });
		});
	});
});

describe("getOrCreateInvitationInternal", () => {
	const mockUserId = "user-123";
	const mockInvitationId = "inv-456";

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns existing invitation if user has one", async () => {
		(db.select as ReturnType<typeof vi.fn>).mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue([{ id: mockInvitationId }]),
				}),
			}),
		});

		const result = await getOrCreateInvitationInternal({
			userId: mockUserId,
		});

		expect(result.id).toBe(mockInvitationId);
		expect(result.isNew).toBe(false);
	});

	it("creates new invitation if user has none", async () => {
		// First call for select - no results
		(db.select as ReturnType<typeof vi.fn>).mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue([]),
				}),
			}),
		});

		// Insert call
		const mockReturning = vi.fn().mockResolvedValue([{ id: mockInvitationId }]);
		const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
		(db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
			values: mockValues,
		});

		const result = await getOrCreateInvitationInternal({
			userId: mockUserId,
			templateId: "classic-elegance",
		});

		expect(result.id).toBe(mockInvitationId);
		expect(result.isNew).toBe(true);
	});
});
