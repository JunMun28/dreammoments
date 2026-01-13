import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { formatDate, formatTime, TemplatePreview } from "./TemplatePreview";

describe("TemplatePreview", () => {
	describe("formatDate", () => {
		it("should format date as Month Day, Year", () => {
			const date = new Date("2026-06-15");
			expect(formatDate(date)).toBe("June 15, 2026");
		});

		it("should return empty string for undefined", () => {
			expect(formatDate(undefined)).toBe("");
		});
	});

	describe("formatTime", () => {
		it("should convert 24h to 12h format - afternoon", () => {
			expect(formatTime("16:00")).toBe("4:00 PM");
		});

		it("should convert 24h to 12h format - morning", () => {
			expect(formatTime("09:30")).toBe("9:30 AM");
		});

		it("should handle noon", () => {
			expect(formatTime("12:00")).toBe("12:00 PM");
		});

		it("should handle midnight", () => {
			expect(formatTime("00:00")).toBe("12:00 AM");
		});

		it("should return empty string for undefined", () => {
			expect(formatTime(undefined)).toBe("");
		});
	});

	describe("component rendering", () => {
		it("should render with testid", () => {
			render(<TemplatePreview />);
			expect(screen.getByTestId("template-preview")).toBeDefined();
		});

		it("should display couple names when provided", () => {
			render(<TemplatePreview partner1Name="Sarah" partner2Name="Michael" />);
			// Names are in the same h1 element with an & separator
			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading.textContent).toContain("Sarah");
			expect(heading.textContent).toContain("Michael");
		});

		it("should display placeholder when no names provided", () => {
			render(<TemplatePreview />);
			expect(screen.getByText("Your Names Here")).toBeDefined();
		});

		it("should display formatted date when provided", () => {
			render(<TemplatePreview weddingDate={new Date("2026-06-15")} />);
			expect(screen.getByText("June 15, 2026")).toBeDefined();
		});

		it("should display formatted time when provided", () => {
			render(<TemplatePreview weddingTime="16:00" />);
			expect(screen.getByText("4:00 PM")).toBeDefined();
		});

		it("should display venue information when provided", () => {
			render(
				<TemplatePreview
					venueName="The Grand Ballroom"
					venueAddress="123 Elegant Ave"
				/>,
			);
			expect(screen.getByText("The Grand Ballroom")).toBeDefined();
			expect(screen.getByText("123 Elegant Ave")).toBeDefined();
		});

		it("should display schedule blocks when provided", () => {
			render(
				<TemplatePreview
					scheduleBlocks={[
						{
							id: "1",
							title: "Ceremony",
							time: "16:00",
							description: "Exchange of vows",
							order: 0,
						},
					]}
				/>,
			);
			expect(screen.getByText("Ceremony")).toBeDefined();
			expect(screen.getByText("Exchange of vows")).toBeDefined();
		});

		it("should display notes when provided", () => {
			render(
				<TemplatePreview
					notes={[
						{
							id: "1",
							title: "Dress Code",
							description: "Black tie optional",
							order: 0,
						},
					]}
				/>,
			);
			expect(screen.getByText("Dress Code")).toBeDefined();
			expect(screen.getByText("Black tie optional")).toBeDefined();
		});

		it("should apply mobile viewport class when viewportMode is mobile", () => {
			render(<TemplatePreview viewportMode="mobile" />);
			const preview = screen.getByTestId("template-preview");
			expect(preview.getAttribute("data-viewport")).toBe("mobile");
		});

		it("should apply desktop viewport class by default", () => {
			render(<TemplatePreview />);
			const preview = screen.getByTestId("template-preview");
			expect(preview.getAttribute("data-viewport")).toBe("desktop");
		});
	});
});
