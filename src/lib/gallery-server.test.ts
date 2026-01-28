import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock @tanstack/react-start
vi.mock("@tanstack/react-start", () => ({
	createServerFn: vi.fn(() => ({
		inputValidator: vi.fn(() => ({
			handler: vi.fn((fn) => fn),
		})),
	})),
}));

// Mock drizzle/db - defined before vi.mock (same pattern as invitation-server.test.ts)
const mockDb = {
	insert: vi.fn(),
	select: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
};

vi.mock("@/db/index", () => ({
	getDb: vi.fn(() => Promise.resolve(mockDb)),
}));

vi.mock("@/db/schema", () => ({
	galleryImages: {
		id: "galleryImages.id",
		invitationId: "galleryImages.invitationId",
		imageUrl: "galleryImages.imageUrl",
		caption: "galleryImages.caption",
		order: "galleryImages.order",
	},
}));

vi.mock("drizzle-orm", () => ({
	eq: vi.fn((a, b) => ({ eq: [a, b] })),
	asc: vi.fn((field) => ({ asc: field })),
	desc: vi.fn((field) => ({ desc: field })),
}));

import {
	addGalleryImageInternal,
	deleteGalleryImageInternal,
	getGalleryImagesInternal,
	reorderGalleryImagesInternal,
	updateGalleryImageInternal,
} from "./gallery-server";

describe("gallery-server", () => {
	const mockInvitationId = "inv-123";
	const mockImageId = "img-456";

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getGalleryImagesInternal", () => {
		it("returns empty array when no images exist", async () => {
			const mockFrom = vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					orderBy: vi.fn().mockResolvedValue([]),
				}),
			});
			(mockDb.select as ReturnType<typeof vi.fn>).mockReturnValue({
				from: mockFrom,
			});

			const result = await getGalleryImagesInternal(mockInvitationId);

			expect(result).toEqual([]);
			expect(mockDb.select).toHaveBeenCalled();
		});

		it("returns sorted images by order", async () => {
			const mockImages = [
				{
					id: "img-1",
					invitationId: mockInvitationId,
					imageUrl: "https://example.com/1.jpg",
					caption: "First",
					order: 0,
				},
				{
					id: "img-2",
					invitationId: mockInvitationId,
					imageUrl: "https://example.com/2.jpg",
					caption: null,
					order: 1,
				},
			];

			const mockFrom = vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					orderBy: vi.fn().mockResolvedValue(mockImages),
				}),
			});
			(mockDb.select as ReturnType<typeof vi.fn>).mockReturnValue({
				from: mockFrom,
			});

			const result = await getGalleryImagesInternal(mockInvitationId);

			expect(result).toHaveLength(2);
			expect(result[0].imageUrl).toBe("https://example.com/1.jpg");
		});
	});

	describe("addGalleryImageInternal", () => {
		it("adds a new image with next order", async () => {
			// Mock getting existing max order
			const mockFrom = vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					orderBy: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ order: 2 }]),
					}),
				}),
			});
			(mockDb.select as ReturnType<typeof vi.fn>).mockReturnValue({
				from: mockFrom,
			});

			// Mock insert
			const mockNewImage = {
				id: mockImageId,
				invitationId: mockInvitationId,
				imageUrl: "https://example.com/new.jpg",
				caption: "New caption",
				order: 3,
			};
			const mockReturning = vi.fn().mockResolvedValue([mockNewImage]);
			const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
			(mockDb.insert as ReturnType<typeof vi.fn>).mockReturnValue({
				values: mockValues,
			});

			const result = await addGalleryImageInternal({
				invitationId: mockInvitationId,
				imageUrl: "https://example.com/new.jpg",
				caption: "New caption",
			});

			expect(result.id).toBe(mockImageId);
			expect(result.order).toBe(3);
			expect(mockDb.insert).toHaveBeenCalled();
		});

		it("adds first image with order 0", async () => {
			// Mock getting no existing images
			const mockFrom = vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					orderBy: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]),
					}),
				}),
			});
			(mockDb.select as ReturnType<typeof vi.fn>).mockReturnValue({
				from: mockFrom,
			});

			// Mock insert
			const mockNewImage = {
				id: mockImageId,
				invitationId: mockInvitationId,
				imageUrl: "https://example.com/first.jpg",
				caption: null,
				order: 0,
			};
			const mockReturning = vi.fn().mockResolvedValue([mockNewImage]);
			const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
			(mockDb.insert as ReturnType<typeof vi.fn>).mockReturnValue({
				values: mockValues,
			});

			const result = await addGalleryImageInternal({
				invitationId: mockInvitationId,
				imageUrl: "https://example.com/first.jpg",
			});

			expect(result.order).toBe(0);
		});
	});

	describe("updateGalleryImageInternal", () => {
		it("updates image caption", async () => {
			const mockUpdatedImage = {
				id: mockImageId,
				invitationId: mockInvitationId,
				imageUrl: "https://example.com/1.jpg",
				caption: "Updated caption",
				order: 0,
			};

			const mockReturning = vi.fn().mockResolvedValue([mockUpdatedImage]);
			const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
			const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
			(mockDb.update as ReturnType<typeof vi.fn>).mockReturnValue({
				set: mockSet,
			});

			const result = await updateGalleryImageInternal({
				id: mockImageId,
				caption: "Updated caption",
			});

			expect(result).not.toBeNull();
			expect(result?.caption).toBe("Updated caption");
			expect(mockDb.update).toHaveBeenCalled();
		});

		it("returns null when image not found", async () => {
			const mockReturning = vi.fn().mockResolvedValue([]);
			const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
			const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
			(mockDb.update as ReturnType<typeof vi.fn>).mockReturnValue({
				set: mockSet,
			});

			const result = await updateGalleryImageInternal({
				id: "non-existent",
				caption: "test",
			});

			expect(result).toBeNull();
		});
	});

	describe("deleteGalleryImageInternal", () => {
		it("returns true when image is deleted", async () => {
			const mockReturning = vi.fn().mockResolvedValue([{ id: mockImageId }]);
			const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
			(mockDb.delete as ReturnType<typeof vi.fn>).mockReturnValue({
				where: mockWhere,
			});

			const result = await deleteGalleryImageInternal(mockImageId);

			expect(result).toBe(true);
			expect(mockDb.delete).toHaveBeenCalled();
		});

		it("returns false when image not found", async () => {
			const mockReturning = vi.fn().mockResolvedValue([]);
			const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
			(mockDb.delete as ReturnType<typeof vi.fn>).mockReturnValue({
				where: mockWhere,
			});

			const result = await deleteGalleryImageInternal("non-existent");

			expect(result).toBe(false);
		});
	});

	describe("reorderGalleryImagesInternal", () => {
		it("swaps order of two images when moving up", async () => {
			const mockImages = [
				{
					id: "img-1",
					invitationId: mockInvitationId,
					imageUrl: "a.jpg",
					order: 0,
				},
				{
					id: "img-2",
					invitationId: mockInvitationId,
					imageUrl: "b.jpg",
					order: 1,
				},
			];

			// Mock select for current image
			let selectCallCount = 0;
			const mockFrom = vi.fn().mockImplementation(() => {
				selectCallCount++;
				if (selectCallCount === 1) {
					// First call: get current image
					return {
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue([mockImages[1]]),
						}),
					};
				}
				// Second call: get all images
				return {
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue(mockImages),
					}),
				};
			});
			(mockDb.select as ReturnType<typeof vi.fn>).mockReturnValue({
				from: mockFrom,
			});

			// Mock update
			const mockWhere = vi.fn().mockResolvedValue([]);
			const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
			(mockDb.update as ReturnType<typeof vi.fn>).mockReturnValue({
				set: mockSet,
			});

			const result = await reorderGalleryImagesInternal({
				imageId: "img-2",
				direction: "up",
			});

			expect(result).toBe(true);
			expect(mockDb.update).toHaveBeenCalledTimes(2);
		});

		it("returns false when moving up from first position", async () => {
			const mockImages = [
				{
					id: "img-1",
					invitationId: mockInvitationId,
					imageUrl: "a.jpg",
					order: 0,
				},
			];

			let selectCallCount = 0;
			const mockFrom = vi.fn().mockImplementation(() => {
				selectCallCount++;
				if (selectCallCount === 1) {
					return {
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue([mockImages[0]]),
						}),
					};
				}
				return {
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue(mockImages),
					}),
				};
			});
			(mockDb.select as ReturnType<typeof vi.fn>).mockReturnValue({
				from: mockFrom,
			});

			const result = await reorderGalleryImagesInternal({
				imageId: "img-1",
				direction: "up",
			});

			expect(result).toBe(false);
		});

		it("returns false when image not found", async () => {
			const mockFrom = vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue([]),
				}),
			});
			(mockDb.select as ReturnType<typeof vi.fn>).mockReturnValue({
				from: mockFrom,
			});

			const result = await reorderGalleryImagesInternal({
				imageId: "non-existent",
				direction: "up",
			});

			expect(result).toBe(false);
		});
	});
});
