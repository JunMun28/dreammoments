import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listGuestsFn, submitRsvpFn } from "@/api/guests";
import {
	deleteInvitationFn,
	getInvitation,
	getInvitations,
	publishInvitationFn,
	unpublishInvitationFn,
} from "@/api/invitations";
import { trackViewFn } from "@/api/public";
import type { Invitation } from "@/lib/types";

const TOKEN_KEY = "dm-auth-token";

function getToken(): string | null {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(TOKEN_KEY);
}

// ── Query keys ──────────────────────────────────────────────────────

export const invitationKeys = {
	all: ["invitations"] as const,
	detail: (id: string) => ["invitations", id] as const,
	guests: (invitationId: string) => ["guests", invitationId] as const,
};

// ── Queries ─────────────────────────────────────────────────────────

export function useInvitations() {
	const token = getToken();
	return useQuery({
		queryKey: invitationKeys.all,
		queryFn: async () => {
			if (!token) return [];
			const result = await getInvitations({ data: { token } });
			if (
				result &&
				typeof result === "object" &&
				!Array.isArray(result) &&
				"error" in result
			)
				return [];
			return result as Invitation[];
		},
		enabled: !!token,
	});
}

export function useInvitation(id: string) {
	const token = getToken();
	return useQuery({
		queryKey: invitationKeys.detail(id),
		queryFn: async () => {
			if (!token) return null;
			const result = await getInvitation({
				data: { invitationId: id, token },
			});
			if (result && typeof result === "object" && "error" in result)
				return null;
			return result as Invitation;
		},
		enabled: !!token && !!id,
	});
}

export function useGuests(invitationId: string) {
	const token = getToken();
	return useQuery({
		queryKey: invitationKeys.guests(invitationId),
		queryFn: async () => {
			if (!token) return [];
			const result = await listGuestsFn({
				data: { invitationId, token },
			});
			if (result && "error" in result) return [];
			return result as Array<{
				id: string;
				invitationId: string;
				name: string;
				email?: string;
				phone?: string;
				relationship?: string;
				attendance?: "attending" | "not_attending" | "undecided";
				guestCount: number;
				dietaryRequirements?: string;
				message?: string;
				visitorKey?: string;
				createdAt: string;
				updatedAt: string;
			}>;
		},
		enabled: !!token && !!invitationId,
	});
}

// ── Mutations ───────────────────────────────────────────────────────

export function useDeleteInvitation() {
	const queryClient = useQueryClient();
	const token = getToken();

	return useMutation({
		mutationFn: async (invitationId: string) => {
			if (!token) throw new Error("Not authenticated");
			const result = await deleteInvitationFn({
				data: { invitationId, token },
			});
			if (result && "error" in result)
				throw new Error((result as { error: string }).error);
			return result;
		},
		onMutate: async (invitationId) => {
			await queryClient.cancelQueries({
				queryKey: invitationKeys.all,
			});
			const previous = queryClient.getQueryData<Invitation[]>(
				invitationKeys.all,
			);
			queryClient.setQueryData<Invitation[]>(invitationKeys.all, (old) =>
				old ? old.filter((inv) => inv.id !== invitationId) : [],
			);
			return { previous };
		},
		onError: (_err, _id, context) => {
			if (context?.previous) {
				queryClient.setQueryData(invitationKeys.all, context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: invitationKeys.all });
		},
	});
}

export function usePublishInvitation() {
	const queryClient = useQueryClient();
	const token = getToken();

	return useMutation({
		mutationFn: async ({
			invitationId,
			slug,
		}: {
			invitationId: string;
			slug?: string;
		}) => {
			if (!token) throw new Error("Not authenticated");
			const result = await publishInvitationFn({
				data: { invitationId, token, slug },
			});
			if (result && typeof result === "object" && "error" in result)
				throw new Error((result as { error: string }).error);
			return result as Invitation;
		},
		onSettled: (_data, _err, variables) => {
			queryClient.invalidateQueries({ queryKey: invitationKeys.all });
			queryClient.invalidateQueries({
				queryKey: invitationKeys.detail(variables.invitationId),
			});
		},
	});
}

export function useUnpublishInvitation() {
	const queryClient = useQueryClient();
	const token = getToken();

	return useMutation({
		mutationFn: async (invitationId: string) => {
			if (!token) throw new Error("Not authenticated");
			const result = await unpublishInvitationFn({
				data: { invitationId, token },
			});
			if (result && typeof result === "object" && "error" in result)
				throw new Error((result as { error: string }).error);
			return result as Invitation;
		},
		onSettled: (_data, _err, invitationId) => {
			queryClient.invalidateQueries({ queryKey: invitationKeys.all });
			queryClient.invalidateQueries({
				queryKey: invitationKeys.detail(invitationId),
			});
		},
	});
}

export function useSubmitRsvp() {
	return useMutation({
		mutationFn: async (payload: {
			invitationId: string;
			name: string;
			email?: string;
			phone?: string;
			relationship?: string;
			attendance?: "attending" | "not_attending" | "undecided";
			guestCount?: number;
			dietaryRequirements?: string;
			message?: string;
			visitorKey: string;
		}) => {
			const result = await submitRsvpFn({ data: payload });
			if (result && "error" in result)
				throw new Error((result as { error: string }).error);
			return result;
		},
	});
}

export function useTrackView() {
	return useMutation({
		mutationFn: async (payload: {
			invitationId: string;
			userAgent?: string;
			referrer?: string;
		}) => {
			const result = await trackViewFn({ data: payload });
			if (result && "error" in result)
				throw new Error((result as { error: string }).error);
			return result;
		},
	});
}
