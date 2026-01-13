// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Note, ScheduleBlock } from "@/contexts/InvitationBuilderContext";
import {
	InvitationBuilderProvider,
	type InvitationData,
} from "@/contexts/InvitationBuilderContext";
import {
	DEFAULT_ACCENT_COLOR,
	formatDate,
	formatTime,
	getAccentColorStyle,
	getFontStyle,
	InvitationPreview,
	sortBlocksByOrder,
	sortNotesByOrder,
} from "./InvitationPreview";
import { DEFAULT_FONT_PAIRING_ID, getFontPairingById } from "./ui/font-picker";

// Wrapper to provide context
function renderWithContext(invitationData: InvitationData) {
	return render(
		<InvitationBuilderProvider initialData={invitationData}>
			<InvitationPreview />
		</InvitationBuilderProvider>,
	);
}

describe("InvitationPreview", () => {
	afterEach(() => {
		cleanup();
	});

	const fullData: InvitationData = {
		id: "test-123",
		partner1Name: "Alice",
		partner2Name: "Bob",
		weddingDate: new Date(2026, 5, 15), // June 15, 2026
		weddingTime: "14:30",
		venueName: "Grand Ballroom",
		venueAddress: "123 Wedding Lane, City",
	};

	const emptyData: InvitationData = {
		id: "test-123",
		partner1Name: "",
		partner2Name: "",
	};

	it("displays partner names when provided", () => {
		renderWithContext(fullData);

		// Names are in the same h1 element, check via heading role
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading.textContent).toContain("Alice");
		expect(heading.textContent).toContain("Bob");
	});

	it("shows placeholder when names are empty", () => {
		renderWithContext(emptyData);

		expect(screen.getByText("Your Names Here")).toBeDefined();
	});

	it("displays formatted wedding date", () => {
		renderWithContext(fullData);

		expect(screen.getByText("June 15, 2026")).toBeDefined();
	});

	it("displays formatted wedding time", () => {
		renderWithContext(fullData);

		expect(screen.getByText("2:30 PM")).toBeDefined();
	});

	it("displays venue name and address", () => {
		renderWithContext(fullData);

		expect(screen.getByText("Grand Ballroom")).toBeDefined();
		expect(screen.getByText("123 Wedding Lane, City")).toBeDefined();
	});

	it("shows placeholder text when date/time are missing", () => {
		renderWithContext(emptyData);

		expect(screen.getByText("Date and time will appear here")).toBeDefined();
	});

	it("shows placeholder text when venue is missing", () => {
		renderWithContext(emptyData);

		expect(screen.getByText("Venue details will appear here")).toBeDefined();
	});

	it("renders RSVP section placeholder", () => {
		renderWithContext(fullData);

		expect(screen.getByText("RSVP")).toBeDefined();
	});

	it("shows schedule placeholder when no blocks exist", () => {
		renderWithContext(emptyData);

		expect(screen.getByText("Schedule")).toBeDefined();
		expect(screen.getByText("Schedule events will appear here")).toBeDefined();
	});

	it("displays schedule blocks when provided", () => {
		const dataWithBlocks: InvitationData = {
			...fullData,
			scheduleBlocks: [
				{ id: "1", title: "Ceremony", time: "14:00", order: 0 },
				{
					id: "2",
					title: "Reception",
					time: "16:00",
					description: "Grand Hall",
					order: 1,
				},
			],
		};
		renderWithContext(dataWithBlocks);

		expect(screen.getByText("Schedule")).toBeDefined();
		expect(screen.getByText("Ceremony")).toBeDefined();
		expect(screen.getByText("2:00 PM")).toBeDefined();
		expect(screen.getByText("Reception")).toBeDefined();
		expect(screen.getByText("4:00 PM")).toBeDefined();
		expect(screen.getByText("Grand Hall")).toBeDefined();
	});

	it("displays blocks sorted by order", () => {
		const dataWithBlocks: InvitationData = {
			...fullData,
			scheduleBlocks: [
				{ id: "2", title: "Reception", time: "16:00", order: 2 },
				{ id: "1", title: "Ceremony", time: "14:00", order: 0 },
				{ id: "3", title: "Dinner", time: "18:00", order: 1 },
			],
		};
		renderWithContext(dataWithBlocks);

		// Get all block titles and check order
		const blockTitles = screen.getAllByText(/Ceremony|Reception|Dinner/);
		expect(blockTitles[0].textContent).toBe("Ceremony");
		expect(blockTitles[1].textContent).toBe("Dinner");
		expect(blockTitles[2].textContent).toBe("Reception");
	});

	it("displays dash when block has no time", () => {
		const dataWithBlocks: InvitationData = {
			...fullData,
			scheduleBlocks: [{ id: "1", title: "Photos", order: 0 }],
		};
		renderWithContext(dataWithBlocks);

		expect(screen.getByText("Photos")).toBeDefined();
		expect(screen.getByText("—")).toBeDefined();
	});
});

describe("formatDate", () => {
	it("formats date correctly", () => {
		const date = new Date(2026, 5, 15); // June 15, 2026
		expect(formatDate(date)).toBe("June 15, 2026");
	});

	it("returns empty string for undefined", () => {
		expect(formatDate(undefined)).toBe("");
	});
});

describe("formatTime", () => {
	it("formats morning time correctly", () => {
		expect(formatTime("09:30")).toBe("9:30 AM");
	});

	it("formats afternoon time correctly", () => {
		expect(formatTime("14:30")).toBe("2:30 PM");
	});

	it("formats noon correctly", () => {
		expect(formatTime("12:00")).toBe("12:00 PM");
	});

	it("formats midnight correctly", () => {
		expect(formatTime("00:00")).toBe("12:00 AM");
	});

	it("returns empty string for undefined", () => {
		expect(formatTime(undefined)).toBe("");
	});
});

describe("sortBlocksByOrder", () => {
	it("sorts blocks by order field ascending", () => {
		const blocks: ScheduleBlock[] = [
			{ id: "3", title: "Third", order: 2 },
			{ id: "1", title: "First", order: 0 },
			{ id: "2", title: "Second", order: 1 },
		];
		const sorted = sortBlocksByOrder(blocks);
		expect(sorted[0].title).toBe("First");
		expect(sorted[1].title).toBe("Second");
		expect(sorted[2].title).toBe("Third");
	});

	it("returns empty array for empty input", () => {
		expect(sortBlocksByOrder([])).toEqual([]);
	});

	it("does not mutate original array", () => {
		const blocks: ScheduleBlock[] = [
			{ id: "2", title: "Second", order: 1 },
			{ id: "1", title: "First", order: 0 },
		];
		const original = [...blocks];
		sortBlocksByOrder(blocks);
		expect(blocks[0].id).toBe(original[0].id);
		expect(blocks[1].id).toBe(original[1].id);
	});
});

describe("sortNotesByOrder", () => {
	it("sorts notes by order field ascending", () => {
		const notes: Note[] = [
			{ id: "3", title: "Third", order: 2 },
			{ id: "1", title: "First", order: 0 },
			{ id: "2", title: "Second", order: 1 },
		];
		const sorted = sortNotesByOrder(notes);
		expect(sorted[0].title).toBe("First");
		expect(sorted[1].title).toBe("Second");
		expect(sorted[2].title).toBe("Third");
	});

	it("returns empty array for empty input", () => {
		expect(sortNotesByOrder([])).toEqual([]);
	});

	it("does not mutate original array", () => {
		const notes: Note[] = [
			{ id: "2", title: "Second", order: 1 },
			{ id: "1", title: "First", order: 0 },
		];
		const original = [...notes];
		sortNotesByOrder(notes);
		expect(notes[0].id).toBe(original[0].id);
		expect(notes[1].id).toBe(original[1].id);
	});
});

describe("InvitationPreview notes section", () => {
	afterEach(() => {
		cleanup();
	});

	const baseData: InvitationData = {
		id: "test-123",
		partner1Name: "Alice",
		partner2Name: "Bob",
	};

	it("shows notes placeholder when no notes exist", () => {
		render(
			<InvitationBuilderProvider initialData={baseData}>
				<InvitationPreview />
			</InvitationBuilderProvider>,
		);

		expect(screen.getByText("Things to Know")).toBeDefined();
		expect(screen.getByText("Notes and FAQ will appear here")).toBeDefined();
	});

	it("displays notes when provided", () => {
		const dataWithNotes: InvitationData = {
			...baseData,
			notes: [
				{
					id: "1",
					title: "Dress Code",
					description: "Black tie optional",
					order: 0,
				},
				{ id: "2", title: "Parking", order: 1 },
			],
		};
		render(
			<InvitationBuilderProvider initialData={dataWithNotes}>
				<InvitationPreview />
			</InvitationBuilderProvider>,
		);

		expect(screen.getByText("Things to Know")).toBeDefined();
		expect(screen.getByText("Dress Code")).toBeDefined();
		expect(screen.getByText("Black tie optional")).toBeDefined();
		expect(screen.getByText("Parking")).toBeDefined();
	});

	it("displays notes sorted by order", () => {
		const dataWithNotes: InvitationData = {
			...baseData,
			notes: [
				{ id: "2", title: "Parking", order: 2 },
				{ id: "1", title: "Dress Code", order: 0 },
				{ id: "3", title: "Kids Policy", order: 1 },
			],
		};
		render(
			<InvitationBuilderProvider initialData={dataWithNotes}>
				<InvitationPreview />
			</InvitationBuilderProvider>,
		);

		// Get all note titles and check order
		const noteTitles = screen.getAllByText(/Dress Code|Parking|Kids Policy/);
		expect(noteTitles[0].textContent).toBe("Dress Code");
		expect(noteTitles[1].textContent).toBe("Kids Policy");
		expect(noteTitles[2].textContent).toBe("Parking");
	});

	it("displays note without description when description is undefined", () => {
		const dataWithNotes: InvitationData = {
			...baseData,
			notes: [{ id: "1", title: "No Description Note", order: 0 }],
		};
		render(
			<InvitationBuilderProvider initialData={dataWithNotes}>
				<InvitationPreview />
			</InvitationBuilderProvider>,
		);

		expect(screen.getByText("No Description Note")).toBeDefined();
	});
});

describe("getAccentColorStyle", () => {
	it("returns CSS custom properties with provided color", () => {
		const style = getAccentColorStyle("#ff5500") as Record<string, string>;
		expect(style["--accent-color"]).toBe("#ff5500");
	});

	it("uses default color when undefined", () => {
		const style = getAccentColorStyle(undefined) as Record<string, string>;
		expect(style["--accent-color"]).toBe(DEFAULT_ACCENT_COLOR);
	});

	it("uses default color when empty string", () => {
		const style = getAccentColorStyle("") as Record<string, string>;
		expect(style["--accent-color"]).toBe(DEFAULT_ACCENT_COLOR);
	});
});

describe("DEFAULT_ACCENT_COLOR", () => {
	it("is a valid hex color", () => {
		expect(DEFAULT_ACCENT_COLOR).toMatch(/^#[0-9a-f]{6}$/i);
	});
});

describe("InvitationPreview accent color", () => {
	afterEach(() => {
		cleanup();
	});

	const baseData: InvitationData = {
		id: "test-123",
		partner1Name: "Alice",
		partner2Name: "Bob",
	};

	it("applies accent color CSS custom property to root element", () => {
		const dataWithColor: InvitationData = {
			...baseData,
			accentColor: "#9caf88",
		};
		const { container } = render(
			<InvitationBuilderProvider initialData={dataWithColor}>
				<InvitationPreview />
			</InvitationBuilderProvider>,
		);

		const rootDiv = container.firstChild as HTMLElement;
		expect(rootDiv.style.getPropertyValue("--accent-color")).toBe("#9caf88");
	});

	it("uses default accent color when not provided", () => {
		const { container } = render(
			<InvitationBuilderProvider initialData={baseData}>
				<InvitationPreview />
			</InvitationBuilderProvider>,
		);

		const rootDiv = container.firstChild as HTMLElement;
		expect(rootDiv.style.getPropertyValue("--accent-color")).toBe(
			DEFAULT_ACCENT_COLOR,
		);
	});
});

describe("getFontStyle", () => {
	it("returns CSS custom properties with font families", () => {
		const style = getFontStyle("classic") as Record<string, string>;
		expect(style["--font-heading"]).toContain("Playfair Display");
		expect(style["--font-body"]).toContain("Lato");
	});

	it("uses default pairing when undefined", () => {
		const style = getFontStyle(undefined) as Record<string, string>;
		const defaultPairing = getFontPairingById(DEFAULT_FONT_PAIRING_ID);
		expect(style["--font-heading"]).toContain(defaultPairing.headingFont);
		expect(style["--font-body"]).toContain(defaultPairing.bodyFont);
	});

	it("uses default pairing for invalid ID", () => {
		const style = getFontStyle("nonexistent") as Record<string, string>;
		const defaultPairing = getFontPairingById(DEFAULT_FONT_PAIRING_ID);
		expect(style["--font-heading"]).toContain(defaultPairing.headingFont);
	});

	it("includes fallback font families", () => {
		const style = getFontStyle("classic") as Record<string, string>;
		expect(style["--font-heading"]).toContain("serif");
		expect(style["--font-body"]).toContain("sans-serif");
	});
});

describe("InvitationPreview font styles", () => {
	afterEach(() => {
		cleanup();
	});

	const baseData: InvitationData = {
		id: "test-123",
		partner1Name: "Alice",
		partner2Name: "Bob",
	};

	it("applies font CSS custom properties to root element", () => {
		const dataWithFont: InvitationData = {
			...baseData,
			fontPairing: "whimsical",
		};
		const { container } = render(
			<InvitationBuilderProvider initialData={dataWithFont}>
				<InvitationPreview />
			</InvitationBuilderProvider>,
		);

		const rootDiv = container.firstChild as HTMLElement;
		expect(rootDiv.style.getPropertyValue("--font-heading")).toContain(
			"Dancing Script",
		);
		expect(rootDiv.style.getPropertyValue("--font-body")).toContain("Poppins");
	});

	it("uses default font pairing when not provided", () => {
		const { container } = render(
			<InvitationBuilderProvider initialData={baseData}>
				<InvitationPreview />
			</InvitationBuilderProvider>,
		);

		const rootDiv = container.firstChild as HTMLElement;
		const defaultPairing = getFontPairingById(DEFAULT_FONT_PAIRING_ID);
		expect(rootDiv.style.getPropertyValue("--font-heading")).toContain(
			defaultPairing.headingFont,
		);
	});
});

describe("InvitationPreview viewport mode", () => {
	afterEach(() => {
		cleanup();
	});

	const baseData: InvitationData = {
		id: "test-123",
		partner1Name: "Alice",
		partner2Name: "Bob",
	};

	it("defaults to desktop viewport mode", () => {
		const { container } = render(
			<InvitationBuilderProvider initialData={baseData}>
				<InvitationPreview />
			</InvitationBuilderProvider>,
		);

		const rootDiv = container.firstChild as HTMLElement;
		expect(rootDiv.getAttribute("data-viewport")).toBe("desktop");
	});

	it("applies desktop styling when viewportMode is desktop", () => {
		const { container } = render(
			<InvitationBuilderProvider initialData={baseData}>
				<InvitationPreview viewportMode="desktop" />
			</InvitationBuilderProvider>,
		);

		const rootDiv = container.firstChild as HTMLElement;
		expect(rootDiv.getAttribute("data-viewport")).toBe("desktop");
		expect(rootDiv.className).toContain("min-h-[400px]");
		expect(rootDiv.className).not.toContain("max-w-[375px]");
	});

	it("applies mobile styling when viewportMode is mobile", () => {
		const { container } = render(
			<InvitationBuilderProvider initialData={baseData}>
				<InvitationPreview viewportMode="mobile" />
			</InvitationBuilderProvider>,
		);

		const rootDiv = container.firstChild as HTMLElement;
		expect(rootDiv.getAttribute("data-viewport")).toBe("mobile");
		expect(rootDiv.className).toContain("max-w-[375px]");
		expect(rootDiv.className).toContain("min-h-[667px]");
	});

	it("applies transition class for smooth mode switching", () => {
		const { container } = render(
			<InvitationBuilderProvider initialData={baseData}>
				<InvitationPreview viewportMode="mobile" />
			</InvitationBuilderProvider>,
		);

		const rootDiv = container.firstChild as HTMLElement;
		expect(rootDiv.className).toContain("transition-all");
	});
});
