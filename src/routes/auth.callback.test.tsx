// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock auth client
vi.mock("../lib/auth", () => ({
	getSession: vi.fn(),
}));

// Mock user-sync
vi.mock("../lib/user-sync", () => ({
	syncUserFromNeonAuth: vi.fn(),
}));

// Mock TanStack Router
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => () => ({}),
	useNavigate: () => mockNavigate,
	useSearch: () => ({ redirect: undefined }),
}));

import { getSession } from "../lib/auth";
import { syncUserFromNeonAuth } from "../lib/user-sync";
import { AuthCallback } from "./auth.callback";

describe("AuthCallback", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders loading state initially", () => {
		vi.mocked(getSession).mockReturnValue(new Promise(() => {})); // Never resolves
		render(<AuthCallback />);
		expect(screen.getByText("Completing sign in...")).toBeDefined();
	});

	it("redirects to home when authenticated successfully", async () => {
		vi.mocked(getSession).mockResolvedValue({
			data: {
				user: { id: "user-123", email: "test@example.com" },
				session: { id: "session-123" },
			},
			error: null,
		});
		vi.mocked(syncUserFromNeonAuth).mockResolvedValue({
			id: "local-user-123",
			neonAuthId: "user-123",
			email: "test@example.com",
		});

		render(<AuthCallback />);

		await waitFor(() => {
			expect(syncUserFromNeonAuth).toHaveBeenCalledWith({
				data: {
					neonAuthId: "user-123",
					email: "test@example.com",
				},
			});
		});

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
		});
	});

	it("redirects to login when no session found", async () => {
		vi.mocked(getSession).mockResolvedValue({
			data: null,
			error: null,
		});

		render(<AuthCallback />);

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith({ to: "/login" });
		});
	});

	it("shows error message when sync fails", async () => {
		vi.mocked(getSession).mockResolvedValue({
			data: {
				user: { id: "user-123", email: "test@example.com" },
				session: { id: "session-123" },
			},
			error: null,
		});
		vi.mocked(syncUserFromNeonAuth).mockRejectedValue(
			new Error("Database error"),
		);

		render(<AuthCallback />);

		await waitFor(() => {
			expect(
				screen.getByText("Something went wrong during sign in."),
			).toBeDefined();
		});
	});
});
