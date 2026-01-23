// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExportDialog } from "./ExportDialog";

// Mock ResizeObserver for Radix Slider component
class MockResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

describe("ExportDialog - CE-018", () => {
	let mockCanvasRef: {
		current: {
			toDataURL: ReturnType<typeof vi.fn>;
		};
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockCanvasRef = {
			current: {
				toDataURL: vi.fn((options: { format?: string; quality?: number }) => {
					const format = options.format || "png";
					const quality = options.quality || 1;
					return `data:image/${format};base64,mockImageData_q${quality}`;
				}),
			},
		};
	});

	afterEach(() => {
		cleanup();
	});

	it("renders export dialog when open", () => {
		render(
			<ExportDialog
				open={true}
				onOpenChange={() => {}}
				canvasRef={mockCanvasRef as never}
			/>,
		);

		expect(screen.getByText("Export Canvas")).toBeTruthy();
	});

	it("does not render when closed", () => {
		render(
			<ExportDialog
				open={false}
				onOpenChange={() => {}}
				canvasRef={mockCanvasRef as never}
			/>,
		);

		expect(screen.queryByText("Export Canvas")).toBeNull();
	});

	it("shows format options: PNG and JPEG", () => {
		render(
			<ExportDialog
				open={true}
				onOpenChange={() => {}}
				canvasRef={mockCanvasRef as never}
			/>,
		);

		expect(screen.getByLabelText("PNG")).toBeTruthy();
		expect(screen.getByLabelText("JPEG")).toBeTruthy();
	});

	it("PNG is selected by default", () => {
		render(
			<ExportDialog
				open={true}
				onOpenChange={() => {}}
				canvasRef={mockCanvasRef as never}
			/>,
		);

		const pngRadio = screen.getByLabelText("PNG") as HTMLInputElement;
		expect(pngRadio.checked).toBe(true);
	});

	it("shows quality slider only when JPEG is selected", async () => {
		const user = userEvent.setup();

		render(
			<ExportDialog
				open={true}
				onOpenChange={() => {}}
				canvasRef={mockCanvasRef as never}
			/>,
		);

		// Quality slider should not be visible with PNG selected
		expect(screen.queryByLabelText(/quality/i)).toBeNull();

		// Select JPEG
		await user.click(screen.getByLabelText("JPEG"));

		// Quality slider should now be visible
		expect(screen.getByLabelText(/quality/i)).toBeTruthy();
	});

	it("quality slider has range 1-100 with default 80", async () => {
		const user = userEvent.setup();

		render(
			<ExportDialog
				open={true}
				onOpenChange={() => {}}
				canvasRef={mockCanvasRef as never}
			/>,
		);

		// Select JPEG to show quality slider
		await user.click(screen.getByLabelText("JPEG"));

		const qualitySlider = screen.getByRole("slider");
		expect(qualitySlider.getAttribute("aria-valuemin")).toBe("1");
		expect(qualitySlider.getAttribute("aria-valuemax")).toBe("100");
		expect(qualitySlider.getAttribute("aria-valuenow")).toBe("80");
	});

	it("shows preview of export result", () => {
		render(
			<ExportDialog
				open={true}
				onOpenChange={() => {}}
				canvasRef={mockCanvasRef as never}
			/>,
		);

		const previewImage = screen.getByTestId("export-preview");
		expect(previewImage).toBeTruthy();
		expect(previewImage.tagName).toBe("IMG");
	});

	it("updates preview when format changes", async () => {
		const user = userEvent.setup();

		render(
			<ExportDialog
				open={true}
				onOpenChange={() => {}}
				canvasRef={mockCanvasRef as never}
			/>,
		);

		const previewImage = screen.getByTestId(
			"export-preview",
		) as HTMLImageElement;
		const initialSrc = previewImage.src;
		expect(initialSrc).toContain("png");

		// Switch to JPEG
		await user.click(screen.getByLabelText("JPEG"));

		await waitFor(() => {
			expect(previewImage.src).toContain("jpeg");
		});
	});

	it("generates preview with quality setting for JPEG", async () => {
		const user = userEvent.setup();

		render(
			<ExportDialog
				open={true}
				onOpenChange={() => {}}
				canvasRef={mockCanvasRef as never}
			/>,
		);

		// Select JPEG to enable quality slider
		await user.click(screen.getByLabelText("JPEG"));

		// Verify the slider is present and preview was generated with quality
		expect(screen.getByRole("slider")).toBeTruthy();

		// Wait for preview to update with quality setting
		await waitFor(() => {
			expect(mockCanvasRef.current.toDataURL).toHaveBeenCalledWith(
				expect.objectContaining({ quality: 0.8 }),
			);
		});
	});

	it("has a Download button", () => {
		render(
			<ExportDialog
				open={true}
				onOpenChange={() => {}}
				canvasRef={mockCanvasRef as never}
			/>,
		);

		expect(screen.getByRole("button", { name: /download/i })).toBeTruthy();
	});

	it("calls download handler when Download button is clicked", async () => {
		const user = userEvent.setup();

		// Store original createElement
		const originalCreateElement = document.createElement.bind(document);

		// Mock the anchor click
		const mockClick = vi.fn();
		const mockAnchor = {
			href: "",
			download: "",
			click: mockClick,
		};

		vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
			if (tag === "a") return mockAnchor as unknown as HTMLAnchorElement;
			return originalCreateElement(tag);
		});

		render(
			<ExportDialog
				open={true}
				onOpenChange={() => {}}
				canvasRef={mockCanvasRef as never}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /download/i }));

		expect(mockAnchor.download).toMatch(/canvas-export.*\.png/);
		expect(mockClick).toHaveBeenCalled();

		vi.restoreAllMocks();
	});

	it("uses correct file extension based on format", async () => {
		const user = userEvent.setup();

		// Store original createElement
		const originalCreateElement = document.createElement.bind(document);

		const mockClick = vi.fn();
		const mockAnchor = {
			href: "",
			download: "",
			click: mockClick,
		};

		vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
			if (tag === "a") return mockAnchor as unknown as HTMLAnchorElement;
			return originalCreateElement(tag);
		});

		render(
			<ExportDialog
				open={true}
				onOpenChange={() => {}}
				canvasRef={mockCanvasRef as never}
			/>,
		);

		// Switch to JPEG
		await user.click(screen.getByLabelText("JPEG"));

		await user.click(screen.getByRole("button", { name: /download/i }));

		expect(mockAnchor.download).toMatch(/\.jpeg$/);

		vi.restoreAllMocks();
	});

	it("closes dialog after successful download", async () => {
		const user = userEvent.setup();
		const handleOpenChange = vi.fn();

		// Store original createElement
		const originalCreateElement = document.createElement.bind(document);

		const mockClick = vi.fn();
		const mockAnchor = { href: "", download: "", click: mockClick };

		vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
			if (tag === "a") return mockAnchor as unknown as HTMLAnchorElement;
			return originalCreateElement(tag);
		});

		render(
			<ExportDialog
				open={true}
				onOpenChange={handleOpenChange}
				canvasRef={mockCanvasRef as never}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /download/i }));

		expect(handleOpenChange).toHaveBeenCalledWith(false);

		vi.restoreAllMocks();
	});

	it("has a Cancel button that closes dialog", async () => {
		const user = userEvent.setup();
		const handleOpenChange = vi.fn();

		render(
			<ExportDialog
				open={true}
				onOpenChange={handleOpenChange}
				canvasRef={mockCanvasRef as never}
			/>,
		);

		const cancelButton = screen.getByRole("button", { name: /cancel/i });
		await user.click(cancelButton);

		expect(handleOpenChange).toHaveBeenCalledWith(false);
	});

	it("displays quality percentage value next to slider", async () => {
		const user = userEvent.setup();

		render(
			<ExportDialog
				open={true}
				onOpenChange={() => {}}
				canvasRef={mockCanvasRef as never}
			/>,
		);

		// Select JPEG
		await user.click(screen.getByLabelText("JPEG"));

		// Quality display should show 80%
		expect(screen.getByText("80%")).toBeTruthy();

		// For Radix slider we need to simulate the value change differently
		// The slider uses onValueChange, so let's check the initial state is correct
	});
});
