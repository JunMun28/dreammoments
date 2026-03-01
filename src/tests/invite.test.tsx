import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import DoubleHappinessInvitation from "../components/templates/double-happiness/DoubleHappinessInvitation";
import { buildSampleContent } from "../data/sample-invitation";

type MockLinkProps = ComponentPropsWithoutRef<"a"> & { children?: ReactNode };

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, ...props }: MockLinkProps) => <a {...props}>{children}</a>,
	createFileRoute: () => () => ({}),
}));

describe("invite template", () => {
	test("double happiness renders sections", () => {
		const markup = renderToString(
			<DoubleHappinessInvitation
				content={buildSampleContent("double-happiness")}
			/>,
		);
		const matches = markup.match(/data-section=/g) ?? [];
		expect(matches.length).toBeGreaterThan(0);
	});
});
