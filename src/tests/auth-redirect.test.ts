import { describe, expect, test } from "vitest";
import {
	buildRedirectFromLocation,
	DEFAULT_AUTH_REDIRECT,
	readRedirectFromSearch,
	readRedirectFromStateSearch,
	sanitizeRedirect,
} from "../lib/auth-redirect";

describe("auth redirect", () => {
	test("keeps valid internal redirect", () => {
		expect(sanitizeRedirect("/editor/new?template=double-happiness")).toBe(
			"/editor/new?template=double-happiness",
		);
	});

	test("blocks external redirects", () => {
		expect(sanitizeRedirect("https://evil.example")).toBe(
			DEFAULT_AUTH_REDIRECT,
		);
		expect(sanitizeRedirect("//evil.example")).toBe(DEFAULT_AUTH_REDIRECT);
	});

	test("falls back for malformed or empty redirect", () => {
		expect(sanitizeRedirect("")).toBe(DEFAULT_AUTH_REDIRECT);
		expect(sanitizeRedirect("editor/new")).toBe(DEFAULT_AUTH_REDIRECT);
	});

	test("reads redirect query for login and signup", () => {
		expect(
			readRedirectFromSearch(
				"?redirect=%2Feditor%2Fnew%3Ftemplate%3Ddouble-happiness",
			),
		).toBe("/editor/new?template=double-happiness");
	});

	test("reads oauth state redirect for callback", () => {
		expect(
			readRedirectFromStateSearch(
				"?code=abc&state=%252Feditor%252Fnew%253Ftemplate%253Ddouble-happiness",
			),
		).toBe("/editor/new?template=double-happiness");
	});

	test("builds redirect from current editor path and search", () => {
		expect(
			buildRedirectFromLocation("/editor/new", "?template=double-happiness"),
		).toBe("/editor/new?template=double-happiness");
	});
});
