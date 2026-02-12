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
		expect(markup).toContain("Your Love Story");
		expect(markup).toContain("Cinema Quality.");
		expect(markup).toContain("Create Your Invitation");
		expect(markup).toContain("View Examples");
		expect(markup).toContain("The Digital Wedding Experience");
		expect(markup).toContain("movie trailer for your life together");
	});

	test("renders template cards", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Garden Romance");
		expect(markup).toContain("Love at Dusk");
		expect(markup).toContain("Eternal Elegance");
		expect(markup).toContain("The Collection");
		expect(markup).toContain("Choose Your Style");
	});

	test("renders social proof section", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Loved by Couples");
		expect(markup).toContain("Adored by Guests.");
		expect(markup).toContain("Vogue");
		expect(markup).toContain("Tatler");
	});

	test("renders timeline steps", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("From idea to invitation in minutes.");
		expect(markup).toContain("Sign up in seconds");
		expect(markup).toContain("Pick your template");
		expect(markup).toContain("Let AI write your story");
		expect(markup).toContain("Customize &amp; Personalize");
		expect(markup).toContain("Share with one tap");
	});

	test("renders features section", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("AI-Powered Storytelling");
		expect(markup).toContain("Bilingual Support");
		expect(markup).toContain("One-Tap RSVP");
		expect(markup).toContain("Guest Dashboard");
		expect(markup).toContain("Digital Ang Bao");
		expect(markup).toContain("Everything you need for the");
	});

	test("renders pricing section", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Simple, transparent pricing.");
		expect(markup).toContain("RM0");
		expect(markup).toContain("RM49");
		expect(markup).toContain("Popular");
	});

	test("renders final CTA section", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Your Forever");
		expect(markup).toContain("Starts Here.");
		expect(markup).toContain("Create Your Invitation");
	});
});
