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
	const {
		invitation,
		updateInvitation,
		autosaveStatus,
		setAutosaveStatus,
		addScheduleBlock,
		updateScheduleBlock,
		deleteScheduleBlock,
		moveScheduleBlock,
	} = useInvitationBuilder();

	const blocks = invitation.scheduleBlocks ?? [];
	const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

	return (
		<div>
			<span data-testid="partner1">{invitation.partner1Name}</span>
			<span data-testid="partner2">{invitation.partner2Name}</span>
			<span data-testid="venue">{invitation.venueName}</span>
			<span data-testid="status">{autosaveStatus}</span>
			<span data-testid="block-count">{blocks.length}</span>
			<span data-testid="block-titles">
				{blocks.map((b) => b.title).join(",")}
			</span>
			<span data-testid="sorted-block-titles">
				{sortedBlocks.map((b) => b.title).join(",")}
			</span>
			<button
				type="button"
				onClick={() => updateInvitation({ partner1Name: "Updated" })}
			>
				Update Name
			</button>
			<button type="button" onClick={() => setAutosaveStatus("saving")}>
				Set Saving
			</button>
			<button
				type="button"
				onClick={() => addScheduleBlock({ title: "Ceremony", time: "14:00" })}
			>
				Add Block
			</button>
			<button
				type="button"
				onClick={() => addScheduleBlock({ title: "Reception", time: "18:00" })}
			>
				Add Reception
			</button>
			<button
				type="button"
				onClick={() => addScheduleBlock({ title: "Dinner", time: "20:00" })}
			>
				Add Dinner
			</button>
			<button
				type="button"
				onClick={() => {
					if (blocks.length > 0) {
						updateScheduleBlock(blocks[0].id, { title: "Updated Ceremony" });
					}
				}}
			>
				Update Block
			</button>
			<button
				type="button"
				onClick={() => {
					if (blocks.length > 0) {
						deleteScheduleBlock(blocks[0].id);
					}
				}}
			>
				Delete Block
			</button>
			<button
				type="button"
				onClick={() => {
					if (sortedBlocks.length > 0) {
						moveScheduleBlock(sortedBlocks[0].id, "down");
					}
				}}
			>
				Move First Down
			</button>
			<button
				type="button"
				onClick={() => {
					if (sortedBlocks.length > 1) {
						moveScheduleBlock(sortedBlocks[1].id, "up");
					}
				}}
			>
				Move Second Up
			</button>
			<button
				type="button"
				onClick={() => {
					if (sortedBlocks.length > 0) {
						moveScheduleBlock(sortedBlocks[0].id, "up");
					}
				}}
			>
				Move First Up
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

	it("adds schedule block with generated id and order", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		expect(screen.getByTestId("block-count").textContent).toBe("0");

		act(() => {
			screen.getByText("Add Block").click();
		});

		expect(screen.getByTestId("block-count").textContent).toBe("1");
		expect(screen.getByTestId("block-titles").textContent).toBe("Ceremony");
	});

	it("assigns sequential order to new blocks", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		act(() => {
			screen.getByText("Add Block").click();
		});

		act(() => {
			screen.getByText("Add Block").click();
		});

		expect(screen.getByTestId("block-count").textContent).toBe("2");
	});

	it("updates schedule block by id", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		act(() => {
			screen.getByText("Add Block").click();
		});

		expect(screen.getByTestId("block-titles").textContent).toBe("Ceremony");

		act(() => {
			screen.getByText("Update Block").click();
		});

		expect(screen.getByTestId("block-titles").textContent).toBe(
			"Updated Ceremony",
		);
	});

	it("deletes schedule block by id", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		act(() => {
			screen.getByText("Add Block").click();
		});

		expect(screen.getByTestId("block-count").textContent).toBe("1");

		act(() => {
			screen.getByText("Delete Block").click();
		});

		expect(screen.getByTestId("block-count").textContent).toBe("0");
	});

	it("moves schedule block down in order", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		// Add two blocks
		act(() => {
			screen.getByText("Add Block").click(); // Ceremony
		});
		act(() => {
			screen.getByText("Add Reception").click(); // Reception
		});

		expect(screen.getByTestId("sorted-block-titles").textContent).toBe(
			"Ceremony,Reception",
		);

		// Move first block down
		act(() => {
			screen.getByText("Move First Down").click();
		});

		expect(screen.getByTestId("sorted-block-titles").textContent).toBe(
			"Reception,Ceremony",
		);
	});

	it("moves schedule block up in order", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		// Add two blocks
		act(() => {
			screen.getByText("Add Block").click(); // Ceremony
		});
		act(() => {
			screen.getByText("Add Reception").click(); // Reception
		});

		expect(screen.getByTestId("sorted-block-titles").textContent).toBe(
			"Ceremony,Reception",
		);

		// Move second block up
		act(() => {
			screen.getByText("Move Second Up").click();
		});

		expect(screen.getByTestId("sorted-block-titles").textContent).toBe(
			"Reception,Ceremony",
		);
	});

	it("does not move block beyond bounds (up at top)", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		// Add two blocks
		act(() => {
			screen.getByText("Add Block").click();
		});
		act(() => {
			screen.getByText("Add Reception").click();
		});

		expect(screen.getByTestId("sorted-block-titles").textContent).toBe(
			"Ceremony,Reception",
		);

		// Try to move first block up (already at top)
		act(() => {
			screen.getByText("Move First Up").click();
		});

		// Order should not change
		expect(screen.getByTestId("sorted-block-titles").textContent).toBe(
			"Ceremony,Reception",
		);
	});

	it("handles move with three or more blocks", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		// Add three blocks
		act(() => {
			screen.getByText("Add Block").click(); // Ceremony
		});
		act(() => {
			screen.getByText("Add Reception").click(); // Reception
		});
		act(() => {
			screen.getByText("Add Dinner").click(); // Dinner
		});

		expect(screen.getByTestId("sorted-block-titles").textContent).toBe(
			"Ceremony,Reception,Dinner",
		);

		// Move first block down
		act(() => {
			screen.getByText("Move First Down").click();
		});

		expect(screen.getByTestId("sorted-block-titles").textContent).toBe(
			"Reception,Ceremony,Dinner",
		);
	});
});
