import { Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, Redo2, Send, Undo2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
	saveStatus: "saved" | "saving" | "unsaved" | "error";
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
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const menuItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

	const menuItems = [
		{
			label: "Undo",
			icon: Undo2,
			action: onUndo,
			disabled: !canUndo,
			accent: false,
		},
		{
			label: "Redo",
			icon: Redo2,
			action: onRedo,
			disabled: !canRedo,
			accent: false,
		},
		{
			label: "Preview",
			icon: Eye,
			action: onPreview,
			disabled: false,
			accent: false,
		},
		{
			label: "Publish",
			icon: Send,
			action: onPublish,
			disabled: false,
			accent: true,
		},
	];

	const closeMenu = useCallback(() => {
		setOverflowOpen(false);
		setFocusedIndex(-1);
		triggerRef.current?.focus();
	}, []);

	// Focus the first menu item when menu opens
	useEffect(() => {
		if (overflowOpen) {
			setFocusedIndex(0);
			requestAnimationFrame(() => {
				menuItemRefs.current[0]?.focus();
			});
		}
	}, [overflowOpen]);

	const handleMenuKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			switch (e.key) {
				case "ArrowDown": {
					e.preventDefault();
					const next = (focusedIndex + 1) % menuItems.length;
					setFocusedIndex(next);
					menuItemRefs.current[next]?.focus();
					break;
				}
				case "ArrowUp": {
					e.preventDefault();
					const prev = (focusedIndex - 1 + menuItems.length) % menuItems.length;
					setFocusedIndex(prev);
					menuItemRefs.current[prev]?.focus();
					break;
				}
				case "Home": {
					e.preventDefault();
					setFocusedIndex(0);
					menuItemRefs.current[0]?.focus();
					break;
				}
				case "End": {
					e.preventDefault();
					const last = menuItems.length - 1;
					setFocusedIndex(last);
					menuItemRefs.current[last]?.focus();
					break;
				}
				case "Escape": {
					e.preventDefault();
					closeMenu();
					break;
				}
				case "Tab": {
					e.preventDefault();
					closeMenu();
					break;
				}
			}
		},
		[focusedIndex, menuItems.length, closeMenu],
	);

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

				<div className="flex items-center gap-1.5">
					<output
						className={cn(
							"block h-1.5 w-1.5 shrink-0 rounded-full",
							saveStatus === "saved" && "bg-[#22c55e]",
							saveStatus === "saving" && "bg-[#eab308]",
							saveStatus === "unsaved" && "bg-[color:var(--dm-muted)]",
							saveStatus === "error" && "bg-[#ef4444]",
						)}
						aria-label={`Save status: ${saveStatus}`}
					/>
					<h1 className="max-w-[40vw] truncate text-sm font-semibold text-[color:var(--dm-ink)]">
						{title}
					</h1>
				</div>

				<div className="relative">
					<button
						ref={triggerRef}
						type="button"
						className="inline-flex min-h-11 min-w-11 items-center justify-center text-[color:var(--dm-ink)]"
						aria-label="More actions"
						aria-haspopup="true"
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
								onClick={closeMenu}
								onKeyDown={(e) => {
									if (e.key === "Escape") closeMenu();
								}}
							/>
							<div
								role="menu"
								aria-label="More actions"
								onKeyDown={handleMenuKeyDown}
								className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-2 shadow-lg"
							>
								{menuItems.map((item, index) => {
									const Icon = item.icon;
									const isSeparatorBefore = index === 3;
									return (
										<div key={item.label}>
											{isSeparatorBefore && (
												<hr className="my-1 border-t border-[color:var(--dm-border)]" />
											)}
											<button
												ref={(el) => {
													menuItemRefs.current[index] = el;
												}}
												type="button"
												role="menuitem"
												tabIndex={focusedIndex === index ? 0 : -1}
												disabled={item.disabled}
												className={cn(
													"flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm active:bg-[color:var(--dm-surface-muted)]",
													item.accent
														? "font-medium text-[color:var(--dm-accent-strong)]"
														: "text-[color:var(--dm-ink)]",
													item.disabled && "opacity-40",
												)}
												onClick={() => {
													item.action();
													closeMenu();
												}}
											>
												<Icon className="h-4 w-4" aria-hidden="true" />
												{item.label}
											</button>
										</div>
									);
								})}
								<hr className="mt-1 border-t border-[color:var(--dm-border)]" />
								<div className="px-3 pt-2">
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
