import { useCallback, useState } from "react";
import type { ImageUploadError } from "@/components/ui/image-upload";

interface UseImageUploadOptions {
	invitationId: string;
	onSuccess?: (imageUrl: string) => void;
	onError?: (error: ImageUploadError | "upload-failed") => void;
}

interface UseImageUploadReturn {
	/** Upload a compressed image blob */
	upload: (file: File, compressedBlob: Blob) => Promise<void>;
	/** Remove the current hero image */
	remove: () => Promise<void>;
	/** Whether upload is in progress */
	uploading: boolean;
	/** Upload progress (0-100) */
	progress: number;
	/** Last error that occurred */
	error: ImageUploadError | "upload-failed" | null;
}

/**
 * Hook for uploading hero images with progress tracking.
 */
export function useImageUpload({
	invitationId,
	onSuccess,
	onError,
}: UseImageUploadOptions): UseImageUploadReturn {
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<ImageUploadError | "upload-failed" | null>(
		null,
	);

	const upload = useCallback(
		async (_file: File, compressedBlob: Blob) => {
			setUploading(true);
			setProgress(0);
			setError(null);

			try {
				const formData = new FormData();
				formData.append("image", compressedBlob, "hero.webp");
				formData.append("invitationId", invitationId);

				// Use XHR for progress tracking
				const response = await new Promise<{
					success: boolean;
					imageUrl: string;
				}>((resolve, reject) => {
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
								reject(new Error("Invalid response"));
							}
						} else {
							reject(new Error(xhr.statusText || "Upload failed"));
						}
					});

					xhr.addEventListener("error", () => {
						reject(new Error("Network error"));
					});

					xhr.open("POST", "/api/upload-hero-image");
					xhr.send(formData);
				});

				setProgress(100);
				onSuccess?.(response.imageUrl);
			} catch {
				setError("upload-failed");
				onError?.("upload-failed");
			} finally {
				setUploading(false);
			}
		},
		[invitationId, onSuccess, onError],
	);

	const remove = useCallback(async () => {
		setError(null);
		try {
			const response = await fetch("/api/remove-hero-image", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ invitationId }),
			});

			if (!response.ok) {
				throw new Error("Failed to remove image");
			}

			onSuccess?.("");
		} catch {
			setError("upload-failed");
			onError?.("upload-failed");
		}
	}, [invitationId, onSuccess, onError]);

	return {
		upload,
		remove,
		uploading,
		progress,
		error,
	};
}
