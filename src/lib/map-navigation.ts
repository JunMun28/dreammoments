/**
 * Map navigation utilities for deep linking to map apps
 * Supports Google Maps, Apple Maps, and Waze (popular in SG/MY)
 */

export interface MapLocation {
	latitude: number;
	longitude: number;
	address?: string;
	name?: string;
}

/**
 * Detect if the user is on iOS
 */
function isIOS(): boolean {
	return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Detect if the user is on Android
 */
function isAndroid(): boolean {
	return /Android/.test(navigator.userAgent);
}

/**
 * Generate Google Maps URL
 */
export function getGoogleMapsUrl(location: MapLocation): string {
	const { latitude, longitude, name, address } = location;
	const query = name || address || `${latitude},${longitude}`;

	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Generate Google Maps directions URL
 */
export function getGoogleMapsDirectionsUrl(location: MapLocation): string {
	const { latitude, longitude, name, address } = location;
	const destination = name || address || `${latitude},${longitude}`;

	return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

/**
 * Generate Apple Maps URL
 */
export function getAppleMapsUrl(location: MapLocation): string {
	const { latitude, longitude, name, address } = location;
	const params = new URLSearchParams({
		ll: `${latitude},${longitude}`,
		q: name || address || "Venue",
	});

	return `https://maps.apple.com/?${params.toString()}`;
}

/**
 * Generate Apple Maps directions URL
 */
export function getAppleMapsDirectionsUrl(location: MapLocation): string {
	const { latitude, longitude, name } = location;
	const params = new URLSearchParams({
		daddr: `${latitude},${longitude}`,
		dirflg: "d", // Driving directions
	});

	if (name) params.set("q", name);

	return `https://maps.apple.com/?${params.toString()}`;
}

/**
 * Generate Waze URL
 */
export function getWazeUrl(location: MapLocation): string {
	const { latitude, longitude } = location;

	return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
}

/**
 * Open map app with directions
 * Returns the best URL based on platform
 */
export function getDirectionsUrl(location: MapLocation): string {
	// On iOS, prefer Apple Maps
	if (isIOS()) {
		return getAppleMapsDirectionsUrl(location);
	}

	// On Android, prefer Google Maps
	if (isAndroid()) {
		return getGoogleMapsDirectionsUrl(location);
	}

	// Default to Google Maps on desktop
	return getGoogleMapsDirectionsUrl(location);
}

/**
 * Get all available map options
 */
export function getMapOptions(location: MapLocation): Array<{
	name: string;
	url: string;
	icon: string;
}> {
	const options = [
		{
			name: "Google Maps",
			url: getGoogleMapsDirectionsUrl(location),
			icon: "google",
		},
		{
			name: "Waze",
			url: getWazeUrl(location),
			icon: "waze",
		},
	];

	// Add Apple Maps option on iOS or if we think they have a Mac
	if (isIOS() || navigator.platform.includes("Mac")) {
		options.splice(1, 0, {
			name: "Apple Maps",
			url: getAppleMapsDirectionsUrl(location),
			icon: "apple",
		});
	}

	return options;
}

/**
 * Generate a tel: URL for phone dialing
 */
export function getTelUrl(phone: string): string {
	// Remove all non-numeric characters except + for international prefix
	const cleaned = phone.replace(/[^\d+]/g, "");
	return `tel:${cleaned}`;
}

/**
 * Format phone number for display
 */
export function formatPhoneDisplay(phone: string): string {
	// Simple formatting for SG/MY numbers
	const cleaned = phone.replace(/[^\d+]/g, "");

	if (cleaned.startsWith("+65")) {
		// Singapore format: +65 9XXX XXXX
		return cleaned.replace(/(\+65)(\d{4})(\d{4})/, "$1 $2 $3");
	}

	if (cleaned.startsWith("+60")) {
		// Malaysia format: +60 1X-XXX XXXX
		return cleaned.replace(/(\+60)(\d{2})(\d{3})(\d{4})/, "$1 $2-$3 $4");
	}

	return phone;
}
