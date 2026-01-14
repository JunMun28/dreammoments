import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	type CsvExportRow,
	downloadCsv,
	generateCsvContent,
} from "@/lib/csv-export";
import type { GuestResponseRow } from "@/lib/rsvp-server";

// ============================================================================
// TYPES
// ============================================================================

export interface CsvExportButtonProps {
	responses: GuestResponseRow[];
	filename?: string;
	buttonText?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convert GuestResponseRow array to CsvExportRow array.
 * Strips fields not needed for CSV export.
 */
export function convertToCsvRows(
	responses: GuestResponseRow[],
): CsvExportRow[] {
	return responses.map((response) => ({
		guestName: response.guestName,
		groupName: response.groupName,
		status: response.status,
		headcount: response.headcount,
		mealPreference: response.mealPreference,
		dietaryNotes: response.dietaryNotes,
		plusOneCount: response.plusOneCount,
		plusOneNames: response.plusOneNames,
		respondedAt: response.respondedAt,
	}));
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Button component that exports RSVP responses to a CSV file.
 * Disabled when there are no responses to export.
 */
export function CsvExportButton({
	responses,
	filename = "rsvp-responses.csv",
	buttonText = "Export to CSV",
}: CsvExportButtonProps) {
	const handleExport = () => {
		const csvRows = convertToCsvRows(responses);
		const csvContent = generateCsvContent(csvRows);
		downloadCsv(csvContent, filename);
	};

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleExport}
			disabled={responses.length === 0}
		>
			<Download className="h-4 w-4 mr-2" />
			{buttonText}
		</Button>
	);
}
