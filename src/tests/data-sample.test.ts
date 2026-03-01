import { describe, expect, test } from "vitest";
import {
	baseSampleContent,
	buildSampleContent,
} from "../data/sample-invitation";

describe("baseSampleContent", () => {
	test("has all required sections", () => {
		expect(baseSampleContent.hero).toBeDefined();
		expect(baseSampleContent.announcement).toBeDefined();
		expect(baseSampleContent.couple).toBeDefined();
		expect(baseSampleContent.story).toBeDefined();
		expect(baseSampleContent.gallery).toBeDefined();
		expect(baseSampleContent.schedule).toBeDefined();
		expect(baseSampleContent.venue).toBeDefined();
		expect(baseSampleContent.entourage).toBeDefined();
		expect(baseSampleContent.registry).toBeDefined();
		expect(baseSampleContent.rsvp).toBeDefined();
		expect(baseSampleContent.faq).toBeDefined();
		expect(baseSampleContent.footer).toBeDefined();
		expect(baseSampleContent.details).toBeDefined();
		expect(baseSampleContent.calendar).toBeDefined();
		expect(baseSampleContent.countdown).toBeDefined();
	});

	test("hero section has required fields", () => {
		expect(baseSampleContent.hero.partnerOneName).toBeDefined();
		expect(baseSampleContent.hero.partnerTwoName).toBeDefined();
		expect(baseSampleContent.hero.tagline).toBeDefined();
		expect(baseSampleContent.hero.date).toBeDefined();
	});

	test("couple section has both partners", () => {
		expect(baseSampleContent.couple.partnerOne).toBeDefined();
		expect(baseSampleContent.couple.partnerTwo).toBeDefined();
		expect(baseSampleContent.couple.partnerOne.fullName).toBeDefined();
		expect(baseSampleContent.couple.partnerTwo.fullName).toBeDefined();
	});

	test("story section has milestones", () => {
		expect(baseSampleContent.story.milestones).toBeInstanceOf(Array);
		expect(baseSampleContent.story.milestones.length).toBeGreaterThan(0);
		expect(baseSampleContent.story.milestones[0].date).toBeDefined();
		expect(baseSampleContent.story.milestones[0].title).toBeDefined();
		expect(baseSampleContent.story.milestones[0].description).toBeDefined();
	});

	test("gallery section has photos", () => {
		expect(baseSampleContent.gallery.photos).toBeInstanceOf(Array);
		expect(baseSampleContent.gallery.photos.length).toBeGreaterThan(0);
		expect(baseSampleContent.gallery.photos[0].url).toBeDefined();
	});

	test("schedule section has events", () => {
		expect(baseSampleContent.schedule.events).toBeInstanceOf(Array);
		expect(baseSampleContent.schedule.events.length).toBeGreaterThan(0);
		expect(baseSampleContent.schedule.events[0].time).toBeDefined();
		expect(baseSampleContent.schedule.events[0].title).toBeDefined();
	});

	test("venue section has required fields", () => {
		expect(baseSampleContent.venue.name).toBeDefined();
		expect(baseSampleContent.venue.address).toBeDefined();
		expect(baseSampleContent.venue.coordinates).toBeDefined();
		expect(baseSampleContent.venue.coordinates.lat).toBeDefined();
		expect(baseSampleContent.venue.coordinates.lng).toBeDefined();
	});

	test("rsvp section has required fields", () => {
		expect(baseSampleContent.rsvp.deadline).toBeDefined();
		expect(baseSampleContent.rsvp.allowPlusOnes).toBeDefined();
		expect(baseSampleContent.rsvp.maxPlusOnes).toBeDefined();
		expect(baseSampleContent.rsvp.dietaryOptions).toBeInstanceOf(Array);
	});

	test("faq section has items", () => {
		expect(baseSampleContent.faq.items).toBeInstanceOf(Array);
		expect(baseSampleContent.faq.items.length).toBeGreaterThan(0);
		expect(baseSampleContent.faq.items[0].question).toBeDefined();
		expect(baseSampleContent.faq.items[0].answer).toBeDefined();
	});
});

describe("buildSampleContent", () => {
	test("returns base content for unknown template", () => {
		const content = buildSampleContent("unknown-template");
		expect(content.hero.partnerOneName).toBe(
			baseSampleContent.hero.partnerOneName,
		);
	});

	test("customizes for double-happiness template", () => {
		const content = buildSampleContent("double-happiness");
		expect(content.hero.tagline).toBe("囍临门 · 永结同心");
		expect(content.hero.partnerOneName).toBe("王小明");
		expect(content.hero.partnerTwoName).toBe("李小红");
		expect(content.announcement.title).toBe("我们结婚啦");
	});

	test("creates deep copy of content", () => {
		const content1 = buildSampleContent("double-happiness");
		const content2 = buildSampleContent("double-happiness");

		// Modifying one should not affect the other
		content1.hero.partnerOneName = "Modified";
		expect(content2.hero.partnerOneName).toBe("王小明");
	});
});
