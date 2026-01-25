import {
  ArrowDown,
  ArrowUp,
  Clipboard,
  Copy,
  Lock,
  Scissors,
  SquareStack,
  Trash2,
  Unlock,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface CanvasContextMenuProps {
  children: ReactNode;
  onCopy: () => void;
  onPaste: () => void;
  onCut: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onLock: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  hasSelection: boolean;
  isLocked: boolean;
  hasClipboard: boolean;
}

/**
 * CE-026: Canvas Context Menu
 * Provides right-click context menu for canvas element operations.
 */
export function CanvasContextMenu({
  children,
  onCopy,
  onPaste,
  onCut,
  onDuplicate,
  onDelete,
  onSelectAll,
  onLock,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  hasSelection,
  isLocked,
  hasClipboard,
}: CanvasContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* Clipboard actions */}
        <ContextMenuItem
          onClick={onCopy}
          disabled={!hasSelection}
          className="gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem
          onClick={onCut}
          disabled={!hasSelection}
          className="gap-2"
        >
          <Scissors className="h-4 w-4" />
          Cut
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem
          onClick={onPaste}
          disabled={!hasClipboard}
          className="gap-2"
        >
          <Clipboard className="h-4 w-4" />
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem
          onClick={onDuplicate}
          disabled={!hasSelection}
          className="gap-2"
        >
          <SquareStack className="h-4 w-4" />
          Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem
          onClick={onDelete}
          disabled={!hasSelection}
          className="gap-2"
          variant="destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Selection actions */}
        <ContextMenuItem onClick={onSelectAll} className="gap-2">
          Select All
          <ContextMenuShortcut>⌘A</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Lock action */}
        <ContextMenuItem
          onClick={onLock}
          disabled={!hasSelection}
          className="gap-2"
        >
          {isLocked ? (
            <>
              <Unlock className="h-4 w-4" />
              Unlock
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Lock
            </>
          )}
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Z-order actions */}
        <ContextMenuItem
          onClick={onBringToFront}
          disabled={!hasSelection}
          className="gap-2"
        >
          <ArrowUp className="h-4 w-4" />
          Bring to Front
        </ContextMenuItem>

        <ContextMenuItem
          onClick={onSendToBack}
          disabled={!hasSelection}
          className="gap-2"
        >
          <ArrowDown className="h-4 w-4" />
          Send to Back
        </ContextMenuItem>

        <ContextMenuItem
          onClick={onBringForward}
          disabled={!hasSelection}
          className="gap-2"
        >
          <ArrowUp className="h-4 w-4 opacity-50" />
          Bring Forward
        </ContextMenuItem>

        <ContextMenuItem
          onClick={onSendBackward}
          disabled={!hasSelection}
          className="gap-2"
        >
          <ArrowDown className="h-4 w-4 opacity-50" />
          Send Backward
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
