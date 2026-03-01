import type { AnchorHTMLAttributes, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import Header from "../components/Header";

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		...props
	}: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) => (
		<a {...props}>{children}</a>
	),
	useNavigate: () => vi.fn(),
}));

vi.mock("@clerk/tanstack-react-start", () => ({
	useUser: () => ({ isSignedIn: false }),
	SignedIn: ({ children }: { children: ReactNode }) => null,
	SignedOut: ({ children }: { children: ReactNode }) => <>{children}</>,
	SignInButton: ({ children }: { children: ReactNode }) => <>{children}</>,
	UserButton: () => null,
}));

describe("header", () => {
	test("nav links align vertically with buttons", () => {
		const markup = renderToString(<Header />);
		expect(markup).toContain(
			"dm-nav-link inline-flex items-center min-h-[44px]",
		);
		expect(markup).toContain(
			"rounded-full inline-flex items-center justify-center",
		);
		expect(markup).toContain("Start Free Trial");
	});
});
