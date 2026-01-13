import { AlertCircle, FileSpreadsheet, Users } from "lucide-react";
import type { CsvParseError, GuestRow } from "@/lib/csv-parser";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

/**
 * Props for GuestImportPreview component
 */
interface GuestImportPreviewProps {
	/** Valid guest rows parsed from CSV */
	validRows: GuestRow[];
	/** Validation errors from CSV parsing */
	errors: CsvParseError[];
	/** Callback when user confirms import */
	onConfirm: () => void;
	/** Callback when user cancels import */
	onCancel: () => void;
	/** Whether import is in progress */
	loading?: boolean;
	/** Original file name for display */
	fileName?: string;
}

/**
 * Calculate unique groups from guest rows
 */
function getUniqueGroups(rows: GuestRow[]): string[] {
	return [...new Set(rows.map((row) => row.group))];
}

/**
 * Guest import preview component.
 * Displays parsed CSV data with validation errors and allows confirm/cancel.
 *
 * Features:
 * - Preview table with guest name, group, email, phone
 * - Summary stats (total guests, unique groups)
 * - Validation error display with row numbers (GUEST-002)
 * - Confirm/Cancel actions (GUEST-003)
 */
export function GuestImportPreview({
	validRows,
	errors,
	onConfirm,
	onCancel,
	loading = false,
	fileName,
}: GuestImportPreviewProps) {
	const uniqueGroups = getUniqueGroups(validRows);
	const hasValidRows = validRows.length > 0;
	const hasErrors = errors.length > 0;

	return (
		<div className="space-y-6">
			{/* Header with file name and stats */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
					{fileName && (
						<span className="text-sm text-muted-foreground">{fileName}</span>
					)}
				</div>
				<div className="flex gap-4">
					<div
						data-testid="total-guests-count"
						className="flex items-center gap-1.5 text-sm"
					>
						<Users className="h-4 w-4 text-muted-foreground" />
						<span className="font-medium">{validRows.length}</span>
						<span className="text-muted-foreground">guests</span>
					</div>
					<div
						data-testid="unique-groups-count"
						className="flex items-center gap-1.5 text-sm"
					>
						<span className="font-medium">{uniqueGroups.length}</span>
						<span className="text-muted-foreground">groups</span>
					</div>
				</div>
			</div>

			{/* Validation Errors Section (GUEST-002) */}
			{hasErrors && (
				<div
					data-testid="import-errors-section"
					className="rounded-lg border border-destructive/50 bg-destructive/5 p-4"
				>
					<div className="mb-3 flex items-center gap-2">
						<AlertCircle className="h-4 w-4 text-destructive" />
						<span className="font-medium text-destructive">
							{errors.length} validation error{errors.length !== 1 ? "s" : ""}
						</span>
					</div>
					<ul className="space-y-1.5 text-sm">
						{errors.map((error) => (
							<li
								key={`error-${error.row}-${error.field || "general"}`}
								className="text-muted-foreground"
							>
								<span className="font-medium">Row {error.row}:</span>{" "}
								{error.message}
								{error.field && (
									<span className="text-muted-foreground/75">
										{" "}
										({error.field})
									</span>
								)}
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Guest Preview Table */}
			{hasValidRows ? (
				<div className="rounded-lg border" data-testid="guest-preview-table">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b bg-muted/50">
									<th className="px-4 py-3 text-left font-medium">Name</th>
									<th className="px-4 py-3 text-left font-medium">Group</th>
									<th className="px-4 py-3 text-left font-medium">Email</th>
									<th className="px-4 py-3 text-left font-medium">Phone</th>
								</tr>
							</thead>
							<tbody>
								{validRows.map((row, index) => (
									<tr
										key={`guest-${index}-${row.name}-${row.group}`}
										className="border-b last:border-0 hover:bg-muted/25"
									>
										<td className="px-4 py-3 font-medium">{row.name}</td>
										<td className="px-4 py-3">
											<Badge variant="secondary">{row.group}</Badge>
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{row.email || "—"}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{row.phone || "—"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
					<Users className="h-8 w-8 text-muted-foreground/50" />
					<p className="text-sm text-muted-foreground">No guests to import</p>
				</div>
			)}

			{/* Action Buttons */}
			<div className="flex justify-end gap-3">
				<Button
					data-testid="cancel-import-button"
					variant="outline"
					onClick={onCancel}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button
					data-testid="confirm-import-button"
					onClick={onConfirm}
					disabled={!hasValidRows || loading}
				>
					{loading ? "Importing..." : `Import ${validRows.length} Guests`}
				</Button>
			</div>
		</div>
	);
}
