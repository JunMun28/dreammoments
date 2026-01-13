import { useCallback, useState } from "react";
import { useInvitationBuilder } from "@/contexts/InvitationBuilderContext";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageUpload, type ImageUploadError } from "./ui/image-upload";

/**
 * Error messages for different error types
 */
const ERROR_MESSAGES: Record<ImageUploadError | "upload-failed", string> = {
	"invalid-type": "Please select a valid image file (JPG, PNG, or WebP)",
	"too-large": "Image is too large. Maximum size is 5MB",
	"upload-failed": "Failed to upload image. Please try again.",
};

/**
 * Hero image upload section for the invitation builder.
 * Handles file selection, compression, upload, and removal.
 */
export function HeroImageSection() {
	const { invitation, updateInvitation } = useInvitationBuilder();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSuccess = useCallback(
		(imageUrl: string) => {
			updateInvitation({ heroImageUrl: imageUrl || undefined });
			setErrorMessage(null);
		},
		[updateInvitation],
	);

	const handleError = useCallback(
		(error: ImageUploadError | "upload-failed") => {
			setErrorMessage(ERROR_MESSAGES[error]);
		},
		[],
	);

	const { upload, remove, uploading, progress } = useImageUpload({
		invitationId: invitation.id,
		onSuccess: handleSuccess,
		onError: handleError,
	});

	const handleUpload = useCallback(
		(file: File, compressedBlob: Blob) => {
			setErrorMessage(null);
			upload(file, compressedBlob);
		},
		[upload],
	);

	const handleValidationError = useCallback((error: ImageUploadError) => {
		setErrorMessage(ERROR_MESSAGES[error]);
	}, []);

	const handleRemove = useCallback(() => {
		setErrorMessage(null);
		remove();
	}, [remove]);

	return (
		<div className="space-y-4">
			<ImageUpload
				onUpload={handleUpload}
				onError={handleValidationError}
				onRemove={handleRemove}
				currentImageUrl={invitation.heroImageUrl}
				uploading={uploading}
				progress={progress}
			/>
			{errorMessage && (
				<p className="text-sm text-destructive" role="alert">
					{errorMessage}
				</p>
			)}
		</div>
	);
}
