export const AUTH_ACCESS_COOKIE = "dm-auth-token";
export const AUTH_REFRESH_COOKIE = "dm-refresh-token";

const ONE_DAY_SECONDS = 24 * 60 * 60;

function isProduction() {
	return process.env.NODE_ENV === "production";
}

export function getAccessCookieOptions() {
	return {
		httpOnly: true,
		secure: isProduction(),
		sameSite: "lax" as const,
		path: "/",
		maxAge: 60 * 60, // 1 hour
	};
}

export function getRefreshCookieOptions() {
	return {
		httpOnly: true,
		secure: isProduction(),
		sameSite: "strict" as const,
		path: "/",
		maxAge: 7 * ONE_DAY_SECONDS, // 7 days
	};
}

export function getClearedCookieOptions() {
	return {
		httpOnly: true,
		secure: isProduction(),
		sameSite: "lax" as const,
		path: "/",
		maxAge: 0,
	};
}
