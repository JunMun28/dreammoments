import { Monitor, Smartphone } from "lucide-react";

export type PreviewLayout = "web" | "mobile";

type LayoutToggleProps = {
	layout: PreviewLayout;
	onChange: (layout: PreviewLayout) => void;
};

export function LayoutToggle({ layout, onChange }: LayoutToggleProps) {
	return (
		<fieldset className="border-0 p-0 m-0 min-w-0">
			<legend className="sr-only">Preview layout</legend>
			<div className="inline-flex items-center rounded-full border border-dm-border bg-dm-surface p-1 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
				{(["web", "mobile"] as const).map((mode) => (
					<button
						key={mode}
						type="button"
						onClick={() => onChange(mode)}
						aria-pressed={layout === mode}
						className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium tracking-wide uppercase transition-all duration-300 ${
							layout === mode
								? "bg-dm-ink text-white shadow-sm"
								: "text-dm-muted hover:text-dm-ink"
						}`}
					>
						{mode === "web" ? (
							<Monitor aria-hidden="true" className="h-3.5 w-3.5" />
						) : (
							<Smartphone aria-hidden="true" className="h-3.5 w-3.5" />
						)}
						{mode === "web" ? "Web" : "Mobile"}
					</button>
				))}
			</div>
		</fieldset>
	);
}
