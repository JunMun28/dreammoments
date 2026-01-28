import { AlertCircle, CheckCircle2, FileUp } from "lucide-react";
import { useCallback, useState } from "react";
import {
	type CsvFileError,
	type CsvParseError,
	type GuestRow,
	parseCsvContent,
} from "@/lib/csv-parser";
import { GuestImportPreview } from "./GuestImportPreview";
import { CsvUpload } from "./ui/csv-upload";

/**
 * Import result returned to parent after successful import
 */
export interface ImportResult {
	groupsCreated: number;
	guestsCreated: number;
}

interface GuestCsvImportProps {
	/** ID of the invitation to import guests into */
	invitationId: string;
	/** Callback when import completes successfully */
	onImportComplete: (result: ImportResult) => void;
}

type ImportState = "idle" | "preview" | "importing";

interface ParsedData {
	fileName: string;
	validRows: GuestRow[];
	errors: CsvParseError[];
}

/**
 * Map file error codes to user-friendly messages
 */
function getFileErrorMessage(error: CsvFileError): string {
	switch (error) {
		case "invalid-type":
			return "Please select a valid CSV file";
		case "too-large":
			return "File is too large. Maximum size is 1MB.";
		default:
			return "Invalid file";
	}
}

/**
 * GuestCsvImport component orchestrates the CSV import flow:
 * 1. File selection via drag-drop or browse (idle state)
 * 2. CSV parsing and validation
 * 3. Preview with error display (preview state)
 * 4. Confirmation and server import (importing state)
 * 5. Return to idle with success/error feedback
 *
 * Addresses GUEST-001 (CSV upload), GUEST-002 (validation), GUEST-003 (preview)
 */
export function GuestCsvImport({
	invitationId,
	onImportComplete,
}: GuestCsvImportProps) {
	const [state, setState] = useState<ImportState>("idle");
	const [parsedData, setParsedData] = useState<ParsedData | null>(null);
	const [fileError, setFileError] = useState<string | null>(null);
	const [importError, setImportError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	/**
	 * Handle file selection from CsvUpload component
	 */
	const handleFileSelect = useCallback((_file: File, content: string) => {
		// Clear previous errors
		setFileError(null);
		setImportError(null);
		setSuccessMessage(null);

		// Parse CSV content
		const result = parseCsvContent(content);

		setParsedData({
			fileName: _file.name,
			validRows: result.rows,
			errors: result.errors,
		});

		setState("preview");
	}, []);

	/**
	 * Handle file validation error from CsvUpload
	 */
	const handleFileError = useCallback((error: CsvFileError) => {
		setFileError(getFileErrorMessage(error));
		setImportError(null);
		setSuccessMessage(null);
	}, []);

	/**
	 * Handle cancel from preview - return to idle state
	 */
	const handleCancel = useCallback(() => {
		setState("idle");
		setParsedData(null);
		setFileError(null);
		setImportError(null);
	}, []);

	/**
	 * Handle confirm - import guests to server
	 * Uses dynamic import to avoid bundling server code on client
	 */
	const handleConfirm = useCallback(async () => {
		if (!parsedData || parsedData.validRows.length === 0) return;

		setState("importing");
		setImportError(null);

		try {
			// Dynamic import to avoid bundling drizzle-orm on client
			const { importGuestsFromCsv } = await import("@/lib/guest-server");
			const result = await importGuestsFromCsv({
				data: {
					invitationId,
					rows: parsedData.validRows,
				},
			});

			// Success - notify parent and reset
			onImportComplete(result);
			setSuccessMessage(
				`Successfully imported ${result.guestsCreated} guests in ${result.groupsCreated} groups`,
			);
			setState("idle");
			setParsedData(null);
		} catch (error) {
			console.error("Import failed:", error);
			setImportError("Failed to import guests. Please try again.");
			setState("preview"); // Return to preview so user can retry
		}
	}, [invitationId, onImportComplete, parsedData]);

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<FileUp className="h-5 w-5 text-muted-foreground" />
				<h3 className="font-medium">Import Guests from CSV</h3>
			</div>

			{/* Success message */}
			{successMessage && (
				<div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
					<CheckCircle2 className="h-4 w-4" />
					<span className="text-sm">{successMessage}</span>
				</div>
			)}

			{/* File error message */}
			{fileError && (
				<div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-destructive">
					<AlertCircle className="h-4 w-4" />
					<span className="text-sm">{fileError}</span>
				</div>
			)}

			{/* Import error message */}
			{importError && (
				<div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-destructive">
					<AlertCircle className="h-4 w-4" />
					<span className="text-sm">{importError}</span>
				</div>
			)}

			{/* Idle state: Show CSV upload zone */}
			{state === "idle" && (
				<CsvUpload onFileSelect={handleFileSelect} onError={handleFileError} />
			)}

			{/* Preview state: Show parsed data with confirm/cancel */}
			{(state === "preview" || state === "importing") && parsedData && (
				<GuestImportPreview
					validRows={parsedData.validRows}
					errors={parsedData.errors}
					fileName={parsedData.fileName}
					loading={state === "importing"}
					onConfirm={handleConfirm}
					onCancel={handleCancel}
				/>
			)}
		</div>
	);
}
