// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BasicInfoForm, type BasicInfoFormValues } from "./BasicInfoForm";

describe("BasicInfoForm", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders partner name inputs", () => {
		render(<BasicInfoForm onSubmit={vi.fn()} />);

		expect(screen.getByLabelText(/partner 1/i)).toBeDefined();
		expect(screen.getByLabelText(/partner 2/i)).toBeDefined();
	});

	it("accepts initial values", () => {
		const initialValues: BasicInfoFormValues = {
			partner1Name: "Alice",
			partner2Name: "Bob",
		};

		render(<BasicInfoForm onSubmit={vi.fn()} initialValues={initialValues} />);

		const partner1Input = screen.getByLabelText(
			/partner 1/i,
		) as HTMLInputElement;
		const partner2Input = screen.getByLabelText(
			/partner 2/i,
		) as HTMLInputElement;

		expect(partner1Input.value).toBe("Alice");
		expect(partner2Input.value).toBe("Bob");
	});

	it("calls onSubmit with form values when submitted", async () => {
		const user = userEvent.setup();
		const handleSubmit = vi.fn();

		render(<BasicInfoForm onSubmit={handleSubmit} />);

		await user.type(screen.getByLabelText(/partner 1/i), "Alice");
		await user.type(screen.getByLabelText(/partner 2/i), "Bob");
		await user.click(screen.getByRole("button", { name: /save/i }));

		await waitFor(() => {
			expect(handleSubmit).toHaveBeenCalledWith({
				partner1Name: "Alice",
				partner2Name: "Bob",
			});
		});
	});

	it("calls onChange when field values change", async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();

		render(<BasicInfoForm onSubmit={vi.fn()} onChange={handleChange} />);

		await user.type(screen.getByLabelText(/partner 1/i), "A");

		await waitFor(() => {
			expect(handleChange).toHaveBeenCalled();
		});
	});

	it("disables submit button while submitting", async () => {
		const user = userEvent.setup();
		// Create a promise that won't resolve immediately
		let resolveSubmit: (() => void) | undefined;
		const submitPromise = new Promise<void>((resolve) => {
			resolveSubmit = resolve;
		});
		const handleSubmit = vi.fn(() => submitPromise);

		render(<BasicInfoForm onSubmit={handleSubmit} />);

		await user.type(screen.getByLabelText(/partner 1/i), "Alice");
		await user.type(screen.getByLabelText(/partner 2/i), "Bob");

		const submitButton = screen.getByRole("button", {
			name: /save/i,
		}) as HTMLButtonElement;
		await user.click(submitButton);

		// Button should be disabled during submission
		await waitFor(() => {
			expect(submitButton.disabled).toBe(true);
		});

		// Resolve the submission
		resolveSubmit?.();

		// Button should be re-enabled after submission
		await waitFor(() => {
			expect(submitButton.disabled).toBe(false);
		});
	});
});
