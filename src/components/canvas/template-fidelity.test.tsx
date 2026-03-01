// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { buildSampleContent } from "@/data/sample-invitation";
import { convertTemplateToCanvasDocument } from "@/lib/canvas/template-converter";
import { CanvasEngine } from "./CanvasEngine";

const TEMPLATE_IDS = ["double-happiness"] as const;

describe("Canvas template fidelity", () => {
	test.each(TEMPLATE_IDS)(
		"%s converts and renders core hero content",
		(templateId) => {
			const content = buildSampleContent(templateId);
			const document = convertTemplateToCanvasDocument(templateId, content);
			const { container } = render(<CanvasEngine document={document} />);

			expect(document.blockOrder.length).toBeGreaterThanOrEqual(10);
			expect(
				screen.getByText(
					`${content.hero.partnerOneName} & ${content.hero.partnerTwoName}`,
				),
			).toBeTruthy();
			expect(screen.getByText(content.hero.tagline)).toBeTruthy();
			expect(container.querySelectorAll("[data-canvas-block-id]").length).toBe(
				document.blockOrder.length,
			);
		},
	);
});
