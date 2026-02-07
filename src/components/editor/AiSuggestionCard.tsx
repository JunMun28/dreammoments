import { cn } from "../../lib/utils";
import type { AiTaskType } from "./hooks/useAiAssistant";

export type AiSuggestionCardProps = {
	type: AiTaskType;
	result: Record<string, unknown>;
};

function SchedulePreview({ result }: { result: Record<string, unknown> }) {
	const events = (result.events ?? []) as Array<{
		time: string;
		title: string;
		description: string;
	}>;
	if (events.length === 0) return <EmptyState />;
	return (
		<div className="space-y-3">
			{events.map((event, i) => (
				<div
					key={`${event.time}-${i}`}
					className="flex gap-3 border-l-2 border-[color:var(--dm-accent-strong)] pl-3"
				>
					<span className="shrink-0 text-xs font-medium text-[color:var(--dm-accent-strong)]">
						{event.time}
					</span>
					<div className="min-w-0">
						<p className="text-sm font-semibold text-[color:var(--dm-ink)]">
							{event.title}
						</p>
						<p className="text-xs text-[color:var(--dm-muted)]">
							{event.description}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}

function FaqPreview({ result }: { result: Record<string, unknown> }) {
	const items = (result.items ?? []) as Array<{
		question: string;
		answer: string;
	}>;
	if (items.length === 0) return <EmptyState />;
	return (
		<div className="divide-y divide-[color:var(--dm-border)]">
			{items.map((item, i) => (
				<div
					key={`${item.question}-${i}`}
					className="py-3 first:pt-0 last:pb-0"
				>
					<p className="text-sm font-semibold text-[color:var(--dm-ink)]">
						{item.question}
					</p>
					<p className="mt-1 text-xs text-[color:var(--dm-muted)]">
						{item.answer}
					</p>
				</div>
			))}
		</div>
	);
}

function StoryPreview({ result }: { result: Record<string, unknown> }) {
	const milestones = (result.milestones ?? []) as Array<{
		date: string;
		title: string;
		description: string;
	}>;
	if (milestones.length === 0) return <EmptyState />;
	return (
		<div className="space-y-3">
			{milestones.map((milestone, i) => (
				<div
					key={`${milestone.date}-${i}`}
					className="flex gap-3 border-l-2 border-[color:var(--dm-accent-strong)] pl-3"
				>
					<span className="shrink-0 text-xs font-medium text-[color:var(--dm-accent-strong)]">
						{milestone.date}
					</span>
					<div className="min-w-0">
						<p className="text-sm font-semibold text-[color:var(--dm-ink)]">
							{milestone.title}
						</p>
						<p className="text-xs text-[color:var(--dm-muted)]">
							{milestone.description}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}

function TaglinePreview({ result }: { result: Record<string, unknown> }) {
	const tagline = String(result.tagline ?? "");
	if (!tagline) return <EmptyState />;
	return (
		<div className="flex items-center justify-center py-4">
			<p className="text-center font-[family-name:var(--dm-font-accent)] text-2xl text-[color:var(--dm-ink)]">
				{tagline}
			</p>
		</div>
	);
}

function StylePreview({ result }: { result: Record<string, unknown> }) {
	const cssVars = (result.cssVars ?? result) as Record<string, unknown>;
	const entries = Object.entries(cssVars).filter(([key]) =>
		key.startsWith("--"),
	);
	if (entries.length === 0) return <EmptyState />;
	return (
		<div className="grid grid-cols-3 gap-3">
			{entries.map(([key, value]) => (
				<div key={key} className="flex flex-col items-center gap-1.5">
					<div
						className="h-10 w-10 rounded-full border border-[color:var(--dm-border)]"
						style={{ backgroundColor: String(value) }}
					/>
					<span className="max-w-full truncate text-[10px] text-[color:var(--dm-muted)]">
						{key.replace(/^--/, "")}
					</span>
				</div>
			))}
		</div>
	);
}

function TranslatePreview({ result }: { result: Record<string, unknown> }) {
	const translation = String(result.translation ?? "");
	if (!translation) return <EmptyState />;
	return (
		<div className="rounded-2xl border border-[color:var(--dm-border)] p-3">
			<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
				Translation
			</p>
			<p className="mt-2 text-sm text-[color:var(--dm-ink)]">{translation}</p>
		</div>
	);
}

function EmptyState() {
	return (
		<p className="py-4 text-center text-xs text-[color:var(--dm-muted)]">
			No preview available
		</p>
	);
}

export function AiSuggestionCard({ type, result }: AiSuggestionCardProps) {
	return (
		<div
			className={cn(
				"rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4",
			)}
		>
			<p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
				AI Suggestion
			</p>
			{type === "schedule" && <SchedulePreview result={result} />}
			{type === "faq" && <FaqPreview result={result} />}
			{type === "story" && <StoryPreview result={result} />}
			{type === "tagline" && <TaglinePreview result={result} />}
			{type === "style" && <StylePreview result={result} />}
			{type === "translate" && <TranslatePreview result={result} />}
		</div>
	);
}
