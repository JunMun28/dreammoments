import { ScheduleBlockList } from "@/components/ScheduleBlockList";

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
 * Schedule properties panel.
 * Allows managing wedding day timeline events.
 */
export function ScheduleProperties() {
	return (
		<div className="flex h-full flex-col">
			<PanelHeader title="Schedule" />

			<div className="flex-1 overflow-y-auto p-4">
				<p className="mb-4 text-xs text-stone-500">
					Add events to create a timeline for your wedding day.
				</p>
				<ScheduleBlockList />
			</div>
		</div>
	);
}
