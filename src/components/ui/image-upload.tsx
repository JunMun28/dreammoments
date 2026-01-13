import { ImageIcon, Upload, X } from "lucide-react";
import {
	type ChangeEvent,
	type DragEvent,
	useCallback,
	useId,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Progress } from "./progress";

/**
 * Error types for image validation
 */
export type ImageUploadError = "invalid-type" | "too-large";

/**
 * Accepted image MIME types
 */
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_TYPES_STRING = ACCEPTED_TYPES.join(",");

/**
 * Default max file size in MB
 */
const DEFAULT_MAX_SIZE_MB = 5;

/**
 * Max image dimension for compression (pixels)
 */
const MAX_DIMENSION = 2048;

interface ValidationResult {
	valid: boolean;
	error?: ImageUploadError;
}

/**
 * Validates an image file for type and size
 */
export function validateImageFile(
	file: File,
	maxSizeMB: number = DEFAULT_MAX_SIZE_MB,
): ValidationResult {
	// Check file type
	if (!ACCEPTED_TYPES.includes(file.type)) {
		return { valid: false, error: "invalid-type" };
	}

	// Check file size
	const maxBytes = maxSizeMB * 1024 * 1024;
	if (file.size > maxBytes) {
		return { valid: false, error: "too-large" };
	}

	return { valid: true };
}

/**
 * Compresses an image file to WebP format with max dimension constraint
 */
export async function compressImage(
	file: File,
	maxDimension: number = MAX_DIMENSION,
	quality: number = 0.85,
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			// Calculate new dimensions maintaining aspect ratio
			let { width, height } = img;
			if (width > maxDimension || height > maxDimension) {
				if (width > height) {
					height = Math.round((height * maxDimension) / width);
					width = maxDimension;
				} else {
					width = Math.round((width * maxDimension) / height);
					height = maxDimension;
				}
			}

			// Create canvas and draw resized image
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				reject(new Error("Failed to get canvas context"));
				return;
			}
			ctx.drawImage(img, 0, 0, width, height);

			// Convert to WebP blob
			canvas.toBlob(
				(blob) => {
					if (blob) {
						resolve(blob);
					} else {
						reject(new Error("Failed to compress image"));
					}
				},
				"image/webp",
				quality,
			);
		};
		img.onerror = () => reject(new Error("Failed to load image"));
		img.src = URL.createObjectURL(file);
	});
}

interface ImageUploadProps {
	/** Callback when file is selected and ready for upload */
	onUpload: (file: File, compressedBlob: Blob) => void;
	/** Callback when validation error occurs */
	onError: (error: ImageUploadError) => void;
	/** Callback when remove button is clicked */
	onRemove?: () => void;
	/** Current image URL to display */
	currentImageUrl?: string;
	/** Whether upload is in progress */
	uploading?: boolean;
	/** Upload progress (0-100) */
	progress?: number;
	/** Whether the input is disabled */
	disabled?: boolean;
	/** Max file size in MB (default: 5) */
	maxSizeMB?: number;
	/** Custom class name */
	className?: string;
}

/**
 * Image upload component with drag-drop zone, validation, and compression.
 * Supports JPG, PNG, and WebP formats.
 */
export function ImageUpload({
	onUpload,
	onError,
	onRemove,
	currentImageUrl,
	uploading = false,
	progress,
	disabled = false,
	maxSizeMB = DEFAULT_MAX_SIZE_MB,
	className,
}: ImageUploadProps) {
	const inputId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragOver, setIsDragOver] = useState(false);

	const handleFile = useCallback(
		async (file: File) => {
			// Validate file
			const validation = validateImageFile(file, maxSizeMB);
			if (!validation.valid && validation.error) {
				onError(validation.error);
				return;
			}

			try {
				// Compress image
				const compressed = await compressImage(file);
				onUpload(file, compressed);
			} catch {
				onError("invalid-type");
			}
		},
		[maxSizeMB, onError, onUpload],
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

			if (disabled || uploading) return;

			const file = e.dataTransfer.files[0];
			if (file) {
				handleFile(file);
			}
		},
		[disabled, handleFile, uploading],
	);

	const handleClick = useCallback(() => {
		if (!disabled && !uploading) {
			inputRef.current?.click();
		}
	}, [disabled, uploading]);

	// Show current image with replace option
	if (currentImageUrl && !uploading) {
		return (
			<div className={cn("relative", className)}>
				<div className="relative overflow-hidden rounded-lg border">
					<img
						src={currentImageUrl}
						alt="Hero preview"
						className="h-48 w-full object-cover"
					/>
					<div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={handleClick}
						>
							<Upload className="mr-2 h-4 w-4" />
							Replace Image
						</Button>
					</div>
					{onRemove && (
						<Button
							type="button"
							variant="destructive"
							size="icon"
							className="absolute right-2 top-2 h-8 w-8"
							onClick={onRemove}
							aria-label="Remove image"
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>
				<input
					ref={inputRef}
					id={inputId}
					type="file"
					accept={ACCEPTED_TYPES_STRING}
					onChange={handleChange}
					disabled={disabled}
					className="sr-only"
				/>
			</div>
		);
	}

	return (
		<div className={className}>
			{/* biome-ignore lint/a11y/useSemanticElements: Drag-drop zones require div for drag events */}
			<div
				data-testid="drop-zone"
				role="button"
				tabIndex={disabled || uploading ? -1 : 0}
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
					uploading && "cursor-wait opacity-75",
					disabled && "cursor-not-allowed opacity-50",
					!isDragOver &&
						!uploading &&
						!disabled &&
						"border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
				)}
			>
				{uploading ? (
					<>
						<div className="flex flex-col items-center gap-2">
							<div className="h-10 w-10 animate-pulse rounded-full bg-primary/20 p-2">
								<Upload className="h-6 w-6 text-primary" />
							</div>
							<span className="text-sm font-medium">Uploading...</span>
						</div>
						{typeof progress === "number" && (
							<div className="w-full max-w-xs">
								<Progress
									value={progress}
									className="h-2"
									aria-label={`Upload progress: ${progress}%`}
								/>
								<p className="mt-1 text-center text-xs text-muted-foreground">
									{progress}%
								</p>
							</div>
						)}
					</>
				) : (
					<>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<ImageIcon className="h-6 w-6 text-muted-foreground" />
						</div>
						<div className="text-center">
							<p className="font-medium">Drag & drop your image here</p>
							<p className="text-sm text-muted-foreground">
								or click to browse
							</p>
						</div>
						<p className="text-xs text-muted-foreground">
							JPG, PNG, WebP (max {maxSizeMB}MB)
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
				disabled={disabled || uploading}
				className="sr-only"
			/>
		</div>
	);
}
