import type { LucideIcon } from "lucide-react";
import {
	BookHeart,
	CalendarDays,
	ChevronDown,
	Clock,
	FileText,
	Gift,
	Heart,
	HelpCircle,
	Images,
	Mail,
	MapPin,
	MessageSquare,
	ScrollText,
	Timer,
	Users,
} from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "../../lib/utils";

type ProgressIndicatorProps = {
	sections: Array<{ id: string; label: string; completion: number }>;
	overallCompletion: number;
};

const sectionIconMap: Record<string, LucideIcon> = {
	hero: Heart,
	announcement: ScrollText,
	couple: Users,
	story: BookHeart,
	gallery: Images,
	schedule: Clock,
	venue: MapPin,
	entourage: Users,
	registry: Gift,
	rsvp: Mail,
	faq: HelpCircle,
	footer: MessageSquare,
	calendar: CalendarDays,
	countdown: Timer,
	details: FileText,
};

export function ProgressIndicator({
	sections,
	overallCompletion,
}: ProgressIndicatorProps) {
	const [expanded, setExpanded] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);

	const rounded = Math.round(overallCompletion);

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setExpanded((prev) => !prev)}
				aria-expanded={expanded}
				aria-label={`Completion: ${rounded}%. Click to see section breakdown`}
				className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--dm-border)] px-3 text-xs text-[color:var(--dm-ink)]"
			>
				{/* Mini progress bar */}
				<div className="h-1.5 w-16 overflow-hidden rounded-full bg-[color:var(--dm-border)]">
					<div
						className="h-full rounded-full bg-[color:var(--dm-peach)] transition-all duration-300"
						style={{ width: `${rounded}%` }}
					/>
				</div>
				<span className="tabular-nums font-medium">{rounded}%</span>
				<ChevronDown
					className={cn(
						"h-3.5 w-3.5 transition-transform",
						expanded && "rotate-180",
					)}
					aria-hidden="true"
				/>
			</button>

			{expanded && (
				<>
					{/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss pattern */}
					<div
						className="fixed inset-0 z-40"
						onClick={() => setExpanded(false)}
						onKeyDown={(e) => {
							if (e.key === "Escape") setExpanded(false);
						}}
					/>
					<div
						ref={panelRef}
						className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4 shadow-lg"
					>
						<p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--dm-muted)]">
							Section progress
						</p>
						<div className="grid gap-2.5">
							{sections.map((section) => {
								const Icon = sectionIconMap[section.id] ?? FileText;
								const pct = Math.round(section.completion);

								return (
									<div key={section.id} className="flex items-center gap-3">
										<Icon
											className="h-4 w-4 shrink-0 text-[color:var(--dm-muted)]"
											aria-hidden="true"
										/>
										<span className="min-w-0 flex-1 truncate text-xs text-[color:var(--dm-ink)]">
											{section.label}
										</span>
										<div className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-[color:var(--dm-border)]">
											<div
												className="h-full rounded-full bg-[color:var(--dm-peach)]"
												style={{
													width: `${pct}%`,
												}}
											/>
										</div>
										<span className="w-8 text-right text-[10px] tabular-nums text-[color:var(--dm-muted)]">
											{pct}%
										</span>
									</div>
								);
							})}
						</div>
					</div>
				</>
			)}
		</div>
	);
}
