import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
	InvitationBuilderProvider,
	type InvitationData,
} from "@/contexts/InvitationBuilderContext";
import { GuestGroupList, getRsvpUrl } from "./GuestGroupList";

// Mock qrcode.react
vi.mock("qrcode.react", () => ({
	QRCodeSVG: ({ value, size }: { value: string; size: number }) => (
		<svg data-testid="qr-code-svg" data-value={value} data-size={size}>
			<title>QR Code</title>
		</svg>
	),
	QRCodeCanvas: ({
		value,
		size,
		id,
	}: {
		value: string;
		size: number;
		id: string;
	}) => (
		<canvas
			data-testid="qr-code-canvas"
			data-value={value}
			data-size={size}
			id={id}
		>
			QR Code
		</canvas>
	),
}));

// Mock navigator.clipboard
Object.assign(navigator, {
	clipboard: {
		writeText: vi.fn().mockResolvedValue(undefined),
	},
});

function createMockInvitation(
	overrides?: Partial<InvitationData>,
): InvitationData {
	return {
		id: "test-invitation",
		partner1Name: "John",
		partner2Name: "Jane",
		scheduleBlocks: [],
		notes: [],
		guestGroups: [],
		...overrides,
	};
}

function renderWithProvider(
	invitation: InvitationData,
	props?: Parameters<typeof GuestGroupList>[0],
) {
	return render(
		<InvitationBuilderProvider initialData={invitation}>
			<GuestGroupList {...props} />
		</InvitationBuilderProvider>,
	);
}

describe("getRsvpUrl", () => {
	it("returns correct URL format with token", () => {
		const url = getRsvpUrl("abc123");
		expect(url).toContain("/rsvp#t=abc123");
	});
});

describe("GuestGroupList", () => {
	describe("empty state", () => {
		it("shows empty message when no groups exist", () => {
			renderWithProvider(createMockInvitation());
			expect(screen.getByTestId("empty-groups-message")).toBeDefined();
			expect(screen.getByText(/No guest groups yet/)).toBeDefined();
		});

		it("shows Add Group button", () => {
			renderWithProvider(createMockInvitation());
			expect(screen.getByTestId("add-group-button")).toBeDefined();
		});
	});

	describe("group management", () => {
		it("displays groups with guest counts", () => {
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{
							id: "g1",
							name: "Family",
							rsvpToken: "token1",
							guests: [
								{ id: "guest1", name: "Mom" },
								{ id: "guest2", name: "Dad" },
							],
						},
						{
							id: "g2",
							name: "Friends",
							rsvpToken: "token2",
							guests: [{ id: "guest3", name: "Best Friend" }],
						},
					],
				}),
			);

			expect(screen.getByText("Family")).toBeDefined();
			expect(screen.getByText("2 guests")).toBeDefined();
			expect(screen.getByText("Friends")).toBeDefined();
			expect(screen.getByText("1 guest")).toBeDefined();
		});

		it("shows total guest count in header", () => {
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{
							id: "g1",
							name: "Family",
							rsvpToken: "token1",
							guests: [{ id: "guest1", name: "Mom" }],
						},
					],
				}),
			);

			expect(screen.getByText(/1 group, 1 guest/)).toBeDefined();
		});

		it("opens new group editor when Add Group clicked", async () => {
			renderWithProvider(createMockInvitation());

			fireEvent.click(screen.getByTestId("add-group-button"));

			await waitFor(() => {
				expect(screen.getByTestId("group-name-input")).toBeDefined();
			});
		});

		it("creates new group with name", async () => {
			renderWithProvider(createMockInvitation());

			fireEvent.click(screen.getByTestId("add-group-button"));

			const input = screen.getByTestId("group-name-input");
			fireEvent.change(input, { target: { value: "Colleagues" } });

			fireEvent.click(screen.getByTestId("save-group-button"));

			await waitFor(() => {
				expect(screen.getByText("Colleagues")).toBeDefined();
			});
		});

		it("opens edit mode when edit group clicked", async () => {
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{ id: "g1", name: "Family", rsvpToken: "token1", guests: [] },
					],
				}),
			);

			fireEvent.click(screen.getByTestId("edit-group-g1"));

			await waitFor(() => {
				expect(screen.getByTestId("group-name-input")).toBeDefined();
			});
		});

		it("shows delete confirmation dialog for group", async () => {
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{
							id: "g1",
							name: "Family",
							rsvpToken: "token1",
							guests: [{ id: "guest1", name: "Mom" }],
						},
					],
				}),
			);

			fireEvent.click(screen.getByTestId("delete-group-g1"));

			await waitFor(() => {
				expect(screen.getByText(/Delete Group/)).toBeDefined();
				expect(screen.getByText(/also remove all 1 guest/)).toBeDefined();
			});
		});
	});

	describe("guest management (GUEST-005)", () => {
		it("expands group to show guests when toggle clicked", async () => {
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{
							id: "g1",
							name: "Family",
							rsvpToken: "token1",
							guests: [{ id: "guest1", name: "Mom" }],
						},
					],
				}),
			);

			fireEvent.click(screen.getByTestId("toggle-group-g1"));

			await waitFor(() => {
				expect(screen.getByText("Mom")).toBeDefined();
			});
		});

		it("shows Add Guest button when group expanded", async () => {
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{ id: "g1", name: "Family", rsvpToken: "token1", guests: [] },
					],
				}),
			);

			fireEvent.click(screen.getByTestId("toggle-group-g1"));

			await waitFor(() => {
				expect(screen.getByTestId("add-guest-g1")).toBeDefined();
			});
		});

		it("opens guest editor when Add Guest clicked", async () => {
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{ id: "g1", name: "Family", rsvpToken: "token1", guests: [] },
					],
				}),
			);

			fireEvent.click(screen.getByTestId("toggle-group-g1"));
			await waitFor(() => {
				expect(screen.getByTestId("add-guest-g1")).toBeDefined();
			});

			fireEvent.click(screen.getByTestId("add-guest-g1"));

			await waitFor(() => {
				expect(screen.getByTestId("guest-editor")).toBeDefined();
			});
		});

		it("adds new guest to group", async () => {
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{ id: "g1", name: "Family", rsvpToken: "token1", guests: [] },
					],
				}),
			);

			// Expand group
			fireEvent.click(screen.getByTestId("toggle-group-g1"));
			await waitFor(() => {
				expect(screen.getByTestId("add-guest-g1")).toBeDefined();
			});

			// Open guest editor
			fireEvent.click(screen.getByTestId("add-guest-g1"));
			await waitFor(() => {
				expect(screen.getByTestId("guest-editor")).toBeDefined();
			});

			// Fill in guest name
			const nameInput = screen.getByTestId("guest-name-input");
			fireEvent.change(nameInput, { target: { value: "Aunt Mary" } });

			// Save
			fireEvent.click(screen.getByTestId("save-guest-button"));

			// Verify guest appears
			await waitFor(() => {
				expect(screen.getByText("Aunt Mary")).toBeDefined();
			});
		});

		it("edits existing guest", async () => {
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{
							id: "g1",
							name: "Family",
							rsvpToken: "token1",
							guests: [{ id: "guest1", name: "Mom", email: "mom@email.com" }],
						},
					],
				}),
			);

			// Expand group
			fireEvent.click(screen.getByTestId("toggle-group-g1"));
			await waitFor(() => {
				expect(screen.getByText("Mom")).toBeDefined();
			});

			// Click edit
			fireEvent.click(screen.getByTestId("edit-guest-guest1"));

			await waitFor(() => {
				expect(screen.getByTestId("guest-editor")).toBeDefined();
			});

			// Change name
			const nameInput = screen.getByTestId("guest-name-input");
			fireEvent.change(nameInput, { target: { value: "Mother" } });

			// Save
			fireEvent.click(screen.getByTestId("save-guest-button"));

			// Verify updated name
			await waitFor(() => {
				expect(screen.getByText("Mother")).toBeDefined();
			});
		});

		it("shows delete confirmation for guest", async () => {
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{
							id: "g1",
							name: "Family",
							rsvpToken: "token1",
							guests: [{ id: "guest1", name: "Mom" }],
						},
					],
				}),
			);

			// Expand group
			fireEvent.click(screen.getByTestId("toggle-group-g1"));
			await waitFor(() => {
				expect(screen.getByText("Mom")).toBeDefined();
			});

			// Click delete
			fireEvent.click(screen.getByTestId("delete-guest-guest1"));

			await waitFor(() => {
				expect(screen.getByText(/Remove Guest/)).toBeDefined();
				expect(screen.getByText(/remove "Mom"/)).toBeDefined();
			});
		});

		it("deletes guest when confirmed", async () => {
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{
							id: "g1",
							name: "Family",
							rsvpToken: "token1",
							guests: [{ id: "guest1", name: "Mom" }],
						},
					],
				}),
			);

			// Expand group
			fireEvent.click(screen.getByTestId("toggle-group-g1"));
			await waitFor(() => {
				expect(screen.getByText("Mom")).toBeDefined();
			});

			// Click delete
			fireEvent.click(screen.getByTestId("delete-guest-guest1"));

			// Confirm delete
			await waitFor(() => {
				expect(screen.getByTestId("confirm-delete-guest-guest1")).toBeDefined();
			});
			fireEvent.click(screen.getByTestId("confirm-delete-guest-guest1"));

			// Verify guest removed
			await waitFor(() => {
				expect(screen.queryByText("Mom")).toBeNull();
			});
		});

		it("updates guest count immediately after adding guest", async () => {
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{ id: "g1", name: "Family", rsvpToken: "token1", guests: [] },
					],
				}),
			);

			// Initially 0 guests
			expect(screen.getByText("0 guests")).toBeDefined();

			// Expand and add guest
			fireEvent.click(screen.getByTestId("toggle-group-g1"));
			await waitFor(() => {
				expect(screen.getByTestId("add-guest-g1")).toBeDefined();
			});

			fireEvent.click(screen.getByTestId("add-guest-g1"));
			await waitFor(() => {
				expect(screen.getByTestId("guest-editor")).toBeDefined();
			});

			fireEvent.change(screen.getByTestId("guest-name-input"), {
				target: { value: "New Guest" },
			});
			fireEvent.click(screen.getByTestId("save-guest-button"));

			// Verify count updated
			await waitFor(() => {
				expect(screen.getByText("1 guest")).toBeDefined();
			});
		});
	});

	describe("RSVP link functionality", () => {
		it("copies RSVP link when copy button clicked", async () => {
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{ id: "g1", name: "Family", rsvpToken: "token123", guests: [] },
					],
				}),
			);

			fireEvent.click(screen.getByTestId("copy-link-g1"));

			await waitFor(() => {
				expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
					expect.stringContaining("/rsvp#t=token123"),
				);
			});
		});

		it("shows checkmark after copying link", async () => {
			const user = userEvent.setup();
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{ id: "g1", name: "Family", rsvpToken: "token123", guests: [] },
					],
				}),
			);

			await user.click(screen.getByTestId("copy-link-g1"));

			await waitFor(() => {
				// After copying, the button's aria-label changes to "Link copied"
				expect(
					screen.getByRole("button", { name: "Link copied" }),
				).toBeDefined();
			});
		});
	});

	describe("QR code generation (RSVP-007)", () => {
		it("shows QR code button for each guest group", () => {
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{ id: "g1", name: "Family", rsvpToken: "token123", guests: [] },
					],
				}),
			);

			const qrButton = screen.getByRole("button", { name: /qr code/i });
			expect(qrButton).toBeDefined();
		});

		it("opens QR code dialog when button clicked", async () => {
			const user = userEvent.setup();
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{ id: "g1", name: "Family", rsvpToken: "token123", guests: [] },
					],
				}),
			);

			await user.click(screen.getByRole("button", { name: /qr code/i }));

			expect(screen.getByRole("dialog")).toBeDefined();
			expect(screen.getByText(/QR Code for Family/i)).toBeDefined();
		});

		it("displays QR code with correct RSVP URL", async () => {
			const user = userEvent.setup();
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{ id: "g1", name: "Family", rsvpToken: "token456", guests: [] },
					],
				}),
			);

			await user.click(screen.getByRole("button", { name: /qr code/i }));

			const qrCode = screen.getByTestId("qr-code-svg");
			expect(qrCode.getAttribute("data-value")).toContain("/rsvp#t=token456");
		});

		it("shows download buttons in QR code dialog", async () => {
			const user = userEvent.setup();
			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{ id: "g1", name: "Family", rsvpToken: "token123", guests: [] },
					],
				}),
			);

			await user.click(screen.getByRole("button", { name: /qr code/i }));

			expect(
				screen.getByRole("button", { name: /download png/i }),
			).toBeDefined();
			expect(
				screen.getByRole("button", { name: /download svg/i }),
			).toBeDefined();
		});
	});

	describe("server callbacks", () => {
		it("calls onGuestCreate when adding guest", async () => {
			const onGuestCreate = vi.fn().mockResolvedValue({ id: "new-guest-id" });

			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{ id: "g1", name: "Family", rsvpToken: "token1", guests: [] },
					],
				}),
				{ onGuestCreate },
			);

			// Expand and add guest
			fireEvent.click(screen.getByTestId("toggle-group-g1"));
			await waitFor(() => {
				expect(screen.getByTestId("add-guest-g1")).toBeDefined();
			});

			fireEvent.click(screen.getByTestId("add-guest-g1"));
			await waitFor(() => {
				expect(screen.getByTestId("guest-editor")).toBeDefined();
			});

			fireEvent.change(screen.getByTestId("guest-name-input"), {
				target: { value: "New Person" },
			});
			fireEvent.click(screen.getByTestId("save-guest-button"));

			await waitFor(() => {
				expect(onGuestCreate).toHaveBeenCalledWith("g1", {
					name: "New Person",
					email: undefined,
					phone: undefined,
				});
			});
		});

		it("calls onGuestUpdate when editing guest", async () => {
			const onGuestUpdate = vi.fn().mockResolvedValue(undefined);

			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{
							id: "g1",
							name: "Family",
							rsvpToken: "token1",
							guests: [{ id: "guest1", name: "Mom" }],
						},
					],
				}),
				{ onGuestUpdate },
			);

			// Expand and edit guest
			fireEvent.click(screen.getByTestId("toggle-group-g1"));
			await waitFor(() => {
				expect(screen.getByText("Mom")).toBeDefined();
			});

			fireEvent.click(screen.getByTestId("edit-guest-guest1"));
			await waitFor(() => {
				expect(screen.getByTestId("guest-editor")).toBeDefined();
			});

			fireEvent.change(screen.getByTestId("guest-name-input"), {
				target: { value: "Mother" },
			});
			fireEvent.click(screen.getByTestId("save-guest-button"));

			await waitFor(() => {
				expect(onGuestUpdate).toHaveBeenCalledWith("g1", "guest1", {
					name: "Mother",
					email: undefined,
					phone: undefined,
				});
			});
		});

		it("calls onGuestDelete when deleting guest", async () => {
			const onGuestDelete = vi.fn().mockResolvedValue(undefined);

			renderWithProvider(
				createMockInvitation({
					guestGroups: [
						{
							id: "g1",
							name: "Family",
							rsvpToken: "token1",
							guests: [{ id: "guest1", name: "Mom" }],
						},
					],
				}),
				{ onGuestDelete },
			);

			// Expand and delete guest
			fireEvent.click(screen.getByTestId("toggle-group-g1"));
			await waitFor(() => {
				expect(screen.getByText("Mom")).toBeDefined();
			});

			fireEvent.click(screen.getByTestId("delete-guest-guest1"));
			await waitFor(() => {
				expect(screen.getByTestId("confirm-delete-guest-guest1")).toBeDefined();
			});
			fireEvent.click(screen.getByTestId("confirm-delete-guest-guest1"));

			await waitFor(() => {
				expect(onGuestDelete).toHaveBeenCalledWith("g1", "guest1");
			});
		});
	});
});
