import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import BlushRomanceInvitation from "../components/templates/blush-romance/BlushRomanceInvitation";
import EternalEleganceInvitation from "../components/templates/eternal-elegance/EternalEleganceInvitation";
import GardenRomanceInvitation from "../components/templates/garden-romance/GardenRomanceInvitation";
import LoveAtDuskInvitation from "../components/templates/love-at-dusk/LoveAtDuskInvitation";
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
	"garden-romance": GardenRomanceInvitation,
	"eternal-elegance": EternalEleganceInvitation,
	"blush-romance": BlushRomanceInvitation,
	"love-at-dusk": LoveAtDuskInvitation,
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
			const Template = templateComponents[template.id] ?? LoveAtDuskInvitation;
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
