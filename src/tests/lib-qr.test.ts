import { describe, expect, test } from "vitest";
import { generateQrDataUrl, generateQrSvg } from "../lib/qr";

describe("generateQrSvg", () => {
	test("generates SVG for simple string", () => {
		const svg = generateQrSvg("hello");
		expect(svg).toContain("<svg");
		expect(svg).toContain("</svg>");
		expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
	});

	test("generates SVG with correct dimensions", () => {
		const pixelSize = 10;
		const margin = 2;
		const svg = generateQrSvg("test", pixelSize, margin);
		
		// Extract viewBox to check dimensions
		const viewBoxMatch = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
		expect(viewBoxMatch).not.toBeNull();
		
		if (viewBoxMatch) {
			const size = Number(viewBoxMatch[1]);
			// Size should be based on QR version + margins
			expect(size).toBeGreaterThan(0);
		}
	});

	test("SVG contains path elements", () => {
		const svg = generateQrSvg("test data");
		expect(svg).toContain("<path");
		expect(svg).toContain('d="M');
	});

	test("SVG has white background rect", () => {
		const svg = generateQrSvg("test");
		expect(svg).toContain('<rect');
		expect(svg).toContain('fill="#fff"');
	});

	test("SVG paths have black fill", () => {
		const svg = generateQrSvg("test");
		expect(svg).toContain('fill="#000"');
	});

	test("generates different output for different inputs", () => {
		const svg1 = generateQrSvg("input1");
		const svg2 = generateQrSvg("input2");
		expect(svg1).not.toBe(svg2);
	});

	test("generates consistent output for same input", () => {
		const svg1 = generateQrSvg("same input");
		const svg2 = generateQrSvg("same input");
		expect(svg1).toBe(svg2);
	});

	test("handles empty string", () => {
		const svg = generateQrSvg("");
		expect(svg).toContain("<svg");
		expect(svg).toContain("</svg>");
	});

	test("handles long text", () => {
		const longText = "a".repeat(100);
		const svg = generateQrSvg(longText);
		expect(svg).toContain("<svg");
		expect(svg).toContain("</svg>");
	});

	test("handles special characters", () => {
		const specialChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
		const svg = generateQrSvg(specialChars);
		expect(svg).toContain("<svg");
		expect(svg).toContain("</svg>");
	});

	test("handles unicode characters", () => {
		const unicode = "Hello 世界 🌍";
		const svg = generateQrSvg(unicode);
		expect(svg).toContain("<svg");
		expect(svg).toContain("</svg>");
	});

	test("handles URLs", () => {
		const url = "https://example.com/path?param=value&other=test";
		const svg = generateQrSvg(url);
		expect(svg).toContain("<svg");
		expect(svg).toContain("</svg>");
	});
});

describe("generateQrDataUrl", () => {
	test("generates data URL", () => {
		const dataUrl = generateQrDataUrl("test");
		expect(dataUrl.startsWith("data:image/svg+xml,")).toBe(true);
	});

	test("generates valid SVG in data URL", () => {
		const dataUrl = generateQrDataUrl("test");
		const decoded = decodeURIComponent(dataUrl.replace("data:image/svg+xml,", ""));
		expect(decoded).toContain("<svg");
		expect(decoded).toContain("</svg>");
	});

	test("generates different data URLs for different inputs", () => {
		const url1 = generateQrDataUrl("input1");
		const url2 = generateQrDataUrl("input2");
		expect(url1).not.toBe(url2);
	});

	test("respects pixelSize parameter", () => {
		const url1 = generateQrDataUrl("test", 8, 4);
		const url2 = generateQrDataUrl("test", 12, 4);
		expect(url1).not.toBe(url2);
	});

	test("respects margin parameter", () => {
		const url1 = generateQrDataUrl("test", 8, 2);
		const url2 = generateQrDataUrl("test", 8, 4);
		expect(url1).not.toBe(url2);
	});
});
