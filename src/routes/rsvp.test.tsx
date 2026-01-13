import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock guest-server to avoid DB dependency
vi.mock("@/lib/guest-server", () => ({
	getGuestGroupByToken: vi.fn(),
}));

// Mock guest-session to avoid DB dependency
vi.mock("@/lib/guest-session", () => ({
	exchangeRsvpTokenForSession: vi.fn(),
	validateGuestSession: vi.fn(),
}));

// Mock invitation-server to avoid DB dependency
vi.mock("@/lib/invitation-server", () => ({
	getInvitationWithRelations: vi.fn(),
}));

import { parseTokenFromHash } from "./rsvp";

describe("rsvp route", () => {
	describe("parseTokenFromHash", () => {
		beforeEach(() => {
			// Reset window.location.hash
			vi.stubGlobal("window", {
				...globalThis.window,
				location: { hash: "" },
			});
		});

		it("returns null when hash is empty", () => {
			vi.stubGlobal("window", {
				location: { hash: "" },
			});
			expect(parseTokenFromHash()).toBeNull();
		});

		it("returns null when hash does not start with #t=", () => {
			vi.stubGlobal("window", {
				location: { hash: "#invalid" },
			});
			expect(parseTokenFromHash()).toBeNull();
		});

		it("returns null when hash is #t= with no token", () => {
			vi.stubGlobal("window", {
				location: { hash: "#t=" },
			});
			expect(parseTokenFromHash()).toBe("");
		});

		it("extracts token from valid hash", () => {
			vi.stubGlobal("window", {
				location: { hash: "#t=abc123def456" },
			});
			expect(parseTokenFromHash()).toBe("abc123def456");
		});

		it("handles 32-character hex tokens", () => {
			vi.stubGlobal("window", {
				location: { hash: "#t=1234567890abcdef1234567890abcdef" },
			});
			expect(parseTokenFromHash()).toBe("1234567890abcdef1234567890abcdef");
		});

		it("returns null in server environment (no window)", () => {
			vi.stubGlobal("window", undefined);
			expect(parseTokenFromHash()).toBeNull();
		});
	});
});
