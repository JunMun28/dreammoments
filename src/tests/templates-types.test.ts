import { describe, expect, test } from "vitest";
import { getSectionLabel, sectionDisplayNames } from "../templates/types";

describe("sectionDisplayNames", () => {
	test("contains expected section names", () => {
		expect(sectionDisplayNames.hero).toBe("Welcome");
		expect(sectionDisplayNames.couple).toBe("Couple");
		expect(sectionDisplayNames.story).toBe("Our Story");
		expect(sectionDisplayNames.gallery).toBe("Gallery");
		expect(sectionDisplayNames.schedule).toBe("Schedule");
		expect(sectionDisplayNames.venue).toBe("Venue");
		expect(sectionDisplayNames.rsvp).toBe("RSVP");
		expect(sectionDisplayNames.faq).toBe("FAQ");
		expect(sectionDisplayNames.footer).toBe("Footer");
		expect(sectionDisplayNames.announcement).toBe("Announcement");
		expect(sectionDisplayNames.entourage).toBe("Entourage");
		expect(sectionDisplayNames.registry).toBe("Registry");
		expect(sectionDisplayNames.calendar).toBe("Calendar");
		expect(sectionDisplayNames.countdown).toBe("Countdown");
		expect(sectionDisplayNames.details).toBe("Details");
		expect(sectionDisplayNames.extra).toBe("Extra");
	});
});

describe("getSectionLabel", () => {
	test("returns display name for known sections", () => {
		expect(getSectionLabel("hero")).toBe("Welcome");
		expect(getSectionLabel("rsvp")).toBe("RSVP");
		expect(getSectionLabel("story")).toBe("Our Story");
	});

	test("capitalizes unknown sections", () => {
		expect(getSectionLabel("custom")).toBe("Custom");
		expect(getSectionLabel("mySection")).toBe("MySection");
	});

	test("handles empty string", () => {
		expect(getSectionLabel("")).toBe("");
	});

	test("handles already capitalized", () => {
		expect(getSectionLabel("Hero")).toBe("Hero");
	});
});
