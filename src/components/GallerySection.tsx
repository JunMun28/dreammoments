import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useInvitationBuilder } from "@/contexts/InvitationBuilderContext";
import { useGalleryUpload } from "@/hooks/useGalleryUpload";
import { Button } from "./ui/button";
import {
	compressImage,
	type ImageUploadError,
	validateImageFile,
} from "./ui/image-upload";
import { Progress } from "./ui/progress";

/**
 * Error messages for different error types
 */
const ERROR_MESSAGES: Record<ImageUploadError | "upload-failed", string> = {
	"invalid-type": "Please select a valid image file (JPG, PNG, or WebP)",
	"too-large": "Image is too large. Maximum size is 5MB",
	"upload-failed": "Failed to upload image. Please try again.",
};

/**
 * Maximum number of gallery images allowed
 */
const MAX_GALLERY_IMAGES = 10;

/**
 * Gallery management section for the invitation builder.
 * Allows adding, removing, and reordering gallery images.
 */
export function GallerySection() {
	const { invitation, addGalleryImage, deleteGalleryImage, moveGalleryImage } =
		useInvitationBuilder();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSuccess = useCallback(
		(image: {
			id: string;
			imageUrl: string;
			caption?: string;
			order: number;
		}) => {
			addGalleryImage(image);
			setErrorMessage(null);
		},
		[addGalleryImage],
	);

	const handleError = useCallback(
		(error: ImageUploadError | "upload-failed") => {
			setErrorMessage(ERROR_MESSAGES[error]);
		},
		[],
	);

	const { upload, uploading, progress } = useGalleryUpload({
		invitationId: invitation.id,
		onSuccess: handleSuccess,
		onError: handleError,
	});

	const handleFileSelect = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			// Validate file
			const validation = validateImageFile(file);
			if (!validation.valid && validation.error) {
				setErrorMessage(ERROR_MESSAGES[validation.error]);
				return;
			}

			try {
				setErrorMessage(null);
				const compressed = await compressImage(file);
				await upload(file, compressed);
			} catch {
				setErrorMessage(ERROR_MESSAGES["upload-failed"]);
			}

			// Reset input
			e.target.value = "";
		},
		[upload],
	);

	const handleDelete = useCallback(
		async (imageId: string) => {
			try {
				// Call server to delete
				const response = await fetch("/api/delete-gallery-image", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ id: imageId }),
				});

				if (response.ok) {
					deleteGalleryImage(imageId);
				} else {
					setErrorMessage("Failed to delete image. Please try again.");
				}
			} catch {
				setErrorMessage("Failed to delete image. Please try again.");
			}
		},
		[deleteGalleryImage],
	);

	const handleMoveUp = useCallback(
		(imageId: string) => {
			moveGalleryImage(imageId, "up");
		},
		[moveGalleryImage],
	);

	const handleMoveDown = useCallback(
		(imageId: string) => {
			moveGalleryImage(imageId, "down");
		},
		[moveGalleryImage],
	);

	const galleryImages = invitation.galleryImages || [];
	const sortedImages = [...galleryImages].sort((a, b) => a.order - b.order);
	const canAddMore = galleryImages.length < MAX_GALLERY_IMAGES;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{galleryImages.length} of {MAX_GALLERY_IMAGES} images
				</p>
			</div>

			{/* Image grid */}
			{sortedImages.length > 0 && (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{sortedImages.map((image, index) => (
						<div
							key={image.id}
							className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
						>
							<img
								src={image.imageUrl}
								alt={image.caption || `Gallery image ${index + 1}`}
								className="h-full w-full object-cover"
							/>
							{/* Overlay with actions */}
							<div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
								{/* Move up */}
								<Button
									type="button"
									variant="secondary"
									size="icon"
									className="h-8 w-8"
									onClick={() => handleMoveUp(image.id)}
									disabled={index === 0}
									aria-label="Move up"
								>
									<ArrowUp className="h-4 w-4" />
								</Button>
								{/* Move down */}
								<Button
									type="button"
									variant="secondary"
									size="icon"
									className="h-8 w-8"
									onClick={() => handleMoveDown(image.id)}
									disabled={index === sortedImages.length - 1}
									aria-label="Move down"
								>
									<ArrowDown className="h-4 w-4" />
								</Button>
								{/* Delete */}
								<Button
									type="button"
									variant="destructive"
									size="icon"
									className="h-8 w-8"
									onClick={() => handleDelete(image.id)}
									aria-label="Delete image"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Upload area */}
			{canAddMore && (
				<label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-primary/50 hover:bg-muted/50">
					{uploading ? (
						<>
							<div className="h-10 w-10 animate-pulse rounded-full bg-primary/20 p-2">
								<Plus className="h-6 w-6 text-primary" />
							</div>
							<span className="text-sm font-medium">Uploading...</span>
							<div className="w-full max-w-xs">
								<Progress value={progress} className="h-2" />
								<p className="mt-1 text-center text-xs text-muted-foreground">
									{progress}%
								</p>
							</div>
						</>
					) : (
						<>
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
								<Plus className="h-6 w-6 text-muted-foreground" />
							</div>
							<span className="text-sm font-medium">Add Photo</span>
							<span className="text-xs text-muted-foreground">
								JPG, PNG, WebP (max 5MB)
							</span>
						</>
					)}
					<input
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onChange={handleFileSelect}
						disabled={uploading}
						className="sr-only"
					/>
				</label>
			)}

			{/* Error message */}
			{errorMessage && (
				<p className="text-sm text-destructive" role="alert">
					{errorMessage}
				</p>
			)}

			{/* Empty state */}
			{sortedImages.length === 0 && !uploading && (
				<p className="text-center text-sm text-muted-foreground">
					No photos yet. Add images to create a photo gallery for your guests.
				</p>
			)}
		</div>
	);
}
