// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MusicPanel } from "./MusicPanel";

describe("MusicPanel", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	describe("Category tabs", () => {
		it("renders 'All' category tab", () => {
			render(<MusicPanel />);

			const allTab = screen.getByRole("tab", { name: /all/i });
			expect(allTab).toBeDefined();
		});

		it("renders 'Romantic' category tab", () => {
			render(<MusicPanel />);

			const romanticTab = screen.getByRole("tab", { name: /romantic/i });
			expect(romanticTab).toBeDefined();
		});

		it("renders 'Chinese Classics' category tab", () => {
			render(<MusicPanel />);

			const chineseClassicsTab = screen.getByRole("tab", { name: /经典/i });
			expect(chineseClassicsTab).toBeDefined();
		});

		it("renders 'Chinese Modern' category tab", () => {
			render(<MusicPanel />);

			const chineseModernTab = screen.getByRole("tab", { name: /华语/i });
			expect(chineseModernTab).toBeDefined();
		});

		it("renders 'Contemporary' category tab", () => {
			render(<MusicPanel />);

			const contemporaryTab = screen.getByRole("tab", {
				name: /contemporary/i,
			});
			expect(contemporaryTab).toBeDefined();
		});

		it("renders 'Instrumental' category tab", () => {
			render(<MusicPanel />);

			const instrumentalTab = screen.getByRole("tab", {
				name: /instrumental/i,
			});
			expect(instrumentalTab).toBeDefined();
		});

		it("All tab is selected by default", () => {
			render(<MusicPanel />);

			const allTab = screen.getByRole("tab", { name: /all/i });
			expect(allTab.getAttribute("aria-selected")).toBe("true");
		});

		it("filters tracks when category tab is clicked", () => {
			render(<MusicPanel />);

			const romanticTab = screen.getByRole("tab", { name: /romantic/i });
			fireEvent.click(romanticTab);

			// Should only show romantic tracks
			expect(screen.getByText("Perfect")).toBeDefined();
			expect(screen.queryByText("Canon in D")).toBeNull();
		});
	});

	describe("Track list", () => {
		it("renders track list", () => {
			render(<MusicPanel />);

			expect(screen.getByRole("list")).toBeDefined();
		});

		it("shows track title", () => {
			render(<MusicPanel />);

			expect(screen.getByText("Perfect")).toBeDefined();
		});

		it("shows track artist", () => {
			render(<MusicPanel />);

			expect(screen.getByText("Wedding Ensemble")).toBeDefined();
		});

		it("shows track duration in MM:SS format", () => {
			render(<MusicPanel />);

			// Perfect is 263 seconds = 4:23
			// Multiple tracks may have the same duration, so use getAllByText
			const durations = screen.getAllByText("4:23");
			expect(durations.length).toBeGreaterThan(0);
		});

		it("shows preview button for each track", () => {
			render(<MusicPanel />);

			const previewButtons = screen.getAllByRole("button", {
				name: /play preview/i,
			});
			expect(previewButtons.length).toBeGreaterThan(0);
		});

		it("shows use button for each track", () => {
			render(<MusicPanel />);

			const useButtons = screen.getAllByRole("button", { name: /use/i });
			expect(useButtons.length).toBeGreaterThan(0);
		});
	});

	describe("Track selection", () => {
		it("calls onTrackSelect when Use button is clicked", () => {
			const onTrackSelect = vi.fn();
			render(<MusicPanel onTrackSelect={onTrackSelect} />);

			const useButtons = screen.getAllByRole("button", { name: /use/i });
			fireEvent.click(useButtons[0]);

			expect(onTrackSelect).toHaveBeenCalledWith(
				expect.objectContaining({ id: "romantic-1" }),
			);
		});

		it("shows currently selected track", () => {
			render(
				<MusicPanel selectedTrackId="romantic-2" onTrackSelect={() => {}} />,
			);

			// The selected track should have visual indication
			const trackItems = screen.getAllByTestId("track-item");
			const selectedItem = trackItems.find((item) =>
				item.className.includes("selected"),
			);
			expect(selectedItem).toBeDefined();
			expect(selectedItem?.textContent).toContain("A Thousand Years");
		});
	});

	describe("Current music section", () => {
		it("shows current music section when a track is selected", () => {
			render(
				<MusicPanel selectedTrackId="romantic-1" onTrackSelect={() => {}} />,
			);

			expect(screen.getByText("Current Music")).toBeDefined();
		});

		it("does not show current music section when no track is selected", () => {
			render(<MusicPanel />);

			expect(screen.queryByText("Current Music")).toBeNull();
		});

		it("shows selected track title in current music section", () => {
			render(
				<MusicPanel selectedTrackId="romantic-1" onTrackSelect={() => {}} />,
			);

			// Should show track title in current music section
			const currentSection = screen.getByTestId("current-music-section");
			expect(currentSection.textContent).toContain("Perfect");
		});

		it("shows remove button in current music section", () => {
			render(
				<MusicPanel selectedTrackId="romantic-1" onTrackSelect={() => {}} />,
			);

			const removeButton = screen.getByRole("button", {
				name: /remove music/i,
			});
			expect(removeButton).toBeDefined();
		});

		it("calls onTrackSelect with null when remove is clicked", () => {
			const onTrackSelect = vi.fn();
			render(
				<MusicPanel
					selectedTrackId="romantic-1"
					onTrackSelect={onTrackSelect}
				/>,
			);

			const removeButton = screen.getByRole("button", {
				name: /remove music/i,
			});
			fireEvent.click(removeButton);

			expect(onTrackSelect).toHaveBeenCalledWith(null);
		});
	});

	describe("Local upload section", () => {
		it("shows upload button", () => {
			render(<MusicPanel />);

			const uploadButton = screen.getByRole("button", {
				name: /upload.*music/i,
			});
			expect(uploadButton).toBeDefined();
		});
	});
});
