import { type CSSProperties, useCallback, useRef } from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { cn } from "@/lib/utils";
// @ts-expect-error -- Swiper v12 CSS exports resolve at runtime via package.json exports
import "swiper/css";
// @ts-expect-error -- Swiper v12 CSS exports resolve at runtime via package.json exports
import "swiper/css/pagination";
import "./swiper-gallery.css";

export interface GalleryPhoto {
	url: string;
	caption?: string;
	captionZh?: string;
	placeholder?: string;
}

interface SwiperGalleryProps {
	photos: GalleryPhoto[];
	primaryColor?: string;
	className?: string;
}

export default function SwiperGallery({
	photos,
	primaryColor,
	className,
}: SwiperGalleryProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	const handleImgLoad = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement>) => {
			const placeholder = e.currentTarget.closest(".img-placeholder");
			placeholder?.classList.add("loaded");
		},
		[],
	);

	const style = primaryColor
		? ({ "--swiper-gallery-color": primaryColor } as CSSProperties)
		: undefined;

	return (
		<div
			ref={containerRef}
			className={cn("swiper-gallery", className)}
			style={style}
		>
			<Swiper
				slidesPerView={1}
				spaceBetween={16}
				pagination={{ clickable: true }}
				modules={[Pagination]}
			>
				{photos.map((photo) => (
					<SwiperSlide key={photo.url}>
						<div
							className={cn("img-placeholder", photo.placeholder && "has-blur")}
							style={
								photo.placeholder
									? {
											backgroundImage: `url(${photo.placeholder})`,
											backgroundSize: "cover",
										}
									: undefined
							}
						>
							<img
								src={photo.url}
								alt={photo.caption ?? ""}
								loading="lazy"
								decoding="async"
								width={800}
								height={600}
								onLoad={handleImgLoad}
							/>
						</div>
						{(photo.caption || photo.captionZh) && (
							<div className="slide-caption">
								{photo.caption && <p>{photo.caption}</p>}
								{photo.captionZh && (
									<p className="slide-caption-zh" lang="zh-Hans">
										{photo.captionZh}
									</p>
								)}
							</div>
						)}
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
}
