import type { GuestResponseStatus } from "./rsvp-server";

// ============================================================================
// TYPES
// ============================================================================

export interface CsvExportRow {
	guestName: string;
	groupName: string;
	status: GuestResponseStatus;
	headcount: number;
	mealPreference: string | null;
	dietaryNotes: string | null;
	plusOneCount: number;
	plusOneNames: string | null;
	respondedAt: Date | null;
}

// ============================================================================
// CSV FORMATTING
// ============================================================================

/**
 * Format a value for CSV export.
 * Handles escaping quotes, commas, and newlines.
 */
export function formatCsvValue(
	value: string | number | Date | null | undefined,
): string {
	if (value === null || value === undefined) {
		return "";
	}

	if (value instanceof Date) {
		return value.toISOString();
	}

	const stringValue = String(value);

	// Check if value needs quoting (contains comma, quote, or newline)
	if (
		stringValue.includes(",") ||
		stringValue.includes('"') ||
		stringValue.includes("\n")
	) {
		// Escape double quotes by doubling them, then wrap in quotes
		return `"${stringValue.replace(/"/g, '""')}"`;
	}

	return stringValue;
}

/**
 * Capitalize the first letter of a string.
 */
function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================================
// CSV GENERATION
// ============================================================================

const CSV_HEADERS = [
	"Guest Name",
	"Group",
	"Status",
	"Headcount",
	"Meal Preference",
	"Dietary Notes",
	"Plus-One Count",
	"Plus-One Names",
	"Responded At",
];

/**
 * Generate CSV content from guest response rows.
 * Returns a string in CSV format with headers.
 */
export function generateCsvContent(rows: CsvExportRow[]): string {
	const lines: string[] = [];

	// Add header row
	lines.push(CSV_HEADERS.join(","));

	// Add data rows
	for (const row of rows) {
		const values = [
			formatCsvValue(row.guestName),
			formatCsvValue(row.groupName),
			formatCsvValue(capitalize(row.status)),
			formatCsvValue(row.headcount),
			formatCsvValue(row.mealPreference),
			formatCsvValue(row.dietaryNotes),
			formatCsvValue(row.plusOneCount),
			formatCsvValue(row.plusOneNames),
			formatCsvValue(row.respondedAt),
		];
		lines.push(values.join(","));
	}

	return lines.join("\n");
}

// ============================================================================
// CSV DOWNLOAD
// ============================================================================

/**
 * Trigger a download of CSV content as a file.
 * Creates a temporary anchor element and clicks it to initiate download.
 */
export function downloadCsv(content: string, filename: string): void {
	const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);

	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();

	URL.revokeObjectURL(url);
}
