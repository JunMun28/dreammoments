/**
 * CSV Parser utility for guest list import
 *
 * Parses CSV files with guest information (name, group, email, phone)
 * and validates each row for required fields and format.
 */

// ============================================================================
// Types
// ============================================================================

export type CsvFileError = "invalid-type" | "too-large";

export interface CsvFileValidationResult {
	valid: boolean;
	error?: CsvFileError;
}

export interface GuestRow {
	name: string;
	group: string;
	email?: string;
	phone?: string;
}

export interface CsvParseError {
	row: number;
	field?: string;
	message: string;
}

export interface CsvParseResult {
	success: boolean;
	rows: GuestRow[];
	errors: CsvParseError[];
}

interface RowValidationResult {
	valid: boolean;
	error?: CsvParseError;
	trimmedRow?: GuestRow;
}

// ============================================================================
// Constants
// ============================================================================

const ACCEPTED_TYPES = ["text/csv", "application/vnd.ms-excel"];
const DEFAULT_MAX_SIZE_MB = 1; // 1MB should be plenty for guest lists

// Simple email regex - not exhaustive but catches common issues
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================================
// File Validation
// ============================================================================

/**
 * Validates a CSV file for type and size
 */
export function validateCsvFile(
	file: File,
	maxSizeMB: number = DEFAULT_MAX_SIZE_MB,
): CsvFileValidationResult {
	// Check file type - allow CSV MIME types or .csv extension
	const isCsvType = ACCEPTED_TYPES.includes(file.type);
	const hasCsvExtension = file.name.toLowerCase().endsWith(".csv");

	if (!isCsvType && !hasCsvExtension) {
		return { valid: false, error: "invalid-type" };
	}

	// Check file size
	const maxBytes = maxSizeMB * 1024 * 1024;
	if (file.size > maxBytes) {
		return { valid: false, error: "too-large" };
	}

	return { valid: true };
}

// ============================================================================
// Row Validation
// ============================================================================

/**
 * Validates a single guest row
 */
export function validateGuestRow(
	row: GuestRow,
	rowNumber: number,
): RowValidationResult {
	const trimmedName = row.name.trim();

	// Name is required
	if (!trimmedName) {
		return {
			valid: false,
			error: { row: rowNumber, field: "name", message: "Name is required" },
		};
	}

	// Validate email format if provided
	const trimmedEmail = row.email?.trim() || "";
	if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
		return {
			valid: false,
			error: {
				row: rowNumber,
				field: "email",
				message: "Invalid email format",
			},
		};
	}

	// Return trimmed row
	return {
		valid: true,
		trimmedRow: {
			name: trimmedName,
			group: row.group.trim(),
			email: trimmedEmail || undefined,
			phone: row.phone?.trim() || undefined,
		},
	};
}

// ============================================================================
// CSV Parsing
// ============================================================================

/**
 * Parses a single CSV line, handling quoted values
 */
function parseCsvLine(line: string): string[] {
	const values: string[] = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			// Check for escaped quote ("")
			if (inQuotes && line[i + 1] === '"') {
				current += '"';
				i++; // Skip next quote
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === "," && !inQuotes) {
			values.push(current);
			current = "";
		} else {
			current += char;
		}
	}

	// Don't forget the last value
	values.push(current);

	return values;
}

/**
 * Parses CSV content and validates each row
 */
export function parseCsvContent(content: string): CsvParseResult {
	const rows: GuestRow[] = [];
	const errors: CsvParseError[] = [];

	// Handle empty content
	if (!content.trim()) {
		return {
			success: false,
			rows: [],
			errors: [{ row: 0, message: "CSV file is empty" }],
		};
	}

	// Normalize line endings and split
	const lines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

	// Filter out empty lines
	const nonEmptyLines = lines.filter((line) => line.trim());

	if (nonEmptyLines.length === 0) {
		return {
			success: false,
			rows: [],
			errors: [{ row: 0, message: "CSV file is empty" }],
		};
	}

	// Parse header row
	const headerLine = nonEmptyLines[0];
	const headers = parseCsvLine(headerLine).map((h) => h.trim().toLowerCase());

	// Find column indices
	const nameIndex = headers.indexOf("name");
	const groupIndex = headers.indexOf("group");
	const emailIndex = headers.indexOf("email");
	const phoneIndex = headers.indexOf("phone");

	// Validate required columns
	if (nameIndex === -1) {
		return {
			success: false,
			rows: [],
			errors: [{ row: 1, message: 'Required column "name" is missing' }],
		};
	}

	// Parse data rows
	for (let i = 1; i < nonEmptyLines.length; i++) {
		const line = nonEmptyLines[i];
		const values = parseCsvLine(line);

		// Build row object
		const row: GuestRow = {
			name: values[nameIndex]?.trim() || "",
			group: groupIndex !== -1 ? values[groupIndex]?.trim() || "" : "Ungrouped",
			email: emailIndex !== -1 ? values[emailIndex]?.trim() : undefined,
			phone: phoneIndex !== -1 ? values[phoneIndex]?.trim() : undefined,
		};

		// Default group if empty
		if (!row.group) {
			row.group = "Ungrouped";
		}

		// Validate row (row number is 1-indexed, header is row 1, so data starts at row 2)
		const validation = validateGuestRow(row, i + 1);

		if (validation.valid && validation.trimmedRow) {
			rows.push(validation.trimmedRow);
		} else if (validation.error) {
			errors.push(validation.error);
		}
	}

	return {
		success: errors.length === 0,
		rows,
		errors,
	};
}
