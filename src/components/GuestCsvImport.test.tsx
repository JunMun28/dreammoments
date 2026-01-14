import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GuestCsvImport } from "./GuestCsvImport";

// Helper to create a mock FileList
function createMockFileList(files: File[]): FileList {
	const fileList = {
		length: files.length,
		item: (i: number) => files[i] || null,
		[Symbol.iterator]: function* () {
			for (const file of files) yield file;
		},
	};
	for (let i = 0; i < files.length; i++) {
		Object.defineProperty(fileList, i, { value: files[i] });
	}
	return fileList as unknown as FileList;
}

// Mock the import server function
vi.mock("@/lib/guest-server", () => ({
	importGuestsFromCsv: vi.fn(),
}));

describe("GuestCsvImport", () => {
	const mockOnImportComplete = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe("initial state", () => {
		it("renders CSV upload zone in idle state", () => {
			render(
				<GuestCsvImport
					invitationId="inv-123"
					onImportComplete={mockOnImportComplete}
				/>,
			);

			expect(screen.getByText(/drag & drop your csv file/i)).toBeDefined();
			expect(screen.getByText(/or click to browse/i)).toBeDefined();
		});

		it("renders header with import button", () => {
			render(
				<GuestCsvImport
					invitationId="inv-123"
					onImportComplete={mockOnImportComplete}
				/>,
			);

			expect(screen.getByText("Import Guests from CSV")).toBeDefined();
		});
	});

	describe("CSV file selection", () => {
		it("shows file error when invalid type selected", async () => {
			render(
				<GuestCsvImport
					invitationId="inv-123"
					onImportComplete={mockOnImportComplete}
				/>,
			);

			// Create a non-CSV file (txt without .csv extension)
			const file = new File(["content"], "test.txt", { type: "text/plain" });

			// Find the hidden file input and simulate file selection
			const input = document.querySelector(
				'input[type="file"]',
			) as HTMLInputElement;

			// Set files property and dispatch change event
			Object.defineProperty(input, "files", {
				value: createMockFileList([file]),
				configurable: true,
			});
			fireEvent.change(input);

			// Should show error message
			await waitFor(() => {
				expect(
					screen.getByText(/please select a valid csv file/i),
				).toBeDefined();
			});
		});

		it("shows file error when file too large", async () => {
			const user = userEvent.setup();

			render(
				<GuestCsvImport
					invitationId="inv-123"
					onImportComplete={mockOnImportComplete}
				/>,
			);

			// Create a large file (mock size by object property)
			const content = "x".repeat(2 * 1024 * 1024); // 2MB
			const file = new File([content], "large.csv", { type: "text/csv" });

			const input = document.querySelector(
				'input[type="file"]',
			) as HTMLInputElement;
			await user.upload(input, file);

			await waitFor(() => {
				expect(screen.getByText(/file is too large/i)).toBeDefined();
			});
		});

		it("transitions to preview state after valid CSV selected", async () => {
			const user = userEvent.setup();

			render(
				<GuestCsvImport
					invitationId="inv-123"
					onImportComplete={mockOnImportComplete}
				/>,
			);

			// Create a valid CSV file
			const csvContent = "name,group,email\nJohn Doe,Family,john@example.com";
			const file = new File([csvContent], "guests.csv", { type: "text/csv" });

			const input = document.querySelector(
				'input[type="file"]',
			) as HTMLInputElement;
			await user.upload(input, file);

			// Should show preview
			await waitFor(() => {
				expect(screen.getByTestId("guest-preview-table")).toBeDefined();
			});

			// Should show parsed guest
			expect(screen.getByText("John Doe")).toBeDefined();
		});
	});

	describe("preview state", () => {
		it("shows validation errors from CSV parsing", async () => {
			const user = userEvent.setup();

			render(
				<GuestCsvImport
					invitationId="inv-123"
					onImportComplete={mockOnImportComplete}
				/>,
			);

			// CSV with invalid row (missing name)
			const csvContent = "name,group,email\n,Family,john@example.com";
			const file = new File([csvContent], "guests.csv", { type: "text/csv" });

			const input = document.querySelector(
				'input[type="file"]',
			) as HTMLInputElement;
			await user.upload(input, file);

			await waitFor(() => {
				expect(screen.getByTestId("import-errors-section")).toBeDefined();
			});

			expect(screen.getByText(/name is required/i)).toBeDefined();
		});

		it("cancel button returns to idle state", async () => {
			const user = userEvent.setup();

			render(
				<GuestCsvImport
					invitationId="inv-123"
					onImportComplete={mockOnImportComplete}
				/>,
			);

			// Upload valid CSV
			const csvContent = "name,group\nJohn Doe,Family";
			const file = new File([csvContent], "guests.csv", { type: "text/csv" });

			const input = document.querySelector(
				'input[type="file"]',
			) as HTMLInputElement;
			await user.upload(input, file);

			await waitFor(() => {
				expect(screen.getByTestId("cancel-import-button")).toBeDefined();
			});

			// Click cancel
			await user.click(screen.getByTestId("cancel-import-button"));

			// Should return to idle state
			await waitFor(() => {
				expect(screen.getByText(/drag & drop your csv file/i)).toBeDefined();
			});
		});
	});

	describe("import confirmation", () => {
		it("calls import server function on confirm", async () => {
			const user = userEvent.setup();
			const { importGuestsFromCsv } = await import("@/lib/guest-server");
			const mockImport = vi.mocked(importGuestsFromCsv);
			mockImport.mockResolvedValue({ groupsCreated: 1, guestsCreated: 1 });

			render(
				<GuestCsvImport
					invitationId="inv-123"
					onImportComplete={mockOnImportComplete}
				/>,
			);

			// Upload valid CSV
			const csvContent = "name,group\nJohn Doe,Family";
			const file = new File([csvContent], "guests.csv", { type: "text/csv" });

			const input = document.querySelector(
				'input[type="file"]',
			) as HTMLInputElement;
			await user.upload(input, file);

			await waitFor(() => {
				expect(screen.getByTestId("confirm-import-button")).toBeDefined();
			});

			// Click confirm
			await user.click(screen.getByTestId("confirm-import-button"));

			await waitFor(() => {
				expect(mockImport).toHaveBeenCalledWith({
					data: {
						invitationId: "inv-123",
						rows: [{ name: "John Doe", group: "Family" }],
					},
				});
			});
		});

		it("calls onImportComplete after successful import", async () => {
			const user = userEvent.setup();
			const { importGuestsFromCsv } = await import("@/lib/guest-server");
			const mockImport = vi.mocked(importGuestsFromCsv);
			mockImport.mockResolvedValue({ groupsCreated: 1, guestsCreated: 2 });

			render(
				<GuestCsvImport
					invitationId="inv-123"
					onImportComplete={mockOnImportComplete}
				/>,
			);

			// Upload valid CSV
			const csvContent = "name,group\nJohn Doe,Family\nJane Doe,Family";
			const file = new File([csvContent], "guests.csv", { type: "text/csv" });

			const input = document.querySelector(
				'input[type="file"]',
			) as HTMLInputElement;
			await user.upload(input, file);

			await waitFor(() => {
				expect(screen.getByTestId("confirm-import-button")).toBeDefined();
			});

			await user.click(screen.getByTestId("confirm-import-button"));

			await waitFor(() => {
				expect(mockOnImportComplete).toHaveBeenCalledWith({
					groupsCreated: 1,
					guestsCreated: 2,
				});
			});
		});

		it("returns to idle state after successful import", async () => {
			const user = userEvent.setup();
			const { importGuestsFromCsv } = await import("@/lib/guest-server");
			const mockImport = vi.mocked(importGuestsFromCsv);
			mockImport.mockResolvedValue({ groupsCreated: 1, guestsCreated: 1 });

			render(
				<GuestCsvImport
					invitationId="inv-123"
					onImportComplete={mockOnImportComplete}
				/>,
			);

			// Upload valid CSV
			const csvContent = "name,group\nJohn Doe,Family";
			const file = new File([csvContent], "guests.csv", { type: "text/csv" });

			const input = document.querySelector(
				'input[type="file"]',
			) as HTMLInputElement;
			await user.upload(input, file);

			await waitFor(() => {
				expect(screen.getByTestId("confirm-import-button")).toBeDefined();
			});

			await user.click(screen.getByTestId("confirm-import-button"));

			// Should return to idle state with success message
			await waitFor(() => {
				expect(screen.getByText(/drag & drop your csv file/i)).toBeDefined();
			});
		});

		it("shows error message when import fails", async () => {
			const user = userEvent.setup();
			const { importGuestsFromCsv } = await import("@/lib/guest-server");
			const mockImport = vi.mocked(importGuestsFromCsv);
			mockImport.mockRejectedValue(new Error("Import failed"));

			render(
				<GuestCsvImport
					invitationId="inv-123"
					onImportComplete={mockOnImportComplete}
				/>,
			);

			// Upload valid CSV
			const csvContent = "name,group\nJohn Doe,Family";
			const file = new File([csvContent], "guests.csv", { type: "text/csv" });

			const input = document.querySelector(
				'input[type="file"]',
			) as HTMLInputElement;
			await user.upload(input, file);

			await waitFor(() => {
				expect(screen.getByTestId("confirm-import-button")).toBeDefined();
			});

			await user.click(screen.getByTestId("confirm-import-button"));

			await waitFor(() => {
				expect(screen.getByText(/failed to import guests/i)).toBeDefined();
			});
		});
	});
});
