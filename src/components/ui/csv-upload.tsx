import { FileSpreadsheet, Upload } from "lucide-react";
import {
	type ChangeEvent,
	type DragEvent,
	useCallback,
	useId,
	useRef,
	useState,
} from "react";
import { type CsvFileError, validateCsvFile } from "@/lib/csv-parser";
import { cn } from "@/lib/utils";

/**
 * Accepted CSV MIME types
 */
const ACCEPTED_TYPES_STRING = ".csv,text/csv,application/vnd.ms-excel";

/**
 * Default max file size in MB
 */
const DEFAULT_MAX_SIZE_MB = 1;

interface CsvUploadProps {
	/** Callback when file is selected and read */
	onFileSelect: (file: File, content: string) => void;
	/** Callback when validation error occurs */
	onError: (error: CsvFileError) => void;
	/** Whether file is being processed */
	loading?: boolean;
	/** Whether the input is disabled */
	disabled?: boolean;
	/** Max file size in MB (default: 1) */
	maxSizeMB?: number;
	/** Custom class name */
	className?: string;
}

/**
 * CSV file upload component with drag-drop zone.
 * Validates CSV files and reads content before passing to parent.
 */
export function CsvUpload({
	onFileSelect,
	onError,
	loading = false,
	disabled = false,
	maxSizeMB = DEFAULT_MAX_SIZE_MB,
	className,
}: CsvUploadProps) {
	const inputId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragOver, setIsDragOver] = useState(false);

	const handleFile = useCallback(
		(file: File) => {
			// Validate file
			const validation = validateCsvFile(file, maxSizeMB);
			if (!validation.valid && validation.error) {
				onError(validation.error);
				return;
			}

			// Read file content
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				onFileSelect(file, content);
			};
			reader.onerror = () => {
				onError("invalid-type");
			};
			reader.readAsText(file);
		},
		[maxSizeMB, onError, onFileSelect],
	);

	const handleChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				handleFile(file);
			}
			// Reset input so same file can be selected again
			if (inputRef.current) {
				inputRef.current.value = "";
			}
		},
		[handleFile],
	);

	const handleDragOver = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(true);
	}, []);

	const handleDragLeave = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);
	}, []);

	const handleDrop = useCallback(
		(e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragOver(false);

			if (disabled || loading) return;

			const file = e.dataTransfer.files[0];
			if (file) {
				handleFile(file);
			}
		},
		[disabled, handleFile, loading],
	);

	const handleClick = useCallback(() => {
		if (!disabled && !loading) {
			inputRef.current?.click();
		}
	}, [disabled, loading]);

	return (
		<div className={className}>
			{/* biome-ignore lint/a11y/useSemanticElements: Drag-drop zones require div for drag events */}
			<div
				data-testid="csv-drop-zone"
				role="button"
				tabIndex={disabled || loading ? -1 : 0}
				onClick={handleClick}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						handleClick();
					}
				}}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={cn(
					"flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors",
					isDragOver && "border-primary bg-primary/5",
					loading && "cursor-wait opacity-75",
					disabled && "cursor-not-allowed opacity-50",
					!isDragOver &&
						!loading &&
						!disabled &&
						"border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
				)}
			>
				{loading ? (
					<div className="flex flex-col items-center gap-2">
						<div className="h-10 w-10 animate-pulse rounded-full bg-primary/20 p-2">
							<Upload className="h-6 w-6 text-primary" />
						</div>
						<span className="text-sm font-medium">Processing...</span>
					</div>
				) : (
					<>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
						</div>
						<div className="text-center">
							<p className="font-medium">Drag & drop your CSV file here</p>
							<p className="text-sm text-muted-foreground">
								or click to browse
							</p>
						</div>
						<p className="text-xs text-muted-foreground">
							CSV files only (max {maxSizeMB}MB)
						</p>
					</>
				)}
			</div>
			<input
				ref={inputRef}
				id={inputId}
				type="file"
				accept={ACCEPTED_TYPES_STRING}
				onChange={handleChange}
				disabled={disabled || loading}
				className="sr-only"
			/>
		</div>
	);
}
