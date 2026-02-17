// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { buildSampleContent } from "@/data/sample-invitation";
import { convertBlushRomanceToCanvasDocument } from "@/lib/canvas/template-converter";
import { CanvasEngine } from "./CanvasEngine";

describe("CanvasEngine", () => {
	test("renders blush-romance canvas blocks from document JSON", () => {
		const content = buildSampleContent("blush-romance");
		const document = convertBlushRomanceToCanvasDocument(content);
		const { container } = render(<CanvasEngine document={document} />);

		expect(
			screen.getByText(
				`${content.hero.partnerOneName} & ${content.hero.partnerTwoName}`,
			),
		).toBeTruthy();
		expect(screen.getByText(content.hero.tagline)).toBeTruthy();
		expect(container.querySelectorAll("[data-canvas-block-id]").length).toBe(
			document.blockOrder.length,
		);
	});
});
