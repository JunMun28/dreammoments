import { Flower2, Image, Menu, Plus, Type } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import type { AnimationType, Block, CanvasDocument } from "@/lib/canvas/types";
import { cn } from "@/lib/utils";
import { BlockInspectorSidebar } from "./BlockInspectorSidebar";

const MobileBottomSheet = lazy(
	() => import("@/components/editor/MobileBottomSheet"),
);

function AddBlockButton({
	label,
	icon,
	onClick,
}: {
	label: string;
	icon: React.ReactNode;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex flex-col items-center gap-1 rounded-lg border border-[color:var(--dm-border)] px-4 py-3 text-[color:var(--dm-ink)] transition-colors hover:bg-[color:var(--dm-surface-muted)]"
		>
			{icon}
			<span className="text-[11px] font-medium">{label}</span>
		</button>
	);
}

export function MobileCanvasFab({ onClick }: { onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--dm-primary)] text-white shadow-md transition-transform active:scale-95 sm:hidden"
			aria-label="Open inspector"
		>
			<Menu className="h-5 w-5" />
		</button>
	);
}

export function MobileCanvasSheet({
	open,
	onClose,
	selectedBlocks,
	onAddBlock,
	onUpdateContent,
	onRestyle,
	onMove,
	onResize,
	onDelete,
	onDuplicate,
	onToggleLock,
	onUpdateAnimation,
	onBulkDelete,
	onBulkLock,
	onBulkRestyle,
	invitationId,
	token,
	designTokens,
	onDesignTokenChange,
	onSpacingChange,
}: {
	open: boolean;
	onClose: () => void;
	selectedBlocks: Block[];
	onAddBlock: (type: Block["type"]) => void;
	onUpdateContent: (blockId: string, patch: Record<string, unknown>) => void;
	onRestyle: (blockId: string, stylePatch: Record<string, string>) => void;
	onMove: (blockId: string, position: { x: number; y: number }) => void;
	onResize: (blockId: string, size: { width: number; height: number }) => void;
	onDelete: (blockId: string) => void;
	onDuplicate: (blockId: string) => void;
	onToggleLock: (blockId: string) => void;
	onUpdateAnimation: (blockId: string, animation: AnimationType) => void;
	onBulkDelete: (blockIds: string[]) => void;
	onBulkLock: (blockIds: string[], locked: boolean) => void;
	onBulkRestyle: (
		blockIds: string[],
		stylePatch: Record<string, string>,
	) => void;
	invitationId?: string;
	token?: string;
	designTokens: CanvasDocument["designTokens"];
	onDesignTokenChange: (
		section: "colors" | "fonts",
		key: string,
		value: string,
	) => void;
	onSpacingChange: (spacing: number) => void;
}) {
	const [tab, setTab] = useState<"inspector" | "add">(
		selectedBlocks.length > 0 ? "inspector" : "add",
	);

	return (
		<Suspense fallback={null}>
			<MobileBottomSheet open={open} onClose={onClose} height="half">
				<div className="flex shrink-0 gap-1 border-b border-[color:var(--dm-border)] px-4 pb-2">
					<button
						type="button"
						onClick={() => setTab("inspector")}
						className={cn(
							"rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors",
							tab === "inspector"
								? "bg-[color:var(--dm-peach)]/15 text-[color:var(--dm-peach)]"
								: "text-[color:var(--dm-muted)]",
						)}
					>
						Inspector
					</button>
					<button
						type="button"
						onClick={() => setTab("add")}
						className={cn(
							"rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors",
							tab === "add"
								? "bg-[color:var(--dm-peach)]/15 text-[color:var(--dm-peach)]"
								: "text-[color:var(--dm-muted)]",
						)}
					>
						<Plus className="mr-1 inline-block h-3 w-3" />
						Add
					</button>
				</div>

				<div className="flex-1 overflow-y-auto">
					{tab === "add" ? (
						<div className="grid grid-cols-3 gap-2 p-4">
							<AddBlockButton
								label="Text"
								icon={<Type className="h-5 w-5" />}
								onClick={() => {
									onAddBlock("text");
									onClose();
								}}
							/>
							<AddBlockButton
								label="Heading"
								icon={<span className="text-sm font-bold">H</span>}
								onClick={() => {
									onAddBlock("heading");
									onClose();
								}}
							/>
							<AddBlockButton
								label="Image"
								icon={<Image className="h-5 w-5" />}
								onClick={() => {
									onAddBlock("image");
									onClose();
								}}
							/>
							<AddBlockButton
								label="Decor"
								icon={<Flower2 className="h-5 w-5" />}
								onClick={() => {
									onAddBlock("decorative");
									onClose();
								}}
							/>
						</div>
					) : (
						<BlockInspectorSidebar
							selectedBlocks={selectedBlocks}
							onUpdateContent={onUpdateContent}
							onRestyle={onRestyle}
							onMove={onMove}
							onResize={onResize}
							onDelete={onDelete}
							onDuplicate={onDuplicate}
							onToggleLock={onToggleLock}
							onUpdateAnimation={onUpdateAnimation}
							onBulkDelete={onBulkDelete}
							onBulkLock={onBulkLock}
							onBulkRestyle={onBulkRestyle}
							invitationId={invitationId}
							token={token}
							designTokens={designTokens}
							onDesignTokenChange={onDesignTokenChange}
							onSpacingChange={onSpacingChange}
						/>
					)}
				</div>
			</MobileBottomSheet>
		</Suspense>
	);
}
