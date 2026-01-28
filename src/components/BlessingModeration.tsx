/**
 * Admin panel for blessing moderation
 * Allows couples to approve, reject, or delete guest blessings
 */

import { formatDistanceToNow } from "date-fns";
import {
  Check,
  CheckSquare,
  MessageCircle,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { BlessingData } from "@/lib/blessings-server";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

type ModerationTab = "pending" | "approved" | "rejected";

interface BlessingModerationProps {
  /** All blessings (including unapproved) from getBlessingsForModeration */
  blessings: BlessingData[];
  /** Callback to approve a blessing */
  onApprove: (id: string) => Promise<void>;
  /** Callback to reject a blessing */
  onReject: (id: string) => Promise<void>;
  /** Callback to delete a blessing */
  onDelete: (id: string) => Promise<void>;
  /** Callback to bulk approve */
  onBulkApprove?: (ids: string[]) => Promise<void>;
  /** Callback to bulk reject */
  onBulkReject?: (ids: string[]) => Promise<void>;
  /** Whether an action is in progress */
  isLoading?: boolean;
}

/**
 * Single blessing item for moderation
 */
function ModerationItem({
  blessing,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  onDelete,
  isLoading,
  showActions = true,
}: {
  blessing: BlessingData;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
  showActions?: boolean;
}) {
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const handleApprove = async () => {
    setActionInProgress("approve");
    await onApprove(blessing.id);
    setActionInProgress(null);
  };

  const handleReject = async () => {
    setActionInProgress("reject");
    await onReject(blessing.id);
    setActionInProgress(null);
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this blessing?",
      )
    ) {
      return;
    }
    setActionInProgress("delete");
    await onDelete(blessing.id);
    setActionInProgress(null);
  };

  const isActionInProgress = actionInProgress !== null || isLoading;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        isSelected
          ? "border-stone-400 bg-stone-50"
          : "border-stone-200 bg-white",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Selection checkbox */}
        <button
          type="button"
          onClick={() => onSelect(blessing.id, !isSelected)}
          className="mt-0.5 text-stone-400 hover:text-stone-600"
          aria-label={isSelected ? "Deselect" : "Select"}
        >
          {isSelected ? (
            <CheckSquare className="h-5 w-5 text-stone-700" />
          ) : (
            <Square className="h-5 w-5" />
          )}
        </button>

        {/* Blessing content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 text-sm font-medium">
              {blessing.authorName.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-stone-800">
              {blessing.authorName}
            </span>
            {blessing.createdAt && (
              <span className="text-xs text-stone-500">
                {formatDistanceToNow(new Date(blessing.createdAt), {
                  addSuffix: true,
                })}
              </span>
            )}
            {blessing.parentId && (
              <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                Reply
              </span>
            )}
          </div>
          <p className="text-sm text-stone-700 whitespace-pre-wrap">
            {blessing.message}
          </p>
        </div>

        {/* Action buttons */}
        {showActions && (
          <div className="flex items-center gap-1">
            {!blessing.isApproved && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleApprove}
                disabled={isActionInProgress}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                title="Approve"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            {blessing.isApproved && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReject}
                disabled={isActionInProgress}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                title="Hide (unapprove)"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isActionInProgress}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete permanently"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Blessing moderation panel for couples
 */
export function BlessingModeration({
  blessings,
  onApprove,
  onReject,
  onDelete,
  onBulkApprove,
  onBulkReject,
  isLoading = false,
}: BlessingModerationProps) {
  const [activeTab, setActiveTab] = useState<ModerationTab>("pending");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false);

  // Filter blessings by tab - flatten to include replies
  const flattenBlessings = useCallback(
    (items: BlessingData[]): BlessingData[] => {
      const result: BlessingData[] = [];
      for (const blessing of items) {
        result.push(blessing);
        if (blessing.replies && blessing.replies.length > 0) {
          result.push(...flattenBlessings(blessing.replies));
        }
      }
      return result;
    },
    [],
  );

  const allBlessings = useMemo(
    () => flattenBlessings(blessings),
    [blessings, flattenBlessings],
  );

  const filteredBlessings = useMemo(() => {
    switch (activeTab) {
      case "pending":
        return allBlessings.filter((b) => !b.isApproved);
      case "approved":
        return allBlessings.filter((b) => b.isApproved);
      case "rejected":
        // For now, rejected = unapproved (could add separate status later)
        return allBlessings.filter((b) => !b.isApproved);
      default:
        return allBlessings;
    }
  }, [allBlessings, activeTab]);

  // Count for tabs
  const counts = useMemo(
    () => ({
      pending: allBlessings.filter((b) => !b.isApproved).length,
      approved: allBlessings.filter((b) => b.isApproved).length,
      total: allBlessings.length,
    }),
    [allBlessings],
  );

  // Selection handlers
  const handleSelect = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredBlessings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBlessings.map((b) => b.id)));
    }
  }, [filteredBlessings, selectedIds.size]);

  // Bulk actions
  const handleBulkApprove = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setBulkActionInProgress(true);

    if (onBulkApprove) {
      await onBulkApprove(Array.from(selectedIds));
    } else {
      // Fallback: approve one by one
      for (const id of selectedIds) {
        await onApprove(id);
      }
    }

    setSelectedIds(new Set());
    setBulkActionInProgress(false);
  }, [selectedIds, onBulkApprove, onApprove]);

  const handleBulkReject = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setBulkActionInProgress(true);

    if (onBulkReject) {
      await onBulkReject(Array.from(selectedIds));
    } else {
      // Fallback: reject one by one
      for (const id of selectedIds) {
        await onReject(id);
      }
    }

    setSelectedIds(new Set());
    setBulkActionInProgress(false);
  }, [selectedIds, onBulkReject, onReject]);

  const tabs: { id: ModerationTab; label: string; count: number }[] = [
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "approved", label: "Approved", count: counts.approved },
  ];

  const isAnyActionInProgress = isLoading || bulkActionInProgress;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-200">
        <MessageCircle className="h-5 w-5 text-stone-600" />
        <h2 className="font-semibold text-stone-800">Blessing Moderation</h2>
        <span className="text-sm text-stone-500">({counts.total} total)</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-stone-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedIds(new Set());
            }}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:bg-stone-100",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "ml-1.5 px-1.5 py-0.5 rounded text-xs",
                activeTab === tab.id
                  ? "bg-white/20 text-white"
                  : "bg-stone-200 text-stone-600",
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bulk actions bar */}
      {filteredBlessings.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-stone-50 border-b border-stone-200">
          <button
            type="button"
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800"
          >
            {selectedIds.size === filteredBlessings.length &&
            filteredBlessings.length > 0 ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedIds.size > 0
              ? `${selectedIds.size} selected`
              : "Select all"}
          </button>

          {selectedIds.size > 0 && (
            <>
              <div className="h-4 w-px bg-stone-300" />
              {activeTab === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkApprove}
                  disabled={isAnyActionInProgress}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Approve All
                </Button>
              )}
              {activeTab === "approved" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkReject}
                  disabled={isAnyActionInProgress}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <X className="h-3 w-3 mr-1" />
                  Hide All
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {/* Blessing list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredBlessings.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>
                {activeTab === "pending"
                  ? "No pending blessings"
                  : "No approved blessings"}
              </p>
            </div>
          ) : (
            filteredBlessings.map((blessing) => (
              <ModerationItem
                key={blessing.id}
                blessing={blessing}
                isSelected={selectedIds.has(blessing.id)}
                onSelect={handleSelect}
                onApprove={onApprove}
                onReject={onReject}
                onDelete={onDelete}
                isLoading={isAnyActionInProgress}
                showActions={activeTab !== "rejected"}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
