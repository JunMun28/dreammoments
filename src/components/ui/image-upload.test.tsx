import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ImageUpload, validateImageFile } from "./image-upload";

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe("validateImageFile", () => {
	it("returns valid for JPG files under limit", () => {
		const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
		Object.defineProperty(file, "size", { value: 1024 * 1024 }); // 1MB
		const result = validateImageFile(file);
		expect(result.valid).toBe(true);
		expect(result.error).toBeUndefined();
	});

	it("returns valid for PNG files under limit", () => {
		const file = new File(["test"], "photo.png", { type: "image/png" });
		Object.defineProperty(file, "size", { value: 2 * 1024 * 1024 }); // 2MB
		const result = validateImageFile(file);
		expect(result.valid).toBe(true);
	});

	it("returns valid for WebP files under limit", () => {
		const file = new File(["test"], "photo.webp", { type: "image/webp" });
		Object.defineProperty(file, "size", { value: 3 * 1024 * 1024 }); // 3MB
		const result = validateImageFile(file);
		expect(result.valid).toBe(true);
	});

	it("returns error for unsupported file types", () => {
		const file = new File(["test"], "document.pdf", {
			type: "application/pdf",
		});
		const result = validateImageFile(file);
		expect(result.valid).toBe(false);
		expect(result.error).toBe("invalid-type");
	});

	it("returns error for files over size limit", () => {
		const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
		Object.defineProperty(file, "size", { value: 10 * 1024 * 1024 }); // 10MB
		const result = validateImageFile(file, 5); // 5MB limit
		expect(result.valid).toBe(false);
		expect(result.error).toBe("too-large");
	});

	it("uses custom size limit when provided", () => {
		const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
		Object.defineProperty(file, "size", { value: 6 * 1024 * 1024 }); // 6MB
		const result = validateImageFile(file, 8); // 8MB limit
		expect(result.valid).toBe(true);
	});
});

describe("ImageUpload component", () => {
	const defaultProps = {
		onUpload: vi.fn(),
		onError: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("renders drag-drop zone with instructions", () => {
		render(<ImageUpload {...defaultProps} />);
		expect(screen.getByText(/drag & drop your image here/i)).toBeDefined();
		expect(screen.getByText(/or click to browse/i)).toBeDefined();
	});

	it("renders accepted formats hint", () => {
		render(<ImageUpload {...defaultProps} />);
		expect(screen.getByText(/jpg, png, webp/i)).toBeDefined();
	});

	it("renders file input with correct accept attribute", () => {
		render(<ImageUpload {...defaultProps} />);
		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		expect(input).toBeDefined();
		expect(input.accept).toBe("image/jpeg,image/png,image/webp");
	});

	it("shows uploading state when uploading prop is true", () => {
		render(<ImageUpload {...defaultProps} uploading />);
		expect(screen.getByText(/uploading/i)).toBeDefined();
	});

	it("shows progress bar when progress is provided", () => {
		render(<ImageUpload {...defaultProps} uploading progress={50} />);
		const progressBar = document.querySelector('[role="progressbar"]');
		expect(progressBar).toBeDefined();
	});

	it("disables input when disabled prop is true", () => {
		render(<ImageUpload {...defaultProps} disabled />);
		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		expect(input.disabled).toBe(true);
	});

	it("shows current image when currentImageUrl is provided", () => {
		render(
			<ImageUpload
				{...defaultProps}
				currentImageUrl="https://example.com/image.jpg"
			/>,
		);
		const img = screen.getByRole("img");
		expect(img).toBeDefined();
		expect(img.getAttribute("src")).toBe("https://example.com/image.jpg");
	});

	it("shows replace button when current image exists", () => {
		render(
			<ImageUpload
				{...defaultProps}
				currentImageUrl="https://example.com/image.jpg"
			/>,
		);
		expect(screen.getByText(/replace image/i)).toBeDefined();
	});

	it("calls onRemove when remove button is clicked", () => {
		const onRemove = vi.fn();
		render(
			<ImageUpload
				{...defaultProps}
				currentImageUrl="https://example.com/image.jpg"
				onRemove={onRemove}
			/>,
		);
		const removeButton = screen.getByLabelText(/remove image/i);
		fireEvent.click(removeButton);
		expect(onRemove).toHaveBeenCalled();
	});

	it("applies drag-over styles during drag", () => {
		render(<ImageUpload {...defaultProps} />);
		const dropZone = screen.getByTestId("drop-zone");
		fireEvent.dragOver(dropZone);
		expect(dropZone.classList.contains("border-primary")).toBe(true);
	});
});
