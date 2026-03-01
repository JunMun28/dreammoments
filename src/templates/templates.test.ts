import { describe, expect, test } from "vitest";
import { doubleHappinessTemplate, templates } from "./index";

describe("templates registry", () => {
	test("includes one template", () => {
		expect(templates.length).toBe(1);
	});

	test("double happiness has core sections", () => {
		const sectionIds = doubleHappinessTemplate.sections.map(
			(section) => section.id,
		);
		expect(sectionIds).toContain("hero");
		expect(sectionIds).toContain("announcement");
		expect(sectionIds).toContain("rsvp");
	});

	test("double happiness tokens include palette", () => {
		expect(doubleHappinessTemplate.tokens.colors.primary).toBe("#C8102E");
	});
});
