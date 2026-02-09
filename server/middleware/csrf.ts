import {
	defineEventHandler,
	getHeader,
	getMethod,
	getRequestURL,
	setResponseHeader,
} from "nitro/h3";
import { generateCsrfToken, validateCsrfToken } from "../../src/lib/csrf";

const MUTATING_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

/** Paths that skip CSRF validation (webhooks, public RSVP) */
const SKIP_PATHS = ["/api/webhooks", "/api/public/rsvp"];

export default defineEventHandler((event) => {
	const method = getMethod(event);
	const url = getRequestURL(event);
	const pathname = url.pathname;

	// On GET requests, generate and attach a CSRF token
	if (method === "GET") {
		const token = generateCsrfToken();
		setResponseHeader(event, "X-CSRF-Token", token);
		return;
	}

	// On mutating requests, validate the CSRF token
	if (MUTATING_METHODS.has(method)) {
		// Skip validation for whitelisted paths
		for (const skip of SKIP_PATHS) {
			if (pathname.startsWith(skip)) {
				return;
			}
		}

		const token = getHeader(event, "x-csrf-token");
		if (!validateCsrfToken(token)) {
			throw new Error("Invalid or missing CSRF token");
		}
	}
});
