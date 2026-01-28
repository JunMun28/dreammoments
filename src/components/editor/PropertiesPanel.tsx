import { useInvitationBuilder } from "@/contexts/InvitationBuilderContext";
import { BasicInfoProperties } from "./properties/BasicInfoProperties";
import { GuestsProperties } from "./properties/GuestsProperties";
import { ImageProperties } from "./properties/ImageProperties";
import { NotesProperties } from "./properties/NotesProperties";
import { RsvpProperties } from "./properties/RsvpProperties";
import { ScheduleProperties } from "./properties/ScheduleProperties";
import { SettingsProperties } from "./properties/SettingsProperties";
import { ThemeProperties } from "./properties/ThemeProperties";

/**
 * Context-sensitive properties panel.
 * Displays different property editors based on the active tool.
 */
export function PropertiesPanel() {
	const { editorState } = useInvitationBuilder();

	return (
		<div className="h-full">
			{editorState.activeTool === "info" && <BasicInfoProperties />}
			{editorState.activeTool === "images" && <ImageProperties />}
			{editorState.activeTool === "theme" && <ThemeProperties />}
			{editorState.activeTool === "schedule" && <ScheduleProperties />}
			{editorState.activeTool === "notes" && <NotesProperties />}
			{editorState.activeTool === "guests" && <GuestsProperties />}
			{editorState.activeTool === "rsvp" && <RsvpProperties />}
			{editorState.activeTool === "settings" && <SettingsProperties />}
		</div>
	);
}
