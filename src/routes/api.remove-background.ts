import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

export const Route = createFileRoute("/api/remove-background")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const formData = await request.formData();
          const image = formData.get("image") as Blob | null;
          const invitationId = formData.get("invitationId") as string | null;

          if (!image || !invitationId) {
            return json(
              { error: "Missing required fields: image and invitationId" },
              { status: 400 },
            );
          }

          // Verify user owns the invitation
          const {
            verifyInvitationOwnership,
            AuthenticationError,
            AuthorizationError,
          } = await import("@/lib/auth-helpers");
          try {
            await verifyInvitationOwnership(invitationId);
          } catch (error) {
            if (error instanceof AuthenticationError) {
              return json(
                { error: "Authentication required" },
                { status: 401 },
              );
            }
            if (error instanceof AuthorizationError) {
              return json({ error: "Access denied" }, { status: 403 });
            }
            throw error;
          }

          // Validate image type
          if (!image.type.startsWith("image/")) {
            return json({ error: "Invalid file type" }, { status: 400 });
          }

          // Check if background removal is available
          const { isBackgroundRemovalAvailable, removeBackground } =
            await import("@/lib/background-removal");

          if (!isBackgroundRemovalAvailable()) {
            return json(
              {
                error:
                  "Background removal is not configured. Please set FAL_KEY environment variable.",
              },
              { status: 503 },
            );
          }

          // Convert blob to array buffer
          const imageBuffer = await image.arrayBuffer();

          // Process the image
          const result = await removeBackground(imageBuffer);

          if (!result.success) {
            return json(
              { error: result.error || "Background removal failed" },
              { status: 500 },
            );
          }

          return json({
            success: true,
            imageUrl: result.imageUrl,
            provider: "fal.ai",
          });
        } catch (error) {
          console.error("Background removal error:", error);
          return json({ error: "Background removal failed" }, { status: 500 });
        }
      },

      GET: async () => {
        // Check if background removal is available
        const { isBackgroundRemovalAvailable, getBackgroundRemovalProvider } =
          await import("@/lib/background-removal");

        return json({
          available: isBackgroundRemovalAvailable(),
          provider: getBackgroundRemovalProvider(),
        });
      },
    },
  },
});
