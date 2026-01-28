"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface VenueMapProps {
	/** Latitude of the venue */
	latitude?: number;
	/** Longitude of the venue */
	longitude?: number;
	/** Name of the venue for marker popup */
	venueName?: string;
	/** Height of the map container */
	height?: string;
	/** Whether to show in mobile mode */
	isMobile?: boolean;
	/** Accent color for styling */
	accentColor?: string;
}

/**
 * Venue map component using Leaflet.
 * Dynamically loads Leaflet to avoid SSR issues.
 */
export function VenueMap({
	latitude,
	longitude,
	venueName,
	height = "200px",
	isMobile = false,
}: VenueMapProps) {
	const [MapComponent, setMapComponent] = useState<React.ComponentType<{
		center: [number, number];
		zoom: number;
		className?: string;
		style?: React.CSSProperties;
		children?: React.ReactNode;
	}> | null>(null);
	const [TileLayerComponent, setTileLayerComponent] =
		useState<React.ComponentType<{
			attribution: string;
			url: string;
		}> | null>(null);
	const [MarkerComponent, setMarkerComponent] = useState<React.ComponentType<{
		position: [number, number];
		children?: React.ReactNode;
	}> | null>(null);
	const [PopupComponent, setPopupComponent] = useState<React.ComponentType<{
		children?: React.ReactNode;
	}> | null>(null);

	// Dynamically import Leaflet components to avoid SSR issues
	useEffect(() => {
		async function loadLeaflet() {
			try {
				// Import Leaflet CSS
				await import("leaflet/dist/leaflet.css");

				// Import react-leaflet components
				const { MapContainer, TileLayer, Marker, Popup } = await import(
					"react-leaflet"
				);

				// Fix for default marker icons in Leaflet with bundlers
				const L = await import("leaflet");
				delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })
					._getIconUrl;
				L.Icon.Default.mergeOptions({
					iconRetinaUrl:
						"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
					iconUrl:
						"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
					shadowUrl:
						"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
				});

				setMapComponent(() => MapContainer);
				setTileLayerComponent(() => TileLayer);
				setMarkerComponent(() => Marker);
				setPopupComponent(() => Popup);
			} catch (error) {
				console.error("Failed to load Leaflet:", error);
			}
		}

		loadLeaflet();
	}, []);

	// Don't render if coordinates are not available
	if (!latitude || !longitude) {
		return (
			<div
				className={cn(
					"flex items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground",
					isMobile ? "h-32" : "h-48",
				)}
			>
				No location set
			</div>
		);
	}

	// Show loading state while Leaflet is loading
	if (
		!MapComponent ||
		!TileLayerComponent ||
		!MarkerComponent ||
		!PopupComponent
	) {
		return (
			<div
				className={cn(
					"flex items-center justify-center rounded-lg bg-muted",
					isMobile ? "h-32" : "h-48",
				)}
			>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
					Loading map...
				</div>
			</div>
		);
	}

	const position: [number, number] = [latitude, longitude];

	return (
		<div className="overflow-hidden rounded-lg">
			<MapComponent
				center={position}
				zoom={15}
				style={{ height, width: "100%" }}
				className="z-0"
			>
				<TileLayerComponent
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<MarkerComponent position={position}>
					{venueName && (
						<PopupComponent>
							<span className="font-medium">{venueName}</span>
						</PopupComponent>
					)}
				</MarkerComponent>
			</MapComponent>
		</div>
	);
}
