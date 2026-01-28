import { NoteList } from "@/components/NoteList";

/**
 * Properties panel header component
 */
function PanelHeader({ title }: { title: string }) {
	return (
		<div className="border-b bg-stone-50 px-4 py-3">
			<h3 className="font-semibold text-stone-800">{title}</h3>
		</div>
	);
}

/**
 * Notes properties panel.
 * Allows adding notes, FAQs, and important details.
 */
export function NotesProperties() {
	return (
		<div className="flex h-full flex-col">
			<PanelHeader title="Notes & Details" />

			<div className="flex-1 overflow-y-auto p-4">
				<p className="mb-4 text-xs text-stone-500">
					Add notes for dress code, dietary info, or other important details.
				</p>
				<NoteList />
			</div>
		</div>
	);
}
