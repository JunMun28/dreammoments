// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type PageInfo, PageThumbnailsPanel } from "./PageThumbnailsPanel";

const mockPages: PageInfo[] = [
	{
		id: "page-1",
		name: "Page 1",
		thumbnailUrl: null,
		order: 0,
	},
	{
		id: "page-2",
		name: "Page 2",
		thumbnailUrl: null,
		order: 1,
	},
	{
		id: "page-3",
		name: "Page 3",
		thumbnailUrl: null,
		order: 2,
	},
];

describe("PageThumbnailsPanel", () => {
	describe("CE-015: Basic rendering", () => {
		it("renders the bottom panel container", () => {
			render(
				<PageThumbnailsPanel
					pages={mockPages}
					currentPageId="page-1"
					onPageSelect={vi.fn()}
					onAddPage={vi.fn()}
					onDeletePage={vi.fn()}
					onReorderPages={vi.fn()}
				/>,
			);

			expect(screen.getByTestId("page-thumbnails-panel")).toBeDefined();
		});

		it("renders horizontal scrollable list of page thumbnails", () => {
			render(
				<PageThumbnailsPanel
					pages={mockPages}
					currentPageId="page-1"
					onPageSelect={vi.fn()}
					onAddPage={vi.fn()}
					onDeletePage={vi.fn()}
					onReorderPages={vi.fn()}
				/>,
			);

			const thumbnails = screen.getAllByTestId(/^page-thumbnail-/);
			expect(thumbnails).toHaveLength(3);
		});

		it("shows page number on each thumbnail", () => {
			render(
				<PageThumbnailsPanel
					pages={mockPages}
					currentPageId="page-1"
					onPageSelect={vi.fn()}
					onAddPage={vi.fn()}
					onDeletePage={vi.fn()}
					onReorderPages={vi.fn()}
				/>,
			);

			// Each page has the number displayed twice (placeholder + label)
			// So check that the thumbnails have proper page numbers
			const thumbnail1 = screen.getByTestId("page-thumbnail-page-1");
			const thumbnail2 = screen.getByTestId("page-thumbnail-page-2");
			const thumbnail3 = screen.getByTestId("page-thumbnail-page-3");

			expect(thumbnail1.textContent).toContain("1");
			expect(thumbnail2.textContent).toContain("2");
			expect(thumbnail3.textContent).toContain("3");
		});
	});

	describe("CE-015: Active page highlighting", () => {
		it("highlights the currently active page", () => {
			render(
				<PageThumbnailsPanel
					pages={mockPages}
					currentPageId="page-2"
					onPageSelect={vi.fn()}
					onAddPage={vi.fn()}
					onDeletePage={vi.fn()}
					onReorderPages={vi.fn()}
				/>,
			);

			const activeThumbnail = screen.getByTestId("page-thumbnail-page-2");
			expect(activeThumbnail.className).toContain("ring-2");
		});

		it("does not highlight inactive pages", () => {
			render(
				<PageThumbnailsPanel
					pages={mockPages}
					currentPageId="page-2"
					onPageSelect={vi.fn()}
					onAddPage={vi.fn()}
					onDeletePage={vi.fn()}
					onReorderPages={vi.fn()}
				/>,
			);

			const inactiveThumbnail = screen.getByTestId("page-thumbnail-page-1");
			expect(inactiveThumbnail.className).not.toContain("ring-2");
		});
	});

	describe("CE-015: Page selection", () => {
		it("calls onPageSelect when clicking a thumbnail", () => {
			const onPageSelect = vi.fn();
			render(
				<PageThumbnailsPanel
					pages={mockPages}
					currentPageId="page-1"
					onPageSelect={onPageSelect}
					onAddPage={vi.fn()}
					onDeletePage={vi.fn()}
					onReorderPages={vi.fn()}
				/>,
			);

			fireEvent.click(screen.getByTestId("page-thumbnail-page-2"));
			expect(onPageSelect).toHaveBeenCalledWith("page-2");
		});
	});

	describe("CE-015: Add page button", () => {
		it("renders add page button with plus icon", () => {
			render(
				<PageThumbnailsPanel
					pages={mockPages}
					currentPageId="page-1"
					onPageSelect={vi.fn()}
					onAddPage={vi.fn()}
					onDeletePage={vi.fn()}
					onReorderPages={vi.fn()}
				/>,
			);

			expect(screen.getByTestId("add-page-button")).toBeDefined();
		});

		it("calls onAddPage when clicking add button", () => {
			const onAddPage = vi.fn();
			render(
				<PageThumbnailsPanel
					pages={mockPages}
					currentPageId="page-1"
					onPageSelect={vi.fn()}
					onAddPage={onAddPage}
					onDeletePage={vi.fn()}
					onReorderPages={vi.fn()}
				/>,
			);

			fireEvent.click(screen.getByTestId("add-page-button"));
			expect(onAddPage).toHaveBeenCalled();
		});
	});

	describe("CE-015: Delete page button", () => {
		it("shows delete button on hover", () => {
			render(
				<PageThumbnailsPanel
					pages={mockPages}
					currentPageId="page-1"
					onPageSelect={vi.fn()}
					onAddPage={vi.fn()}
					onDeletePage={vi.fn()}
					onReorderPages={vi.fn()}
				/>,
			);

			const thumbnail = screen.getByTestId("page-thumbnail-page-2");
			fireEvent.mouseEnter(thumbnail);

			const deleteButton = within(thumbnail).getByTestId("delete-page-button");
			expect(deleteButton).toBeDefined();
		});

		it("calls onDeletePage when clicking delete button", () => {
			const onDeletePage = vi.fn();
			render(
				<PageThumbnailsPanel
					pages={mockPages}
					currentPageId="page-1"
					onPageSelect={vi.fn()}
					onAddPage={vi.fn()}
					onDeletePage={onDeletePage}
					onReorderPages={vi.fn()}
				/>,
			);

			const thumbnail = screen.getByTestId("page-thumbnail-page-2");
			fireEvent.mouseEnter(thumbnail);

			const deleteButton = within(thumbnail).getByTestId("delete-page-button");
			fireEvent.click(deleteButton);

			expect(onDeletePage).toHaveBeenCalledWith("page-2");
		});

		it("does not show delete button when only one page exists", () => {
			const singlePage: PageInfo[] = [
				{ id: "page-1", name: "Page 1", thumbnailUrl: null, order: 0 },
			];

			render(
				<PageThumbnailsPanel
					pages={singlePage}
					currentPageId="page-1"
					onPageSelect={vi.fn()}
					onAddPage={vi.fn()}
					onDeletePage={vi.fn()}
					onReorderPages={vi.fn()}
				/>,
			);

			const thumbnail = screen.getByTestId("page-thumbnail-page-1");
			fireEvent.mouseEnter(thumbnail);

			expect(within(thumbnail).queryByTestId("delete-page-button")).toBeNull();
		});
	});

	describe("CE-015: Thumbnail preview", () => {
		it("displays thumbnail image when thumbnailUrl is provided", () => {
			const pagesWithThumbnail: PageInfo[] = [
				{
					id: "page-1",
					name: "Page 1",
					thumbnailUrl: "data:image/png;base64,test",
					order: 0,
				},
			];

			render(
				<PageThumbnailsPanel
					pages={pagesWithThumbnail}
					currentPageId="page-1"
					onPageSelect={vi.fn()}
					onAddPage={vi.fn()}
					onDeletePage={vi.fn()}
					onReorderPages={vi.fn()}
				/>,
			);

			const thumbnail = screen.getByTestId("page-thumbnail-page-1");
			const img = within(thumbnail).getByRole("img");
			expect(img.getAttribute("src")).toBe("data:image/png;base64,test");
		});

		it("shows placeholder when no thumbnail image", () => {
			render(
				<PageThumbnailsPanel
					pages={mockPages}
					currentPageId="page-1"
					onPageSelect={vi.fn()}
					onAddPage={vi.fn()}
					onDeletePage={vi.fn()}
					onReorderPages={vi.fn()}
				/>,
			);

			const thumbnail = screen.getByTestId("page-thumbnail-page-1");
			expect(
				within(thumbnail).getByTestId("thumbnail-placeholder"),
			).toBeDefined();
		});
	});

	describe("CE-015: Drag to reorder", () => {
		it("sets draggable attribute on thumbnails", () => {
			render(
				<PageThumbnailsPanel
					pages={mockPages}
					currentPageId="page-1"
					onPageSelect={vi.fn()}
					onAddPage={vi.fn()}
					onDeletePage={vi.fn()}
					onReorderPages={vi.fn()}
				/>,
			);

			const thumbnail = screen.getByTestId("page-thumbnail-page-1");
			expect(thumbnail.getAttribute("draggable")).toBe("true");
		});

		it("calls onReorderPages when drag ends at different position", () => {
			const onReorderPages = vi.fn();
			render(
				<PageThumbnailsPanel
					pages={mockPages}
					currentPageId="page-1"
					onPageSelect={vi.fn()}
					onAddPage={vi.fn()}
					onDeletePage={vi.fn()}
					onReorderPages={onReorderPages}
				/>,
			);

			const sourceThumbnail = screen.getByTestId("page-thumbnail-page-1");
			const targetThumbnail = screen.getByTestId("page-thumbnail-page-3");

			// Simulate drag start on page-1
			fireEvent.dragStart(sourceThumbnail, {
				dataTransfer: { setData: vi.fn() },
			});

			// Simulate drag over page-3
			fireEvent.dragOver(targetThumbnail, { preventDefault: vi.fn() });

			// Simulate drop
			fireEvent.drop(targetThumbnail, {
				dataTransfer: { getData: () => "page-1" },
			});

			expect(onReorderPages).toHaveBeenCalledWith("page-1", 2);
		});
	});

	describe("CE-015: Empty state", () => {
		it("renders add button even with no pages", () => {
			render(
				<PageThumbnailsPanel
					pages={[]}
					currentPageId=""
					onPageSelect={vi.fn()}
					onAddPage={vi.fn()}
					onDeletePage={vi.fn()}
					onReorderPages={vi.fn()}
				/>,
			);

			expect(screen.getByTestId("add-page-button")).toBeDefined();
		});
	});
});
