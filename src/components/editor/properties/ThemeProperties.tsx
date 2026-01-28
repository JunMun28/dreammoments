import { ThemeSection } from "@/components/ThemeSection";

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
 * Theme properties panel.
 * Includes accent color picker and font selection.
 */
export function ThemeProperties() {
	return (
		<div className="flex h-full flex-col">
			<PanelHeader title="Theme" />

			<div className="flex-1 space-y-6 overflow-y-auto p-4">
				<p className="text-xs text-stone-500">
					Customize the look and feel of your invitation.
				</p>
				<ThemeSection />
			</div>
		</div>
	);
}
