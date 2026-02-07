import { ListFieldItem } from "./ListFieldItem";
import { listFieldMap } from "./listFieldMap";

type ListFieldEditorProps = {
	sectionId: string;
	items: Array<Record<string, unknown>>;
	onItemsChange: (items: Array<Record<string, unknown>>) => void;
};

export function ListFieldEditor({
	sectionId,
	items,
	onItemsChange,
}: ListFieldEditorProps) {
	const listConfig = listFieldMap[sectionId];
	if (!listConfig) return null;

	const handleChange = (index: number, key: string, value: string) => {
		const nextItems = items.map((currentItem, itemIndex) =>
			itemIndex === index ? { ...currentItem, [key]: value } : currentItem,
		);
		onItemsChange(nextItems);
	};

	const handleRemove = (index: number) => {
		onItemsChange(items.filter((_, i) => i !== index));
	};

	const handleAdd = () => {
		onItemsChange([
			...items,
			Object.fromEntries(listConfig.fields.map((field) => [field.key, ""])),
		]);
	};

	return (
		<div className="space-y-4">
			<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
				{listConfig.label}
			</p>
			{items.map((item, index) => (
				<ListFieldItem
					// biome-ignore lint/suspicious/noArrayIndexKey: list items lack stable IDs
					key={`${sectionId}-${index}`}
					sectionId={sectionId}
					item={item}
					index={index}
					fields={listConfig.fields}
					onChange={handleChange}
					onRemove={handleRemove}
				/>
			))}
			<button
				type="button"
				className="min-h-11 rounded-full border border-[color:var(--dm-accent-strong)]/40 px-4 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)] active:bg-[color:var(--dm-surface-muted)]"
				onClick={handleAdd}
			>
				Add Item
			</button>
		</div>
	);
}

export default ListFieldEditor;
