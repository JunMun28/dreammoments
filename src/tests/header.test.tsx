import type { AnchorHTMLAttributes, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import Header from "../components/Header";
import { AuthProvider } from "../lib/auth";

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		...props
	}: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) => (
		<a {...props}>{children}</a>
	),
	useNavigate: () => vi.fn(),
}));

describe("header", () => {
	test("nav links align vertically with buttons", () => {
		const markup = renderToString(
			<AuthProvider>
				<Header />
			</AuthProvider>,
		);
		expect(markup).toContain(
			"dm-nav-link inline-flex items-center min-h-[44px]",
		);
		expect(markup).toContain(
			"rounded-full inline-flex items-center justify-center",
		);
		expect(markup).toContain("Start Free Trial");
	});
});
