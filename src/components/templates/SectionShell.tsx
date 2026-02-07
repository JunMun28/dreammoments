import type { CSSProperties, ReactNode } from "react";
import type { TemplateRenderMode } from "./types";

type SectionShellProps = {
	sectionId: string;
	mode?: TemplateRenderMode;
	hidden?: boolean;
	isActive?: boolean;
	onSelect?: (sectionId: string) => void;
	onAiClick?: (sectionId: string) => void;
	className?: string;
	style?: CSSProperties;
	children: ReactNode;
};

export default function SectionShell({
	sectionId,
	mode = "public",
	hidden,
	isActive,
	onSelect,
	onAiClick,
	className,
	style,
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
			<section
				data-section={sectionId}
				data-editor-active={isActive ? "true" : undefined}
				className={className}
				style={style}
			>
				{aiButton}
				{children}
			</section>
		);
	}

	return (
		// biome-ignore lint: editor preview uses a section as an interactive surface
		<div
			data-section={sectionId}
			data-editor-active={isActive ? "true" : undefined}
			className={className}
			style={style}
			role="button"
			tabIndex={0}
			onClick={() => onSelect?.(sectionId)}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onSelect?.(sectionId);
				}
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
