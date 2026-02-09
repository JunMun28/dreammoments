import type { ComponentType } from "react";
import BlushRomanceInvitation from "./blush-romance/BlushRomanceInvitation";
import EternalEleganceInvitation from "./eternal-elegance/EternalEleganceInvitation";
import GardenRomanceInvitation from "./garden-romance/GardenRomanceInvitation";
import LoveAtDuskInvitation from "./love-at-dusk/LoveAtDuskInvitation";
import type { TemplateInvitationProps } from "./types";

const templateComponents: Record<
	string,
	ComponentType<TemplateInvitationProps>
> = {
	"garden-romance": GardenRomanceInvitation,
	"eternal-elegance": EternalEleganceInvitation,
	"blush-romance": BlushRomanceInvitation,
	"love-at-dusk": LoveAtDuskInvitation,
};

export default function InvitationRenderer({
	templateId,
	...props
}: TemplateInvitationProps & { templateId: string }) {
	const Template = templateComponents[templateId] ?? LoveAtDuskInvitation;
	return <Template {...props} />;
}
