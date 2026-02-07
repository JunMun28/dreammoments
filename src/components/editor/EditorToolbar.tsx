import { Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, Redo2, Send, Undo2 } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { SaveStatusBadge } from "./SaveStatusBadge";

type EditorToolbarProps = {
	title: string;
	canUndo: boolean;
	canRedo: boolean;
	onUndo: () => void;
	onRedo: () => void;
	onPreview: () => void;
	onPublish: () => void;
	saveStatus: "saved" | "saving" | "unsaved";
	autosaveAt: string;
	isMobile: boolean;
};

export function EditorToolbar({
	title,
	canUndo,
	canRedo,
	onUndo,
	onRedo,
	onPreview,
	onPublish,
	saveStatus,
	autosaveAt,
	isMobile,
}: EditorToolbarProps) {
	const [overflowOpen, setOverflowOpen] = useState(false);

	if (isMobile) {
		return (
			<header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-[color:var(--dm-border)] bg-[color:var(--dm-bg)] px-3">
				<Link
					to="/dashboard"
					className="inline-flex min-h-11 items-center gap-1 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
					aria-label="Back to Dashboard"
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Back
				</Link>

				<h1 className="max-w-[40vw] truncate text-sm font-semibold text-[color:var(--dm-ink)]">
					{title}
				</h1>

				<div className="relative">
					<button
						type="button"
						className="inline-flex min-h-11 min-w-11 items-center justify-center text-[color:var(--dm-ink)]"
						aria-label="More actions"
						aria-expanded={overflowOpen}
						onClick={() => setOverflowOpen((prev) => !prev)}
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="currentColor"
							aria-hidden="true"
						>
							<circle cx="12" cy="5" r="2" />
							<circle cx="12" cy="12" r="2" />
							<circle cx="12" cy="19" r="2" />
						</svg>
					</button>

					{overflowOpen && (
						<>
							{/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss pattern */}
							<div
								className="fixed inset-0 z-40"
								onClick={() => setOverflowOpen(false)}
								onKeyDown={(e) => {
									if (e.key === "Escape") setOverflowOpen(false);
								}}
							/>
							<div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-2 shadow-lg">
								<button
									type="button"
									disabled={!canUndo}
									className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-[color:var(--dm-ink)] disabled:opacity-40 active:bg-[color:var(--dm-surface-muted)]"
									onClick={() => {
										onUndo();
										setOverflowOpen(false);
									}}
								>
									<Undo2 className="h-4 w-4" aria-hidden="true" />
									Undo
								</button>
								<button
									type="button"
									disabled={!canRedo}
									className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-[color:var(--dm-ink)] disabled:opacity-40 active:bg-[color:var(--dm-surface-muted)]"
									onClick={() => {
										onRedo();
										setOverflowOpen(false);
									}}
								>
									<Redo2 className="h-4 w-4" aria-hidden="true" />
									Redo
								</button>
								<button
									type="button"
									className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-[color:var(--dm-ink)] active:bg-[color:var(--dm-surface-muted)]"
									onClick={() => {
										onPreview();
										setOverflowOpen(false);
									}}
								>
									<Eye className="h-4 w-4" aria-hidden="true" />
									Preview
								</button>
								<div className="my-1 border-t border-[color:var(--dm-border)]" />
								<button
									type="button"
									className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-[color:var(--dm-accent-strong)] active:bg-[color:var(--dm-surface-muted)]"
									onClick={() => {
										onPublish();
										setOverflowOpen(false);
									}}
								>
									<Send className="h-4 w-4" aria-hidden="true" />
									Publish
								</button>
								<div className="mt-1 border-t border-[color:var(--dm-border)] pt-2 px-3">
									<SaveStatusBadge
										status={saveStatus}
										autosaveAt={autosaveAt}
									/>
								</div>
							</div>
						</>
					)}
				</div>
			</header>
		);
	}

	return (
		<header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[color:var(--dm-border)] bg-[color:var(--dm-bg)] px-4">
			<div className="flex items-center gap-4">
				<Link
					to="/dashboard"
					className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--dm-border)] px-4 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Dashboard
				</Link>
				<h1 className="text-sm font-semibold text-[color:var(--dm-ink)]">
					{title}
				</h1>
			</div>

			<div className="flex items-center gap-3">
				<button
					type="button"
					disabled={!canUndo}
					onClick={onUndo}
					aria-label="Undo"
					aria-disabled={!canUndo}
					className={cn(
						"inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[color:var(--dm-border)] text-[color:var(--dm-ink)]",
						!canUndo && "opacity-40 cursor-not-allowed",
					)}
				>
					<Undo2 className="h-4 w-4" aria-hidden="true" />
				</button>
				<button
					type="button"
					disabled={!canRedo}
					onClick={onRedo}
					aria-label="Redo"
					aria-disabled={!canRedo}
					className={cn(
						"inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[color:var(--dm-border)] text-[color:var(--dm-ink)]",
						!canRedo && "opacity-40 cursor-not-allowed",
					)}
				>
					<Redo2 className="h-4 w-4" aria-hidden="true" />
				</button>

				<SaveStatusBadge status={saveStatus} autosaveAt={autosaveAt} />

				<button
					type="button"
					onClick={onPreview}
					aria-label="Switch to preview mode"
					className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--dm-border)] px-4 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
				>
					<Eye className="h-4 w-4" aria-hidden="true" />
					Preview
				</button>
				<button
					type="button"
					onClick={onPublish}
					className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--dm-accent-strong)] px-4 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
				>
					<Send className="h-4 w-4" aria-hidden="true" />
					Publish
				</button>
			</div>
		</header>
	);
}

export default EditorToolbar;
