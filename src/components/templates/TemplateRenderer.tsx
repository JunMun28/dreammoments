import type { TemplateConfig } from '../../templates/types'

type TemplateRendererProps = {
	template: TemplateConfig
	className?: string
}

export default function TemplateRenderer({
	template,
	className,
}: TemplateRendererProps) {
	return (
		<section className={className}>
			<div className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-6">
				<p className="text-xs uppercase tracking-[0.4em] text-[#d8b25a]">
					{template.nameZh}
				</p>
				<h2 className="mt-2 text-2xl font-semibold text-[#fdf6ea]">
					{template.name}
				</h2>
				<p className="mt-2 text-sm text-[#f7e8c4]/70">{template.description}</p>
				<div className="mt-6 grid gap-3">
					{template.sections.map((section) => (
						<div
							key={section.id}
							className="rounded-2xl border border-white/10 bg-[#14100d] p-4"
						>
							<p className="text-xs uppercase tracking-[0.3em] text-[#d8b25a]">
								{section.type}
							</p>
							<p className="mt-2 text-sm text-[#f7e8c4]/70">{section.id}</p>
							{section.notes && (
								<p className="mt-2 text-xs text-[#f7e8c4]/60">
									{section.notes}
								</p>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
