import { describe, expect, test } from "vitest";
import { buildSampleContent } from "@/data/sample-invitation";
import { doubleHappinessTemplate } from "@/templates/double-happiness";
import { convertTemplateToCanvasDocument } from "./template-converter";

describe("convertTemplateToCanvasDocument", () => {
	test("converts double-happiness sample content into a normalized canvas document", () => {
		const content = buildSampleContent("double-happiness");
		const document = convertTemplateToCanvasDocument(
			"double-happiness",
			content,
		);

		expect(document.formatVersion).toBe("canvas-v2");
		expect(document.version).toBe("2.0");
		expect(document.templateId).toBe("double-happiness");
		expect(document.canvas.width).toBe(390);
		expect(document.blockOrder.length).toBeGreaterThan(0);
		expect(document.blockOrder).toEqual(Object.keys(document.blocksById));
		expect(document.metadata.templateVersion).toBe(
			doubleHappinessTemplate.version,
		);
		expect(document.designTokens.fonts.heading).toBe(
			doubleHappinessTemplate.tokens.typography.headingFont,
		);
	});

	test("maps key fields into expected blocks", () => {
		const content = buildSampleContent("double-happiness");
		const document = convertTemplateToCanvasDocument(
			"double-happiness",
			content,
		);
		const titleBlock = document.blocksById["hero-title"];
		const taglineBlock = document.blocksById["hero-tagline"];
		const announcementBlock = document.blocksById["announcement-message"];

		expect(titleBlock?.content.text).toBe(
			`${content.hero.partnerOneName} & ${content.hero.partnerTwoName}`,
		);
		expect(taglineBlock?.content.text).toBe(content.hero.tagline);
		expect(announcementBlock?.content.text).toBe(content.announcement.message);
	});

	test("ensures z-index values track block order", () => {
		const content = buildSampleContent("double-happiness");
		const document = convertTemplateToCanvasDocument(
			"double-happiness",
			content,
		);

		document.blockOrder.forEach((blockId, index) => {
			expect(document.blocksById[blockId]?.zIndex).toBe(index);
		});
	});
});
