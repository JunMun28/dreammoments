// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { InvitationContent } from "../lib/types";
import type { SectionConfig } from "../templates/types";

// Mock external dependencies used by useAutoSave
vi.mock("../api/invitations", () => ({
	updateInvitationFn: vi.fn().mockResolvedValue({}),
}));
vi.mock("../lib/data", () => ({
	updateInvitationContent: vi.fn(),
	setInvitationVisibility: vi.fn(),
}));

import { useAutoSave } from "../components/editor/hooks/useAutoSave";
import {
	getValueByPath,
	setValueByPath,
	useEditorState,
	validateField,
} from "../components/editor/hooks/useEditorState";
import { useFieldValidation } from "../components/editor/hooks/useFieldValidation";
import { useMediaQuery } from "../components/editor/hooks/useMediaQuery";
import { useSectionProgress } from "../components/editor/hooks/useSectionProgress";

function makeContent(
	overrides?: Partial<InvitationContent>,
): InvitationContent {
	return {
		hero: {
			partnerOneName: "Alice",
			partnerTwoName: "Bob",
			tagline: "Together forever",
			date: "2025-12-25",
		},
		announcement: { title: "", message: "", formalText: "" },
		couple: {
			partnerOne: { fullName: "Alice Tan", bio: "", photoUrl: "" },
			partnerTwo: { fullName: "Bob Lim", bio: "", photoUrl: "" },
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
		...overrides,
	};
}

// ─── getValueByPath / setValueByPath (pure functions) ───────────────────────

describe("getValueByPath", () => {
	const content = makeContent();

	test("returns string value at a shallow path", () => {
		expect(getValueByPath(content, "hero.partnerOneName")).toBe("Alice");
	});

	test("returns string value at a deeper nested path", () => {
		expect(getValueByPath(content, "couple.partnerOne.fullName")).toBe(
			"Alice Tan",
		);
	});

	test("returns empty string for missing path", () => {
		expect(getValueByPath(content, "hero.nonexistent")).toBe("");
	});

	test("returns empty string for null-ish intermediate", () => {
		expect(getValueByPath(content, "missing.deep.path")).toBe("");
	});

	test("converts number to string", () => {
		expect(getValueByPath(content, "rsvp.maxPlusOnes")).toBe("0");
	});

	test("converts boolean to string", () => {
		expect(getValueByPath(content, "rsvp.allowPlusOnes")).toBe("false");
	});
});

describe("setValueByPath", () => {
	test("sets a shallow nested value", () => {
		const content = makeContent();
		const updated = setValueByPath(content, "hero.tagline", "New tagline");
		expect(updated.hero.tagline).toBe("New tagline");
	});

	test("sets a deeply nested value", () => {
		const content = makeContent();
		const updated = setValueByPath(
			content,
			"couple.partnerOne.fullName",
			"Carol Wong",
		);
		expect(updated.couple.partnerOne.fullName).toBe("Carol Wong");
	});

	test("does not mutate the original content", () => {
		const content = makeContent();
		const updated = setValueByPath(content, "hero.tagline", "Changed");
		expect(content.hero.tagline).toBe("Together forever");
		expect(updated.hero.tagline).toBe("Changed");
	});

	test("creates intermediate objects when needed", () => {
		const content = makeContent();
		const updated = setValueByPath(
			content,
			"gift.paymentUrl",
			"https://pay.me",
		);
		expect(
			(updated as unknown as Record<string, Record<string, unknown>>).gift
				.paymentUrl,
		).toBe("https://pay.me");
	});
});

// ─── validateField ──────────────────────────────────────────────────────────

describe("validateField", () => {
	test("returns error for required empty field", () => {
		const field = {
			id: "name",
			label: "Name",
			type: "text" as const,
			required: true,
		};
		expect(validateField(field, "")).toBe("Name is required");
		expect(validateField(field, "   ")).toBe("Name is required");
	});

	test("returns empty string for valid required field", () => {
		const field = {
			id: "name",
			label: "Name",
			type: "text" as const,
			required: true,
		};
		expect(validateField(field, "Alice")).toBe("");
	});

	test("validates date format", () => {
		const field = { id: "date", label: "Date", type: "date" as const };
		expect(validateField(field, "not-a-date")).toBe("Use YYYY-MM-DD format");
		expect(validateField(field, "2025-12-25")).toBe("");
	});

	test("validates email-like fields", () => {
		const field = { id: "contactEmail", label: "Email", type: "text" as const };
		expect(validateField(field, "bad")).toBe("Invalid email");
		expect(validateField(field, "test@example.com")).toBe("");
	});

	test("returns empty string for optional empty field", () => {
		const field = { id: "bio", label: "Bio", type: "textarea" as const };
		expect(validateField(field, "")).toBe("");
	});
});

// ─── useEditorState ─────────────────────────────────────────────────────────

describe("useEditorState", () => {
	const initialContent = makeContent();
	const initialVisibility: Record<string, boolean> = {
		hero: true,
		couple: true,
	};
	const initialSection = "hero";

	test("initial state has expected structure", () => {
		const { result } = renderHook(() =>
			useEditorState({ initialContent, initialVisibility, initialSection }),
		);

		expect(result.current.draft).toEqual(initialContent);
		expect(result.current.activeSection).toBe("hero");
		expect(result.current.sectionVisibility).toEqual(initialVisibility);
		expect(result.current.canUndo).toBe(false);
		expect(result.current.canRedo).toBe(false);
		expect(result.current.version).toBe(0);
	});

	test("handleFieldChange updates nested content", () => {
		const { result } = renderHook(() =>
			useEditorState({ initialContent, initialVisibility, initialSection }),
		);

		act(() => {
			result.current.handleFieldChange("hero.tagline", "Love is in the air");
		});

		expect(result.current.draft.hero.tagline).toBe("Love is in the air");
		expect(result.current.version).toBe(1);
	});

	test("updateDraft replaces entire draft and increments version", () => {
		const { result } = renderHook(() =>
			useEditorState({ initialContent, initialVisibility, initialSection }),
		);

		const newContent = makeContent({
			hero: { ...initialContent.hero, tagline: "Updated" },
		});
		act(() => {
			result.current.updateDraft(newContent);
		});

		expect(result.current.draft.hero.tagline).toBe("Updated");
		expect(result.current.version).toBe(1);
	});

	test("undo restores previous state after update", () => {
		const { result } = renderHook(() =>
			useEditorState({ initialContent, initialVisibility, initialSection }),
		);

		act(() => {
			result.current.handleFieldChange("hero.tagline", "Version 1");
		});
		expect(result.current.draft.hero.tagline).toBe("Version 1");

		act(() => {
			result.current.handleUndo();
		});
		expect(result.current.draft.hero.tagline).toBe("Together forever");
		expect(result.current.canUndo).toBe(false);
		expect(result.current.canRedo).toBe(true);
	});

	test("redo reapplies undone changes", () => {
		const { result } = renderHook(() =>
			useEditorState({ initialContent, initialVisibility, initialSection }),
		);

		act(() => {
			result.current.handleFieldChange("hero.tagline", "Version 1");
		});
		act(() => {
			result.current.handleUndo();
		});
		act(() => {
			result.current.handleRedo();
		});

		expect(result.current.draft.hero.tagline).toBe("Version 1");
		expect(result.current.canRedo).toBe(false);
		expect(result.current.canUndo).toBe(true);
	});

	test("multiple sequential updates tracked in history", () => {
		const { result } = renderHook(() =>
			useEditorState({ initialContent, initialVisibility, initialSection }),
		);

		// Use different field paths so each push is immediate (not debounced)
		act(() => {
			result.current.handleFieldChange("hero.tagline", "V1");
		});
		act(() => {
			result.current.handleFieldChange("hero.date", "2025-12-01");
		});
		act(() => {
			result.current.handleFieldChange("hero.tagline", "V3");
		});

		expect(result.current.draft.hero.tagline).toBe("V3");
		expect(result.current.version).toBe(3);

		// Undo back through each distinct field change
		act(() => {
			result.current.handleUndo();
		});
		expect(result.current.draft.hero.date).toBe("2025-12-01");
		expect(result.current.draft.hero.tagline).toBe("V1");

		act(() => {
			result.current.handleUndo();
		});
		expect(result.current.draft.hero.tagline).toBe("V1");

		act(() => {
			result.current.handleUndo();
		});
		expect(result.current.draft.hero.tagline).toBe("Together forever");
	});

	test("new update after undo clears redo history", () => {
		const { result } = renderHook(() =>
			useEditorState({ initialContent, initialVisibility, initialSection }),
		);

		act(() => {
			result.current.handleFieldChange("hero.tagline", "V1");
		});
		act(() => {
			result.current.handleUndo();
		});
		expect(result.current.canRedo).toBe(true);

		act(() => {
			result.current.handleFieldChange("hero.tagline", "V2");
		});
		expect(result.current.canRedo).toBe(false);
	});

	test("handleFieldChange normalizes maxPlusOnes to number", () => {
		const { result } = renderHook(() =>
			useEditorState({ initialContent, initialVisibility, initialSection }),
		);

		act(() => {
			result.current.handleFieldChange("rsvp.maxPlusOnes", "5");
		});
		expect(result.current.draft.rsvp.maxPlusOnes).toBe(5);
	});

	test("setActiveSection changes the active section", () => {
		const { result } = renderHook(() =>
			useEditorState({ initialContent, initialVisibility, initialSection }),
		);

		act(() => {
			result.current.setActiveSection("couple");
		});
		expect(result.current.activeSection).toBe("couple");
	});

	test("hiddenSections is inverse of sectionVisibility", () => {
		const { result } = renderHook(() =>
			useEditorState({
				initialContent,
				initialVisibility: { hero: true, couple: false, story: true },
				initialSection,
			}),
		);

		expect(result.current.hiddenSections).toEqual({
			hero: false,
			couple: true,
			story: false,
		});
	});
});

// ─── useAutoSave ────────────────────────────────────────────────────────────

describe("useAutoSave", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.clearAllMocks();
		localStorage.clear();
	});

	function makeAutoSaveParams(version = 0) {
		return {
			invitationId: "inv-123",
			draftRef: { current: makeContent() },
			visibilityRef: { current: { hero: true } },
			version,
			onSaveError: vi.fn(),
		};
	}

	test("initial save status is 'saved'", () => {
		const params = makeAutoSaveParams(0);
		const { result } = renderHook(() => useAutoSave(params));

		expect(result.current.saveStatus).toBe("saved");
		expect(result.current.hasUnsavedChanges).toBe(false);
	});

	test("marks unsaved when version changes", () => {
		const params = makeAutoSaveParams(0);
		const { result, rerender } = renderHook((props) => useAutoSave(props), {
			initialProps: params,
		});

		expect(result.current.hasUnsavedChanges).toBe(false);

		// Simulate a version bump (content changed)
		rerender({ ...params, version: 1 });

		expect(result.current.hasUnsavedChanges).toBe(true);
		expect(result.current.saveStatus).toBe("unsaved");
	});

	test("saveNow persists and updates status to saved", async () => {
		const params = makeAutoSaveParams(1);
		const { result } = renderHook(() => useAutoSave(params));

		await act(async () => {
			await result.current.saveNow();
		});

		expect(result.current.saveStatus).toBe("saved");
		expect(result.current.autosaveAt).not.toBe("");
		expect(result.current.hasUnsavedChanges).toBe(false);
	});

	test("periodic interval triggers saveNow every 30 seconds", async () => {
		const params = makeAutoSaveParams(1);
		const { result } = renderHook(() => useAutoSave(params));

		// Advance 30 seconds to trigger the interval
		await act(async () => {
			vi.advanceTimersByTime(30000);
		});

		expect(result.current.saveStatus).toBe("saved");
	});

	test("does not save when version has not changed", async () => {
		const { updateInvitationContent } = await import("../lib/data");
		const params = makeAutoSaveParams(0);
		const { result } = renderHook(() => useAutoSave(params));

		await act(async () => {
			await result.current.saveNow();
		});

		// Should not have written because version === lastSavedVersion (both 0)
		expect(updateInvitationContent).not.toHaveBeenCalled();
		expect(result.current.saveStatus).toBe("saved");
	});

	test("reports error status when save fails", async () => {
		const { updateInvitationContent } = await import("../lib/data");
		(
			updateInvitationContent as ReturnType<typeof vi.fn>
		).mockImplementationOnce(() => {
			throw new Error("Storage full");
		});

		const onSaveError = vi.fn();
		const params = { ...makeAutoSaveParams(1), onSaveError };
		const { result } = renderHook(() => useAutoSave(params));

		await act(async () => {
			await result.current.saveNow();
		});

		expect(result.current.saveStatus).toBe("error");
		expect(result.current.saveError).toBe("Storage full");
		expect(onSaveError).toHaveBeenCalledWith("Storage full");
	});

	afterEach(() => {
		vi.useRealTimers();
	});
});

// ─── useFieldValidation ─────────────────────────────────────────────────────

describe("useFieldValidation", () => {
	test("validate stores error for invalid field", () => {
		const { result } = renderHook(() => useFieldValidation());

		act(() => {
			result.current.validate(
				"hero.partnerOneName",
				{
					id: "partnerOneName",
					label: "Partner Name",
					type: "text",
					required: true,
				},
				"",
			);
		});

		expect(result.current.errors["hero.partnerOneName"]).toBe(
			"Partner Name is required",
		);
	});

	test("validate clears error for valid field", () => {
		const { result } = renderHook(() => useFieldValidation());

		act(() => {
			result.current.validate(
				"hero.date",
				{ id: "date", label: "Date", type: "date" },
				"bad-date",
			);
		});
		expect(result.current.errors["hero.date"]).toBe("Use YYYY-MM-DD format");

		act(() => {
			result.current.validate(
				"hero.date",
				{ id: "date", label: "Date", type: "date" },
				"2025-12-25",
			);
		});
		expect(result.current.errors["hero.date"]).toBe("");
	});

	test("clearError removes a specific error", () => {
		const { result } = renderHook(() => useFieldValidation());

		act(() => {
			result.current.validate(
				"hero.date",
				{ id: "date", label: "Date", type: "date" },
				"bad",
			);
		});
		expect(result.current.errors["hero.date"]).toBeTruthy();

		act(() => {
			result.current.clearError("hero.date");
		});
		expect(result.current.errors["hero.date"]).toBeUndefined();
	});

	test("clearAll removes all errors", () => {
		const { result } = renderHook(() => useFieldValidation());

		act(() => {
			result.current.validate(
				"a",
				{ id: "a", label: "A", type: "text", required: true },
				"",
			);
			result.current.validate(
				"b",
				{ id: "b", label: "B", type: "text", required: true },
				"",
			);
		});
		expect(Object.keys(result.current.errors).length).toBe(2);

		act(() => {
			result.current.clearAll();
		});
		expect(Object.keys(result.current.errors).length).toBe(0);
	});
});

// ─── useMediaQuery ──────────────────────────────────────────────────────────

describe("useMediaQuery", () => {
	test("is a callable function", () => {
		expect(typeof useMediaQuery).toBe("function");
	});

	test("returns false for non-matching queries in jsdom", () => {
		// jsdom does not implement matchMedia, so we mock it
		const mql = {
			matches: false,
			media: "(min-width: 768px)",
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		};
		window.matchMedia = vi.fn().mockReturnValue(mql);

		const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
		expect(result.current).toBe(false);
	});
});

// ─── useSectionProgress ────────────────────────────────────────────────────

describe("useSectionProgress", () => {
	const makeSections = (): SectionConfig[] => [
		{
			id: "hero",
			type: "hero",
			defaultVisible: true,
			fields: [
				{
					id: "partnerOneName",
					label: "Partner 1",
					type: "text",
					required: true,
				},
				{
					id: "partnerTwoName",
					label: "Partner 2",
					type: "text",
					required: true,
				},
				{ id: "tagline", label: "Tagline", type: "text" },
				{ id: "date", label: "Date", type: "date" },
			],
		},
		{
			id: "story",
			type: "story",
			defaultVisible: true,
			fields: [{ id: "milestones", label: "Milestones", type: "list" }],
		},
		{
			id: "announcement",
			type: "announcement",
			defaultVisible: true,
			fields: [],
		},
	];

	test("returns correct progress for filled fields", () => {
		const content = makeContent();
		const sections = makeSections();
		const visibility = { hero: true, story: true, announcement: true };

		const { result } = renderHook(() =>
			useSectionProgress({ sections, content, sectionVisibility: visibility }),
		);

		// hero: partnerOneName=Alice, partnerTwoName=Bob, tagline=filled, date=filled => 4/4 = 100
		expect(result.current.hero).toBe(100);
	});

	test("returns 0 for sections with no filled fields", () => {
		const content = makeContent({
			hero: { partnerOneName: "", partnerTwoName: "", tagline: "", date: "" },
		});
		const sections = makeSections();
		const visibility = { hero: true, story: true, announcement: true };

		const { result } = renderHook(() =>
			useSectionProgress({ sections, content, sectionVisibility: visibility }),
		);

		expect(result.current.hero).toBe(0);
	});

	test("returns partial progress when some fields are filled", () => {
		const content = makeContent({
			hero: {
				partnerOneName: "Alice",
				partnerTwoName: "",
				tagline: "",
				date: "",
			},
		});
		const sections = makeSections();
		const visibility = { hero: true, story: true, announcement: true };

		const { result } = renderHook(() =>
			useSectionProgress({ sections, content, sectionVisibility: visibility }),
		);

		// 1 out of 4 fields filled => 25
		expect(result.current.hero).toBe(25);
	});

	test("returns 0 for hidden sections", () => {
		const content = makeContent();
		const sections = makeSections();
		const visibility = { hero: false, story: true, announcement: true };

		const { result } = renderHook(() =>
			useSectionProgress({ sections, content, sectionVisibility: visibility }),
		);

		expect(result.current.hero).toBe(0);
	});

	test("returns 100 for section with no fields", () => {
		const content = makeContent();
		const sections = makeSections();
		const visibility = { hero: true, story: true, announcement: true };

		const { result } = renderHook(() =>
			useSectionProgress({ sections, content, sectionVisibility: visibility }),
		);

		// announcement has 0 fields => 100%
		expect(result.current.announcement).toBe(100);
	});

	test("list field counts as filled when array has items", () => {
		const content = makeContent({
			story: {
				milestones: [
					{ date: "2020-01-01", title: "Met", description: "First meeting" },
				],
			},
		});
		const sections = makeSections();
		const visibility = { hero: true, story: true, announcement: true };

		const { result } = renderHook(() =>
			useSectionProgress({ sections, content, sectionVisibility: visibility }),
		);

		expect(result.current.story).toBe(100);
	});

	test("list field counts as unfilled when array is empty", () => {
		const content = makeContent({ story: { milestones: [] } });
		const sections = makeSections();
		const visibility = { hero: true, story: true, announcement: true };

		const { result } = renderHook(() =>
			useSectionProgress({ sections, content, sectionVisibility: visibility }),
		);

		expect(result.current.story).toBe(0);
	});

	test("handles empty content gracefully", () => {
		const content = {} as InvitationContent;
		const sections = makeSections();
		const visibility = { hero: true, story: true, announcement: true };

		const { result } = renderHook(() =>
			useSectionProgress({ sections, content, sectionVisibility: visibility }),
		);

		expect(result.current.hero).toBe(0);
		expect(result.current.story).toBe(0);
		expect(result.current.announcement).toBe(100);
	});
});
