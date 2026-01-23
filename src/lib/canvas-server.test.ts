import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	getCanvasStateInternal,
	saveCanvasStateInternal,
} from "./canvas-server";

// Mock database
vi.mock("@/db/index", () => ({
	getDb: vi.fn(),
}));

import { getDb } from "@/db/index";

const mockDb = {
	select: vi.fn().mockReturnThis(),
	from: vi.fn().mockReturnThis(),
	where: vi.fn().mockReturnThis(),
	limit: vi.fn().mockReturnThis(),
	insert: vi.fn().mockReturnThis(),
	values: vi.fn().mockReturnThis(),
	onConflictDoUpdate: vi.fn().mockReturnThis(),
	returning: vi.fn(),
};

describe("canvas-server", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getDb).mockResolvedValue(
			mockDb as unknown as Awaited<ReturnType<typeof getDb>>,
		);
	});

	describe("saveCanvasStateInternal", () => {
		it("saves new canvas state when none exists", async () => {
			const canvasData = { objects: [], background: "#ffffff" };
			const savedRecord = {
				id: "canvas-state-123",
				invitationId: "inv-456",
				canvasData,
				version: 1,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockDb.returning.mockResolvedValue([savedRecord]);

			const result = await saveCanvasStateInternal({
				invitationId: "inv-456",
				canvasData,
			});

			expect(result).toEqual({ success: true, id: "canvas-state-123" });
			expect(mockDb.insert).toHaveBeenCalled();
			expect(mockDb.onConflictDoUpdate).toHaveBeenCalled();
		});

		it("updates existing canvas state via upsert", async () => {
			const canvasData = { objects: [{ type: "rect" }], background: "#ffffff" };
			const updatedRecord = {
				id: "canvas-state-123",
				invitationId: "inv-456",
				canvasData,
				version: 1,
				updatedAt: new Date(),
			};

			mockDb.returning.mockResolvedValue([updatedRecord]);

			const result = await saveCanvasStateInternal({
				invitationId: "inv-456",
				canvasData,
			});

			expect(result).toEqual({ success: true, id: "canvas-state-123" });
		});

		it("throws error when save fails", async () => {
			mockDb.returning.mockResolvedValue([]);

			await expect(
				saveCanvasStateInternal({
					invitationId: "inv-456",
					canvasData: { objects: [] },
				}),
			).rejects.toThrow("Failed to save canvas state");
		});

		it("preserves all canvas data including nested objects", async () => {
			const complexCanvasData = {
				version: "6.0.0",
				objects: [
					{
						type: "rect",
						left: 100,
						top: 100,
						width: 150,
						height: 100,
						fill: "#c4a373",
						angle: 45,
					},
					{
						type: "i-text",
						text: "Wedding Day",
						fontSize: 24,
						fontFamily: "serif",
					},
				],
				background: "#ffffff",
			};

			const savedRecord = {
				id: "canvas-state-123",
				invitationId: "inv-456",
				canvasData: complexCanvasData,
				version: 1,
			};

			mockDb.returning.mockResolvedValue([savedRecord]);

			const result = await saveCanvasStateInternal({
				invitationId: "inv-456",
				canvasData: complexCanvasData,
			});

			expect(result.success).toBe(true);
		});
	});

	describe("getCanvasStateInternal", () => {
		it("returns canvas state when found", async () => {
			const canvasData = { objects: [], background: "#ffffff" };
			const canvasState = {
				id: "canvas-state-123",
				invitationId: "inv-456",
				canvasData,
				version: 1,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockDb.limit.mockResolvedValue([canvasState]);

			const result = await getCanvasStateInternal("inv-456");

			expect(result).toEqual(canvasState);
			expect(mockDb.select).toHaveBeenCalled();
			expect(mockDb.where).toHaveBeenCalled();
		});

		it("returns null when canvas state not found", async () => {
			mockDb.limit.mockResolvedValue([]);

			const result = await getCanvasStateInternal("non-existent-id");

			expect(result).toBeNull();
		});

		it("returns full canvas data with all element properties", async () => {
			const fullCanvasData = {
				version: "6.0.0",
				objects: [
					{
						type: "rect",
						left: 100,
						top: 100,
						width: 150,
						height: 100,
						fill: "#c4a373",
						stroke: "#8b7355",
						strokeWidth: 2,
						angle: 0,
						scaleX: 1,
						scaleY: 1,
					},
				],
				background: "#ffffff",
			};

			const canvasState = {
				id: "canvas-state-123",
				invitationId: "inv-456",
				canvasData: fullCanvasData,
				version: 1,
			};

			mockDb.limit.mockResolvedValue([canvasState]);

			const result = await getCanvasStateInternal("inv-456");

			expect(result?.canvasData).toEqual(fullCanvasData);
		});
	});
});
