import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import {
	HERO_VIDEO_MP4,
	HERO_VIDEO_POSTER,
	HERO_VIDEO_WEBM,
	Landing,
} from "../routes/index";

type MockLinkProps = ComponentPropsWithoutRef<"a"> & { children?: ReactNode };

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, ...props }: MockLinkProps) => <a {...props}>{children}</a>,
	createFileRoute: () => () => ({}),
}));

describe("landing page", () => {
	test("renders hero headline", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("More than an invitation.");
		expect(markup).toContain("cinematic");
		expect(markup).toContain("remembered.");
		expect(markup).toContain("Start Free Trial");
		expect(markup).toContain("See Real Invites");
		expect(markup).toContain("data-hero-film");
		expect(markup).toContain("data-hero-filmstrip");
		expect(markup).toContain("data-hero-proof");
		expect(markup).toContain("The Collection");
		expect(markup).toContain("gentle features");
	});

	test("renders three collection cards", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Sage Morning");
		expect(markup).toContain("Velvet Dusk");
		expect(markup).toContain("Peach Haze");
	});

	test("renders hero video stage with poster and source fallbacks", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("<video");
		expect(markup).toContain(`poster="${HERO_VIDEO_POSTER}"`);
		expect(markup).toContain(`src="${HERO_VIDEO_WEBM}"`);
		expect(markup).toContain(`src="${HERO_VIDEO_MP4}"`);
	});
});
