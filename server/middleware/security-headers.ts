import { defineEventHandler, setResponseHeaders } from "nitro/h3";

export default defineEventHandler((event) => {
	setResponseHeaders(event, {
		"X-Frame-Options": "DENY",
		"X-Content-Type-Options": "nosniff",
		"Referrer-Policy": "strict-origin-when-cross-origin",
		"Permissions-Policy": "camera=(), microphone=(), geolocation=()",
	});
});
