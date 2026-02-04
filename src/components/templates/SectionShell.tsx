import type { ReactNode } from 'react'
import type { TemplateRenderMode } from './types'

type SectionShellProps = {
	id: string
	mode?: TemplateRenderMode
	hidden?: boolean
	onSelect?: (sectionId: string) => void
	onAiClick?: (sectionId: string) => void
	className?: string
	children: ReactNode
}

export default function SectionShell({
	id,
	mode = 'public',
	hidden,
	onSelect,
	onAiClick,
	className,
	children,
}: SectionShellProps) {
	if (hidden) return null

	return (
		<section
			data-section={id}
			className={className}
			role={mode === 'editor' ? 'button' : undefined}
			tabIndex={mode === 'editor' ? 0 : -1}
		onClick={() => onSelect?.(id)}
		onKeyDown={(event) => {
			if (mode !== 'editor') return
			if (event.key === 'Enter') onSelect?.(id)
		}}
		onFocus={(event) => {
			if (mode !== 'editor') return
			event.currentTarget.scrollIntoView({ block: 'nearest' })
		}}
	>
			{mode === 'editor' && (
				<button
					type="button"
					aria-label={`Open AI for ${id}`}
					className="dm-ai-button"
					onClick={(event) => {
						event.stopPropagation()
						onAiClick?.(id)
					}}
				>
					AI
				</button>
			)}
			{children}
		</section>
	)
}
