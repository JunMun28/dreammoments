// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	InvitationBuilderProvider,
	type InvitationData,
	useInvitationBuilder,
} from "./InvitationBuilderContext";

// Test consumer component
function TestConsumer() {
	const { invitation, updateInvitation, autosaveStatus, setAutosaveStatus } =
		useInvitationBuilder();

	return (
		<div>
			<span data-testid="partner1">{invitation.partner1Name}</span>
			<span data-testid="partner2">{invitation.partner2Name}</span>
			<span data-testid="venue">{invitation.venueName}</span>
			<span data-testid="status">{autosaveStatus}</span>
			<button
				type="button"
				onClick={() => updateInvitation({ partner1Name: "Updated" })}
			>
				Update Name
			</button>
			<button type="button" onClick={() => setAutosaveStatus("saving")}>
				Set Saving
			</button>
		</div>
	);
}

describe("InvitationBuilderContext", () => {
	afterEach(() => {
		cleanup();
	});

	const mockInitialData: InvitationData = {
		id: "test-123",
		partner1Name: "Alice",
		partner2Name: "Bob",
		weddingDate: new Date(2026, 5, 15),
		weddingTime: "14:00",
		venueName: "Grand Hall",
		venueAddress: "123 Main St",
	};

	it("provides initial invitation data to consumers", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		expect(screen.getByTestId("partner1").textContent).toBe("Alice");
		expect(screen.getByTestId("partner2").textContent).toBe("Bob");
		expect(screen.getByTestId("venue").textContent).toBe("Grand Hall");
	});

	it("updates invitation data when updateInvitation is called", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		expect(screen.getByTestId("partner1").textContent).toBe("Alice");

		act(() => {
			screen.getByText("Update Name").click();
		});

		expect(screen.getByTestId("partner1").textContent).toBe("Updated");
	});

	it("initializes with idle autosave status", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		expect(screen.getByTestId("status").textContent).toBe("idle");
	});

	it("updates autosave status when setAutosaveStatus is called", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		expect(screen.getByTestId("status").textContent).toBe("idle");

		act(() => {
			screen.getByText("Set Saving").click();
		});

		expect(screen.getByTestId("status").textContent).toBe("saving");
	});

	it("throws error when useInvitationBuilder is used outside provider", () => {
		// Suppress console.error for this test
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => render(<TestConsumer />)).toThrow(
			"useInvitationBuilder must be used within InvitationBuilderProvider",
		);

		consoleSpy.mockRestore();
	});
});
