import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import {
  InvitationBuilderProvider,
  type InvitationData,
  useInvitationBuilder,
} from "@/contexts/InvitationBuilderContext";
import { useAutosave } from "@/hooks/useAutosave";
import {
  CanvasPanel,
  EditorHeader,
  EditorLayout,
  FilmstripPanel,
  PropertiesPanel,
  SectionThumbnails,
  ToolSidebar,
} from "./editor";
import { TooltipProvider } from "./ui/tooltip";

interface InvitationBuilderProps {
  /** Initial invitation data from server */
  initialData: InvitationData;
  /** Callback to save invitation (typically a server function) */
  onSave: (data: InvitationData) => Promise<void>;
}

/**
 * Multi-panel editor content.
 * Uses the hunbei.com-style layout with 5 panels.
 */
function MultiPanelEditorContent() {
  const { invitation } = useInvitationBuilder();
  const navigate = useNavigate();

  const handlePreview = useCallback(() => {
    // Open preview in new tab
    window.open(`/invite/${invitation.id}`, "_blank");
  }, [invitation.id]);

  const handleExit = useCallback(() => {
    navigate({ to: "/" });
  }, [navigate]);

  return (
    <TooltipProvider>
      <EditorLayout
        header={<EditorHeader onPreview={handlePreview} onExit={handleExit} />}
        toolSidebar={<ToolSidebar />}
        thumbnails={<SectionThumbnails />}
        canvas={<CanvasPanel />}
        properties={<PropertiesPanel />}
        filmstrip={<FilmstripPanel />}
      />
    </TooltipProvider>
  );
}

/**
 * Inner component that manages autosave and renders the canvas editor.
 * Must be inside InvitationBuilderProvider to access context.
 */
function InvitationBuilderContent({
  onSave,
}: {
  onSave: (data: InvitationData) => Promise<void>;
}) {
  const { invitation, setAutosaveStatus } = useInvitationBuilder();

  const { status } = useAutosave({
    data: invitation,
    onSave,
    delay: 1000,
  });

  // Sync status to context for potential use elsewhere
  useEffect(() => {
    setAutosaveStatus(status);
  }, [status, setAutosaveStatus]);

  return <MultiPanelEditorContent />;
}

/**
 * Main invitation builder component.
 * Uses the canvas editor with multi-panel layout.
 * Includes autosave functionality.
 *
 * @example
 * ```tsx
 * <InvitationBuilder
 *   initialData={{ id: "123", partner1Name: "Alice", partner2Name: "Bob" }}
 *   onSave={async (data) => {
 *     await updateInvitation({ data: { invitationId: data.id, ...data } });
 *   }}
 * />
 * ```
 */
export function InvitationBuilder({
  initialData,
  onSave,
}: InvitationBuilderProps) {
  return (
    <InvitationBuilderProvider initialData={initialData}>
      <InvitationBuilderContent onSave={onSave} />
    </InvitationBuilderProvider>
  );
}
