type ListFieldItemProps = {
	sectionId: string;
	item: Record<string, unknown>;
	index: number;
	fields: Array<{ key: string; label: string }>;
	onChange: (index: number, key: string, value: string) => void;
	onRemove: (index: number) => void;
};

export function ListFieldItem({
	sectionId,
	item,
	index,
	fields,
	onChange,
	onRemove,
}: ListFieldItemProps) {
	return (
		<div className="grid gap-3 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4 md:gap-2">
			{fields.map((field) => (
				<label
					key={field.key}
					className="grid gap-1.5 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]"
				>
					{field.label}
					<input
						name={`${sectionId}.${field.key}.${index}`}
						autoComplete="off"
						value={String(item[field.key] ?? "")}
						onChange={(event) => onChange(index, field.key, event.target.value)}
						className="min-h-11 rounded-xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-3 text-base text-[color:var(--dm-ink)]"
					/>
				</label>
			))}
			<button
				type="button"
				className="mt-2 min-h-11 rounded-full border border-[color:var(--dm-border)] px-4 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)] active:bg-[color:var(--dm-surface-muted)]"
				onClick={() => onRemove(index)}
			>
				Remove
			</button>
		</div>
	);
}
