import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Block } from "@/lib/canvas/types";

type PhotoItem = {
	url?: string;
	caption?: string;
};

function toPhotos(value: unknown): PhotoItem[] {
	if (!Array.isArray(value)) return [];
	return value.filter(
		(item) => typeof item === "object" && item !== null,
	) as PhotoItem[];
}

function GalleryLightbox({
	photo,
	onClose,
}: {
	photo: PhotoItem;
	onClose: () => void;
}) {
	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [onClose]);

	return createPortal(
		<div
			className="dm-gallery-lightbox"
			onClick={onClose}
			onKeyDown={(e) => {
				if (e.key === "Escape") onClose();
			}}
			role="dialog"
			aria-label="Photo lightbox"
			aria-modal="true"
		>
			<button
				type="button"
				className="dm-gallery-lightbox-close"
				onClick={onClose}
				aria-label="Close lightbox"
			>
				&times;
			</button>
			{photo.url ? (
				<img
					src={photo.url}
					alt={photo.caption || "Gallery photo"}
					onClick={(e) => e.stopPropagation()}
					onKeyDown={() => {}}
				/>
			) : null}
			{photo.caption ? (
				<p className="dm-gallery-lightbox-caption">{photo.caption}</p>
			) : null}
		</div>,
		document.body,
	);
}

export function GalleryBlock({ block }: { block: Block }) {
	const photos = toPhotos(block.content.photos);
	const trackRef = useRef<HTMLDivElement>(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const [lightboxPhoto, setLightboxPhoto] = useState<PhotoItem | null>(null);

	const handleScroll = useCallback(() => {
		const track = trackRef.current;
		if (!track || track.clientWidth === 0) return;
		const idx = Math.round(track.scrollLeft / track.clientWidth);
		setActiveIndex(idx);
	}, []);

	const scrollTo = useCallback((index: number) => {
		const track = trackRef.current;
		if (!track) return;
		track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
	}, []);

	if (photos.length === 0) {
		return (
			<div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-[color:var(--dm-border)] bg-[color:var(--dm-bg-soft)] text-xs uppercase tracking-[0.16em] text-[color:var(--dm-muted)]">
				No gallery photos
			</div>
		);
	}

	return (
		<div className="dm-gallery-carousel">
			<div ref={trackRef} className="dm-gallery-track" onScroll={handleScroll}>
				{photos.map((photo, index) => (
					<div
						key={`${photo.url ?? "photo"}-${index}`}
						className="dm-gallery-slide"
					>
						{photo.url ? (
							<button
								type="button"
								onClick={() => setLightboxPhoto(photo)}
								style={{
									display: "block",
									width: "100%",
									height: "100%",
									padding: 0,
									border: "none",
									background: "none",
									cursor: "pointer",
								}}
								aria-label={photo.caption || `View photo ${index + 1}`}
							>
								<img
									src={photo.url}
									alt={photo.caption || `Gallery photo ${index + 1}`}
									loading="lazy"
									decoding="async"
								/>
							</button>
						) : null}
						{photo.caption ? (
							<div className="dm-gallery-caption">{photo.caption}</div>
						) : null}
					</div>
				))}
			</div>

			{photos.length > 1 ? (
				<nav className="dm-gallery-dots" aria-label="Gallery navigation">
					{photos.map((_, i) => (
						<button
							key={i}
							type="button"
							className="dm-gallery-dot"
							data-active={i === activeIndex}
							onClick={() => scrollTo(i)}
							aria-label={`Go to photo ${i + 1}`}
							aria-current={i === activeIndex ? "step" : undefined}
						/>
					))}
				</nav>
			) : null}

			{lightboxPhoto ? (
				<GalleryLightbox
					photo={lightboxPhoto}
					onClose={() => setLightboxPhoto(null)}
				/>
			) : null}
		</div>
	);
}
