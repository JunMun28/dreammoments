import { describe, expect, test } from "vitest";
import {
	blushRomanceTemplate,
	eternalEleganceTemplate,
	gardenRomanceTemplate,
	loveAtDuskTemplate,
	templates,
} from "../templates";
import type { TemplateConfig } from "../templates/types";

describe("templates array", () => {
	test("contains all four templates", () => {
		expect(templates).toHaveLength(4);
		expect(templates.map((t) => t.id)).toContain("blush-romance");
		expect(templates.map((t) => t.id)).toContain("love-at-dusk");
		expect(templates.map((t) => t.id)).toContain("garden-romance");
		expect(templates.map((t) => t.id)).toContain("eternal-elegance");
	});

	test("all templates have required fields", () => {
		for (const template of templates) {
			expect(template.id).toBeDefined();
			expect(template.name).toBeDefined();
			expect(template.nameZh).toBeDefined();
			expect(template.description).toBeDefined();
			expect(template.category).toBeDefined();
			expect(template.version).toBeDefined();
			expect(template.sections).toBeDefined();
			expect(template.tokens).toBeDefined();
			expect(template.aiConfig).toBeDefined();
		}
	});

	test("all template IDs are unique", () => {
		const ids = templates.map((t) => t.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	test("all templates have at least one section", () => {
		for (const template of templates) {
			expect(template.sections.length).toBeGreaterThan(0);
		}
	});

	test("all sections have required fields", () => {
		for (const template of templates) {
			for (const section of template.sections) {
				expect(section.id).toBeDefined();
				expect(section.type).toBeDefined();
				expect(section.defaultVisible).toBeDefined();
				expect(section.fields).toBeDefined();
			}
		}
	});

	test("all fields have required properties", () => {
		for (const template of templates) {
			for (const section of template.sections) {
				for (const field of section.fields) {
					expect(field.id).toBeDefined();
					expect(field.label).toBeDefined();
					expect(field.type).toBeDefined();
				}
			}
		}
	});

	test("all field types are valid", () => {
		const validTypes = ["text", "textarea", "date", "time", "image", "toggle", "list"];
		for (const template of templates) {
			for (const section of template.sections) {
				for (const field of section.fields) {
					expect(validTypes).toContain(field.type);
				}
			}
		}
	});

	test("all categories are valid", () => {
		const validCategories = ["chinese", "garden", "western"];
		for (const template of templates) {
			expect(validCategories).toContain(template.category);
		}
	});

	test("all templates have valid design tokens", () => {
		for (const template of templates) {
			const tokens = template.tokens;
			expect(tokens.colors.primary).toBeDefined();
			expect(tokens.colors.secondary).toBeDefined();
			expect(tokens.colors.accent).toBeDefined();
			expect(tokens.colors.background).toBeDefined();
			expect(tokens.colors.text).toBeDefined();
			expect(tokens.colors.muted).toBeDefined();
			expect(tokens.typography.headingFont).toBeDefined();
			expect(tokens.typography.bodyFont).toBeDefined();
			expect(tokens.typography.accentFont).toBeDefined();
		}
	});

	test("all templates have valid AI config", () => {
		for (const template of templates) {
			const validTones = ["formal", "casual", "romantic"];
			const validContexts = ["chinese", "western", "mixed"];
			expect(validTones).toContain(template.aiConfig.defaultTone);
			expect(validContexts).toContain(template.aiConfig.culturalContext);
		}
	});
});

describe("individual templates", () => {
	describe("blushRomanceTemplate", () => {
		test("has correct ID", () => {
			expect(blushRomanceTemplate.id).toBe("blush-romance");
		});

		test("has correct name", () => {
			expect(blushRomanceTemplate.name).toBe("Blush Romance");
			expect(blushRomanceTemplate.nameZh).toBe("胭脂之恋");
		});

		test("has expected sections", () => {
			const sectionIds = blushRomanceTemplate.sections.map((s) => s.id);
			expect(sectionIds).toContain("hero");
			expect(sectionIds).toContain("announcement");
			expect(sectionIds).toContain("story");
			expect(sectionIds).toContain("gallery");
			expect(sectionIds).toContain("schedule");
			expect(sectionIds).toContain("venue");
			expect(sectionIds).toContain("rsvp");
			expect(sectionIds).toContain("faq");
			expect(sectionIds).toContain("footer");
		});
	});

	describe("loveAtDuskTemplate", () => {
		test("has correct ID", () => {
			expect(loveAtDuskTemplate.id).toBe("love-at-dusk");
		});

		test("has correct category", () => {
			expect(loveAtDuskTemplate.category).toBe("chinese");
		});
	});

	describe("gardenRomanceTemplate", () => {
		test("has correct ID", () => {
			expect(gardenRomanceTemplate.id).toBe("garden-romance");
		});

		test("has correct category", () => {
			expect(gardenRomanceTemplate.category).toBe("garden");
		});
	});

	describe("eternalEleganceTemplate", () => {
		test("has correct ID", () => {
			expect(eternalEleganceTemplate.id).toBe("eternal-elegance");
		});

		test("has correct category", () => {
			expect(eternalEleganceTemplate.category).toBe("western");
		});
	});
});
