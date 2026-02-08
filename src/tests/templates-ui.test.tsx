import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import InvitationRenderer from "../components/templates/InvitationRenderer";
import { buildSampleContent } from "../data/sample-invitation";
import { templates } from "../templates";

type MockLinkProps = ComponentPropsWithoutRef<"a"> & { children?: ReactNode };

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, ...props }: MockLinkProps) => <a {...props}>{children}</a>,
	createFileRoute: () => () => ({}),
}));

describe("template render coverage", () => {
	test("renders default-visible sections per template", () => {
		templates.forEach((template) => {
			const hiddenSections = Object.fromEntries(
				template.sections.map((section) => [
					section.id,
					!section.defaultVisible,
				]),
			);
			const markup = renderToString(
				<InvitationRenderer
					templateId={template.id}
					content={buildSampleContent(template.id)}
					hiddenSections={hiddenSections}
				/>,
			);
			const matches = markup.match(/data-section=/g) ?? [];
			const expectedVisible = template.sections.filter(
				(section) => section.defaultVisible,
			).length;
			expect(matches).toHaveLength(expectedVisible);
			template.sections
				.filter((section) => !section.defaultVisible)
				.forEach((section) => {
					expect(markup).not.toContain(`data-section="${section.id}"`);
				});
			expect(markup).toContain('data-section="rsvp"');
		});
	});
});
