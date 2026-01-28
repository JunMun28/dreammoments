/**
 * Utility functions for list operations in the invitation builder.
 */

/**
 * Generate a unique ID with a prefix.
 * Used for schedule blocks, notes, gallery images, etc.
 */
export function generateId(prefix: string): string {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Sort items by their order field (ascending).
 * Creates a new sorted array without mutating the original.
 *
 * @param items - The list of items with order field
 * @returns A new array sorted by order
 */
export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
	return [...items].sort((a, b) => a.order - b.order);
}

/**
 * Move an item in a list up or down by swapping order values.
 * Items must have `id` and `order` properties.
 *
 * @param items - The list of items
 * @param id - The ID of the item to move
 * @param direction - "up" or "down"
 * @returns A new array with updated order values, or the original if move is invalid
 */
export function moveItemInList<T extends { id: string; order: number }>(
	items: T[],
	id: string,
	direction: "up" | "down",
): T[] {
	if (items.length < 2) return items;

	// Sort items by order to find adjacent items
	const sorted = [...items].sort((a, b) => a.order - b.order);
	const currentIndex = sorted.findIndex((item) => item.id === id);

	if (currentIndex === -1) return items;

	// Determine target index
	const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

	// Check bounds
	if (targetIndex < 0 || targetIndex >= sorted.length) return items;

	// Swap order values
	const currentItem = sorted[currentIndex];
	const targetItem = sorted[targetIndex];
	const currentOrder = currentItem.order;
	const targetOrder = targetItem.order;

	return items.map((item) => {
		if (item.id === currentItem.id) return { ...item, order: targetOrder };
		if (item.id === targetItem.id) return { ...item, order: currentOrder };
		return item;
	});
}

/**
 * Add an item to a list with auto-generated ID and order.
 *
 * @param items - The existing list
 * @param newItem - The item to add (without id and order)
 * @param idPrefix - Prefix for the generated ID
 * @returns A new array with the added item
 */
export function addItemToList<T extends { id: string; order: number }>(
	items: T[],
	newItem: Omit<T, "id" | "order">,
	idPrefix: string,
): T[] {
	const maxOrder =
		items.length > 0 ? Math.max(...items.map((i) => i.order)) : -1;
	const fullItem = {
		...newItem,
		id: generateId(idPrefix),
		order: maxOrder + 1,
	} as T;
	return [...items, fullItem];
}

/**
 * Update an item in a list by ID.
 *
 * @param items - The list of items
 * @param id - The ID of the item to update
 * @param updates - Partial updates to apply
 * @returns A new array with the updated item
 */
export function updateItemInList<T extends { id: string }>(
	items: T[],
	id: string,
	updates: Partial<T>,
): T[] {
	return items.map((item) => (item.id === id ? { ...item, ...updates } : item));
}

/**
 * Remove an item from a list by ID.
 *
 * @param items - The list of items
 * @param id - The ID of the item to remove
 * @returns A new array without the removed item
 */
export function removeItemFromList<T extends { id: string }>(
	items: T[],
	id: string,
): T[] {
	return items.filter((item) => item.id !== id);
}
