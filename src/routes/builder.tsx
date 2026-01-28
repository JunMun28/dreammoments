import { createFileRoute, redirect } from "@tanstack/react-router";
import { useCallback } from "react";
import { InvitationBuilder } from "@/components/InvitationBuilder";
import type { InvitationData } from "@/contexts/InvitationBuilderContext";
import { updateInvitation } from "@/lib/invitation-server";

interface BuilderSearch {
  template?: string;
}

export const Route = createFileRoute("/builder")({
  component: BuilderPage,
  validateSearch: (search: Record<string, unknown>): BuilderSearch => ({
    template: typeof search.template === "string" ? search.template : undefined,
  }),
  loaderDeps: ({ search }) => ({ template: search.template }),
  beforeLoad: async ({ search }) => {
    const { getSession } = await import("@/lib/auth");
    const result = await getSession();

    if (!result.data?.user) {
      const loginParams = search.template
        ? { template: search.template }
        : undefined;
      throw redirect({
        to: "/login",
        search: loginParams,
      });
    }

    return { user: result.data.user };
  },
  loader: async ({ context, deps }) => {
    // Use loader-specific server functions that accept user info directly.
    // These don't re-check auth (which fails during SSR cookie forwarding)
    // since beforeLoad already verified authentication.
    const { syncUserFromNeonAuth } = await import("@/lib/user-sync");
    const {
      getExistingInvitationForLoader,
      getOrCreateInvitationForLoader,
      getInvitationWithRelationsForLoader,
    } = await import("@/lib/invitation-server");

    const { user } = context;
    const { template } = deps;

    const localUser = await syncUserFromNeonAuth({
      data: {
        neonAuthId: user.id,
        email: user.email,
      },
    });

    // PRD-005: If no template is provided, check if user has an existing invitation
    // If not, redirect to landing page for template selection
    if (!template) {
      const existingInvitation = await getExistingInvitationForLoader({
        data: { userId: localUser.id },
      });

      if (!existingInvitation) {
        // No existing invitation and no template selected - redirect to landing page
        throw redirect({
          to: "/",
        });
      }

      // User has existing invitation - load it
      const invitation = await getInvitationWithRelationsForLoader({
        data: { invitationId: existingInvitation.id },
      });

      if (!invitation) {
        throw new Error("Failed to load invitation");
      }

      return { invitation };
    }

    // Template provided - create/get invitation with template
    const { id: invitationId } = await getOrCreateInvitationForLoader({
      data: {
        userId: localUser.id,
        templateId: template,
      },
    });

    const invitation = await getInvitationWithRelationsForLoader({
      data: { invitationId },
    });

    if (!invitation) {
      throw new Error("Failed to load invitation");
    }

    return { invitation };
  },
});

/**
 * Builder page that renders the invitation builder with template data.
 * Uses InvitationBuilder component with canvas editor for longpage layout,
 * automatically rendering all template sections (hero, schedule, venue, photos, RSVP).
 */
function BuilderPage() {
  const { invitation } = Route.useLoaderData();

  // Convert loader data to InvitationData format
  // Drizzle's date() returns string by default, need to parse to Date
  const weddingDate = invitation.weddingDate
    ? new Date(invitation.weddingDate)
    : undefined;
  const rsvpDeadline = invitation.rsvpDeadline
    ? new Date(invitation.rsvpDeadline)
    : undefined;

  const initialData: InvitationData = {
    id: invitation.id,
    templateId: invitation.templateId ?? undefined,
    partner1Name: invitation.partner1Name ?? "",
    partner2Name: invitation.partner2Name ?? "",
    weddingDate,
    weddingTime: invitation.weddingTime ?? undefined,
    venueName: invitation.venueName ?? undefined,
    venueAddress: invitation.venueAddress ?? undefined,
    venueLatitude: invitation.venueLatitude ?? undefined,
    venueLongitude: invitation.venueLongitude ?? undefined,
    rsvpDeadline,
    accentColor: invitation.accentColor ?? undefined,
    fontPairing: invitation.fontPairing ?? undefined,
    heroImageUrl: invitation.heroImageUrl ?? undefined,
    themeVariant: invitation.themeVariant ?? "light",
    backgroundColor: invitation.backgroundColor ?? undefined,
    decorativeElements: invitation.decorativeElements ?? undefined,
    scheduleBlocks: invitation.scheduleBlocks ?? [],
    notes: invitation.notes ?? [],
    galleryImages: invitation.galleryImages ?? [],
    guestGroups: [], // Guest groups loaded separately in GuestManagementSection
  };

  // Save handler that updates invitation via server function
  const handleSave = useCallback(async (data: InvitationData) => {
    await updateInvitation({
      data: {
        invitationId: data.id,
        partner1Name: data.partner1Name,
        partner2Name: data.partner2Name,
        weddingDate: data.weddingDate,
        weddingTime: data.weddingTime,
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        venueLatitude: data.venueLatitude,
        venueLongitude: data.venueLongitude,
        rsvpDeadline: data.rsvpDeadline,
        accentColor: data.accentColor,
        fontPairing: data.fontPairing,
        heroImageUrl: data.heroImageUrl,
        themeVariant: data.themeVariant,
        backgroundColor: data.backgroundColor,
        decorativeSettings: data.decorativeElements,
      },
    });
  }, []);

  return <InvitationBuilder initialData={initialData} onSave={handleSave} />;
}
