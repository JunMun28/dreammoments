import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CsvUpload } from "./csv-upload";

describe("CsvUpload component", () => {
	const defaultProps = {
		onFileSelect: vi.fn(),
		onError: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("renders drag-drop zone with instructions", () => {
		render(<CsvUpload {...defaultProps} />);
		expect(screen.getByText(/drag & drop your csv file here/i)).toBeDefined();
		expect(screen.getByText(/or click to browse/i)).toBeDefined();
	});

	it("renders accepted formats hint", () => {
		render(<CsvUpload {...defaultProps} />);
		expect(screen.getByText(/csv files only/i)).toBeDefined();
	});

	it("renders file input with correct accept attribute", () => {
		render(<CsvUpload {...defaultProps} />);
		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		expect(input).toBeDefined();
		expect(input.accept).toBe(".csv,text/csv,application/vnd.ms-excel");
	});

	it("shows loading state when loading prop is true", () => {
		render(<CsvUpload {...defaultProps} loading />);
		expect(screen.getByText(/processing/i)).toBeDefined();
	});

	it("disables input when disabled prop is true", () => {
		render(<CsvUpload {...defaultProps} disabled />);
		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		expect(input.disabled).toBe(true);
	});

	it("applies drag-over styles during drag", () => {
		render(<CsvUpload {...defaultProps} />);
		const dropZone = screen.getByTestId("csv-drop-zone");
		fireEvent.dragOver(dropZone);
		expect(dropZone.classList.contains("border-primary")).toBe(true);
	});

	it("calls onError for non-CSV file types", () => {
		const onError = vi.fn();
		render(<CsvUpload {...defaultProps} onError={onError} />);
		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;

		const pdfFile = new File(["test"], "document.pdf", {
			type: "application/pdf",
		});
		Object.defineProperty(input, "files", { value: [pdfFile] });
		fireEvent.change(input);

		expect(onError).toHaveBeenCalledWith("invalid-type");
	});

	it("calls onError for files over size limit", () => {
		const onError = vi.fn();
		render(<CsvUpload {...defaultProps} onError={onError} maxSizeMB={1} />);
		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;

		const largeFile = new File(["test"], "guests.csv", { type: "text/csv" });
		Object.defineProperty(largeFile, "size", { value: 2 * 1024 * 1024 }); // 2MB
		Object.defineProperty(input, "files", { value: [largeFile] });
		fireEvent.change(input);

		expect(onError).toHaveBeenCalledWith("too-large");
	});

	it("calls onFileSelect with file content for valid CSV", async () => {
		const onFileSelect = vi.fn();
		render(<CsvUpload {...defaultProps} onFileSelect={onFileSelect} />);
		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;

		const csvContent = "name,group\nJohn Doe,Family";
		const csvFile = new File([csvContent], "guests.csv", { type: "text/csv" });
		Object.defineProperty(input, "files", { value: [csvFile] });
		fireEvent.change(input);

		// Wait for FileReader to finish
		await vi.waitFor(() => {
			expect(onFileSelect).toHaveBeenCalledWith(csvFile, csvContent);
		});
	});

	it("shows custom max size in hint", () => {
		render(<CsvUpload {...defaultProps} maxSizeMB={2} />);
		expect(screen.getByText(/max 2mb/i)).toBeDefined();
	});
});
