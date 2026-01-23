import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useInvitationBuilder } from "@/contexts/InvitationBuilderContext";

/**
 * Filmstrip panel for gallery image management.
 * Horizontal scrollable strip of gallery images with quick actions.
 */
export function FilmstripPanel() {
	const { invitation, setActiveTool, deleteGalleryImage } =
		useInvitationBuilder();
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const images = invitation.galleryImages ?? [];

	const scrollLeft = useCallback(() => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
		}
	}, []);

	const scrollRight = useCallback(() => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
		}
	}, []);

	const handleAddClick = useCallback(() => {
		setActiveTool("images");
	}, [setActiveTool]);

	const handleDeleteClick = useCallback(
		async (imageId: string) => {
			// Delete from context
			deleteGalleryImage(imageId);

			// Also delete from server
			try {
				const { deleteGalleryImage: deleteGalleryImageServer } = await import(
					"@/lib/gallery-server"
				);
				await deleteGalleryImageServer({ data: { id: imageId } });
			} catch (error) {
				console.error("Failed to delete gallery image from server:", error);
			}
		},
		[deleteGalleryImage],
	);

	return (
		<div className="flex h-full items-center gap-2 px-4">
			{/* Left scroll button */}
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8 flex-shrink-0"
				onClick={scrollLeft}
				disabled={images.length === 0}
			>
				<ChevronLeft className="h-4 w-4" />
				<span className="sr-only">Scroll left</span>
			</Button>

			{/* Filmstrip container */}
			<div
				ref={scrollContainerRef}
				className="flex flex-1 items-center gap-3 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent"
			>
				{/* Add button */}
				<button
					type="button"
					className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-stone-300 text-stone-400 transition-colors hover:border-stone-400 hover:text-stone-500"
					onClick={handleAddClick}
				>
					<Plus className="h-6 w-6" />
					<span className="sr-only">Add image</span>
				</button>

				{/* Image thumbnails */}
				{images
					.sort((a, b) => a.order - b.order)
					.map((image) => (
						<div
							key={image.id}
							className="group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg"
						>
							<img
								src={image.imageUrl}
								alt={image.caption ?? "Gallery image"}
								className="h-full w-full object-cover transition-transform group-hover:scale-105"
							/>

							{/* Hover overlay with delete button */}
							<div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
								<Button
									variant="destructive"
									size="icon"
									className="h-8 w-8"
									onClick={() => handleDeleteClick(image.id)}
								>
									<Trash2 className="h-4 w-4" />
									<span className="sr-only">Delete image</span>
								</Button>
							</div>

							{/* Order indicator */}
							<span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
								{image.order + 1}
							</span>
						</div>
					))}

				{/* Empty state */}
				{images.length === 0 && (
					<div className="flex flex-1 items-center justify-center text-sm text-stone-400">
						No gallery images yet. Click + to add photos.
					</div>
				)}
			</div>

			{/* Right scroll button */}
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8 flex-shrink-0"
				onClick={scrollRight}
				disabled={images.length === 0}
			>
				<ChevronRight className="h-4 w-4" />
				<span className="sr-only">Scroll right</span>
			</Button>
		</div>
	);
}
