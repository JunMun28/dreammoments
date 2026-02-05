import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { Landing } from "../routes/index";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
	createFileRoute: () => () => ({}),
}));

describe("landing page", () => {
	test("renders hero headline", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Digital invites that feel");
		expect(markup).toContain("The Collection");
		expect(markup).toContain("gentle features");
	});

	test("renders three collection cards", () => {
		const markup = renderToString(<Landing />);
		expect(markup).toContain("Sage Morning");
		expect(markup).toContain("Velvet Dusk");
		expect(markup).toContain("Peach Haze");
	});
});
