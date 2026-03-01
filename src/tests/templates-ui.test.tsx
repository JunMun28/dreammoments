import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import DoubleHappinessInvitation from "../components/templates/double-happiness/DoubleHappinessInvitation";
import type { TemplateInvitationProps } from "../components/templates/types";
import { buildSampleContent } from "../data/sample-invitation";
import { templates } from "../templates";

type MockLinkProps = ComponentPropsWithoutRef<"a"> & { children?: ReactNode };

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, ...props }: MockLinkProps) => <a {...props}>{children}</a>,
	createFileRoute: () => () => ({}),
}));

const templateComponents: Record<
	string,
	ComponentType<TemplateInvitationProps>
> = {
	"double-happiness": DoubleHappinessInvitation,
};

describe("template render coverage", () => {
	test("renders default-visible sections per template", () => {
		templates.forEach((template) => {
			const hiddenSections = Object.fromEntries(
				template.sections.map((section) => [
					section.id,
					!section.defaultVisible,
				]),
			);
			const Template =
				templateComponents[template.id] ?? DoubleHappinessInvitation;
			const markup = renderToString(
				<Template
					content={buildSampleContent(template.id)}
					hiddenSections={hiddenSections}
				/>,
			);
			const matches = markup.match(/data-section=/g) ?? [];
			const expectedVisible = template.sections.filter(
				(section) => section.defaultVisible,
			).length;
			// Templates may render extra sections not in the config (e.g. countdown)
			expect(matches.length).toBeGreaterThanOrEqual(expectedVisible);
			template.sections
				.filter((section) => !section.defaultVisible)
				.forEach((section) => {
					expect(markup).not.toContain(`data-section="${section.id}"`);
				});
			expect(markup).toContain('data-section="rsvp"');
		});
	});
});
