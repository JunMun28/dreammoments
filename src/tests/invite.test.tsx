import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import InvitationRenderer from "../components/templates/InvitationRenderer";
import { buildSampleContent } from "../data/sample-invitation";

type MockLinkProps = ComponentPropsWithoutRef<"a"> & { children?: ReactNode };

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, ...props }: MockLinkProps) => <a {...props}>{children}</a>,
	createFileRoute: () => () => ({}),
}));

describe("invite template", () => {
	test("love at dusk renders 11 sections", () => {
		const markup = renderToString(
			<InvitationRenderer
				templateId="love-at-dusk"
				content={buildSampleContent("love-at-dusk")}
			/>,
		);
		const matches = markup.match(/data-section=/g) ?? [];
		expect(matches).toHaveLength(11);
	});
});
