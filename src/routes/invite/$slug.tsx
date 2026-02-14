import {
	createFileRoute,
	type ErrorComponentProps,
	Link,
} from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getPublicInvitation } from "../../api/public";
import EnvelopeAnimation from "../../components/templates/EnvelopeAnimation";
import InvitationRenderer from "../../components/templates/InvitationRenderer";
import { buildSampleContent } from "../../data/sample-invitation";
import { useSubmitRsvp, useTrackView } from "../../hooks/useInvitations";
import { useAuth } from "../../lib/auth";
import { submitRsvp, trackInvitationView } from "../../lib/data";
import { useStore } from "../../lib/store";

function InviteErrorFallback({ reset }: ErrorComponentProps) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-dm-bg px-6">
			<div className="max-w-md text-center">
				<h1 className="font-heading text-2xl font-semibold text-dm-ink">
					Unable to load invitation
				</h1>
				<p className="mt-3 text-sm text-dm-muted">
					Something went wrong while loading this invitation. Please try again.
				</p>
				<div className="mt-6 flex justify-center gap-3">
					<button
						type="button"
						onClick={reset}
						className="rounded-full bg-dm-accent-strong px-6 py-2 text-xs uppercase tracking-[0.2em] text-dm-on-accent"
					>
						Try Again
					</button>
					<Link
						to="/"
						className="rounded-full border border-dm-border px-6 py-2 text-xs uppercase tracking-[0.2em] text-dm-ink"
					>
						Go Home
					</Link>
				</div>
			</div>
		</div>
	);
}

function InviteLoadingState() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-[color:var(--dm-bg)]">
			<div className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--dm-accent-strong)] border-t-transparent" />
			<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-muted)]">
				Loading invitation...
			</p>
		</div>
	);
}

const TEMPLATE_NAMES = new Set([
	"blush-romance",
	"garden-romance",
	"eternal-elegance",
	"love-at-dusk",
]);

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

function parseCoupleNames(slug: string): string {
	const cleaned = slug.replace(/-sample$/, "");
	const parts = cleaned.split("-").filter(Boolean);

	const nameparts: string[] = [];
	for (const part of parts) {
		if (TEMPLATE_NAMES.has(parts.slice(parts.indexOf(part)).join("-"))) break;
		nameparts.push(part);
	}

	if (nameparts.length >= 3) {
		const mid = nameparts.indexOf("and");
		if (mid > 0 && mid < nameparts.length - 1) {
			const first = nameparts.slice(0, mid).map(capitalize).join(" ");
			const second = nameparts
				.slice(mid + 1)
				.map(capitalize)
				.join(" ");
			return `${first} & ${second}`;
		}
	}

	if (nameparts.length >= 2) {
		return `${capitalize(nameparts[0])} & ${capitalize(nameparts[nameparts.length - 1])}`;
	}
	return "Wedding Invitation";
}

export const Route = createFileRoute("/invite/$slug")({
	component: InviteScreen,
	// @ts-expect-error ServerFn inference mismatch with route loader return type
	loader: async ({ params }) => {
		if (params.slug.endsWith("-sample"))
			return { invitation: null, errorReason: null };
		try {
			const result = await getPublicInvitation({
				data: { slug: params.slug },
			});
			if (result && typeof result === "object" && "error" in result) {
				const reason =
					(result as { error: string }).error === "Invitation is not published"
						? "unpublished"
						: null;
				return { invitation: null, errorReason: reason };
			}
			return { invitation: result, errorReason: null };
		} catch {
			return { invitation: null, errorReason: null };
		}
	},
	head: ({ params }) => {
		const coupleNames = parseCoupleNames(params.slug);
		const title = `${coupleNames} | DreamMoments`;
		const description = `You're invited to celebrate the wedding of ${coupleNames}. View the invitation and RSVP.`;
		const baseUrl =
			typeof window !== "undefined"
				? window.location.origin
				: import.meta.env.VITE_PUBLIC_URL || "https://dreammoments.app";
		const ogImage = `${baseUrl}/og-default.jpg`;
		return {
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "website" },
				{ property: "og:image", content: ogImage },
				{ property: "og:image:width", content: "1200" },
				{ property: "og:image:height", content: "630" },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: ogImage },
			],
		};
	},
	pendingComponent: InviteLoadingState,
	errorComponent: InviteErrorFallback,
});

const lightTemplates = new Set([
	"garden-romance",
	"eternal-elegance",
	"blush-romance",
]);

function resolveSampleTemplate(slug: string) {
	if (slug.includes("blush-romance")) return "blush-romance";
	if (slug.includes("garden-romance")) return "garden-romance";
	if (slug.includes("eternal-elegance")) return "eternal-elegance";
	return "love-at-dusk";
}

function InviteScreen() {
	const { slug } = Route.useParams();
	const { user } = useAuth();
	const loaderData = Route.useLoaderData() as
		| {
				invitation: Record<string, unknown> | null;
				errorReason?: string | null;
		  }
		| undefined;
	const storeInvitation = useStore((store) =>
		store.invitations.find((item) => item.slug === slug),
	);
	const invitation =
		storeInvitation ??
		(loaderData?.invitation as typeof storeInvitation) ??
		null;
	const [rsvpStatus, setRsvpStatus] = useState("");
	const handleEnvelopeComplete = useCallback(() => {}, []);
	const trackViewMutation = useTrackView();
	const submitRsvpMutation = useSubmitRsvp();

	const isSample = slug.endsWith("-sample");
	const notFound = !invitation && !isSample;
	const isUnpublished = loaderData?.errorReason === "unpublished";
	const templateId =
		(invitation?.templateSnapshot as { id?: string } | undefined)?.id ??
		invitation?.templateId ??
		resolveSampleTemplate(slug);
	const content = invitation?.content ?? buildSampleContent(templateId);

	// Fix 1: RSVP duplicate submission prevention
	const storageKey = invitation ? `rsvp_${invitation.id}` : "";
	const [alreadySubmitted, setAlreadySubmitted] = useState(() => {
		if (!storageKey) return false;
		try {
			return !!localStorage.getItem(storageKey);
		} catch {
			return false;
		}
	});

	const hiddenSections = useMemo(() => {
		if (!invitation?.sectionVisibility) return undefined;
		return Object.fromEntries(
			Object.entries(invitation.sectionVisibility).map(([key, value]) => [
				key,
				!value,
			]),
		);
	}, [invitation?.sectionVisibility]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: trackViewMutation intentionally excluded – fire once when invitation loads
	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!invitation) return;
		const visitorKey =
			localStorage.getItem("dm-visitor") ??
			`${Date.now()}-${Math.random().toString(36).slice(2)}`;
		localStorage.setItem("dm-visitor", visitorKey);
		// Track view via server mutation, fall back to local store
		trackViewMutation.mutate(
			{
				invitationId: invitation.id,
				userAgent: navigator.userAgent,
				referrer: document.referrer,
				visitorKey,
			},
			{
				onError: () => {
					trackInvitationView(
						invitation.id,
						navigator.userAgent,
						document.referrer,
					);
				},
			},
		);
	}, [invitation]);

	const headerLabel = useMemo(() => {
		if (!isSample)
			return `${content.hero.partnerOneName} & ${content.hero.partnerTwoName}`;
		const label = templateId
			.split("-")
			.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");
		return `${label} Sample Invitation`;
	}, [
		content.hero.partnerOneName,
		content.hero.partnerTwoName,
		isSample,
		templateId,
	]);

	const shellClass = lightTemplates.has(templateId)
		? "dm-shell-light"
		: "dm-shell-dark";

	const handleRsvpSubmit = useCallback(
		(payload: {
			name: string;
			attendance: "attending" | "not_attending" | "undecided";
			guestCount: number;
			dietaryRequirements?: string;
			message?: string;
			email?: string;
		}) => {
			if (!invitation || invitation.status !== "published") return;
			const visitorKey =
				localStorage.getItem("dm-visitor") ?? `${Date.now()}-${Math.random()}`;
			localStorage.setItem("dm-visitor", visitorKey);

			submitRsvpMutation.mutate(
				{
					invitationId: invitation.id,
					name: payload.name,
					attendance: payload.attendance,
					guestCount: payload.guestCount,
					dietaryRequirements: payload.dietaryRequirements,
					message: payload.message,
					email: payload.email,
					visitorKey,
				},
				{
					onSuccess: () => {
						setRsvpStatus("RSVP received. Thank you!");
						try {
							localStorage.setItem(
								storageKey,
								JSON.stringify({
									name: payload.name,
									attendance: payload.attendance,
									submittedAt: Date.now(),
								}),
							);
						} catch {}
						setAlreadySubmitted(true);
					},
					onError: () => {
						// Fall back to local store
						try {
							submitRsvp(invitation.id, payload, visitorKey);
							setRsvpStatus("RSVP received. Thank you!");
							try {
								localStorage.setItem(
									storageKey,
									JSON.stringify({
										name: payload.name,
										attendance: payload.attendance,
										submittedAt: Date.now(),
									}),
								);
							} catch {}
							setAlreadySubmitted(true);
						} catch {
							setRsvpStatus("RSVP limit reached. Please try again later.");
						}
					},
				},
			);
		},
		[invitation, storageKey, submitRsvpMutation],
	);

	if (notFound) {
		return (
			<div className="flex min-h-svh flex-col items-center justify-center gap-4 text-center p-6">
				<h1 className="font-display text-3xl font-bold text-[color:var(--dm-ink)]">
					{isUnpublished
						? "Invitation Not Yet Published"
						: "Invitation Not Found"}
				</h1>
				<p className="text-[color:var(--dm-muted)]">
					{isUnpublished
						? "This invitation is still being prepared. Please check back later."
						: "This invitation may have been removed or the link is incorrect."}
				</p>
				<Link
					to="/"
					className="rounded-full bg-[color:var(--dm-accent-strong)] px-6 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
				>
					Visit DreamMoments
				</Link>
			</div>
		);
	}

	return (
		<EnvelopeAnimation
			slug={slug}
			onComplete={handleEnvelopeComplete}
			coupleNames={`${content.hero.partnerOneName} & ${content.hero.partnerTwoName}`}
		>
			<div className={`min-h-screen ${shellClass}`}>
				{/* Fix 11: Only show header for sample invitations */}
				{isSample && (
					<header className="border-b border-[color:var(--dm-border)] px-6 py-6 text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
						<div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
							<p className="text-center">{headerLabel}</p>
							<Link
								to="/editor/new"
								search={{ template: templateId }}
								className="shrink-0 whitespace-nowrap rounded-full border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-4 py-2 text-[10px] font-semibold tracking-[0.22em] text-[color:var(--dm-accent-strong)]"
							>
								{user ? "Use template" : "Create yours"}
							</Link>
						</div>
					</header>
				)}
				<InvitationRenderer
					templateId={templateId}
					content={content}
					hiddenSections={hiddenSections}
					onRsvpSubmit={alreadySubmitted ? undefined : handleRsvpSubmit}
					rsvpStatus={
						alreadySubmitted
							? "You have already submitted your RSVP. Thank you!"
							: rsvpStatus
					}
				/>
			</div>
		</EnvelopeAnimation>
	);
}
