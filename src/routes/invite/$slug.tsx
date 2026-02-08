import {
	createFileRoute,
	type ErrorComponentProps,
	Link,
} from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import InvitationRenderer from "../../components/templates/InvitationRenderer";
import { buildSampleContent } from "../../data/sample-invitation";
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

function parseCoupleNames(slug: string): string {
	const cleaned = slug
		.replace(/-sample$/, "")
		.replace(
			/-(blush-romance|garden-romance|eternal-elegance|love-at-dusk)$/,
			"",
		);
	const parts = cleaned.split("-").filter(Boolean);
	if (parts.length >= 2) {
		const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
		return `${capitalize(parts[0])} & ${capitalize(parts[parts.length - 1])}`;
	}
	return "Wedding Invitation";
}

export const Route = createFileRoute("/invite/$slug")({
	component: InviteScreen,
	head: ({ params }) => {
		const coupleNames = parseCoupleNames(params.slug);
		const title = `${coupleNames} | DreamMoments`;
		const description = `You're invited to celebrate the wedding of ${coupleNames}. View the invitation and RSVP.`;
		const ogImage = `/api/og/${encodeURIComponent(params.slug)}`;
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
	errorComponent: InviteErrorFallback,
});

const lightTemplates = new Set([
	"garden-romance",
	"eternal-elegance",
	"blush-romance",
]);

function formatTemplateName(templateId: string) {
	return templateId
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function resolveSampleTemplate(slug: string) {
	if (slug.includes("blush-romance")) return "blush-romance";
	if (slug.includes("garden-romance")) return "garden-romance";
	if (slug.includes("eternal-elegance")) return "eternal-elegance";
	return "love-at-dusk";
}

export function InviteScreen() {
	const { slug } = Route.useParams();
	const { user } = useAuth();
	const invitation = useStore((store) =>
		store.invitations.find((item) => item.slug === slug),
	);
	const [rsvpStatus, setRsvpStatus] = useState("");
	const isSample = slug.endsWith("-sample") || !invitation;
	const templateId =
		(invitation?.templateSnapshot as { id?: string } | undefined)?.id ??
		invitation?.templateId ??
		resolveSampleTemplate(slug);
	const content = invitation?.content ?? buildSampleContent(templateId);
	const hiddenSections = useMemo(() => {
		if (!invitation?.sectionVisibility) return undefined;
		return Object.fromEntries(
			Object.entries(invitation.sectionVisibility).map(([key, value]) => [
				key,
				!value,
			]),
		);
	}, [invitation?.sectionVisibility]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!invitation) return;
		trackInvitationView(invitation.id, navigator.userAgent, document.referrer);
	}, [invitation]);

	const templateLabel = useMemo(
		() => formatTemplateName(templateId),
		[templateId],
	);
	const headerLabel = useMemo(() => {
		if (isSample) return `${templateLabel} Sample Invitation`;
		return `${content.hero.partnerOneName} & ${content.hero.partnerTwoName}`;
	}, [
		content.hero.partnerOneName,
		content.hero.partnerTwoName,
		isSample,
		templateLabel,
	]);
	const shellClass = lightTemplates.has(templateId)
		? "dm-shell-light"
		: "dm-shell-dark";

	const handleRsvpSubmit = (payload: {
		name: string;
		attendance: "attending" | "not_attending" | "undecided";
		guestCount: number;
		dietaryRequirements?: string;
		message?: string;
		email?: string;
	}) => {
		if (!invitation) return;
		try {
			const visitorKey =
				localStorage.getItem("dm-visitor") ?? `${Date.now()}-${Math.random()}`;
			localStorage.setItem("dm-visitor", visitorKey);
			submitRsvp(invitation.id, payload, visitorKey);
			setRsvpStatus("RSVP received. Thank you!");
		} catch {
			setRsvpStatus("RSVP limit reached. Please try again later.");
		}
	};

	return (
		<div className={`min-h-screen ${shellClass}`}>
			<header className="border-b border-[color:var(--dm-border)] px-6 py-6 text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
					<p className="text-center">{headerLabel}</p>
					{isSample ? (
						<Link
							to="/editor/new"
							search={{ template: templateId }}
							className="rounded-full border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-4 py-2 text-[10px] font-semibold tracking-[0.22em] text-[color:var(--dm-accent-strong)]"
						>
							{user ? "Use this template" : "Create your own"}
						</Link>
					) : null}
				</div>
			</header>
			<InvitationRenderer
				templateId={templateId}
				content={content}
				hiddenSections={hiddenSections}
				onRsvpSubmit={handleRsvpSubmit}
				rsvpStatus={rsvpStatus}
			/>
		</div>
	);
}
