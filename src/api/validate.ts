import type { ZodSchema, z } from "zod";

export function parseInput<T extends ZodSchema>(
	schema: T,
	data: unknown,
): z.output<T> {
	const result = schema.safeParse(data);
	if (!result.success) {
		throw new Error(result.error.issues[0].message);
	}
	return result.data;
}
