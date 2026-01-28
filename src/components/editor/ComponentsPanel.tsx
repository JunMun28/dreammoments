import {
  Calendar,
  CheckSquare,
  ChevronDown,
  Circle,
  Clock,
  FileText,
  Folder,
  Image,
  Loader2,
  MapPin,
  Package,
  Puzzle,
  Send,
  Square,
  TextCursor,
  Trash2,
  Type,
} from "lucide-react";
import { useCallback, useState } from "react";
import type { ElementType, SavedElementData } from "@/lib/collection-server";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

/**
 * CE-007: Widget definition for adding components to canvas
 */
export interface WidgetDefinition {
  id: string;
  type:
    | "countdown"
    | "map"
    | "rsvp"
    | "gallery"
    | "schedule"
    | "radio"
    | "checkbox"
    | "dropdown"
    | "input"
    | "submit";
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
    id: "radio-button",
    type: "radio",
    name: "Radio Button",
    description: "Single choice selection from options",
    category: "forms",
    defaultWidth: 200,
    defaultHeight: 120,
  },
  {
    id: "checkbox",
    type: "checkbox",
    name: "Checkbox",
    description: "Multiple choice selection from options",
    category: "forms",
    defaultWidth: 200,
    defaultHeight: 120,
  },
  {
    id: "dropdown",
    type: "dropdown",
    name: "Dropdown",
    description: "Select from a list of options",
    category: "forms",
    defaultWidth: 200,
    defaultHeight: 40,
  },
  {
    id: "text-input",
    type: "input",
    name: "Text Input",
    description: "Single line text input field",
    category: "forms",
    defaultWidth: 200,
    defaultHeight: 40,
  },
  {
    id: "submit-button",
    type: "submit",
    name: "Submit Button",
    description: "Submit form data button",
    category: "forms",
    defaultWidth: 120,
    defaultHeight: 40,
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
    case "radio":
      return Circle;
    case "checkbox":
      return CheckSquare;
    case "dropdown":
      return ChevronDown;
    case "input":
      return TextCursor;
    case "submit":
      return Send;
    default:
      return Puzzle;
  }
}

/**
 * Get icon for element type
 */
function getElementIcon(type: ElementType) {
  switch (type) {
    case "text":
      return Type;
    case "image":
      return Image;
    case "shape":
      return Square;
    case "group":
      return Package;
    default:
      return Puzzle;
  }
}

type PanelTab = "widgets" | "collection";

interface ComponentsPanelProps {
  /** Callback when a widget is selected to be added to canvas */
  onAddWidget: (widget: WidgetDefinition) => void;
  /** Callback when a saved element is selected to be added to canvas */
  onAddSavedElement?: (element: SavedElementData) => void;
  /** Saved elements from the user's collection */
  savedElements?: SavedElementData[];
  /** Callback to delete a saved element */
  onDeleteSavedElement?: (id: string) => Promise<void>;
  /** Whether the collection is loading */
  isLoadingCollection?: boolean;
}

/**
 * CE-007: Panel showing categorized wedding widgets and personal collection.
 * Clicking a widget or saved element adds it to the canvas.
 */
export function ComponentsPanel({
  onAddWidget,
  onAddSavedElement,
  savedElements = [],
  onDeleteSavedElement,
  isLoadingCollection = false,
}: ComponentsPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>("widgets");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteElement = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!onDeleteSavedElement) return;

      if (!window.confirm("Delete this saved element?")) return;

      setDeletingId(id);
      await onDeleteSavedElement(id);
      setDeletingId(null);
    },
    [onDeleteSavedElement],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Tab header */}
      <div className="flex gap-1 border-b border-stone-200 px-2 py-2">
        <button
          type="button"
          onClick={() => setActiveTab("widgets")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activeTab === "widgets"
              ? "bg-stone-900 text-white"
              : "text-stone-600 hover:bg-stone-100",
          )}
        >
          <Puzzle className="h-4 w-4" />
          Widgets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("collection")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activeTab === "collection"
              ? "bg-stone-900 text-white"
              : "text-stone-600 hover:bg-stone-100",
          )}
        >
          <Folder className="h-4 w-4" />
          My Collection
          {savedElements.length > 0 && (
            <span
              className={cn(
                "ml-1 rounded-full px-1.5 text-xs",
                activeTab === "collection"
                  ? "bg-white/20 text-white"
                  : "bg-stone-200 text-stone-600",
              )}
            >
              {savedElements.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Widgets tab */}
        {activeTab === "widgets" && (
          <div className="space-y-4">
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
        )}

        {/* Collection tab */}
        {activeTab === "collection" && (
          <div className="space-y-4">
            <p className="text-xs text-stone-500">
              Your saved elements. Click to add to canvas.
            </p>

            {isLoadingCollection ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
              </div>
            ) : savedElements.length === 0 ? (
              <div className="text-center py-8 text-stone-500">
                <Folder className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No saved elements yet</p>
                <p className="text-xs mt-1">
                  Select an element on the canvas and click "Save to Collection"
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedElements.map((element) => {
                  const Icon = getElementIcon(element.elementType);
                  const isDeleting = deletingId === element.id;

                  return (
                    <div
                      key={element.id}
                      className="group relative flex items-start gap-3 rounded-lg border border-stone-200 bg-white p-3 transition-colors hover:border-stone-300 hover:bg-stone-50"
                    >
                      {/* Thumbnail or icon */}
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-stone-100">
                        {element.thumbnailUrl ? (
                          <img
                            src={element.thumbnailUrl}
                            alt={element.name}
                            className="h-full w-full rounded-md object-cover"
                          />
                        ) : (
                          <Icon className="h-6 w-6 text-stone-400" />
                        )}
                      </div>

                      {/* Info */}
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => onAddSavedElement?.(element)}
                        disabled={isDeleting}
                      >
                        <div className="font-medium text-stone-700">
                          {element.name}
                        </div>
                        <div className="text-xs text-stone-500 capitalize">
                          {element.elementType}
                        </div>
                      </button>

                      {/* Delete button */}
                      {onDeleteSavedElement && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-stone-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-600"
                          onClick={(e) => handleDeleteElement(element.id, e)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
