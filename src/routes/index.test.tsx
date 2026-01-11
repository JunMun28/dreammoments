// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./index";

describe("Index Route", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders correctly", () => {
		render(<App />);
		expect(screen.getByText("TANSTACK")).toBeDefined();
		expect(screen.getByText("START")).toBeDefined();
		expect(screen.getByText("Powerful Server Functions")).toBeDefined();
	});
});
