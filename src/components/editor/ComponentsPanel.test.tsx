// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentsPanel, type WidgetDefinition } from "./ComponentsPanel";

/**
 * CE-007: Components library panel with wedding widgets
 *
 * Acceptance criteria:
 * - Components panel shows categorized widget list
 * - Categories: Interactive (countdown, map), Forms (RSVP), Media (gallery)
 * - Each component has icon, name, and description
 * - Dragging component to canvas adds it as widget element
 * - Available widgets: Countdown Timer, Venue Map, RSVP Form, Photo Gallery, Schedule Timeline
 */
describe("ComponentsPanel (CE-007)", () => {
	const mockOnAddWidget = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	describe("Panel Structure", () => {
		it("renders the components panel with title", () => {
			render(<ComponentsPanel onAddWidget={mockOnAddWidget} />);

			expect(screen.getByText("Components")).toBeDefined();
			expect(
				screen.getByText(/Click or drag a component to add/i),
			).toBeDefined();
		});

		it("shows all three categories", () => {
			render(<ComponentsPanel onAddWidget={mockOnAddWidget} />);

			expect(screen.getByText("Interactive")).toBeDefined();
			expect(screen.getByText("Forms")).toBeDefined();
			expect(screen.getByText("Media")).toBeDefined();
		});
	});

	describe("Interactive Category", () => {
		it("shows Countdown Timer widget", () => {
			render(<ComponentsPanel onAddWidget={mockOnAddWidget} />);

			expect(screen.getByText("Countdown Timer")).toBeDefined();
			expect(
				screen.getByText(/Display countdown to your event/i),
			).toBeDefined();
		});

		it("shows Venue Map widget", () => {
			render(<ComponentsPanel onAddWidget={mockOnAddWidget} />);

			expect(screen.getByText("Venue Map")).toBeDefined();
			expect(screen.getByText(/Show your venue location/i)).toBeDefined();
		});

		it("shows Schedule Timeline widget", () => {
			render(<ComponentsPanel onAddWidget={mockOnAddWidget} />);

			expect(screen.getByText("Schedule Timeline")).toBeDefined();
			expect(screen.getByText(/Display event schedule/i)).toBeDefined();
		});
	});

	describe("Forms Category", () => {
		it("shows RSVP Form widget", () => {
			render(<ComponentsPanel onAddWidget={mockOnAddWidget} />);

			expect(screen.getByText("RSVP Form")).toBeDefined();
			expect(screen.getByText(/Collect guest responses/i)).toBeDefined();
		});
	});

	describe("Media Category", () => {
		it("shows Photo Gallery widget", () => {
			render(<ComponentsPanel onAddWidget={mockOnAddWidget} />);

			expect(screen.getByText("Photo Gallery")).toBeDefined();
			expect(screen.getByText(/Display photos/i)).toBeDefined();
		});
	});

	describe("Widget Interactions", () => {
		it("calls onAddWidget when clicking Countdown Timer", async () => {
			const user = userEvent.setup();
			render(<ComponentsPanel onAddWidget={mockOnAddWidget} />);

			const countdownButton = screen.getByRole("button", {
				name: /Countdown Timer/i,
			});
			await user.click(countdownButton);

			expect(mockOnAddWidget).toHaveBeenCalledTimes(1);
			expect(mockOnAddWidget).toHaveBeenCalledWith(
				expect.objectContaining({
					id: "countdown-timer",
					type: "countdown",
					name: "Countdown Timer",
				}),
			);
		});

		it("calls onAddWidget when clicking Venue Map", async () => {
			const user = userEvent.setup();
			render(<ComponentsPanel onAddWidget={mockOnAddWidget} />);

			const mapButton = screen.getByRole("button", { name: /Venue Map/i });
			await user.click(mapButton);

			expect(mockOnAddWidget).toHaveBeenCalledTimes(1);
			expect(mockOnAddWidget).toHaveBeenCalledWith(
				expect.objectContaining({
					id: "venue-map",
					type: "map",
					name: "Venue Map",
				}),
			);
		});

		it("calls onAddWidget when clicking RSVP Form", async () => {
			const user = userEvent.setup();
			render(<ComponentsPanel onAddWidget={mockOnAddWidget} />);

			const rsvpButton = screen.getByRole("button", { name: /RSVP Form/i });
			await user.click(rsvpButton);

			expect(mockOnAddWidget).toHaveBeenCalledTimes(1);
			expect(mockOnAddWidget).toHaveBeenCalledWith(
				expect.objectContaining({
					id: "rsvp-form",
					type: "rsvp",
					name: "RSVP Form",
				}),
			);
		});

		it("calls onAddWidget when clicking Photo Gallery", async () => {
			const user = userEvent.setup();
			render(<ComponentsPanel onAddWidget={mockOnAddWidget} />);

			const galleryButton = screen.getByRole("button", {
				name: /Photo Gallery/i,
			});
			await user.click(galleryButton);

			expect(mockOnAddWidget).toHaveBeenCalledTimes(1);
			expect(mockOnAddWidget).toHaveBeenCalledWith(
				expect.objectContaining({
					id: "photo-gallery",
					type: "gallery",
					name: "Photo Gallery",
				}),
			);
		});

		it("calls onAddWidget when clicking Schedule Timeline", async () => {
			const user = userEvent.setup();
			render(<ComponentsPanel onAddWidget={mockOnAddWidget} />);

			const scheduleButton = screen.getByRole("button", {
				name: /Schedule Timeline/i,
			});
			await user.click(scheduleButton);

			expect(mockOnAddWidget).toHaveBeenCalledTimes(1);
			expect(mockOnAddWidget).toHaveBeenCalledWith(
				expect.objectContaining({
					id: "schedule-timeline",
					type: "schedule",
					name: "Schedule Timeline",
				}),
			);
		});
	});

	describe("Widget Definition Interface", () => {
		it("passes widget definition with all required fields", async () => {
			const user = userEvent.setup();
			render(<ComponentsPanel onAddWidget={mockOnAddWidget} />);

			const countdownButton = screen.getByRole("button", {
				name: /Countdown Timer/i,
			});
			await user.click(countdownButton);

			const widgetDef = mockOnAddWidget.mock.calls[0][0] as WidgetDefinition;
			expect(widgetDef).toHaveProperty("id");
			expect(widgetDef).toHaveProperty("type");
			expect(widgetDef).toHaveProperty("name");
			expect(widgetDef).toHaveProperty("description");
			expect(widgetDef).toHaveProperty("category");
			expect(widgetDef).toHaveProperty("defaultWidth");
			expect(widgetDef).toHaveProperty("defaultHeight");
		});
	});

	describe("Accessibility", () => {
		it("all widget buttons have accessible names", () => {
			render(<ComponentsPanel onAddWidget={mockOnAddWidget} />);

			// All 5 widgets should be accessible by their names
			expect(
				screen.getByRole("button", { name: /Countdown Timer/i }),
			).toBeDefined();
			expect(screen.getByRole("button", { name: /Venue Map/i })).toBeDefined();
			expect(screen.getByRole("button", { name: /RSVP Form/i })).toBeDefined();
			expect(
				screen.getByRole("button", { name: /Photo Gallery/i }),
			).toBeDefined();
			expect(
				screen.getByRole("button", { name: /Schedule Timeline/i }),
			).toBeDefined();
		});
	});
});
