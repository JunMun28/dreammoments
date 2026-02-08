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
	test("renders hero headline and CTAs", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Beautiful invitations your guests will");
		expect(markup).toContain("remember.");
		expect(markup).toContain("Create Your Invitation");
		expect(markup).toContain("Browse Templates");
		expect(markup).toContain("Made for Chinese Weddings");
		expect(markup).toContain("囍");
		expect(markup).toContain("AI-Powered");
	});

	test("renders four template cards", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Garden Romance");
		expect(markup).toContain("Love at Dusk");
		expect(markup).toContain("Blush Romance");
		expect(markup).toContain("Eternal Elegance");
		expect(markup).toContain("The Collection");
	});

	test("renders social proof section", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("500+");
		expect(markup).toContain("4.9/5");
		expect(markup).toContain("&lt; 3 min");
		expect(markup).toContain("tea ceremony");
	});

	test("renders timeline steps", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("From sign up to RSVPs in 5 steps");
		expect(markup).toContain("Sign up in seconds");
		expect(markup).toContain("Pick your template");
		expect(markup).toContain("Let AI write your story");
		expect(markup).toContain("Make it yours");
		expect(markup).toContain("Share &amp; track RSVPs");
	});

	test("renders features section", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("AI-Powered Content");
		expect(markup).toContain("Built for Chinese Weddings");
		expect(markup).toContain("One-Tap RSVP");
		expect(markup).toContain("Real-Time Dashboard");
		expect(markup).toContain("Beautiful on Every Screen");
		expect(markup).toContain("Why DreamMoments");
	});

	test("renders pricing section", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Simple Pricing");
		expect(markup).toContain("RM0");
		expect(markup).toContain("RM49");
		expect(markup).toContain("Most Popular");
	});

	test("renders final CTA section", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Your love story awaits");
		expect(markup).toContain("Create an invitation your guests will treasure.");
	});
});
