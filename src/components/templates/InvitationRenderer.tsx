import { type ComponentType, lazy, Suspense, useEffect } from "react";
import AudioPlayer from "./AudioPlayer";
import type { TemplateInvitationProps } from "./types";

const templateImports: Record<
	string,
	() => Promise<{ default: ComponentType<TemplateInvitationProps> }>
> = {
	"blush-romance": () => import("./blush-romance/BlushRomanceInvitation"),
	"eternal-elegance": () =>
		import("./eternal-elegance/EternalEleganceInvitation"),
	"garden-romance": () => import("./garden-romance/GardenRomanceInvitation"),
	"love-at-dusk": () => import("./love-at-dusk/LoveAtDuskInvitation"),
	"double-happiness": () =>
		import("./double-happiness/DoubleHappinessInvitation"),
};

const templateComponents: Record<
	string,
	ComponentType<TemplateInvitationProps>
> = Object.fromEntries(
	Object.entries(templateImports).map(([id, loader]) => [id, lazy(loader)]),
);

const FallbackTemplate = templateComponents["love-at-dusk"];

export function preloadTemplate(templateId: string): void {
	templateImports[templateId]?.();
}

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
	const Template = templateComponents[templateId] ?? FallbackTemplate;
	const musicUrl = props.content?.musicUrl;

	useEffect(() => {
		preloadTemplate(templateId);
	}, [templateId]);

	return (
		<Suspense fallback={<TemplateSkeleton />}>
			<Template {...props} />
			{musicUrl && !props.hiddenSections?.music ? (
				<AudioPlayer src={musicUrl} />
			) : null}
		</Suspense>
	);
}
