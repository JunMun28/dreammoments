import { describe, expect, it } from "vitest";
import { getAllTemplates, getTemplateById, templates } from "./template-data";

describe("template-data", () => {
	describe("templates", () => {
		it("should have at least 3 templates", () => {
			expect(templates.length).toBeGreaterThanOrEqual(3);
		});

		it("should have unique IDs for each template", () => {
			const ids = templates.map((t) => t.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length);
		});

		it.each(templates)(
			"template $id should have required fields",
			(template) => {
				expect(template.id).toBeDefined();
				expect(template.name).toBeDefined();
				expect(template.description).toBeDefined();
				expect(template.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
				expect(template.fontPairing).toBeDefined();
			},
		);

		it.each(templates)(
			"template $id preview should have all wedding details",
			(template) => {
				const { preview } = template;
				expect(preview.partner1Name).toBeDefined();
				expect(preview.partner2Name).toBeDefined();
				expect(preview.weddingDate).toBeInstanceOf(Date);
				expect(preview.weddingTime).toMatch(/^\d{2}:\d{2}$/);
				expect(preview.venueName).toBeDefined();
				expect(preview.venueAddress).toBeDefined();
			},
		);

		it.each(templates)(
			"template $id should have schedule blocks",
			(template) => {
				expect(template.preview.scheduleBlocks.length).toBeGreaterThan(0);
				for (const block of template.preview.scheduleBlocks) {
					expect(block.id).toBeDefined();
					expect(block.title).toBeDefined();
					expect(typeof block.order).toBe("number");
				}
			},
		);

		it.each(templates)("template $id should have notes", (template) => {
			expect(template.preview.notes.length).toBeGreaterThan(0);
			for (const note of template.preview.notes) {
				expect(note.id).toBeDefined();
				expect(note.title).toBeDefined();
				expect(typeof note.order).toBe("number");
			}
		});
	});

	describe("getTemplateById", () => {
		it("should return template when ID exists", () => {
			const template = getTemplateById("classic-elegance");
			expect(template).toBeDefined();
			expect(template?.name).toBe("Classic Elegance");
		});

		it("should return undefined for non-existent ID", () => {
			const template = getTemplateById("non-existent");
			expect(template).toBeUndefined();
		});
	});

	describe("getAllTemplates", () => {
		it("should return all templates", () => {
			const all = getAllTemplates();
			expect(all).toEqual(templates);
			expect(all.length).toBe(templates.length);
		});
	});
});
