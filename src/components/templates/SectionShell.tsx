import type { ReactNode } from "react";
import type { TemplateRenderMode } from "./types";

type SectionShellProps = {
	sectionId: string;
	mode?: TemplateRenderMode;
	hidden?: boolean;
	onSelect?: (sectionId: string) => void;
	onAiClick?: (sectionId: string) => void;
	className?: string;
	children: ReactNode;
};

export default function SectionShell({
	sectionId,
	mode = "public",
	hidden,
	onSelect,
	onAiClick,
	className,
	children,
}: SectionShellProps) {
	if (hidden) return null;

	const isEditor = mode === "editor";
	const interactive = isEditor && Boolean(onSelect);

	const aiButton = isEditor ? (
		<button
			type="button"
			aria-label={`Open AI for ${sectionId}`}
			className="dm-ai-button"
			onClick={(event) => {
				event.stopPropagation();
				onAiClick?.(sectionId);
			}}
		>
			AI
		</button>
	) : null;

	if (!interactive) {
		return (
			<section data-section={sectionId} className={className}>
				{aiButton}
				{children}
			</section>
		);
	}

	return (
		// biome-ignore lint: editor preview uses a section as an interactive surface
		<div
			data-section={sectionId}
			className={className}
			role="button"
			tabIndex={0}
			onClick={() => onSelect?.(sectionId)}
			onKeyDown={(event) => {
				if (event.key === "Enter") onSelect?.(sectionId);
			}}
			onFocus={(event) => {
				event.currentTarget.scrollIntoView({ block: "nearest" });
			}}
		>
			{aiButton}
			{children}
		</div>
	);
}
