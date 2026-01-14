import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QrCodeDialog } from "./qr-code-dialog";

// Mock qrcode.react
vi.mock("qrcode.react", () => ({
	QRCodeSVG: ({ value, size }: { value: string; size: number }) => (
		<svg data-testid="qr-code-svg" data-value={value} data-size={size}>
			<title>QR Code</title>
		</svg>
	),
	QRCodeCanvas: ({
		value,
		size,
		id,
	}: {
		value: string;
		size: number;
		id: string;
	}) => (
		<canvas
			data-testid="qr-code-canvas"
			data-value={value}
			data-size={size}
			id={id}
		>
			QR Code
		</canvas>
	),
}));

describe("QrCodeDialog", () => {
	const defaultProps = {
		url: "https://example.com/rsvp#t=abc123",
		groupName: "Family",
	};

	it("renders trigger button with QR code icon", () => {
		render(<QrCodeDialog {...defaultProps} />);
		const button = screen.getByRole("button", { name: /qr code/i });
		expect(button).toBeDefined();
	});

	it("opens dialog when trigger is clicked", async () => {
		const user = userEvent.setup();
		render(<QrCodeDialog {...defaultProps} />);

		await user.click(screen.getByRole("button", { name: /qr code/i }));

		expect(screen.getByRole("dialog")).toBeDefined();
		expect(screen.getByText(/QR Code for Family/i)).toBeDefined();
	});

	it("displays QR code SVG in dialog", async () => {
		const user = userEvent.setup();
		render(<QrCodeDialog {...defaultProps} />);

		await user.click(screen.getByRole("button", { name: /qr code/i }));

		const qrCode = screen.getByTestId("qr-code-svg");
		expect(qrCode).toBeDefined();
		expect(qrCode.getAttribute("data-value")).toBe(defaultProps.url);
	});

	it("shows the RSVP URL below QR code", async () => {
		const user = userEvent.setup();
		render(<QrCodeDialog {...defaultProps} />);

		await user.click(screen.getByRole("button", { name: /qr code/i }));

		expect(screen.getByText(defaultProps.url)).toBeDefined();
	});

	it("has download PNG button", async () => {
		const user = userEvent.setup();
		render(<QrCodeDialog {...defaultProps} />);

		await user.click(screen.getByRole("button", { name: /qr code/i }));

		expect(screen.getByRole("button", { name: /download png/i })).toBeDefined();
	});

	it("has download SVG button", async () => {
		const user = userEvent.setup();
		render(<QrCodeDialog {...defaultProps} />);

		await user.click(screen.getByRole("button", { name: /qr code/i }));

		expect(screen.getByRole("button", { name: /download svg/i })).toBeDefined();
	});

	it("renders canvas element for PNG download", async () => {
		const user = userEvent.setup();
		render(<QrCodeDialog {...defaultProps} />);

		await user.click(screen.getByRole("button", { name: /qr code/i }));

		// Canvas should be hidden but present for download
		const canvas = screen.getByTestId("qr-code-canvas");
		expect(canvas).toBeDefined();
	});

	it("accepts custom trigger button via children", async () => {
		const user = userEvent.setup();
		render(
			<QrCodeDialog {...defaultProps}>
				<button type="button">Custom Trigger</button>
			</QrCodeDialog>,
		);

		expect(screen.getByText("Custom Trigger")).toBeDefined();
		await user.click(screen.getByText("Custom Trigger"));
		expect(screen.getByRole("dialog")).toBeDefined();
	});

	it("displays QR code with correct size", async () => {
		const user = userEvent.setup();
		render(<QrCodeDialog {...defaultProps} size={300} />);

		await user.click(screen.getByRole("button", { name: /qr code/i }));

		const qrCode = screen.getByTestId("qr-code-svg");
		expect(qrCode.getAttribute("data-size")).toBe("300");
	});

	it("uses default size of 256 when not specified", async () => {
		const user = userEvent.setup();
		render(<QrCodeDialog {...defaultProps} />);

		await user.click(screen.getByRole("button", { name: /qr code/i }));

		const qrCode = screen.getByTestId("qr-code-svg");
		expect(qrCode.getAttribute("data-size")).toBe("256");
	});
});
