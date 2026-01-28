import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { getTemplateById } from "@/lib/template-data";

/**
 * GalleryShowcase - Photo carousel section showing template gallery images.
 * Uses existing Carousel component with gold frame styling.
 * Caption overlay uses CSS-only hover effect.
 */
export function GalleryShowcase() {
	const template = getTemplateById("crimson-blessings");

	if (!template?.galleryImages) return null;

	return (
		<section className="bg-[#5c1a1b] px-6 py-20">
			<div className="mx-auto max-w-5xl">
				{/* Section header */}
				<div className="mb-12 text-center">
					<p className="mb-2 text-sm uppercase tracking-widest text-[#d4af37]/80">
						Cherish Every Moment
					</p>
					<h2
						className="mb-4 text-3xl font-light text-white md:text-4xl"
						style={{ fontFamily: "'Cinzel Decorative', serif" }}
					>
						Your Love in Focus
					</h2>
					<p className="mx-auto max-w-xl text-white/70">
						Showcase your most treasured memories in an elegant gallery that
						guests can explore
					</p>
				</div>

				{/* Carousel */}
				<div className="relative px-12">
					<Carousel
						opts={{
							align: "center",
							loop: true,
						}}
						className="w-full"
					>
						<CarouselContent>
							{template.galleryImages.map((image) => (
								<CarouselItem
									key={image.order}
									className="md:basis-1/2 lg:basis-1/2"
								>
									<div className="group relative overflow-hidden rounded-lg border-2 border-[#d4af37]/40 shadow-xl transition-all duration-300 hover:border-[#d4af37] hover:shadow-2xl hover:shadow-[#d4af37]/20">
										<div className="aspect-[4/3] overflow-hidden">
											<img
												src={image.imageUrl}
												alt={image.caption || "Gallery image"}
												className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
											/>
										</div>
										{/* Caption overlay - uses group-hover for CSS-only interaction */}
										<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
											<p
												className="text-center text-sm text-white"
												style={{ fontFamily: "'EB Garamond', serif" }}
											>
												{image.caption}
											</p>
										</div>
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious className="border-[#d4af37]/50 bg-[#5c1a1b] text-[#d4af37] hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#5c1a1b]" />
						<CarouselNext className="border-[#d4af37]/50 bg-[#5c1a1b] text-[#d4af37] hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#5c1a1b]" />
					</Carousel>
				</div>
			</div>
		</section>
	);
}
