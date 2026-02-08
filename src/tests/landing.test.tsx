import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { Landing } from "../routes/index";

type MockLinkProps = ComponentPropsWithoutRef<"a"> & { children?: ReactNode };

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, ...props }: MockLinkProps) => <a {...props}>{children}</a>,
	createFileRoute: () => () => ({}),
}));

describe("landing page", () => {
	test("renders hero headline", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Wedding invitations that feel like");
		expect(markup).toContain("home.");
		expect(markup).toContain("Get Started Free");
		expect(markup).toContain("View Templates");
		expect(markup).toContain("your love story, softly told");
		expect(markup).toContain("The collection");
		expect(markup).toContain("From sign up to RSVPs in 5 steps");
		expect(markup).toContain("Sign up");
		expect(markup).toContain("Choose a template");
		expect(markup).toContain("Personalize your details");
		expect(markup).toContain("Publish and share");
		expect(markup).toContain("Collect RSVPs");
		expect(markup).toContain("gentle features");
	});

	test("renders three collection cards", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Sage morning");
		expect(markup).toContain("Velvet dusk");
		expect(markup).toContain("Peach haze");
	});

	test("renders feature pills in hero", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Tactile textures");
		expect(markup).toContain("Fluid motion");
		expect(markup).toContain("Guest ease");
		expect(markup).toContain("One-tap RSVP");
	});
});
