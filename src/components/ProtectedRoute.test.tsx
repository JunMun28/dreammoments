// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock useSession hook
const mockUseSession = vi.fn();

vi.mock("../lib/auth", () => ({
	useSession: () => mockUseSession(),
}));

// Mock TanStack Router's useNavigate
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => mockNavigate,
}));

// Import after mocks
import { ProtectedRoute } from "./ProtectedRoute";

describe("ProtectedRoute", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("shows loading state while session is pending", () => {
		mockUseSession.mockReturnValue({
			isPending: true,
			data: null,
		});

		render(
			<ProtectedRoute>
				<div>Protected Content</div>
			</ProtectedRoute>,
		);

		expect(screen.getByText(/Loading/i)).toBeDefined();
		expect(screen.queryByText("Protected Content")).toBeNull();
	});

	it("renders children when user is authenticated", () => {
		mockUseSession.mockReturnValue({
			isPending: false,
			data: {
				user: { id: "user-123", name: "Test User", email: "test@example.com" },
				session: { id: "session-123" },
			},
		});

		render(
			<ProtectedRoute>
				<div>Protected Content</div>
			</ProtectedRoute>,
		);

		expect(screen.getByText("Protected Content")).toBeDefined();
	});

	it("redirects to login when not authenticated", async () => {
		mockUseSession.mockReturnValue({
			isPending: false,
			data: null,
		});

		render(
			<ProtectedRoute>
				<div>Protected Content</div>
			</ProtectedRoute>,
		);

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith({
				to: "/login",
				replace: true,
			});
		});

		expect(screen.queryByText("Protected Content")).toBeNull();
	});

	it("redirects to custom path when specified", async () => {
		mockUseSession.mockReturnValue({
			isPending: false,
			data: null,
		});

		render(
			<ProtectedRoute redirectTo="/custom-login">
				<div>Protected Content</div>
			</ProtectedRoute>,
		);

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith({
				to: "/custom-login",
				replace: true,
			});
		});
	});

	it("renders custom loading component when provided", () => {
		mockUseSession.mockReturnValue({
			isPending: true,
			data: null,
		});

		render(
			<ProtectedRoute loadingFallback={<div>Custom Loading...</div>}>
				<div>Protected Content</div>
			</ProtectedRoute>,
		);

		expect(screen.getByText("Custom Loading...")).toBeDefined();
		expect(screen.queryByText("Protected Content")).toBeNull();
	});
});
