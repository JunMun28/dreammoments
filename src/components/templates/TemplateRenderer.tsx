import type { TemplateConfig } from "../../templates/types";

type TemplateRendererProps = {
	template: TemplateConfig;
	className?: string;
};

export default function TemplateRenderer({
	template,
	className,
}: TemplateRendererProps) {
	return (
		<section className={className}>
			<div className="rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6">
				<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
					{template.nameZh}
				</p>
				<h2 className="mt-2 text-2xl font-semibold text-[color:var(--dm-ink)]">
					{template.name}
				</h2>
				<p className="mt-2 text-sm text-[color:var(--dm-muted)]">
					{template.description}
				</p>
				<div className="mt-6 grid gap-3">
					{template.sections.map((section) => (
						<div
							key={section.id}
							className="rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] p-4"
						>
							<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
								{section.type}
							</p>
							<p className="mt-2 text-sm text-[color:var(--dm-muted)]">
								{section.id}
							</p>
							{section.notes && (
								<p className="mt-2 text-xs text-[color:var(--dm-muted)]">
									{section.notes}
								</p>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
