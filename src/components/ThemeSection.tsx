import { useCallback } from "react";
import { useInvitationBuilder } from "@/contexts/InvitationBuilderContext";
import { ColorPicker } from "./ui/color-picker";

/**
 * Theme customization section for the invitation builder.
 * Includes accent color picker.
 */
export function ThemeSection() {
	const { invitation, updateInvitation } = useInvitationBuilder();

	const handleColorChange = useCallback(
		(color: string) => {
			updateInvitation({ accentColor: color || undefined });
		},
		[updateInvitation],
	);

	return (
		<div className="space-y-6">
			<ColorPicker
				label="Accent Color"
				value={invitation.accentColor}
				onChange={handleColorChange}
			/>
		</div>
	);
}
