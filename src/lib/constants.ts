export const PUBLIC_BASE_URL = "https://dreammoments.app";

export type DeviceType = "mobile" | "desktop" | "tablet";

export function detectDeviceType(userAgent: string): DeviceType {
	if (/ipad|tablet/i.test(userAgent)) return "tablet";
	if (/mobi|iphone|android/i.test(userAgent)) return "mobile";
	return "desktop";
}
