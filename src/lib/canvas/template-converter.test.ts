import { describe, expect, test } from "vitest";
import { buildSampleContent } from "@/data/sample-invitation";
import { blushRomanceTemplate } from "@/templates/blush-romance";
import {
	convertBlushRomanceToCanvasDocument,
	convertTemplateToCanvasDocument,
} from "./template-converter";

describe("convertBlushRomanceToCanvasDocument", () => {
	test("converts sample content into a normalized canvas document", () => {
		const content = buildSampleContent("blush-romance");
		const document = convertBlushRomanceToCanvasDocument(content);

		expect(document.formatVersion).toBe("canvas-v2");
		expect(document.version).toBe("2.0");
		expect(document.templateId).toBe("blush-romance");
		expect(document.canvas.width).toBe(390);
		expect(document.blockOrder.length).toBeGreaterThan(0);
		expect(document.blockOrder).toEqual(Object.keys(document.blocksById));
		expect(document.metadata.templateVersion).toBe(
			blushRomanceTemplate.version,
		);
		expect(document.designTokens.fonts.heading).toBe(
			blushRomanceTemplate.tokens.typography.headingFont,
		);
	});

	test("maps key blush fields into expected blocks", () => {
		const content = buildSampleContent("blush-romance");
		const document = convertBlushRomanceToCanvasDocument(content);
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
		const content = buildSampleContent("blush-romance");
		const document = convertBlushRomanceToCanvasDocument(content);

		document.blockOrder.forEach((blockId, index) => {
			expect(document.blocksById[blockId]?.zIndex).toBe(index);
		});
	});
});

describe("convertTemplateToCanvasDocument", () => {
	test("routes blush-romance through the phase 1 converter", () => {
		const content = buildSampleContent("blush-romance");
		const document = convertTemplateToCanvasDocument("blush-romance", content);
		expect(document.templateId).toBe("blush-romance");
	});

	test("supports conversion for additional templates", () => {
		const content = buildSampleContent("love-at-dusk");
		const document = convertTemplateToCanvasDocument("love-at-dusk", content);
		expect(document.templateId).toBe("love-at-dusk");
		expect(document.blockOrder.length).toBeGreaterThan(0);
	});
});
