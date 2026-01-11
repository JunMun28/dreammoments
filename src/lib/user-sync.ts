import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { users } from "@/db/schema";

interface SyncUserInput {
	neonAuthId: string;
	email: string;
}

interface User {
	id: string;
	neonAuthId: string | null;
	email: string;
}

/**
 * Syncs a Neon Auth user to the local users table.
 * Creates a new user if the neonAuthId doesn't exist.
 * Updates email if it has changed for existing users.
 *
 * @param input - The Neon Auth user data (neonAuthId and email)
 * @returns The local user record
 */
export async function syncUserFromNeonAuth(
	input: SyncUserInput,
): Promise<User> {
	const { neonAuthId, email: rawEmail } = input;

	if (!neonAuthId) {
		throw new Error("neonAuthId is required");
	}
	if (!rawEmail) {
		throw new Error("email is required");
	}

	const email = rawEmail.toLowerCase();

	// Check if user exists by neonAuthId
	const existingUsers = await db
		.select()
		.from(users)
		.where(eq(users.neonAuthId, neonAuthId));

	if (existingUsers.length > 0) {
		const existingUser = existingUsers[0];

		// Update email if changed
		if (existingUser.email !== email) {
			const [updatedUser] = await db
				.update(users)
				.set({ email })
				.where(eq(users.neonAuthId, neonAuthId))
				.returning();
			return updatedUser as User;
		}

		return existingUser as User;
	}

	// Create new user
	const [newUser] = await db
		.insert(users)
		.values({ neonAuthId, email })
		.returning();

	return newUser as User;
}
