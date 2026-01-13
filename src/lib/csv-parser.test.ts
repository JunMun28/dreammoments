import { describe, expect, it } from "vitest";
import {
	type GuestRow,
	parseCsvContent,
	validateCsvFile,
	validateGuestRow,
} from "./csv-parser";

describe("validateCsvFile", () => {
	it("returns valid for CSV files", () => {
		const file = new File(["name,group"], "guests.csv", { type: "text/csv" });
		const result = validateCsvFile(file);
		expect(result.valid).toBe(true);
		expect(result.error).toBeUndefined();
	});

	it("returns valid for CSV files with .csv extension but generic type", () => {
		// Browsers may report generic type for CSV
		const file = new File(["name,group"], "guests.csv", {
			type: "application/octet-stream",
		});
		const result = validateCsvFile(file);
		expect(result.valid).toBe(true);
	});

	it("returns error for non-CSV files", () => {
		const file = new File(["test"], "document.pdf", {
			type: "application/pdf",
		});
		const result = validateCsvFile(file);
		expect(result.valid).toBe(false);
		expect(result.error).toBe("invalid-type");
	});

	it("returns error for files over size limit", () => {
		const file = new File(["test"], "guests.csv", { type: "text/csv" });
		Object.defineProperty(file, "size", { value: 2 * 1024 * 1024 }); // 2MB
		const result = validateCsvFile(file, 1); // 1MB limit
		expect(result.valid).toBe(false);
		expect(result.error).toBe("too-large");
	});

	it("uses default 1MB limit", () => {
		const file = new File(["test"], "guests.csv", { type: "text/csv" });
		Object.defineProperty(file, "size", { value: 512 * 1024 }); // 512KB
		const result = validateCsvFile(file);
		expect(result.valid).toBe(true);
	});
});

describe("validateGuestRow", () => {
	it("returns valid for row with name", () => {
		const row: GuestRow = { name: "John Doe", group: "Family" };
		const result = validateGuestRow(row, 1);
		expect(result.valid).toBe(true);
	});

	it("returns error for row with empty name", () => {
		const row: GuestRow = { name: "", group: "Family" };
		const result = validateGuestRow(row, 1);
		expect(result.valid).toBe(false);
		expect(result.error?.row).toBe(1);
		expect(result.error?.field).toBe("name");
		expect(result.error?.message).toBe("Name is required");
	});

	it("returns error for row with whitespace-only name", () => {
		const row: GuestRow = { name: "   ", group: "Family" };
		const result = validateGuestRow(row, 2);
		expect(result.valid).toBe(false);
		expect(result.error?.row).toBe(2);
		expect(result.error?.field).toBe("name");
	});

	it("trims whitespace from name", () => {
		const row: GuestRow = { name: "  John Doe  ", group: "Family" };
		const result = validateGuestRow(row, 1);
		expect(result.valid).toBe(true);
		expect(result.trimmedRow?.name).toBe("John Doe");
	});

	it("validates optional email format when provided", () => {
		const row: GuestRow = {
			name: "John Doe",
			group: "Family",
			email: "invalid-email",
		};
		const result = validateGuestRow(row, 1);
		expect(result.valid).toBe(false);
		expect(result.error?.field).toBe("email");
		expect(result.error?.message).toBe("Invalid email format");
	});

	it("accepts valid email format", () => {
		const row: GuestRow = {
			name: "John Doe",
			group: "Family",
			email: "john@example.com",
		};
		const result = validateGuestRow(row, 1);
		expect(result.valid).toBe(true);
	});

	it("allows empty email", () => {
		const row: GuestRow = { name: "John Doe", group: "Family", email: "" };
		const result = validateGuestRow(row, 1);
		expect(result.valid).toBe(true);
	});
});

describe("parseCsvContent", () => {
	it("parses simple CSV with headers", () => {
		const content = `name,group,email,phone
John Doe,Family,john@example.com,123-456-7890
Jane Smith,Friends,jane@example.com,`;
		const result = parseCsvContent(content);
		expect(result.success).toBe(true);
		expect(result.rows).toHaveLength(2);
		expect(result.rows[0]).toEqual({
			name: "John Doe",
			group: "Family",
			email: "john@example.com",
			phone: "123-456-7890",
		});
		expect(result.rows[1]).toEqual({
			name: "Jane Smith",
			group: "Friends",
			email: "jane@example.com",
			phone: undefined,
		});
	});

	it("handles CSV with only name and group columns", () => {
		const content = `name,group
Alice,Family
Bob,Friends`;
		const result = parseCsvContent(content);
		expect(result.success).toBe(true);
		expect(result.rows).toHaveLength(2);
		expect(result.rows[0].name).toBe("Alice");
	});

	it("returns errors for invalid rows", () => {
		const content = `name,group,email
,Family,test@test.com
Jane Smith,Friends,invalid-email`;
		const result = parseCsvContent(content);
		expect(result.success).toBe(false);
		expect(result.errors).toHaveLength(2);
		expect(result.errors[0].row).toBe(2); // 1-indexed, row 2 (first data row)
		expect(result.errors[0].field).toBe("name");
		expect(result.errors[1].row).toBe(3);
		expect(result.errors[1].field).toBe("email");
	});

	it("separates valid and invalid rows", () => {
		const content = `name,group
Valid Name,Family
,Friends
Another Valid,Family`;
		const result = parseCsvContent(content);
		expect(result.rows).toHaveLength(2); // Only valid rows
		expect(result.errors).toHaveLength(1);
		expect(result.rows[0].name).toBe("Valid Name");
		expect(result.rows[1].name).toBe("Another Valid");
	});

	it("trims whitespace from values", () => {
		const content = `name,group
  John Doe  ,  Family  `;
		const result = parseCsvContent(content);
		expect(result.success).toBe(true);
		expect(result.rows[0].name).toBe("John Doe");
		expect(result.rows[0].group).toBe("Family");
	});

	it("handles quoted values with commas", () => {
		const content = `name,group
"Doe, John",Family`;
		const result = parseCsvContent(content);
		expect(result.success).toBe(true);
		expect(result.rows[0].name).toBe("Doe, John");
	});

	it("handles empty CSV", () => {
		const content = "";
		const result = parseCsvContent(content);
		expect(result.success).toBe(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].message).toBe("CSV file is empty");
	});

	it("handles CSV with only headers", () => {
		const content = "name,group,email";
		const result = parseCsvContent(content);
		expect(result.success).toBe(true);
		expect(result.rows).toHaveLength(0);
	});

	it("returns error when name column is missing", () => {
		const content = `group,email
Family,test@test.com`;
		const result = parseCsvContent(content);
		expect(result.success).toBe(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].message).toBe('Required column "name" is missing');
	});

	it("handles CRLF line endings", () => {
		const content = "name,group\r\nJohn Doe,Family\r\nJane Smith,Friends";
		const result = parseCsvContent(content);
		expect(result.success).toBe(true);
		expect(result.rows).toHaveLength(2);
	});

	it("ignores empty lines", () => {
		const content = `name,group

John Doe,Family

Jane Smith,Friends
`;
		const result = parseCsvContent(content);
		expect(result.success).toBe(true);
		expect(result.rows).toHaveLength(2);
	});

	it("handles header column name variations (case insensitive)", () => {
		const content = `Name,GROUP,Email,Phone
John Doe,Family,john@test.com,123`;
		const result = parseCsvContent(content);
		expect(result.success).toBe(true);
		expect(result.rows[0].name).toBe("John Doe");
		expect(result.rows[0].group).toBe("Family");
	});

	it("defaults group to 'Ungrouped' when not provided", () => {
		const content = `name,email
John Doe,john@test.com`;
		const result = parseCsvContent(content);
		expect(result.success).toBe(true);
		expect(result.rows[0].group).toBe("Ungrouped");
	});
});
