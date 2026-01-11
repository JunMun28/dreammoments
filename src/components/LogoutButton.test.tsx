// @vitest-environment jsdom

import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock auth module
const mockUseSession = vi.fn();
const mockSignOut = vi.fn();

vi.mock("../lib/auth", () => ({
	useSession: () => mockUseSession(),
	signOut: () => mockSignOut(),
}));

// Mock TanStack Router's useNavigate
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => mockNavigate,
}));

// Import after mocks
import { LogoutButton } from "./LogoutButton";

describe("LogoutButton", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSignOut.mockResolvedValue(undefined);
	});

	afterEach(() => {
		cleanup();
	});

	it("renders nothing when user is not authenticated", () => {
		mockUseSession.mockReturnValue({
			isPending: false,
			data: null,
		});

		const { container } = render(<LogoutButton />);
		expect(container.firstChild).toBeNull();
	});

	it("renders nothing while session is loading", () => {
		mockUseSession.mockReturnValue({
			isPending: true,
			data: null,
		});

		const { container } = render(<LogoutButton />);
		expect(container.firstChild).toBeNull();
	});

	it("renders logout button when authenticated", () => {
		mockUseSession.mockReturnValue({
			isPending: false,
			data: {
				user: { id: "user-123", name: "Test User", email: "test@example.com" },
				session: { id: "session-123" },
			},
		});

		render(<LogoutButton />);
		expect(
			screen.getByRole("button", { name: /sign out|logout/i }),
		).toBeDefined();
	});

	it("calls signOut when clicked", async () => {
		mockUseSession.mockReturnValue({
			isPending: false,
			data: {
				user: { id: "user-123", name: "Test User" },
				session: { id: "session-123" },
			},
		});

		render(<LogoutButton />);

		const button = screen.getByRole("button", { name: /sign out|logout/i });
		fireEvent.click(button);

		await waitFor(() => {
			expect(mockSignOut).toHaveBeenCalled();
		});
	});

	it("redirects to home page after logout", async () => {
		mockUseSession.mockReturnValue({
			isPending: false,
			data: {
				user: { id: "user-123", name: "Test User" },
				session: { id: "session-123" },
			},
		});

		render(<LogoutButton />);

		const button = screen.getByRole("button", { name: /sign out|logout/i });
		fireEvent.click(button);

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
		});
	});

	it("disables button while logging out", async () => {
		mockUseSession.mockReturnValue({
			isPending: false,
			data: {
				user: { id: "user-123", name: "Test User" },
				session: { id: "session-123" },
			},
		});

		// Make signOut take time to resolve
		let resolveSignOut: (() => void) | undefined;
		mockSignOut.mockImplementation(
			() =>
				new Promise<void>((resolve) => {
					resolveSignOut = resolve;
				}),
		);

		render(<LogoutButton />);

		const button = screen.getByRole("button", { name: /sign out|logout/i });
		fireEvent.click(button);

		// Button should be disabled while signing out
		await waitFor(() => {
			expect(button).toHaveProperty("disabled", true);
		});

		// Resolve the sign out
		resolveSignOut?.();

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
		});
	});
});
