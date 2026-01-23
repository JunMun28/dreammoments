import { Calendar, Clock, FileText, Image, MapPin, Puzzle } from "lucide-react";

/**
 * CE-007: Widget definition for adding components to canvas
 */
export interface WidgetDefinition {
	id: string;
	type: "countdown" | "map" | "rsvp" | "gallery" | "schedule";
	name: string;
	description: string;
	category: "interactive" | "forms" | "media";
	defaultWidth: number;
	defaultHeight: number;
}

/**
 * Available wedding widgets (CE-007)
 */
const WIDGETS: WidgetDefinition[] = [
	{
		id: "countdown-timer",
		type: "countdown",
		name: "Countdown Timer",
		description: "Display countdown to your event date",
		category: "interactive",
		defaultWidth: 300,
		defaultHeight: 120,
	},
	{
		id: "venue-map",
		type: "map",
		name: "Venue Map",
		description: "Show your venue location on a map",
		category: "interactive",
		defaultWidth: 350,
		defaultHeight: 250,
	},
	{
		id: "schedule-timeline",
		type: "schedule",
		name: "Schedule Timeline",
		description: "Display event schedule and timeline",
		category: "interactive",
		defaultWidth: 300,
		defaultHeight: 200,
	},
	{
		id: "rsvp-form",
		type: "rsvp",
		name: "RSVP Form",
		description: "Collect guest responses and attendance",
		category: "forms",
		defaultWidth: 320,
		defaultHeight: 280,
	},
	{
		id: "photo-gallery",
		type: "gallery",
		name: "Photo Gallery",
		description: "Display photos in a carousel or grid",
		category: "media",
		defaultWidth: 350,
		defaultHeight: 300,
	},
];

/**
 * Group widgets by category
 */
const WIDGET_CATEGORIES: {
	name: string;
	category: WidgetDefinition["category"];
}[] = [
	{ name: "Interactive", category: "interactive" },
	{ name: "Forms", category: "forms" },
	{ name: "Media", category: "media" },
];

/**
 * Get icon component for widget type
 */
function getWidgetIcon(type: WidgetDefinition["type"]) {
	switch (type) {
		case "countdown":
			return Clock;
		case "map":
			return MapPin;
		case "schedule":
			return Calendar;
		case "rsvp":
			return FileText;
		case "gallery":
			return Image;
		default:
			return Puzzle;
	}
}

interface ComponentsPanelProps {
	/** Callback when a widget is selected to be added to canvas */
	onAddWidget: (widget: WidgetDefinition) => void;
}

/**
 * CE-007: Panel showing categorized wedding widgets for canvas editor.
 * Clicking a widget adds it to the canvas.
 */
export function ComponentsPanel({ onAddWidget }: ComponentsPanelProps) {
	return (
		<div className="space-y-4">
			<h3 className="font-medium text-stone-700">Components</h3>
			<p className="text-xs text-stone-500">
				Click or drag a component to add to canvas
			</p>

			{WIDGET_CATEGORIES.map((cat) => {
				const categoryWidgets = WIDGETS.filter(
					(w) => w.category === cat.category,
				);
				if (categoryWidgets.length === 0) return null;

				return (
					<div key={cat.category} className="space-y-2">
						<h4 className="text-xs font-semibold uppercase tracking-wide text-stone-400">
							{cat.name}
						</h4>
						<div className="space-y-1">
							{categoryWidgets.map((widget) => {
								const Icon = getWidgetIcon(widget.type);
								return (
									<button
										key={widget.id}
										type="button"
										className="flex w-full items-start gap-3 rounded-lg border border-stone-200 bg-white p-3 text-left transition-colors hover:border-stone-300 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
										onClick={() => onAddWidget(widget)}
										aria-label={widget.name}
									>
										<Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-500" />
										<div className="min-w-0 flex-1">
											<div className="font-medium text-stone-700">
												{widget.name}
											</div>
											<div className="text-xs text-stone-500">
												{widget.description}
											</div>
										</div>
									</button>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}
