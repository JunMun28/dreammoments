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

export function GalleryBlock({ block }: { block: Block }) {
	const photos = toPhotos(block.content.photos).slice(0, 4);

	if (photos.length === 0) {
		return (
			<div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-[color:var(--dm-border)] bg-[color:var(--dm-bg-soft)] text-xs uppercase tracking-[0.16em] text-[color:var(--dm-muted)]">
				No gallery photos
			</div>
		);
	}

	return (
		<div className="grid h-full w-full grid-cols-2 gap-2">
			{photos.map((photo, index) => (
				<div
					key={`${photo.url ?? "photo"}-${index}`}
					className="relative overflow-hidden rounded-md bg-[color:var(--dm-bg-soft)]"
				>
					{photo.url ? (
						<img
							src={photo.url}
							alt={photo.caption || `Gallery photo ${index + 1}`}
							className="h-full w-full object-cover"
							loading="lazy"
							decoding="async"
						/>
					) : null}
					{photo.caption ? (
						<div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1 text-[10px] text-white">
							{photo.caption}
						</div>
					) : null}
				</div>
			))}
		</div>
	);
}
