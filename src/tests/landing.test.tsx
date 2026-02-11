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
		expect(markup).toContain("AI-POWERED INVITATIONS");
		expect(markup).toContain("囍");
		expect(markup).toContain("AI-Powered");
	});

	test("renders four template cards", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Garden Romance");
		expect(markup).toContain("Love at Dusk");
		expect(markup).toContain("Blush Romance");
		expect(markup).toContain("Eternal Elegance");
		expect(markup).toContain("THE COLLECTION");
	});

	test("renders social proof section", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Couples &amp; counting");
		expect(markup).toContain("Average rating");
		expect(markup).toContain("Minutes to set up");
		expect(markup).toContain("tea ceremony");
	});

	test("renders timeline steps", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Five steps to your perfect invitation.");
		expect(markup).toContain("Sign up in seconds");
		expect(markup).toContain("Pick your template");
		expect(markup).toContain("Let AI write your story");
		expect(markup).toContain("Make it yours");
		expect(markup).toContain("Share &amp; track RSVPs");
	});

	test("renders features section", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("AI-Powered Content");
		expect(markup).toContain("Chinese Wedding Customs");
		expect(markup).toContain("One-Tap RSVP");
		expect(markup).toContain("Real-Time Dashboard");
		expect(markup).toContain("WhatsApp Share");
		expect(markup).toContain("WHY DREAMMOMENTS");
	});

	test("renders pricing section", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("SIMPLE PRICING");
		expect(markup).toContain("RM0");
		expect(markup).toContain("RM49");
		expect(markup).toContain("Most Popular");
	});

	test("renders final CTA section", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Your love story awaits");
		expect(markup).toContain("Create an invitation your guests will");
		expect(markup).toContain("treasure.");
	});
});
