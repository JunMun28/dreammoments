import { useCallback, useState } from "react";
import type { ImageUploadError } from "@/components/ui/image-upload";
import type { GalleryImage } from "@/contexts/InvitationBuilderContext";

interface UseGalleryUploadOptions {
	invitationId: string;
	onSuccess?: (image: GalleryImage) => void;
	onError?: (error: ImageUploadError | "upload-failed") => void;
}

interface UseGalleryUploadReturn {
	/** Upload a compressed image blob to the gallery */
	upload: (file: File, compressedBlob: Blob, caption?: string) => Promise<void>;
	/** Whether upload is in progress */
	uploading: boolean;
	/** Upload progress (0-100) */
	progress: number;
	/** Last error that occurred */
	error: ImageUploadError | "upload-failed" | null;
}

/**
 * Hook for uploading gallery images with progress tracking.
 */
export function useGalleryUpload({
	invitationId,
	onSuccess,
	onError,
}: UseGalleryUploadOptions): UseGalleryUploadReturn {
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<ImageUploadError | "upload-failed" | null>(
		null,
	);

	const upload = useCallback(
		async (_file: File, compressedBlob: Blob, caption?: string) => {
			setUploading(true);
			setProgress(0);
			setError(null);

			try {
				const formData = new FormData();
				formData.append("image", compressedBlob, "gallery.webp");
				formData.append("invitationId", invitationId);
				if (caption) {
					formData.append("caption", caption);
				}

				// Use XHR for progress tracking
				const response = await new Promise<{
					success: boolean;
					image: GalleryImage;
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

					xhr.open("POST", "/api/upload-gallery-image");
					xhr.send(formData);
				});

				setProgress(100);
				onSuccess?.(response.image);
			} catch {
				setError("upload-failed");
				onError?.("upload-failed");
			} finally {
				setUploading(false);
			}
		},
		[invitationId, onSuccess, onError],
	);

	return {
		upload,
		uploading,
		progress,
		error,
	};
}
