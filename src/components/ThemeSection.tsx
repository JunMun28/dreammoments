import { useCallback } from "react";
import { useInvitationBuilder } from "@/contexts/InvitationBuilderContext";
import { ColorPicker } from "./ui/color-picker";
import { FontPicker } from "./ui/font-picker";

/**
 * Theme customization section for the invitation builder.
 * Includes accent color picker and font selection.
 */
export function ThemeSection() {
	const { invitation, updateInvitation } = useInvitationBuilder();

	const handleColorChange = useCallback(
		(color: string) => {
			updateInvitation({ accentColor: color || undefined });
		},
		[updateInvitation],
	);

	const handleFontChange = useCallback(
		(fontPairingId: string) => {
			updateInvitation({ fontPairing: fontPairingId || undefined });
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
			<FontPicker
				label="Font Style"
				value={invitation.fontPairing}
				onChange={handleFontChange}
			/>
		</div>
	);
}
