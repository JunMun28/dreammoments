import { type ComponentType, lazy, Suspense } from "react";
import AudioPlayer from "./AudioPlayer";
import type { TemplateInvitationProps } from "./types";

const BlushRomanceInvitation = lazy(
	() => import("./blush-romance/BlushRomanceInvitation"),
);
const EternalEleganceInvitation = lazy(
	() => import("./eternal-elegance/EternalEleganceInvitation"),
);
const GardenRomanceInvitation = lazy(
	() => import("./garden-romance/GardenRomanceInvitation"),
);
const LoveAtDuskInvitation = lazy(
	() => import("./love-at-dusk/LoveAtDuskInvitation"),
);

const templateComponents: Record<
	string,
	ComponentType<TemplateInvitationProps>
> = {
	"garden-romance": GardenRomanceInvitation,
	"eternal-elegance": EternalEleganceInvitation,
	"blush-romance": BlushRomanceInvitation,
	"love-at-dusk": LoveAtDuskInvitation,
};

function TemplateSkeleton() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-[color:var(--dm-bg)]">
			<div className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--dm-peach)] border-t-transparent" />
		</div>
	);
}

export default function InvitationRenderer({
	templateId,
	...props
}: TemplateInvitationProps & { templateId: string }) {
	const Template = templateComponents[templateId] ?? LoveAtDuskInvitation;
	const musicUrl = props.content.musicUrl;
	return (
		<Suspense fallback={<TemplateSkeleton />}>
			<Template {...props} />
			{musicUrl ? <AudioPlayer src={musicUrl} /> : null}
		</Suspense>
	);
}
