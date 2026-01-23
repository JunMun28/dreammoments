import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { canvasStates } from "@/db/schema";

/**
 * Canvas data type (Fabric.js serialized format)
 * Using a more permissive type for JSONB storage
 */
// biome-ignore lint/suspicious/noExplicitAny: JSONB data can be any structure
export type CanvasData = Record<string, any>;

/**
 * Input type for saving canvas state
 */
export interface SaveCanvasStateInput {
	invitationId: string;
	canvasData: CanvasData;
}

/**
 * Internal function to save canvas state.
 * Uses upsert pattern (insert or update on conflict).
 * Extracted for testability.
 */
export async function saveCanvasStateInternal(input: SaveCanvasStateInput) {
	const { invitationId, canvasData } = input;

	const db = await getDb();

	// Upsert: insert new or update existing (unique constraint on invitationId)
	const result = await db
		.insert(canvasStates)
		.values({
			invitationId,
			canvasData,
		})
		.onConflictDoUpdate({
			target: canvasStates.invitationId,
			set: {
				canvasData,
				updatedAt: new Date(),
			},
		})
		.returning({ id: canvasStates.id });

	if (result.length === 0) {
		throw new Error("Failed to save canvas state");
	}

	return { success: true, id: result[0].id };
}

/**
 * Server function wrapper for saving canvas state.
 * Called by frontend auto-save with debounce.
 */
export const saveCanvasState = createServerFn({ method: "POST" })
	.inputValidator((input: SaveCanvasStateInput) => input)
	.handler(async ({ data }) => {
		return saveCanvasStateInternal(data);
	});

/**
 * Canvas state record type
 */
export interface CanvasStateRecord {
	id: string;
	invitationId: string;
	canvasData: CanvasData;
	version: number;
	createdAt: Date | null;
	updatedAt: Date | null;
}

/**
 * Internal function to get canvas state by invitation ID.
 * Extracted for testability.
 */
export async function getCanvasStateInternal(
	invitationId: string,
): Promise<CanvasStateRecord | null> {
	const db = await getDb();

	const result = await db
		.select()
		.from(canvasStates)
		.where(eq(canvasStates.invitationId, invitationId))
		.limit(1);

	if (result.length === 0) {
		return null;
	}

	// Cast the canvasData from unknown to CanvasData
	return {
		...result[0],
		canvasData: result[0].canvasData as CanvasData,
	};
}

/**
 * Server function wrapper for getting canvas state.
 * Used by route loader to restore canvas on page load.
 */
export const getCanvasState = createServerFn({ method: "GET" })
	.inputValidator((input: { invitationId: string }) => input)
	.handler(async ({ data }): Promise<CanvasStateRecord | null> => {
		return getCanvasStateInternal(data.invitationId);
	});
