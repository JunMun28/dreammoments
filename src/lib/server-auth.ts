import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { eq } from "drizzle-orm";
import { getDbOrNull, schema } from "@/db/index";
import type { User } from "./types";

/**
 * Verify the Clerk session and return the authenticated user from DB.
 * Creates a DB record on first encounter (just-in-time sync).
 */
export async function requireAuth(): Promise<{ userId: string; user: User }> {
	const { userId: clerkUserId } = await auth();
	if (!clerkUserId) {
		throw new Error("Authentication required");
	}

	const db = getDbOrNull();
	if (!db) throw new Error("Database connection required");

	// Look up existing user by Clerk ID
	const [existing] = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.clerkId, clerkUserId));

	if (existing) {
		return {
			userId: existing.id,
			user: dbRowToUser(existing),
		};
	}

	// First encounter — create user from Clerk profile
	const clerkUser = await clerkClient().users.getUser(clerkUserId);
	const email =
		clerkUser.emailAddresses.find(
			(e) => e.id === clerkUser.primaryEmailAddressId,
		)?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

	if (!email) throw new Error("No email found on Clerk user");

	const [created] = await db
		.insert(schema.users)
		.values({
			clerkId: clerkUserId,
			email,
			name:
				[clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
				undefined,
			avatarUrl: clerkUser.imageUrl || undefined,
			plan: "free",
		})
		.returning();

	return {
		userId: created.id,
		user: dbRowToUser(created),
	};
}

function dbRowToUser(row: typeof schema.users.$inferSelect): User {
	return {
		id: row.id,
		clerkId: row.clerkId,
		email: row.email,
		name: row.name ?? undefined,
		avatarUrl: row.avatarUrl ?? undefined,
		plan: (row.plan as "free" | "premium") ?? "free",
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}
