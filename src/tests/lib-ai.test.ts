import { describe, expect, test, vi } from "vitest";
import type { InvitationContent } from "../lib/types";

// Mock the API module
vi.mock("../api/ai", () => ({
	generateAiContentFn: vi
		.fn()
		.mockRejectedValue(new Error("AI_NOT_CONFIGURED")),
}));

describe("AI module", () => {
	test("mock AI generation returns fallback data", async () => {
		const { generateAiContent } = await import("../lib/ai");

		const context: InvitationContent = {
			hero: {
				partnerOneName: "John",
				partnerTwoName: "Jane",
				tagline: "Test",
				date: "2025-01-01",
			},
			announcement: { title: "Test", message: "Test message", formalText: "" },
			couple: {
				partnerOne: { fullName: "John Doe", bio: "" },
				partnerTwo: { fullName: "Jane Doe", bio: "" },
			},
			story: { milestones: [] },
			gallery: { photos: [] },
			schedule: { events: [] },
			venue: {
				name: "",
				address: "",
				coordinates: { lat: 0, lng: 0 },
				directions: "",
			},
			entourage: { members: [] },
			registry: { title: "", note: "" },
			rsvp: {
				deadline: "",
				allowPlusOnes: false,
				maxPlusOnes: 0,
				dietaryOptions: [],
				customMessage: "",
			},
			faq: { items: [] },
			footer: { message: "" },
			details: { scheduleSummary: "", venueSummary: "" },
			calendar: { dateLabel: "", message: "" },
			countdown: { targetDate: "" },
		};

		const result = await generateAiContent({
			type: "schedule",
			sectionId: "schedule",
			prompt: "Create a schedule",
			context,
		});

		// Should return mock fallback data when AI is not configured
		expect(result).toBeDefined();
		expect(result.events).toBeInstanceOf(Array);
	});

	test("returns mock schedule data", async () => {
		const { generateAiContent } = await import("../lib/ai");

		const context = {
			hero: { partnerOneName: "", partnerTwoName: "", tagline: "", date: "" },
			announcement: { title: "", message: "", formalText: "" },
			couple: {
				partnerOne: { fullName: "", bio: "" },
				partnerTwo: { fullName: "", bio: "" },
			},
			story: { milestones: [] },
			gallery: { photos: [] },
			schedule: { events: [] },
			venue: {
				name: "",
				address: "",
				coordinates: { lat: 0, lng: 0 },
				directions: "",
			},
			entourage: { members: [] },
			registry: { title: "", note: "" },
			rsvp: {
				deadline: "",
				allowPlusOnes: false,
				maxPlusOnes: 0,
				dietaryOptions: [],
				customMessage: "",
			},
			faq: { items: [] },
			footer: { message: "" },
			details: { scheduleSummary: "", venueSummary: "" },
			calendar: { dateLabel: "", message: "" },
			countdown: { targetDate: "" },
		} as InvitationContent;

		const result = await generateAiContent({
			type: "schedule",
			sectionId: "schedule",
			prompt: "",
			context,
		});

		expect(result.events).toHaveLength(5);
		expect(result.events[0]).toHaveProperty("time");
		expect(result.events[0]).toHaveProperty("title");
		expect(result.events[0]).toHaveProperty("description");
	});

	test("returns mock FAQ data", async () => {
		const { generateAiContent } = await import("../lib/ai");

		const context = {
			hero: { partnerOneName: "", partnerTwoName: "", tagline: "", date: "" },
			announcement: { title: "", message: "", formalText: "" },
			couple: {
				partnerOne: { fullName: "", bio: "" },
				partnerTwo: { fullName: "", bio: "" },
			},
			story: { milestones: [] },
			gallery: { photos: [] },
			schedule: { events: [] },
			venue: {
				name: "",
				address: "",
				coordinates: { lat: 0, lng: 0 },
				directions: "",
			},
			entourage: { members: [] },
			registry: { title: "", note: "" },
			rsvp: {
				deadline: "",
				allowPlusOnes: false,
				maxPlusOnes: 0,
				dietaryOptions: [],
				customMessage: "",
			},
			faq: { items: [] },
			footer: { message: "" },
			details: { scheduleSummary: "", venueSummary: "" },
			calendar: { dateLabel: "", message: "" },
			countdown: { targetDate: "" },
		} as InvitationContent;

		const result = await generateAiContent({
			type: "faq",
			sectionId: "faq",
			prompt: "",
			context,
		});

		expect(result.items).toBeInstanceOf(Array);
		expect(result.items.length).toBeGreaterThan(0);
		expect(result.items[0]).toHaveProperty("question");
		expect(result.items[0]).toHaveProperty("answer");
	});

	test("returns mock story data", async () => {
		const { generateAiContent } = await import("../lib/ai");

		const context = {
			hero: { partnerOneName: "", partnerTwoName: "", tagline: "", date: "" },
			announcement: { title: "", message: "", formalText: "" },
			couple: {
				partnerOne: { fullName: "", bio: "" },
				partnerTwo: { fullName: "", bio: "" },
			},
			story: { milestones: [] },
			gallery: { photos: [] },
			schedule: { events: [] },
			venue: {
				name: "",
				address: "",
				coordinates: { lat: 0, lng: 0 },
				directions: "",
			},
			entourage: { members: [] },
			registry: { title: "", note: "" },
			rsvp: {
				deadline: "",
				allowPlusOnes: false,
				maxPlusOnes: 0,
				dietaryOptions: [],
				customMessage: "",
			},
			faq: { items: [] },
			footer: { message: "" },
			details: { scheduleSummary: "", venueSummary: "" },
			calendar: { dateLabel: "", message: "" },
			countdown: { targetDate: "" },
		} as InvitationContent;

		const result = await generateAiContent({
			type: "story",
			sectionId: "story",
			prompt: "",
			context,
		});

		expect(result.milestones).toBeInstanceOf(Array);
		expect(result.milestones.length).toBeGreaterThan(0);
	});

	test("returns mock tagline data", async () => {
		const { generateAiContent } = await import("../lib/ai");

		const context = {
			hero: { partnerOneName: "", partnerTwoName: "", tagline: "", date: "" },
			announcement: { title: "", message: "", formalText: "" },
			couple: {
				partnerOne: { fullName: "", bio: "" },
				partnerTwo: { fullName: "", bio: "" },
			},
			story: { milestones: [] },
			gallery: { photos: [] },
			schedule: { events: [] },
			venue: {
				name: "",
				address: "",
				coordinates: { lat: 0, lng: 0 },
				directions: "",
			},
			entourage: { members: [] },
			registry: { title: "", note: "" },
			rsvp: {
				deadline: "",
				allowPlusOnes: false,
				maxPlusOnes: 0,
				dietaryOptions: [],
				customMessage: "",
			},
			faq: { items: [] },
			footer: { message: "" },
			details: { scheduleSummary: "", venueSummary: "" },
			calendar: { dateLabel: "", message: "" },
			countdown: { targetDate: "" },
		} as InvitationContent;

		const result = await generateAiContent({
			type: "tagline",
			sectionId: "hero",
			prompt: "",
			context,
		});

		expect(result.tagline).toBeDefined();
		expect(typeof result.tagline).toBe("string");
	});

	test("returns mock translation data", async () => {
		const { generateAiContent } = await import("../lib/ai");

		const context = {
			hero: { partnerOneName: "", partnerTwoName: "", tagline: "", date: "" },
			announcement: { title: "", message: "Hello world", formalText: "" },
			couple: {
				partnerOne: { fullName: "", bio: "" },
				partnerTwo: { fullName: "", bio: "" },
			},
			story: { milestones: [] },
			gallery: { photos: [] },
			schedule: { events: [] },
			venue: {
				name: "",
				address: "",
				coordinates: { lat: 0, lng: 0 },
				directions: "",
			},
			entourage: { members: [] },
			registry: { title: "", note: "" },
			rsvp: {
				deadline: "",
				allowPlusOnes: false,
				maxPlusOnes: 0,
				dietaryOptions: [],
				customMessage: "",
			},
			faq: { items: [] },
			footer: { message: "" },
			details: { scheduleSummary: "", venueSummary: "" },
			calendar: { dateLabel: "", message: "" },
			countdown: { targetDate: "" },
		} as InvitationContent;

		const result = await generateAiContent({
			type: "translate",
			sectionId: "announcement",
			prompt: "",
			context,
		});

		expect(result.translation).toBeDefined();
		expect(typeof result.translation).toBe("string");
	});

	test("returns mock style data", async () => {
		const { generateAiContent } = await import("../lib/ai");

		const context = {
			hero: { partnerOneName: "", partnerTwoName: "", tagline: "", date: "" },
			announcement: { title: "", message: "", formalText: "" },
			couple: {
				partnerOne: { fullName: "", bio: "" },
				partnerTwo: { fullName: "", bio: "" },
			},
			story: { milestones: [] },
			gallery: { photos: [] },
			schedule: { events: [] },
			venue: {
				name: "",
				address: "",
				coordinates: { lat: 0, lng: 0 },
				directions: "",
			},
			entourage: { members: [] },
			registry: { title: "", note: "" },
			rsvp: {
				deadline: "",
				allowPlusOnes: false,
				maxPlusOnes: 0,
				dietaryOptions: [],
				customMessage: "",
			},
			faq: { items: [] },
			footer: { message: "" },
			details: { scheduleSummary: "", venueSummary: "" },
			calendar: { dateLabel: "", message: "" },
			countdown: { targetDate: "" },
		} as InvitationContent;

		const result = await generateAiContent({
			type: "style",
			sectionId: "design",
			prompt: "romantic theme with warm colors",
			context,
		});

		expect(result.cssVars).toBeDefined();
		expect(result.animationIntensity).toBeDefined();
	});
});
