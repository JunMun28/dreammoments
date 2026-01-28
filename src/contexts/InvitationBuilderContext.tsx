import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import type { BasicInfoFormValues } from "@/components/BasicInfoForm";
import type { AutosaveStatus } from "@/hooks/useAutosave";
import {
  addItemToList,
  moveItemInList,
  removeItemFromList,
  updateItemInList,
} from "@/lib/list-utils";

/**
 * Tool types for the editor sidebar
 */
export type EditorTool =
  | "info"
  | "images"
  | "theme"
  | "schedule"
  | "notes"
  | "guests"
  | "rsvp"
  | "settings";

/**
 * Section identifiers for the longpage preview
 */
export type SectionId =
  | "hero"
  | "countdown"
  | "gallery"
  | "schedule"
  | "venue"
  | "notes"
  | "rsvp";

/**
 * Editor state for the multi-panel layout
 */
export interface EditorState {
  activeTool: EditorTool;
  activeSection: SectionId | null;
  zoomLevel: number;
  canvasScrollPosition: number;
}

/**
 * Schedule block data for wedding timeline events
 */
export interface ScheduleBlock {
  id: string;
  title: string;
  time?: string;
  description?: string;
  order: number;
}

/**
 * Note data for wedding notes/FAQ items
 */
export interface Note {
  id: string;
  title: string;
  description?: string;
  order: number;
}

/**
 * Guest data for individual guests in a group
 */
export interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

/**
 * Guest group data with RSVP token
 */
export interface GuestGroup {
  id: string;
  name: string;
  rsvpToken: string;
  guests: Guest[];
}

/**
 * Gallery image data for photo carousel
 */
export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption?: string;
  order: number;
}

/**
 * Decorative element settings for themed templates
 */
export interface DecorativeElements {
  sparkles?: boolean;
  doubleHappiness?: boolean;
  borderStyle?: "flourish" | "geometric" | "minimal" | "none";
}

/**
 * Extended invitation data including DB fields
 */
export interface InvitationData extends BasicInfoFormValues {
  id: string;
  templateId?: string;
  accentColor?: string;
  fontPairing?: string;
  heroImageUrl?: string;
  scheduleBlocks?: ScheduleBlock[];
  notes?: Note[];
  guestGroups?: GuestGroup[];
  galleryImages?: GalleryImage[];
  venueLatitude?: string;
  venueLongitude?: string;
  themeVariant?: "light" | "dark";
  backgroundColor?: string;
  decorativeElements?: DecorativeElements;
}

interface InvitationBuilderContextValue {
  invitation: InvitationData;
  updateInvitation: (
    updates: Partial<
      Omit<
        InvitationData,
        "scheduleBlocks" | "notes" | "guestGroups" | "galleryImages"
      >
    >,
  ) => void;
  autosaveStatus: AutosaveStatus;
  setAutosaveStatus: (status: AutosaveStatus) => void;
  editorState: EditorState;
  setActiveTool: (tool: EditorTool) => void;
  setActiveSection: (section: SectionId | null) => void;
  setZoomLevel: (level: number) => void;
  setCanvasScrollPosition: (position: number) => void;
  // Schedule block operations
  addScheduleBlock: (block: Omit<ScheduleBlock, "id" | "order">) => void;
  updateScheduleBlock: (id: string, updates: Partial<ScheduleBlock>) => void;
  deleteScheduleBlock: (id: string) => void;
  moveScheduleBlock: (id: string, direction: "up" | "down") => void;
  // Note operations
  addNote: (note: Omit<Note, "id" | "order">) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  moveNote: (id: string, direction: "up" | "down") => void;
  // Guest group operations
  addGuestGroup: (group: GuestGroup) => void;
  updateGuestGroup: (
    id: string,
    updates: Partial<Omit<GuestGroup, "guests">>,
  ) => void;
  deleteGuestGroup: (id: string) => void;
  addGuest: (groupId: string, guest: Guest) => void;
  updateGuest: (
    groupId: string,
    guestId: string,
    updates: Partial<Guest>,
  ) => void;
  deleteGuest: (groupId: string, guestId: string) => void;
  setGuestGroups: (groups: GuestGroup[]) => void;
  // Gallery image operations
  addGalleryImage: (image: Omit<GalleryImage, "id" | "order">) => void;
  updateGalleryImage: (id: string, updates: Partial<GalleryImage>) => void;
  deleteGalleryImage: (id: string) => void;
  moveGalleryImage: (id: string, direction: "up" | "down") => void;
}

const InvitationBuilderContext =
  createContext<InvitationBuilderContextValue | null>(null);

interface InvitationBuilderProviderProps {
  children: ReactNode;
  initialData: InvitationData;
}

/**
 * Provider for invitation builder state.
 */
export function InvitationBuilderProvider({
  children,
  initialData,
}: InvitationBuilderProviderProps) {
  const [invitation, setInvitation] = useState<InvitationData>(initialData);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");

  const [editorState, setEditorState] = useState<EditorState>({
    activeTool: "info",
    activeSection: null,
    zoomLevel: 0.8,
    canvasScrollPosition: 0,
  });

  const setActiveTool = useCallback((tool: EditorTool) => {
    setEditorState((prev) => ({ ...prev, activeTool: tool }));
  }, []);

  const setActiveSection = useCallback((section: SectionId | null) => {
    setEditorState((prev) => ({ ...prev, activeSection: section }));
  }, []);

  const setZoomLevel = useCallback((level: number) => {
    const clampedLevel = Math.max(0.5, Math.min(2.0, level));
    setEditorState((prev) => ({ ...prev, zoomLevel: clampedLevel }));
  }, []);

  const setCanvasScrollPosition = useCallback((position: number) => {
    setEditorState((prev) => ({ ...prev, canvasScrollPosition: position }));
  }, []);

  const updateInvitation = useCallback(
    (
      updates: Partial<
        Omit<
          InvitationData,
          "scheduleBlocks" | "notes" | "guestGroups" | "galleryImages"
        >
      >,
    ) => {
      setInvitation((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  // Schedule block operations using list utilities
  const addScheduleBlock = useCallback(
    (block: Omit<ScheduleBlock, "id" | "order">) => {
      setInvitation((prev) => ({
        ...prev,
        scheduleBlocks: addItemToList(
          prev.scheduleBlocks ?? [],
          block,
          "block",
        ),
      }));
    },
    [],
  );

  const updateScheduleBlock = useCallback(
    (id: string, updates: Partial<ScheduleBlock>) => {
      setInvitation((prev) => ({
        ...prev,
        scheduleBlocks: updateItemInList(
          prev.scheduleBlocks ?? [],
          id,
          updates,
        ),
      }));
    },
    [],
  );

  const deleteScheduleBlock = useCallback((id: string) => {
    setInvitation((prev) => ({
      ...prev,
      scheduleBlocks: removeItemFromList(prev.scheduleBlocks ?? [], id),
    }));
  }, []);

  const moveScheduleBlock = useCallback(
    (id: string, direction: "up" | "down") => {
      setInvitation((prev) => ({
        ...prev,
        scheduleBlocks: moveItemInList(
          prev.scheduleBlocks ?? [],
          id,
          direction,
        ),
      }));
    },
    [],
  );

  // Note operations using list utilities
  const addNote = useCallback((note: Omit<Note, "id" | "order">) => {
    setInvitation((prev) => ({
      ...prev,
      notes: addItemToList(prev.notes ?? [], note, "note"),
    }));
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setInvitation((prev) => ({
      ...prev,
      notes: updateItemInList(prev.notes ?? [], id, updates),
    }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setInvitation((prev) => ({
      ...prev,
      notes: removeItemFromList(prev.notes ?? [], id),
    }));
  }, []);

  const moveNote = useCallback((id: string, direction: "up" | "down") => {
    setInvitation((prev) => ({
      ...prev,
      notes: moveItemInList(prev.notes ?? [], id, direction),
    }));
  }, []);

  // Gallery image operations using list utilities
  const addGalleryImage = useCallback(
    (image: Omit<GalleryImage, "id" | "order">) => {
      setInvitation((prev) => ({
        ...prev,
        galleryImages: addItemToList(
          prev.galleryImages ?? [],
          image,
          "gallery",
        ),
      }));
    },
    [],
  );

  const updateGalleryImage = useCallback(
    (id: string, updates: Partial<GalleryImage>) => {
      setInvitation((prev) => ({
        ...prev,
        galleryImages: updateItemInList(prev.galleryImages ?? [], id, updates),
      }));
    },
    [],
  );

  const deleteGalleryImage = useCallback((id: string) => {
    setInvitation((prev) => ({
      ...prev,
      galleryImages: removeItemFromList(prev.galleryImages ?? [], id),
    }));
  }, []);

  const moveGalleryImage = useCallback(
    (id: string, direction: "up" | "down") => {
      setInvitation((prev) => ({
        ...prev,
        galleryImages: moveItemInList(prev.galleryImages ?? [], id, direction),
      }));
    },
    [],
  );

  // Guest group operations
  const addGuestGroup = useCallback((group: GuestGroup) => {
    setInvitation((prev) => ({
      ...prev,
      guestGroups: [...(prev.guestGroups ?? []), group],
    }));
  }, []);

  const updateGuestGroup = useCallback(
    (id: string, updates: Partial<Omit<GuestGroup, "guests">>) => {
      setInvitation((prev) => ({
        ...prev,
        guestGroups: (prev.guestGroups ?? []).map((g) =>
          g.id === id ? { ...g, ...updates } : g,
        ),
      }));
    },
    [],
  );

  const deleteGuestGroup = useCallback((id: string) => {
    setInvitation((prev) => ({
      ...prev,
      guestGroups: (prev.guestGroups ?? []).filter((g) => g.id !== id),
    }));
  }, []);

  const addGuest = useCallback((groupId: string, guest: Guest) => {
    setInvitation((prev) => ({
      ...prev,
      guestGroups: (prev.guestGroups ?? []).map((g) =>
        g.id === groupId ? { ...g, guests: [...g.guests, guest] } : g,
      ),
    }));
  }, []);

  const updateGuest = useCallback(
    (groupId: string, guestId: string, updates: Partial<Guest>) => {
      setInvitation((prev) => ({
        ...prev,
        guestGroups: (prev.guestGroups ?? []).map((g) =>
          g.id === groupId
            ? {
                ...g,
                guests: g.guests.map((guest) =>
                  guest.id === guestId ? { ...guest, ...updates } : guest,
                ),
              }
            : g,
        ),
      }));
    },
    [],
  );

  const deleteGuest = useCallback((groupId: string, guestId: string) => {
    setInvitation((prev) => ({
      ...prev,
      guestGroups: (prev.guestGroups ?? []).map((g) =>
        g.id === groupId
          ? { ...g, guests: g.guests.filter((guest) => guest.id !== guestId) }
          : g,
      ),
    }));
  }, []);

  const setGuestGroups = useCallback((groups: GuestGroup[]) => {
    setInvitation((prev) => ({ ...prev, guestGroups: groups }));
  }, []);

  return (
    <InvitationBuilderContext.Provider
      value={{
        invitation,
        updateInvitation,
        autosaveStatus,
        setAutosaveStatus,
        editorState,
        setActiveTool,
        setActiveSection,
        setZoomLevel,
        setCanvasScrollPosition,
        addScheduleBlock,
        updateScheduleBlock,
        deleteScheduleBlock,
        moveScheduleBlock,
        addNote,
        updateNote,
        deleteNote,
        moveNote,
        addGuestGroup,
        updateGuestGroup,
        deleteGuestGroup,
        addGuest,
        updateGuest,
        deleteGuest,
        setGuestGroups,
        addGalleryImage,
        updateGalleryImage,
        deleteGalleryImage,
        moveGalleryImage,
      }}
    >
      {children}
    </InvitationBuilderContext.Provider>
  );
}

/**
 * Hook to access invitation builder context.
 */
export function useInvitationBuilder(): InvitationBuilderContextValue {
  const context = useContext(InvitationBuilderContext);
  if (!context) {
    throw new Error(
      "useInvitationBuilder must be used within InvitationBuilderProvider",
    );
  }
  return context;
}
