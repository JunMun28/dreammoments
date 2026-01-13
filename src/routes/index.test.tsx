// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "./index";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
	CalendarHeart: () => <div data-testid="icon-calendar-heart" />,
	Camera: () => <div data-testid="icon-camera" />,
	Heart: () => <div data-testid="icon-heart" />,
	Mail: () => <div data-testid="icon-mail" />,
	Palette: () => <div data-testid="icon-palette" />,
	Sparkles: () => <div data-testid="icon-sparkles" />,
	Users: () => <div data-testid="icon-users" />,
}));

// Mock Link from tanstack router
vi.mock("@tanstack/react-router", () => ({
	Link: ({
		to,
		children,
		className,
	}: {
		to: string;
		children: React.ReactNode;
		className?: string;
	}) => (
		<a href={to} className={className}>
			{children}
		</a>
	),
	createFileRoute: () => (config: { component: React.ComponentType }) => config,
}));

describe("Index Route", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders DreamMoments home page correctly", () => {
		render(<HomePage />);
		// Check for branding
		expect(screen.getAllByText("DreamMoments").length).toBeGreaterThan(0);
		// Check for main headline
		expect(screen.getByText("Your love story,")).toBeDefined();
		expect(screen.getByText("beautifully invited")).toBeDefined();
		// Check for template section
		expect(screen.getByText("Choose Your Perfect Template")).toBeDefined();
		// Check for features
		expect(screen.getByText("Beautiful Templates")).toBeDefined();
		expect(screen.getByText("Easy Guest Management")).toBeDefined();
	});
});
