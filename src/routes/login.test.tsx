// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authClient } from "../lib/auth";
import { Login } from "./login";

// Mock auth client
vi.mock("../lib/auth", () => ({
	authClient: {
		signIn: {
			social: vi.fn(),
		},
	},
}));

describe("Login Route", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("renders login button", () => {
		render(<Login />);
		expect(screen.getByText(/Sign in with Google/i)).toBeDefined();
	});

	it("calls sign in when button clicked", async () => {
		render(<Login />);
		const button = screen.getByText(/Sign in with Google/i).closest("button");
		if (button) fireEvent.click(button);
		expect(authClient.signIn.social).toHaveBeenCalledWith({
			provider: "google",
			callbackURL: "/",
		});
	});
});
