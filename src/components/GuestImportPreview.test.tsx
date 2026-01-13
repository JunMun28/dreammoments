// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CsvParseError, GuestRow } from "@/lib/csv-parser";
import { GuestImportPreview } from "./GuestImportPreview";

describe("GuestImportPreview", () => {
	afterEach(() => {
		cleanup();
	});

	const mockValidRows: GuestRow[] = [
		{ name: "John Doe", group: "Family", email: "john@example.com" },
		{ name: "Jane Smith", group: "Friends", phone: "555-1234" },
		{ name: "Bob Wilson", group: "Family" },
	];

	const mockErrors: CsvParseError[] = [
		{ row: 3, field: "name", message: "Name is required" },
		{ row: 5, field: "email", message: "Invalid email format" },
	];

	const defaultProps = {
		validRows: mockValidRows,
		errors: [],
		onConfirm: vi.fn(),
		onCancel: vi.fn(),
	};

	// ==========================================================================
	// Rendering Tests
	// ==========================================================================

	it("renders preview table with valid rows", () => {
		render(<GuestImportPreview {...defaultProps} />);

		expect(screen.getByTestId("guest-preview-table")).toBeDefined();
		expect(screen.getByText("John Doe")).toBeDefined();
		expect(screen.getByText("Jane Smith")).toBeDefined();
		expect(screen.getByText("Bob Wilson")).toBeDefined();
	});

	it("renders table headers for name, group, email, phone", () => {
		render(<GuestImportPreview {...defaultProps} />);

		expect(screen.getByText("Name")).toBeDefined();
		expect(screen.getByText("Group")).toBeDefined();
		expect(screen.getByText("Email")).toBeDefined();
		expect(screen.getByText("Phone")).toBeDefined();
	});

	it("displays guest groups correctly", () => {
		render(<GuestImportPreview {...defaultProps} />);

		// Should show Family twice and Friends once
		const familyBadges = screen.getAllByText("Family");
		expect(familyBadges.length).toBe(2);
		expect(screen.getByText("Friends")).toBeDefined();
	});

	it("displays email when provided", () => {
		render(<GuestImportPreview {...defaultProps} />);

		expect(screen.getByText("john@example.com")).toBeDefined();
	});

	it("displays phone when provided", () => {
		render(<GuestImportPreview {...defaultProps} />);

		expect(screen.getByText("555-1234")).toBeDefined();
	});

	it("displays dash for missing email/phone", () => {
		render(<GuestImportPreview {...defaultProps} />);

		// Bob Wilson has no email or phone
		const dashes = screen.getAllByText("—");
		expect(dashes.length).toBeGreaterThanOrEqual(2);
	});

	// ==========================================================================
	// Summary Stats Tests
	// ==========================================================================

	it("displays total guest count", () => {
		render(<GuestImportPreview {...defaultProps} />);

		expect(screen.getByTestId("total-guests-count")).toBeDefined();
		expect(screen.getByTestId("total-guests-count").textContent).toContain("3");
	});

	it("displays unique groups count", () => {
		render(<GuestImportPreview {...defaultProps} />);

		expect(screen.getByTestId("unique-groups-count")).toBeDefined();
		// Family and Friends = 2 unique groups
		expect(screen.getByTestId("unique-groups-count").textContent).toContain(
			"2",
		);
	});

	// ==========================================================================
	// Error Display Tests (GUEST-002)
	// ==========================================================================

	it("displays error section when errors exist", () => {
		render(<GuestImportPreview {...defaultProps} errors={mockErrors} />);

		expect(screen.getByTestId("import-errors-section")).toBeDefined();
	});

	it("displays error count in header", () => {
		render(<GuestImportPreview {...defaultProps} errors={mockErrors} />);

		expect(screen.getByText(/2 validation errors/i)).toBeDefined();
	});

	it("displays individual error messages with row numbers", () => {
		render(<GuestImportPreview {...defaultProps} errors={mockErrors} />);

		expect(screen.getByText(/row 3/i)).toBeDefined();
		expect(screen.getByText(/name is required/i)).toBeDefined();
		expect(screen.getByText(/row 5/i)).toBeDefined();
		expect(screen.getByText(/invalid email format/i)).toBeDefined();
	});

	it("does not show error section when no errors", () => {
		render(<GuestImportPreview {...defaultProps} errors={[]} />);

		expect(screen.queryByTestId("import-errors-section")).toBeNull();
	});

	// ==========================================================================
	// Action Button Tests
	// ==========================================================================

	it("renders confirm and cancel buttons", () => {
		render(<GuestImportPreview {...defaultProps} />);

		expect(screen.getByTestId("confirm-import-button")).toBeDefined();
		expect(screen.getByTestId("cancel-import-button")).toBeDefined();
	});

	it("calls onConfirm when confirm button clicked", () => {
		const onConfirm = vi.fn();
		render(<GuestImportPreview {...defaultProps} onConfirm={onConfirm} />);

		act(() => {
			screen.getByTestId("confirm-import-button").click();
		});

		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("calls onCancel when cancel button clicked", () => {
		const onCancel = vi.fn();
		render(<GuestImportPreview {...defaultProps} onCancel={onCancel} />);

		act(() => {
			screen.getByTestId("cancel-import-button").click();
		});

		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it("disables confirm button when no valid rows", () => {
		render(<GuestImportPreview {...defaultProps} validRows={[]} />);

		const confirmButton = screen.getByTestId(
			"confirm-import-button",
		) as HTMLButtonElement;
		expect(confirmButton.disabled).toBe(true);
	});

	it("enables confirm button when valid rows exist", () => {
		render(<GuestImportPreview {...defaultProps} />);

		const confirmButton = screen.getByTestId(
			"confirm-import-button",
		) as HTMLButtonElement;
		expect(confirmButton.disabled).toBe(false);
	});

	it("disables buttons when loading", () => {
		render(<GuestImportPreview {...defaultProps} loading={true} />);

		const confirmButton = screen.getByTestId(
			"confirm-import-button",
		) as HTMLButtonElement;
		const cancelButton = screen.getByTestId(
			"cancel-import-button",
		) as HTMLButtonElement;

		expect(confirmButton.disabled).toBe(true);
		expect(cancelButton.disabled).toBe(true);
	});

	// ==========================================================================
	// Empty State Tests
	// ==========================================================================

	it("shows empty message when no valid rows and no errors", () => {
		render(<GuestImportPreview {...defaultProps} validRows={[]} errors={[]} />);

		expect(screen.getByText(/no guests to import/i)).toBeDefined();
	});

	// ==========================================================================
	// File Name Display Tests
	// ==========================================================================

	it("displays file name when provided", () => {
		render(<GuestImportPreview {...defaultProps} fileName="guests.csv" />);

		expect(screen.getByText(/guests\.csv/)).toBeDefined();
	});
});
