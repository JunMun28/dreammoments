import { Calendar, Clock, ExternalLink, MapPin, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WeddingEvent {
	id: string;
	nameEn: string;
	nameZh: string;
	date: string;
	lunarDate?: string;
	time: string;
	venue: string;
	address: string;
	dressCode?: string;
	googleMapsUrl?: string;
	wazeUrl?: string;
}

interface MultiEventCardsProps {
	events: WeddingEvent[];
	primaryColor?: string;
	accentColor?: string;
	className?: string;
}

export default function MultiEventCards({
	events,
	primaryColor = "var(--t-primary, #C8102E)",
	accentColor,
	className,
}: MultiEventCardsProps) {
	const borderColor = accentColor || primaryColor;

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			{events.map((event) => (
				<div
					key={event.id}
					data-reveal
					className="dm-reveal rounded-lg bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-6"
					style={{ borderLeft: `4px solid ${borderColor}` }}
				>
					{/* Event name */}
					<h3
						className="text-lg font-semibold sm:text-xl"
						style={{ color: primaryColor }}
						lang="en"
					>
						{event.nameEn}
					</h3>
					<p
						className="mt-0.5 text-sm opacity-70"
						style={{ color: primaryColor }}
						lang="zh-Hans"
					>
						{event.nameZh}
					</p>

					{/* Details */}
					<div className="mt-4 flex flex-col gap-3 text-sm text-gray-700">
						{/* Date & time */}
						<div className="flex items-start gap-2.5">
							<Calendar
								size={18}
								className="mt-0.5 shrink-0"
								style={{ color: primaryColor }}
								aria-hidden="true"
							/>
							<div>
								<span>{event.date}</span>
								{event.lunarDate && (
									<span className="ml-2 opacity-60" lang="zh-Hans">
										({event.lunarDate})
									</span>
								)}
							</div>
						</div>

						<div className="flex items-center gap-2.5">
							<Clock
								size={18}
								className="shrink-0"
								style={{ color: primaryColor }}
								aria-hidden="true"
							/>
							<span>{event.time}</span>
						</div>

						{/* Venue */}
						<div className="flex items-start gap-2.5">
							<MapPin
								size={18}
								className="mt-0.5 shrink-0"
								style={{ color: primaryColor }}
								aria-hidden="true"
							/>
							<div>
								<p className="font-medium">{event.venue}</p>
								<p className="mt-0.5 opacity-70">{event.address}</p>
							</div>
						</div>

						{/* Dress code */}
						{event.dressCode && (
							<div className="flex items-center gap-2.5">
								<Shirt
									size={18}
									className="shrink-0"
									style={{ color: primaryColor }}
									aria-hidden="true"
								/>
								<span>{event.dressCode}</span>
							</div>
						)}
					</div>

					{/* Map links */}
					{(event.googleMapsUrl || event.wazeUrl) && (
						<div className="mt-4 flex flex-wrap gap-3">
							{event.googleMapsUrl && (
								<a
									href={event.googleMapsUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
									style={{ backgroundColor: primaryColor }}
									aria-label={`Open ${event.venue} in Google Maps`}
								>
									Google Maps
									<ExternalLink size={14} aria-hidden="true" />
								</a>
							)}
							{event.wazeUrl && (
								<a
									href={event.wazeUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
									style={{ borderColor: primaryColor, color: primaryColor }}
									aria-label={`Open ${event.venue} in Waze`}
								>
									Waze
									<ExternalLink size={14} aria-hidden="true" />
								</a>
							)}
						</div>
					)}
				</div>
			))}
		</div>
	);
}
