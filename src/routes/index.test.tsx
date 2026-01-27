// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { HomePage } from "./index";

// Mock window.matchMedia for SparkleEffect component
beforeAll(() => {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation((query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});
});

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
	Camera: () => <div data-testid="icon-camera" />,
	Heart: () => <div data-testid="icon-heart" />,
	Mail: () => <div data-testid="icon-mail" />,
	Monitor: () => <div data-testid="icon-monitor" />,
	Smartphone: () => <div data-testid="icon-smartphone" />,
	Sparkles: () => <div data-testid="icon-sparkles" />,
	ArrowLeft: () => <div data-testid="icon-arrow-left" />,
	ArrowRight: () => <div data-testid="icon-arrow-right" />,
	X: () => <div data-testid="icon-x" />,
}));

// Mock Link from tanstack router
vi.mock("@tanstack/react-router", () => ({
	Link: ({
		to,
		children,
		className,
		search,
	}: {
		to: string;
		children: React.ReactNode;
		className?: string;
		search?: Record<string, string>;
	}) => {
		const searchStr = search
			? `?${new URLSearchParams(search).toString()}`
			: "";
		return (
			<a href={`${to}${searchStr}`} className={className}>
				{children}
			</a>
		);
	},
	createFileRoute: () => (config: { component: React.ComponentType }) => config,
}));

// Mock radix-ui dialog for TemplateSelectionModal
vi.mock("@radix-ui/react-dialog", () => ({
	Root: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	Trigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	Overlay: () => null,
	Content: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dialog-content">{children}</div>
	),
	Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
	Description: ({ children }: { children: React.ReactNode }) => (
		<p>{children}</p>
	),
	Close: ({ children }: { children: React.ReactNode }) => (
		<button type="button">{children}</button>
	),
}));

// Mock embla-carousel-react
vi.mock("embla-carousel-react", () => ({
	default: () => [
		() => {},
		{
			canScrollPrev: () => false,
			canScrollNext: () => true,
			scrollPrev: () => {},
			scrollNext: () => {},
			on: () => {},
			off: () => {},
		},
	],
}));

describe("Index Route - Landing Page", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders the cinematic hero section", () => {
		render(<HomePage />);
		// Check for main headline
		expect(screen.getByText("Celebrate Love,")).toBeDefined();
		expect(screen.getByText("Honor Tradition")).toBeDefined();
		// Check for CTA buttons
		expect(screen.getByText("Begin Your Story")).toBeDefined();
		expect(screen.getByText("Explore the Design")).toBeDefined();
	});

	it("renders the template showcase section", () => {
		render(<HomePage />);
		// Check for template name
		expect(screen.getByText("Crimson Blessings")).toBeDefined();
		// Check for viewport toggle buttons
		expect(screen.getByText("Desktop")).toBeDefined();
		expect(screen.getByText("Mobile")).toBeDefined();
	});

	it("renders the gallery section", () => {
		render(<HomePage />);
		// Check for gallery header
		expect(screen.getByText("Your Love in Focus")).toBeDefined();
		expect(screen.getByText("Cherish Every Moment")).toBeDefined();
	});

	it("renders the emotional storytelling sections", () => {
		render(<HomePage />);
		// Check for storytelling headlines
		expect(screen.getByText("Your Love Story, Beautifully Told")).toBeDefined();
		expect(
			screen.getByText("Honoring Heritage, Embracing Tomorrow"),
		).toBeDefined();
		expect(screen.getByText("Every Detail Matters")).toBeDefined();
	});

	it("renders the simplified features section", () => {
		render(<HomePage />);
		// Check for features header
		expect(screen.getByText("Simple. Elegant. Complete.")).toBeDefined();
		// Check for feature titles
		expect(screen.getByText("Stunning Design")).toBeDefined();
		expect(screen.getByText("Easy RSVPs")).toBeDefined();
		expect(screen.getByText("Photo Memories")).toBeDefined();
	});

	it("renders the final CTA section", () => {
		render(<HomePage />);
		// Check for CTA headline
		expect(screen.getByText("Begin Your")).toBeDefined();
		expect(screen.getAllByText("Forever").length).toBeGreaterThan(0);
		// Check for CTA button
		expect(screen.getByText("Create Your Invitation")).toBeDefined();
	});

	it("renders the footer with branding", () => {
		render(<HomePage />);
		// Check for branding
		expect(screen.getByText("DreamMoments")).toBeDefined();
		expect(
			screen.getByText("Crafted with love for couples everywhere"),
		).toBeDefined();
	});
});
