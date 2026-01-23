import { Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * CE-015: Page info for multi-page canvas support
 */
export interface PageInfo {
	id: string;
	name: string;
	thumbnailUrl: string | null;
	order: number;
}

interface PageThumbnailsPanelProps {
	pages: PageInfo[];
	currentPageId: string;
	onPageSelect: (pageId: string) => void;
	onAddPage: () => void;
	onDeletePage: (pageId: string) => void;
	onReorderPages: (pageId: string, newIndex: number) => void;
}

/**
 * CE-015: Bottom panel for multi-page navigation
 * Shows horizontal scrollable list of page thumbnails
 */
export function PageThumbnailsPanel({
	pages,
	currentPageId,
	onPageSelect,
	onAddPage,
	onDeletePage,
	onReorderPages,
}: PageThumbnailsPanelProps) {
	const [hoveredPageId, setHoveredPageId] = useState<string | null>(null);
	const [draggedPageId, setDraggedPageId] = useState<string | null>(null);

	const handleDragStart = useCallback(
		(e: React.DragEvent<HTMLDivElement>, pageId: string) => {
			e.dataTransfer.setData("text/plain", pageId);
			setDraggedPageId(pageId);
		},
		[],
	);

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
			e.preventDefault();
			const sourcePageId = e.dataTransfer.getData("text/plain");
			if (sourcePageId && sourcePageId !== pages[targetIndex]?.id) {
				onReorderPages(sourcePageId, targetIndex);
			}
			setDraggedPageId(null);
		},
		[pages, onReorderPages],
	);

	const handleDragEnd = useCallback(() => {
		setDraggedPageId(null);
	}, []);

	const handleDeleteClick = useCallback(
		(e: React.MouseEvent, pageId: string) => {
			e.stopPropagation(); // Prevent page selection
			onDeletePage(pageId);
		},
		[onDeletePage],
	);

	const sortedPages = [...pages].sort((a, b) => a.order - b.order);

	return (
		<div
			data-testid="page-thumbnails-panel"
			className="flex items-center gap-2 border-t bg-stone-50 px-4 py-3"
		>
			{/* Page thumbnails list */}
			<div className="flex flex-1 items-center gap-2 overflow-x-auto">
				{sortedPages.map((page, index) => {
					const isActive = page.id === currentPageId;
					const isHovered = page.id === hoveredPageId;
					const isDragging = page.id === draggedPageId;
					const canDelete = pages.length > 1;

					return (
						// biome-ignore lint/a11y/useSemanticElements: div with role="button" needed for drag/drop support
						<div
							key={page.id}
							data-testid={`page-thumbnail-${page.id}`}
							role="button"
							tabIndex={0}
							draggable
							onClick={() => onPageSelect(page.id)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									onPageSelect(page.id);
								}
							}}
							onDragStart={(e) => handleDragStart(e, page.id)}
							onDragOver={handleDragOver}
							onDrop={(e) => handleDrop(e, index)}
							onDragEnd={handleDragEnd}
							onMouseEnter={() => setHoveredPageId(page.id)}
							onMouseLeave={() => setHoveredPageId(null)}
							className={`
								relative flex h-16 w-12 cursor-pointer flex-col items-center justify-center
								rounded-md border bg-white transition-all
								${isActive ? "ring-2 ring-blue-500" : "hover:border-stone-400"}
								${isDragging ? "opacity-50" : ""}
							`}
						>
							{/* Thumbnail preview or placeholder */}
							{page.thumbnailUrl ? (
								<img
									src={page.thumbnailUrl}
									alt={page.name}
									className="h-10 w-8 rounded object-cover"
								/>
							) : (
								<div
									data-testid="thumbnail-placeholder"
									className="flex h-10 w-8 items-center justify-center rounded bg-stone-100"
								>
									<span className="text-xs text-stone-400">{index + 1}</span>
								</div>
							)}

							{/* Page number label */}
							<span className="mt-0.5 text-[10px] text-stone-500">
								{index + 1}
							</span>

							{/* Delete button on hover (only if more than 1 page) */}
							{isHovered && canDelete && (
								<button
									type="button"
									data-testid="delete-page-button"
									onClick={(e) => handleDeleteClick(e, page.id)}
									className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
								>
									<Trash2 className="h-2.5 w-2.5" />
								</button>
							)}
						</div>
					);
				})}
			</div>

			{/* Add page button */}
			<Button
				variant="outline"
				size="sm"
				onClick={onAddPage}
				data-testid="add-page-button"
				className="h-16 w-12 flex-shrink-0"
			>
				<Plus className="h-4 w-4" />
			</Button>
		</div>
	);
}
