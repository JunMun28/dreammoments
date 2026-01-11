// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Header from "./Header";

// Mock icons to avoid issues and simplify snapshots if used
vi.mock("lucide-react", () => ({
	Menu: () => <div data-testid="icon-menu" />,
	X: () => <div data-testid="icon-x" />,
	Home: () => <div data-testid="icon-home" />,
	ChevronDown: () => <div data-testid="icon-chevron-down" />,
	ChevronRight: () => <div data-testid="icon-chevron-right" />,
	ClipboardType: () => <div data-testid="icon-clipboard" />,
	Database: () => <div data-testid="icon-database" />,
	Network: () => <div data-testid="icon-network" />,
	SquareFunction: () => <div data-testid="icon-square-function" />,
	StickyNote: () => <div data-testid="icon-sticky-note" />,
	LogOut: () => <div data-testid="icon-logout" />,
}));

// Mock auth module for LogoutButton
vi.mock("../lib/auth", () => ({
	useSession: () => ({ isPending: false, data: null }),
	signOut: vi.fn(),
}));

// Mock Link and useNavigate from tanstack router
vi.mock("@tanstack/react-router", () => ({
	Link: ({
		to,
		children,
		className,
		onClick,
	}: {
		to: string;
		children: React.ReactNode;
		className?: string;
		onClick?: () => void;
	}) => (
		<a href={to} className={className} onClick={onClick}>
			{children}
		</a>
	),
	useNavigate: () => vi.fn(),
}));

describe("Header component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders header with logo and menu button", () => {
		render(<Header />);
		const logo = screen.getByAltText(/TanStack Logo/i);
		expect(logo).toBeDefined();
		const menuButton = screen.getByLabelText(/Open menu/i);
		expect(menuButton).toBeDefined();
	});

	it("opens sidebar when menu button is clicked", () => {
		render(<Header />);
		const menuButton = screen.getByLabelText(/Open menu/i);
		fireEvent.click(menuButton);

		// Check if close button is visible (meaning sidebar is open)
		const closeButton = screen.getByLabelText(/Close menu/i);
		expect(closeButton).toBeDefined();

		// Check for navigation links
		expect(screen.getByText("Home")).toBeDefined();
		expect(screen.getByText("Drizzle")).toBeDefined();
	});

	it("closes sidebar when close button is clicked", () => {
		render(<Header />);
		// Open first
		fireEvent.click(screen.getByLabelText(/Open menu/i));
		// Close
		fireEvent.click(screen.getByLabelText(/Close menu/i));

		// Sidebar uses transform, so it's still in document but presumably hidden visually or by class
		// In this test implementation we verify the class change
		const sidebar = screen.getByRole("complementary"); // aside tag
		expect(sidebar.className).toContain("-translate-x-full");
	});

	it("toggles grouped expanded links", () => {
		render(<Header />);
		fireEvent.click(screen.getByLabelText(/Open menu/i));

		// Find shared projects expand button (ChevronRight)
		const expandButton = screen
			.getByTestId("icon-chevron-right")
			.closest("button");
		expect(expandButton).toBeDefined();

		// Click to expand
		if (expandButton) fireEvent.click(expandButton);

		// Check if sub-items are visible
		expect(screen.getByText("Full SSR")).toBeDefined();
		expect(screen.getByTestId("icon-chevron-down")).toBeDefined();
	});
});
