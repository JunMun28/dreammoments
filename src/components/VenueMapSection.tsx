import { MapPin, Search } from "lucide-react";
import { useCallback, useState } from "react";
import { useInvitationBuilder } from "@/contexts/InvitationBuilderContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { VenueMap } from "./VenueMap";

/**
 * Geocode an address using Nominatim (OpenStreetMap)
 * Free API, no key required
 */
async function geocodeAddress(
	address: string,
): Promise<{ lat: number; lon: number } | null> {
	try {
		const encodedAddress = encodeURIComponent(address);
		const response = await fetch(
			`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
			{
				headers: {
					"User-Agent": "DreamMoments-Wedding-App/1.0",
				},
			},
		);

		if (!response.ok) {
			throw new Error("Geocoding request failed");
		}

		const results = await response.json();
		if (results.length > 0) {
			return {
				lat: Number.parseFloat(results[0].lat),
				lon: Number.parseFloat(results[0].lon),
			};
		}
		return null;
	} catch (error) {
		console.error("Geocoding error:", error);
		return null;
	}
}

/**
 * Venue map section for the invitation builder.
 * Allows setting venue coordinates via geocoding or manual entry.
 */
export function VenueMapSection() {
	const { invitation, updateInvitation } = useInvitationBuilder();
	const [isGeocoding, setIsGeocoding] = useState(false);
	const [geocodeError, setGeocodeError] = useState<string | null>(null);
	const [manualLat, setManualLat] = useState(invitation.venueLatitude || "");
	const [manualLon, setManualLon] = useState(invitation.venueLongitude || "");

	const handleGeocode = useCallback(async () => {
		const address = [invitation.venueName, invitation.venueAddress]
			.filter(Boolean)
			.join(", ");

		if (!address) {
			setGeocodeError("Please enter a venue name or address first.");
			return;
		}

		setIsGeocoding(true);
		setGeocodeError(null);

		const result = await geocodeAddress(address);

		if (result) {
			updateInvitation({
				venueLatitude: result.lat.toString(),
				venueLongitude: result.lon.toString(),
			});
			setManualLat(result.lat.toString());
			setManualLon(result.lon.toString());
		} else {
			setGeocodeError(
				"Could not find coordinates for this address. Try entering them manually.",
			);
		}

		setIsGeocoding(false);
	}, [invitation.venueName, invitation.venueAddress, updateInvitation]);

	const handleManualUpdate = useCallback(() => {
		const lat = Number.parseFloat(manualLat);
		const lon = Number.parseFloat(manualLon);

		if (Number.isNaN(lat) || Number.isNaN(lon)) {
			setGeocodeError("Please enter valid latitude and longitude values.");
			return;
		}

		if (lat < -90 || lat > 90) {
			setGeocodeError("Latitude must be between -90 and 90.");
			return;
		}

		if (lon < -180 || lon > 180) {
			setGeocodeError("Longitude must be between -180 and 180.");
			return;
		}

		setGeocodeError(null);
		updateInvitation({
			venueLatitude: lat.toString(),
			venueLongitude: lon.toString(),
		});
	}, [manualLat, manualLon, updateInvitation]);

	const handleClearLocation = useCallback(() => {
		updateInvitation({
			venueLatitude: undefined,
			venueLongitude: undefined,
		});
		setManualLat("");
		setManualLon("");
		setGeocodeError(null);
	}, [updateInvitation]);

	const hasVenueInfo = invitation.venueName || invitation.venueAddress;
	const hasCoordinates = invitation.venueLatitude && invitation.venueLongitude;

	return (
		<div className="space-y-4">
			{/* Map preview */}
			<div className="overflow-hidden rounded-lg border">
				<VenueMap
					latitude={
						invitation.venueLatitude
							? Number.parseFloat(invitation.venueLatitude)
							: undefined
					}
					longitude={
						invitation.venueLongitude
							? Number.parseFloat(invitation.venueLongitude)
							: undefined
					}
					venueName={invitation.venueName}
					height="200px"
				/>
			</div>

			{/* Geocoding button */}
			<div className="flex flex-col gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={handleGeocode}
					disabled={isGeocoding || !hasVenueInfo}
					className="w-full"
				>
					{isGeocoding ? (
						<>
							<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
							Finding location...
						</>
					) : (
						<>
							<Search className="mr-2 h-4 w-4" />
							Find Location from Venue Address
						</>
					)}
				</Button>
				{!hasVenueInfo && (
					<p className="text-xs text-muted-foreground">
						Enter a venue name or address in Basic Information first.
					</p>
				)}
			</div>

			{/* Manual coordinates */}
			<div className="space-y-3 rounded-lg border p-4">
				<div className="flex items-center gap-2">
					<MapPin className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm font-medium">Manual Coordinates</span>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1.5">
						<Label htmlFor="latitude" className="text-xs">
							Latitude
						</Label>
						{/* biome-ignore lint/correctness/useUniqueElementIds: Form field ID for label association */}
						<Input
							id="latitude"
							type="number"
							step="any"
							placeholder="-90 to 90"
							value={manualLat}
							onChange={(e) => setManualLat(e.target.value)}
							className="text-sm"
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="longitude" className="text-xs">
							Longitude
						</Label>
						{/* biome-ignore lint/correctness/useUniqueElementIds: Form field ID for label association */}
						<Input
							id="longitude"
							type="number"
							step="any"
							placeholder="-180 to 180"
							value={manualLon}
							onChange={(e) => setManualLon(e.target.value)}
							className="text-sm"
						/>
					</div>
				</div>

				<div className="flex gap-2">
					<Button
						type="button"
						variant="secondary"
						size="sm"
						onClick={handleManualUpdate}
						disabled={!manualLat || !manualLon}
					>
						Update Location
					</Button>
					{hasCoordinates && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleClearLocation}
						>
							Clear
						</Button>
					)}
				</div>
			</div>

			{/* Error message */}
			{geocodeError && (
				<p className="text-sm text-destructive" role="alert">
					{geocodeError}
				</p>
			)}

			{/* Help text */}
			<p className="text-xs text-muted-foreground">
				Tip: You can find coordinates from Google Maps by right-clicking on a
				location and selecting "What's here?"
			</p>
		</div>
	);
}
