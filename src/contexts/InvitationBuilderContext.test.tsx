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
		addNote,
		updateNote,
		deleteNote,
		moveNote,
		addGuestGroup,
		updateGuestGroup,
		deleteGuestGroup,
		addGuest,
		updateGuest,
		deleteGuest,
		setGuestGroups,
	} = useInvitationBuilder();

	const blocks = invitation.scheduleBlocks ?? [];
	const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

	const notes = invitation.notes ?? [];
	const sortedNotes = [...notes].sort((a, b) => a.order - b.order);

	const guestGroups = invitation.guestGroups ?? [];
	const totalGuests = guestGroups.reduce((sum, g) => sum + g.guests.length, 0);

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
			<span data-testid="note-count">{notes.length}</span>
			<span data-testid="note-titles">
				{notes.map((n) => n.title).join(",")}
			</span>
			<span data-testid="sorted-note-titles">
				{sortedNotes.map((n) => n.title).join(",")}
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
			<button
				type="button"
				onClick={() =>
					addNote({ title: "Dress Code", description: "Black tie optional" })
				}
			>
				Add Dress Code Note
			</button>
			<button
				type="button"
				onClick={() =>
					addNote({ title: "Kids Policy", description: "Adults only" })
				}
			>
				Add Kids Policy Note
			</button>
			<button
				type="button"
				onClick={() => {
					if (notes.length > 0) {
						updateNote(notes[0].id, { title: "Updated Dress Code" });
					}
				}}
			>
				Update Note
			</button>
			<button
				type="button"
				onClick={() => {
					if (notes.length > 0) {
						deleteNote(notes[0].id);
					}
				}}
			>
				Delete Note
			</button>
			<button
				type="button"
				onClick={() => {
					if (sortedNotes.length > 0) {
						moveNote(sortedNotes[0].id, "down");
					}
				}}
			>
				Move First Note Down
			</button>
			<button
				type="button"
				onClick={() => {
					if (sortedNotes.length > 1) {
						moveNote(sortedNotes[1].id, "up");
					}
				}}
			>
				Move Second Note Up
			</button>
			{/* Guest group displays */}
			<span data-testid="group-count">{guestGroups.length}</span>
			<span data-testid="group-names">
				{guestGroups.map((g) => g.name).join(",")}
			</span>
			<span data-testid="guest-count">{totalGuests}</span>
			{/* Guest group buttons */}
			<button
				type="button"
				onClick={() =>
					addGuestGroup({
						id: "group-1",
						name: "Family",
						rsvpToken: "token-1",
						guests: [],
					})
				}
			>
				Add Family Group
			</button>
			<button
				type="button"
				onClick={() =>
					addGuestGroup({
						id: "group-2",
						name: "Friends",
						rsvpToken: "token-2",
						guests: [],
					})
				}
			>
				Add Friends Group
			</button>
			<button
				type="button"
				onClick={() => {
					if (guestGroups.length > 0) {
						updateGuestGroup(guestGroups[0].id, { name: "Close Family" });
					}
				}}
			>
				Rename First Group
			</button>
			<button
				type="button"
				onClick={() => {
					if (guestGroups.length > 0) {
						deleteGuestGroup(guestGroups[0].id);
					}
				}}
			>
				Delete First Group
			</button>
			<button
				type="button"
				onClick={() => {
					if (guestGroups.length > 0) {
						addGuest(guestGroups[0].id, {
							id: "guest-1",
							name: "John Doe",
							email: "john@example.com",
						});
					}
				}}
			>
				Add Guest
			</button>
			<button
				type="button"
				onClick={() => {
					if (guestGroups.length > 0 && guestGroups[0].guests.length > 0) {
						updateGuest(guestGroups[0].id, guestGroups[0].guests[0].id, {
							name: "Jane Doe",
						});
					}
				}}
			>
				Update Guest
			</button>
			<button
				type="button"
				onClick={() => {
					if (guestGroups.length > 0 && guestGroups[0].guests.length > 0) {
						deleteGuest(guestGroups[0].id, guestGroups[0].guests[0].id);
					}
				}}
			>
				Delete Guest
			</button>
			<button
				type="button"
				onClick={() =>
					setGuestGroups([
						{
							id: "bulk-1",
							name: "Bulk Group",
							rsvpToken: "bulk-token",
							guests: [
								{ id: "b-guest-1", name: "Bulk Guest 1" },
								{ id: "b-guest-2", name: "Bulk Guest 2" },
							],
						},
					])
				}
			>
				Set Bulk Groups
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

	// Note CRUD tests
	it("adds note with generated id and order", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		expect(screen.getByTestId("note-count").textContent).toBe("0");

		act(() => {
			screen.getByText("Add Dress Code Note").click();
		});

		expect(screen.getByTestId("note-count").textContent).toBe("1");
		expect(screen.getByTestId("note-titles").textContent).toBe("Dress Code");
	});

	it("updates note by id", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		act(() => {
			screen.getByText("Add Dress Code Note").click();
		});

		expect(screen.getByTestId("note-titles").textContent).toBe("Dress Code");

		act(() => {
			screen.getByText("Update Note").click();
		});

		expect(screen.getByTestId("note-titles").textContent).toBe(
			"Updated Dress Code",
		);
	});

	it("deletes note by id", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		act(() => {
			screen.getByText("Add Dress Code Note").click();
		});

		expect(screen.getByTestId("note-count").textContent).toBe("1");

		act(() => {
			screen.getByText("Delete Note").click();
		});

		expect(screen.getByTestId("note-count").textContent).toBe("0");
	});

	it("moves note down in order", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		// Add two notes
		act(() => {
			screen.getByText("Add Dress Code Note").click();
		});
		act(() => {
			screen.getByText("Add Kids Policy Note").click();
		});

		expect(screen.getByTestId("sorted-note-titles").textContent).toBe(
			"Dress Code,Kids Policy",
		);

		// Move first note down
		act(() => {
			screen.getByText("Move First Note Down").click();
		});

		expect(screen.getByTestId("sorted-note-titles").textContent).toBe(
			"Kids Policy,Dress Code",
		);
	});

	it("moves note up in order", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		// Add two notes
		act(() => {
			screen.getByText("Add Dress Code Note").click();
		});
		act(() => {
			screen.getByText("Add Kids Policy Note").click();
		});

		expect(screen.getByTestId("sorted-note-titles").textContent).toBe(
			"Dress Code,Kids Policy",
		);

		// Move second note up
		act(() => {
			screen.getByText("Move Second Note Up").click();
		});

		expect(screen.getByTestId("sorted-note-titles").textContent).toBe(
			"Kids Policy,Dress Code",
		);
	});

	// Guest Group CRUD tests
	it("adds guest group", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		expect(screen.getByTestId("group-count").textContent).toBe("0");

		act(() => {
			screen.getByText("Add Family Group").click();
		});

		expect(screen.getByTestId("group-count").textContent).toBe("1");
		expect(screen.getByTestId("group-names").textContent).toBe("Family");
	});

	it("updates guest group name", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		act(() => {
			screen.getByText("Add Family Group").click();
		});

		expect(screen.getByTestId("group-names").textContent).toBe("Family");

		act(() => {
			screen.getByText("Rename First Group").click();
		});

		expect(screen.getByTestId("group-names").textContent).toBe("Close Family");
	});

	it("deletes guest group", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		act(() => {
			screen.getByText("Add Family Group").click();
		});

		expect(screen.getByTestId("group-count").textContent).toBe("1");

		act(() => {
			screen.getByText("Delete First Group").click();
		});

		expect(screen.getByTestId("group-count").textContent).toBe("0");
	});

	it("adds guest to a group", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		act(() => {
			screen.getByText("Add Family Group").click();
		});

		expect(screen.getByTestId("guest-count").textContent).toBe("0");

		act(() => {
			screen.getByText("Add Guest").click();
		});

		expect(screen.getByTestId("guest-count").textContent).toBe("1");
	});

	it("updates a guest", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		act(() => {
			screen.getByText("Add Family Group").click();
		});
		act(() => {
			screen.getByText("Add Guest").click();
		});

		act(() => {
			screen.getByText("Update Guest").click();
		});

		// Guest count should remain same
		expect(screen.getByTestId("guest-count").textContent).toBe("1");
	});

	it("deletes a guest", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		act(() => {
			screen.getByText("Add Family Group").click();
		});
		act(() => {
			screen.getByText("Add Guest").click();
		});

		expect(screen.getByTestId("guest-count").textContent).toBe("1");

		act(() => {
			screen.getByText("Delete Guest").click();
		});

		expect(screen.getByTestId("guest-count").textContent).toBe("0");
	});

	it("sets guest groups for bulk import", () => {
		render(
			<InvitationBuilderProvider initialData={mockInitialData}>
				<TestConsumer />
			</InvitationBuilderProvider>,
		);

		// Add some existing groups first
		act(() => {
			screen.getByText("Add Family Group").click();
		});
		act(() => {
			screen.getByText("Add Friends Group").click();
		});

		expect(screen.getByTestId("group-count").textContent).toBe("2");

		// Replace with bulk import
		act(() => {
			screen.getByText("Set Bulk Groups").click();
		});

		expect(screen.getByTestId("group-count").textContent).toBe("1");
		expect(screen.getByTestId("group-names").textContent).toBe("Bulk Group");
		expect(screen.getByTestId("guest-count").textContent).toBe("2");
	});
});
