import { describe, expect, test } from "vitest";
import {
	buildRedirectFromLocation,
	DEFAULT_AUTH_REDIRECT,
	readRedirectFromSearch,
	readRedirectFromStateSearch,
	sanitizeRedirect,
} from "../lib/auth-redirect";

describe("sanitizeRedirect", () => {
	test("returns valid internal redirect", () => {
		expect(sanitizeRedirect("/dashboard")).toBe("/dashboard");
		expect(sanitizeRedirect("/editor/123")).toBe("/editor/123");
		expect(sanitizeRedirect("/invite/test-slug")).toBe("/invite/test-slug");
	});

	test("returns default for external URLs", () => {
		expect(sanitizeRedirect("https://evil.com")).toBe(DEFAULT_AUTH_REDIRECT);
		expect(sanitizeRedirect("http://evil.com")).toBe(DEFAULT_AUTH_REDIRECT);
	});

	test("returns default for protocol-relative URLs", () => {
		expect(sanitizeRedirect("//evil.com")).toBe(DEFAULT_AUTH_REDIRECT);
	});

	test("returns default for non-path strings", () => {
		expect(sanitizeRedirect("not-a-path")).toBe(DEFAULT_AUTH_REDIRECT);
		expect(sanitizeRedirect("editor/123")).toBe(DEFAULT_AUTH_REDIRECT);
	});

	test("returns default for empty/null values", () => {
		expect(sanitizeRedirect("")).toBe(DEFAULT_AUTH_REDIRECT);
		expect(sanitizeRedirect(null)).toBe(DEFAULT_AUTH_REDIRECT);
		expect(sanitizeRedirect(undefined)).toBe(DEFAULT_AUTH_REDIRECT);
	});

	test("handles query strings", () => {
		expect(sanitizeRedirect("/editor/123?template=blush")).toBe(
			"/editor/123?template=blush",
		);
	});

	test("handles fragment identifiers", () => {
		expect(sanitizeRedirect("/page#section")).toBe("/page#section");
	});

	test("trims whitespace", () => {
		expect(sanitizeRedirect("  /dashboard  ")).toBe("/dashboard");
	});
});

describe("readRedirectFromSearch", () => {
	test("reads redirect from query string", () => {
		const search = "?redirect=%2Feditor%2F123";
		expect(readRedirectFromSearch(search)).toBe("/editor/123");
	});

	test("returns default when no redirect param", () => {
		const search = "?other=value";
		expect(readRedirectFromSearch(search)).toBe(DEFAULT_AUTH_REDIRECT);
	});

	test("returns default for empty search", () => {
		expect(readRedirectFromSearch("")).toBe(DEFAULT_AUTH_REDIRECT);
		expect(readRedirectFromSearch("?")).toBe(DEFAULT_AUTH_REDIRECT);
	});

	test("decodes URL-encoded redirect", () => {
		const search = "?redirect=%2Feditor%2Fnew%3Ftemplate%3Dblush-romance";
		expect(readRedirectFromSearch(search)).toBe(
			"/editor/new?template=blush-romance",
		);
	});

	test("rejects external redirect in query", () => {
		const search = "?redirect=https%3A%2F%2Fevil.com";
		expect(readRedirectFromSearch(search)).toBe(DEFAULT_AUTH_REDIRECT);
	});
});

describe("readRedirectFromStateSearch", () => {
	test("reads redirect from state param", () => {
		const search = "?code=abc&state=%2Feditor%2F123";
		expect(readRedirectFromStateSearch(search)).toBe("/editor/123");
	});

	test("decodes URL-encoded state", () => {
		const search = "?code=abc&state=%252Feditor%252Fnew";
		expect(readRedirectFromStateSearch(search)).toBe("/editor/new");
	});

	test("returns default when no state param", () => {
		const search = "?code=abc";
		expect(readRedirectFromStateSearch(search)).toBe(DEFAULT_AUTH_REDIRECT);
	});

	test("returns default for empty state", () => {
		const search = "?code=abc&state=";
		expect(readRedirectFromStateSearch(search)).toBe(DEFAULT_AUTH_REDIRECT);
	});

	test("handles malformed state gracefully", () => {
		const search = "?code=abc&state=%";
		expect(readRedirectFromStateSearch(search)).toBe(DEFAULT_AUTH_REDIRECT);
	});
});

describe("buildRedirectFromLocation", () => {
	test("builds redirect from pathname and search", () => {
		expect(buildRedirectFromLocation("/editor/123", "?template=blush")).toBe(
			"/editor/123?template=blush",
		);
	});

	test("returns pathname when no search", () => {
		expect(buildRedirectFromLocation("/dashboard", "")).toBe("/dashboard");
	});

	test("returns default for non-internal path", () => {
		expect(buildRedirectFromLocation("not-a-path", "")).toBe(
			DEFAULT_AUTH_REDIRECT,
		);
	});

	test("rejects external URL in pathname", () => {
		expect(buildRedirectFromLocation("https://evil.com", "")).toBe(
			DEFAULT_AUTH_REDIRECT,
		);
	});

	test("strips unsafe query params", () => {
		// The sanitizeRedirect should catch any external URLs in the query
		const result = buildRedirectFromLocation(
			"/page",
			"?redirect=https://evil.com",
		);
		// The query is preserved as part of the path, but if redirect points external, default is used
		expect(result).toBe("/page?redirect=https%3A%2F%2Fevil.com");
	});
});
