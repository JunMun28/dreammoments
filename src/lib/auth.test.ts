// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseSession = vi.fn();
const mockGetSession = vi.fn();
const mockSignOut = vi.fn();
const mockSignIn = { social: vi.fn() };

vi.mock("@neondatabase/auth", () => ({
	createAuthClient: vi.fn().mockReturnValue({
		signIn: mockSignIn,
		useSession: mockUseSession,
		getSession: mockGetSession,
		signOut: mockSignOut,
	}),
}));

vi.mock("@neondatabase/auth/react", () => ({
	BetterAuthReactAdapter: vi.fn(),
}));

describe("Auth Lib", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("exports useSession from authClient", async () => {
		const { useSession } = await import("./auth");
		expect(useSession).toBe(mockUseSession);
	});

	it("exports getSession from authClient", async () => {
		const { getSession } = await import("./auth");
		expect(getSession).toBe(mockGetSession);
	});

	it("exports signOut from authClient", async () => {
		const { signOut } = await import("./auth");
		expect(signOut).toBe(mockSignOut);
	});

	it("exports authClient with signIn methods", async () => {
		const { authClient } = await import("./auth");
		expect(authClient.signIn).toBe(mockSignIn);
	});
});
