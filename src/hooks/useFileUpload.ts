import { useCallback, useState } from "react";

/**
 * Error type for file upload failures.
 */
export type FileUploadError =
	| "upload-failed"
	| "network-error"
	| "invalid-response";

/**
 * Options for the useFileUpload hook.
 */
export interface UseFileUploadOptions<TResponse> {
	/** API endpoint to upload to */
	endpoint: string;
	/** Form field name for the file (default: "file") */
	fieldName?: string;
	/** Additional form data to include with the upload */
	additionalData?: Record<string, string>;
	/** Callback on successful upload */
	onSuccess?: (response: TResponse) => void;
	/** Callback on upload error */
	onError?: (error: FileUploadError) => void;
}

/**
 * Return type for the useFileUpload hook.
 */
export interface UseFileUploadReturn<TResponse> {
	/** Upload a file with optional additional form data */
	upload: (
		file: File | Blob,
		filename?: string,
		extraData?: Record<string, string>,
	) => Promise<TResponse | null>;
	/** Whether upload is in progress */
	uploading: boolean;
	/** Upload progress (0-100) */
	progress: number;
	/** Last error that occurred */
	error: FileUploadError | null;
	/** Reset the error state */
	resetError: () => void;
}

/**
 * Generic hook for file uploads with progress tracking.
 *
 * This hook provides a consistent pattern for uploading files with XHR,
 * including progress tracking, error handling, and success callbacks.
 *
 * @example
 * ```tsx
 * const { upload, uploading, progress, error } = useFileUpload<{ imageUrl: string }>({
 *   endpoint: "/api/upload-image",
 *   fieldName: "image",
 *   additionalData: { invitationId: "123" },
 *   onSuccess: (response) => console.log("Uploaded:", response.imageUrl),
 * });
 *
 * // Upload a file
 * await upload(file, "photo.webp");
 * ```
 */
export function useFileUpload<TResponse>({
	endpoint,
	fieldName = "file",
	additionalData = {},
	onSuccess,
	onError,
}: UseFileUploadOptions<TResponse>): UseFileUploadReturn<TResponse> {
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<FileUploadError | null>(null);

	const resetError = useCallback(() => {
		setError(null);
	}, []);

	const upload = useCallback(
		async (
			file: File | Blob,
			filename?: string,
			extraData?: Record<string, string>,
		): Promise<TResponse | null> => {
			setUploading(true);
			setProgress(0);
			setError(null);

			try {
				const formData = new FormData();

				// Add the file with optional filename
				if (filename) {
					formData.append(fieldName, file, filename);
				} else {
					formData.append(fieldName, file);
				}

				// Add additional data configured in options
				for (const [key, value] of Object.entries(additionalData)) {
					formData.append(key, value);
				}

				// Add extra data passed to the upload call
				if (extraData) {
					for (const [key, value] of Object.entries(extraData)) {
						formData.append(key, value);
					}
				}

				// Use XHR for progress tracking
				const response = await new Promise<TResponse>((resolve, reject) => {
					const xhr = new XMLHttpRequest();

					xhr.upload.addEventListener("progress", (e) => {
						if (e.lengthComputable) {
							const percent = Math.round((e.loaded / e.total) * 100);
							setProgress(percent);
						}
					});

					xhr.addEventListener("load", () => {
						if (xhr.status >= 200 && xhr.status < 300) {
							try {
								const data = JSON.parse(xhr.responseText);
								resolve(data);
							} catch {
								reject(new Error("invalid-response"));
							}
						} else {
							reject(new Error("upload-failed"));
						}
					});

					xhr.addEventListener("error", () => {
						reject(new Error("network-error"));
					});

					xhr.open("POST", endpoint);
					xhr.send(formData);
				});

				setProgress(100);
				onSuccess?.(response);
				return response;
			} catch (err) {
				const errorType =
					err instanceof Error &&
					["upload-failed", "network-error", "invalid-response"].includes(
						err.message,
					)
						? (err.message as FileUploadError)
						: "upload-failed";

				setError(errorType);
				onError?.(errorType);
				return null;
			} finally {
				setUploading(false);
			}
		},
		[endpoint, fieldName, additionalData, onSuccess, onError],
	);

	return {
		upload,
		uploading,
		progress,
		error,
		resetError,
	};
}
