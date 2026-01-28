/**
 * Server functions for personal element collection
 * CRUD operations for saved canvas elements
 */

import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { savedElements } from "@/db/schema";
import { getAuthenticatedUserId } from "./auth-helpers";

// ============================================================================
// TYPES
// ============================================================================

export type ElementType = "text" | "image" | "shape" | "group";

export interface SavedElementData {
  id: string;
  userId: string;
  name: string;
  elementType: ElementType;
  elementData: Record<string, any>;
  thumbnailUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface CreateElementInput {
  name: string;
  elementType: ElementType;
  // biome-ignore lint/suspicious/noExplicitAny: JSONB data can be any structure
  elementData: Record<string, any>;
  thumbnailUrl?: string | null;
}

export interface UpdateElementInput {
  id: string;
  name?: string;
  // biome-ignore lint/suspicious/noExplicitAny: JSONB data can be any structure
  elementData?: Record<string, any>;
  thumbnailUrl?: string | null;
}

export interface DeleteElementInput {
  id: string;
}

// ============================================================================
// INTERNAL FUNCTIONS (for testing)
// ============================================================================

/**
 * Get all saved elements for the current user
 */
export async function getSavedElementsInternal(
  userId: string,
): Promise<SavedElementData[]> {
  const db = await getDb();

  const elements = await db
    .select()
    .from(savedElements)
    .where(eq(savedElements.userId, userId))
    .orderBy(desc(savedElements.createdAt));

  return elements.map((el) => ({
    id: el.id,
    userId: el.userId,
    name: el.name,
    elementType: el.elementType as ElementType,
    elementData: el.elementData as Record<string, any>,
    thumbnailUrl: el.thumbnailUrl,
    createdAt: el.createdAt,
    updatedAt: el.updatedAt,
  }));
}

/**
 * Get a single saved element by ID
 */
export async function getSavedElementInternal(
  id: string,
  userId: string,
): Promise<SavedElementData | null> {
  const db = await getDb();

  const [element] = await db
    .select()
    .from(savedElements)
    .where(eq(savedElements.id, id))
    .limit(1);

  if (!element || element.userId !== userId) {
    return null;
  }

  return {
    id: element.id,
    userId: element.userId,
    name: element.name,
    elementType: element.elementType as ElementType,
    elementData: element.elementData as Record<string, any>,
    thumbnailUrl: element.thumbnailUrl,
    createdAt: element.createdAt,
    updatedAt: element.updatedAt,
  };
}

/**
 * Create a new saved element
 */
export async function createSavedElementInternal(
  userId: string,
  data: CreateElementInput,
): Promise<SavedElementData> {
  const db = await getDb();

  const [newElement] = await db
    .insert(savedElements)
    .values({
      userId,
      name: data.name,
      elementType: data.elementType,
      elementData: data.elementData,
      thumbnailUrl: data.thumbnailUrl || null,
    })
    .returning();

  return {
    id: newElement.id,
    userId: newElement.userId,
    name: newElement.name,
    elementType: newElement.elementType as ElementType,
    elementData: newElement.elementData as Record<string, any>,
    thumbnailUrl: newElement.thumbnailUrl,
    createdAt: newElement.createdAt,
    updatedAt: newElement.updatedAt,
  };
}

/**
 * Update a saved element
 */
export async function updateSavedElementInternal(
  userId: string,
  data: UpdateElementInput,
): Promise<SavedElementData | null> {
  const db = await getDb();

  // Verify ownership
  const existing = await getSavedElementInternal(data.id, userId);
  if (!existing) {
    return null;
  }

  const updates: Partial<{
    name: string;
    elementData: Record<string, any>;
    thumbnailUrl: string | null;
    updatedAt: Date;
  }> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) {
    updates.name = data.name;
  }
  if (data.elementData !== undefined) {
    updates.elementData = data.elementData;
  }
  if (data.thumbnailUrl !== undefined) {
    updates.thumbnailUrl = data.thumbnailUrl;
  }

  const [updated] = await db
    .update(savedElements)
    .set(updates)
    .where(eq(savedElements.id, data.id))
    .returning();

  return {
    id: updated.id,
    userId: updated.userId,
    name: updated.name,
    elementType: updated.elementType as ElementType,
    elementData: updated.elementData as Record<string, any>,
    thumbnailUrl: updated.thumbnailUrl,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

/**
 * Delete a saved element
 */
export async function deleteSavedElementInternal(
  userId: string,
  id: string,
): Promise<boolean> {
  const db = await getDb();

  // Verify ownership
  const existing = await getSavedElementInternal(id, userId);
  if (!existing) {
    return false;
  }

  const result = await db
    .delete(savedElements)
    .where(eq(savedElements.id, id))
    .returning();

  return result.length > 0;
}

// ============================================================================
// SERVER FUNCTIONS
// ============================================================================

/**
 * Get all saved elements for current user
 */
export const getSavedElements = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await getAuthenticatedUserId();
    return getSavedElementsInternal(userId);
  },
);

/**
 * Get a single saved element
 */
export const getSavedElement = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const userId = await getAuthenticatedUserId();
    return getSavedElementInternal(data.id, userId);
  });

/**
 * Create a new saved element
 */
export const createSavedElement = createServerFn({ method: "POST" })
  .inputValidator((input: CreateElementInput) => input)
  .handler(async ({ data }) => {
    const userId = await getAuthenticatedUserId();
    return createSavedElementInternal(userId, data);
  });

/**
 * Update a saved element
 */
export const updateSavedElement = createServerFn({ method: "POST" })
  .inputValidator((input: UpdateElementInput) => input)
  .handler(async ({ data }) => {
    const userId = await getAuthenticatedUserId();
    return updateSavedElementInternal(userId, data);
  });

/**
 * Delete a saved element
 */
export const deleteSavedElement = createServerFn({ method: "POST" })
  .inputValidator((input: DeleteElementInput) => input)
  .handler(async ({ data }) => {
    const userId = await getAuthenticatedUserId();
    return deleteSavedElementInternal(userId, data.id);
  });
