export const DEFAULT_AUTH_REDIRECT = "/dashboard";

function isSafeInternalRedirect(value: string) {
	if (!value.startsWith("/")) return false;
	if (value.startsWith("//")) return false;
	if (/^https?:\/\//i.test(value)) return false;
	return true;
}

export function sanitizeRedirect(value?: string | null) {
	const raw = value?.trim() ?? "";
	if (!raw) return DEFAULT_AUTH_REDIRECT;
	if (!isSafeInternalRedirect(raw)) return DEFAULT_AUTH_REDIRECT;
	return raw;
}

export function readRedirectFromSearch(search: string) {
	const params = new URLSearchParams(search);
	return sanitizeRedirect(params.get("redirect"));
}

export function readRedirectFromStateSearch(search: string) {
	const params = new URLSearchParams(search);
	const state = params.get("state");
	if (!state) return DEFAULT_AUTH_REDIRECT;
	try {
		return sanitizeRedirect(decodeURIComponent(state));
	} catch {
		return sanitizeRedirect(state);
	}
}

export function buildRedirectFromLocation(pathname: string, search: string) {
	const path = sanitizeRedirect(pathname);
	const query = new URLSearchParams(search).toString();
	if (path === DEFAULT_AUTH_REDIRECT && pathname.trim() !== path) {
		return DEFAULT_AUTH_REDIRECT;
	}
	return sanitizeRedirect(query ? `${path}?${query}` : path);
}
