import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import DoubleHappinessInvitation from "../components/templates/double-happiness/DoubleHappinessInvitation";
import SectionTitle from "../components/templates/SectionTitle";
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

describe("SectionTitle", () => {
	test("renders bilingual title with correct lang attributes", () => {
		const html = renderToString(
			<SectionTitle zhLabel="爱 情 故 事" enHeading="Our Story" />,
		);
		expect(html).toContain("爱 情 故 事");
		expect(html).toContain("Our Story");
		expect(html).toContain('lang="en"');
	});
});

describe("design rules conformance", () => {
	test("template CSS defines all required --t-* custom properties", () => {
		const css = readFileSync(
			resolve(
				__dirname,
				"../components/templates/double-happiness/double-happiness.css",
			),
			"utf-8",
		);
		const requiredTokens = [
			"--t-primary",
			"--t-secondary",
			"--t-accent",
			"--t-bg",
			"--t-text",
			"--t-muted",
			"--t-bg-alt",
		];
		for (const token of requiredTokens) {
			expect(css).toContain(token);
		}
	});

	test("template renders sections in expected order", () => {
		const Template = DoubleHappinessInvitation;
		const html = renderToString(
			<Template content={buildSampleContent("double-happiness")} />,
		);
		const sectionOrder = [...html.matchAll(/data-section="([^"]+)"/g)].map(
			(m) => m[1],
		);
		expect(sectionOrder[0]).toBe("hero");
		expect(sectionOrder).toContain("rsvp");
		expect(sectionOrder).toContain("footer");
		expect(sectionOrder.indexOf("hero")).toBeLessThan(
			sectionOrder.indexOf("rsvp"),
		);
	});

	test("template has reduced motion CSS", () => {
		const css = readFileSync(
			resolve(
				__dirname,
				"../components/templates/double-happiness/double-happiness.css",
			),
			"utf-8",
		);
		expect(css).toContain("prefers-reduced-motion");
	});
});
