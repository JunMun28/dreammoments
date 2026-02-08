import { describe, expect, test } from "vitest";
import { listFieldMap } from "../components/editor/listFieldMap";

describe("listFieldMap", () => {
	test("contains story milestones mapping", () => {
		expect(listFieldMap.story).toBeDefined();
		expect(listFieldMap.story.label).toBe("Milestones");
		expect(listFieldMap.story.fields).toContainEqual(
			expect.objectContaining({ key: "date", label: "Date" }),
		);
		expect(listFieldMap.story.fields).toContainEqual(
			expect.objectContaining({ key: "title", label: "Title" }),
		);
		expect(listFieldMap.story.fields).toContainEqual(
			expect.objectContaining({ key: "description", label: "Description" }),
		);
	});

	test("contains gallery mapping", () => {
		expect(listFieldMap.gallery).toBeDefined();
		expect(listFieldMap.gallery.label).toBe("Gallery");
		expect(listFieldMap.gallery.fields).toContainEqual(
			expect.objectContaining({ key: "url", label: "Image URL" }),
		);
		expect(listFieldMap.gallery.fields).toContainEqual(
			expect.objectContaining({ key: "caption", label: "Caption" }),
		);
	});

	test("contains schedule events mapping", () => {
		expect(listFieldMap.schedule).toBeDefined();
		expect(listFieldMap.schedule.label).toBe("Events");
		expect(listFieldMap.schedule.fields).toContainEqual(
			expect.objectContaining({ key: "time", label: "Time" }),
		);
		expect(listFieldMap.schedule.fields).toContainEqual(
			expect.objectContaining({ key: "title", label: "Title" }),
		);
		expect(listFieldMap.schedule.fields).toContainEqual(
			expect.objectContaining({ key: "description", label: "Description" }),
		);
	});

	test("contains FAQ items mapping", () => {
		expect(listFieldMap.faq).toBeDefined();
		expect(listFieldMap.faq.label).toBe("FAQ Items");
		expect(listFieldMap.faq.fields).toContainEqual(
			expect.objectContaining({ key: "question", label: "Question" }),
		);
		expect(listFieldMap.faq.fields).toContainEqual(
			expect.objectContaining({ key: "answer", label: "Answer" }),
		);
	});

	test("contains entourage members mapping", () => {
		expect(listFieldMap.entourage).toBeDefined();
		expect(listFieldMap.entourage.label).toBe("Entourage");
		expect(listFieldMap.entourage.fields).toContainEqual(
			expect.objectContaining({ key: "role", label: "Role" }),
		);
		expect(listFieldMap.entourage.fields).toContainEqual(
			expect.objectContaining({ key: "name", label: "Name" }),
		);
	});

	test("all fields have required properties", () => {
		for (const [key, config] of Object.entries(listFieldMap)) {
			expect(config.fields, `Fields missing for ${key}`).toBeDefined();
			expect(
				Array.isArray(config.fields),
				`Fields should be array for ${key}`,
			).toBe(true);

			for (const field of config.fields) {
				expect(field.key, `Field key missing in ${key}`).toBeDefined();
				expect(field.label, `Field label missing in ${key}`).toBeDefined();
			}
		}
	});
});
