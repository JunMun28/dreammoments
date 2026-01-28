import type { GalleryImage } from "@/contexts/InvitationBuilderContext";
import { cn } from "@/lib/utils";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "./ui/carousel";

interface PhotoGalleryProps {
	/** Array of gallery images to display */
	images: GalleryImage[];
	/** Optional accent color for styling */
	accentColor?: string;
	/** Whether in mobile viewport mode */
	isMobile?: boolean;
}

/**
 * Photo gallery carousel component for displaying gallery images.
 * Used in invitation preview to show couple's photos.
 */
export function PhotoGallery({
	images,
	accentColor,
	isMobile = false,
}: PhotoGalleryProps) {
	// Sort images by order
	const sortedImages = [...images].sort((a, b) => a.order - b.order);

	if (sortedImages.length === 0) {
		return null;
	}

	return (
		<div className="w-full">
			<Carousel
				opts={{
					align: "start",
					loop: true,
				}}
				className="w-full"
			>
				<CarouselContent className={cn(isMobile ? "-ml-2" : "-ml-4")}>
					{sortedImages.map((image, index) => (
						<CarouselItem
							key={image.id}
							className={cn(
								isMobile ? "pl-2 basis-4/5" : "pl-4 basis-2/3 md:basis-1/2",
							)}
						>
							<div className="relative aspect-[4/3] overflow-hidden rounded-lg">
								<img
									src={image.imageUrl}
									alt={image.caption || `Gallery photo ${index + 1}`}
									className="h-full w-full object-cover"
									loading="lazy"
								/>
								{image.caption && (
									<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
										<p className="text-sm text-white">{image.caption}</p>
									</div>
								)}
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				{sortedImages.length > 1 && (
					<>
						<CarouselPrevious
							className={cn("left-2", isMobile && "h-8 w-8")}
							style={{
								borderColor: accentColor,
								color: accentColor,
							}}
						/>
						<CarouselNext
							className={cn("right-2", isMobile && "h-8 w-8")}
							style={{
								borderColor: accentColor,
								color: accentColor,
							}}
						/>
					</>
				)}
			</Carousel>
			{/* Dots indicator */}
			{sortedImages.length > 1 && (
				<div className="mt-3 flex justify-center gap-1.5">
					{sortedImages.map((image, index) => (
						<div
							key={image.id}
							className={cn(
								"h-1.5 w-1.5 rounded-full transition-colors",
								index === 0 ? "bg-current" : "bg-current/30",
							)}
							style={{ color: accentColor }}
							aria-hidden="true"
						/>
					))}
				</div>
			)}
		</div>
	);
}
