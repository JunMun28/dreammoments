import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnalyticsPanel } from "../../../components/dashboard/AnalyticsPanel";
import ShareModal from "../../../components/share/ShareModal";
import { RouteErrorFallback } from "../../../components/ui/RouteErrorFallback";
import { RouteLoadingSpinner } from "../../../components/ui/RouteLoadingSpinner";
import { useToast } from "../../../components/ui/Toast";
import {
	useInvitation,
	usePublishInvitation,
	useGuests as useServerGuests,
	useUnpublishInvitation,
} from "../../../hooks/useInvitations";
import { useAuth } from "../../../lib/auth";
import {
	addGuest,
	exportGuestsCsv,
	getDietarySummary,
	importGuests,
	setInvitationSlug,
} from "../../../lib/data";
import { useStore } from "../../../lib/store";
import type {
	AttendanceStatus,
	Invitation,
	InvitationStatus,
} from "../../../lib/types";

export const Route = createFileRoute("/dashboard/$invitationId/")({
	component: InvitationDashboard,
	pendingComponent: RouteLoadingSpinner,
	errorComponent: RouteErrorFallback,
});

type CsvMapping = {
	name?: string;
	email?: string;
	relationship?: string;
};

type ImportStep = "idle" | "preview" | "mapping" | "importing";

const COMMON_NAME_COLUMNS = [
	"name",
	"full name",
	"fullname",
	"guest name",
	"guest",
	"nama",
];
const COMMON_EMAIL_COLUMNS = ["email", "e-mail", "email address", "mail"];
const COMMON_RELATIONSHIP_COLUMNS = [
	"relationship",
	"relation",
	"group",
	"category",
	"type",
];

function autoDetectMapping(headers: string[]): CsvMapping {
	const mapping: CsvMapping = {};
	const lower = headers.map((h) => h.toLowerCase().trim());

	for (let i = 0; i < lower.length; i++) {
		if (!mapping.name && COMMON_NAME_COLUMNS.includes(lower[i])) {
			mapping.name = headers[i];
		}
		if (!mapping.email && COMMON_EMAIL_COLUMNS.includes(lower[i])) {
			mapping.email = headers[i];
		}
		if (
			!mapping.relationship &&
			COMMON_RELATIONSHIP_COLUMNS.includes(lower[i])
		) {
			mapping.relationship = headers[i];
		}
	}
	return mapping;
}

function parseCsv(text: string) {
	const [headerLine, ...rows] = text.split(/\r?\n/).filter(Boolean);
	const headers = headerLine
		.split(",")
		.map((item) => item.trim().replace(/^"|"$/g, ""));
	return rows.map((row) => {
		const values = row
			.split(",")
			.map((item) => item.trim().replace(/^"|"$/g, ""));
		return Object.fromEntries(
			headers.map((header, index) => [header, values[index] ?? ""]),
		);
	});
}

function downloadCsv(name: string, content: string) {
	const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = name;
	link.click();
	URL.revokeObjectURL(url);
}

const filterOptions: Array<{
	value: AttendanceStatus | "pending" | "all";
	label: string;
}> = [
	{ value: "all", label: "All" },
	{ value: "attending", label: "Attending" },
	{ value: "not_attending", label: "Not Attending" },
	{ value: "pending", label: "Pending" },
];

const attendanceLabels: Record<
	AttendanceStatus | "pending" | "undecided",
	string
> = {
	attending: "Attending",
	not_attending: "Not Attending",
	undecided: "Undecided",
	pending: "Pending",
};

const statusLabels: Record<InvitationStatus, string> = {
	draft: "Draft",
	published: "Published",
	archived: "Archived",
};

const fieldLabels: Record<keyof CsvMapping, string> = {
	name: "Name",
	email: "Email",
	relationship: "Relationship",
};

function ConfirmPublishDialog({
	action,
	publishing,
	onConfirm,
	onCancel,
}: {
	action: "publish" | "unpublish";
	publishing: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	const cancelRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		cancelRef.current?.focus();
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && !publishing) onCancel();
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onCancel, publishing]);

	return (
		<div
			className="dm-inline-edit"
			onPointerDown={(e) => {
				if (e.target === e.currentTarget && !publishing) onCancel();
			}}
			role="dialog"
			aria-modal="true"
			aria-label={`Confirm ${action}`}
		>
			<div className="w-full max-w-sm rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6 shadow-lg">
				<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
					{action === "publish" ? "Publish Invitation" : "Unpublish Invitation"}
				</p>
				<p className="mt-3 text-sm text-[color:var(--dm-ink)]">
					{action === "publish"
						? "Your invitation will be live and accessible via its public link. Continue?"
						: "Your invitation will no longer be accessible via its public link. Continue?"}
				</p>
				<div className="mt-5 flex gap-3">
					<button
						ref={cancelRef}
						type="button"
						className="flex-1 rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
						onClick={onCancel}
						disabled={publishing}
					>
						Cancel
					</button>
					<button
						type="button"
						className="flex-1 rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)] disabled:opacity-60"
						onClick={onConfirm}
						disabled={publishing}
					>
						{publishing
							? "Processing..."
							: action === "publish"
								? "Publish"
								: "Unpublish"}
					</button>
				</div>
			</div>
		</div>
	);
}

function InvitationDashboard() {
	const { invitationId } = Route.useParams();
	const { user, loading } = useAuth();
	const { addToast } = useToast();
	const { data: serverInvitation } = useInvitation(invitationId);
	const localInvitation = useStore((store) =>
		store.invitations.find((item) => item.id === invitationId),
	);
	const invitation = serverInvitation ?? localInvitation;
	const { data: serverGuests } = useServerGuests(invitationId);
	const localGuests = useStore((store) =>
		store.guests.filter((guest) => guest.invitationId === invitationId),
	);
	const guests = serverGuests ?? localGuests;
	const publishMutation = usePublishInvitation();
	const unpublishMutation = useUnpublishInvitation();
	const [filter, setFilter] = useState<AttendanceStatus | "pending" | "all">(
		"all",
	);
	const [search, setSearch] = useState("");
	const [shareOpen, setShareOpen] = useState(false);
	const [importRows, setImportRows] = useState<Record<string, string>[]>([]);
	const [importStep, setImportStep] = useState<ImportStep>("idle");
	const [mapping, setMapping] = useState<CsvMapping>({});
	const [manualGuest, setManualGuest] = useState({
		name: "",
		email: "",
		relationship: "",
	});
	const [guestError, setGuestError] = useState("");
	const [publishConfirm, setPublishConfirm] = useState<
		"publish" | "unpublish" | null
	>(null);
	const [publishing, setPublishing] = useState(false);
	const [slugValue, setSlugValue] = useState("");
	const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
	const [slugChecking, setSlugChecking] = useState(false);
	const slugTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const params = new URLSearchParams(window.location.search);
		const filterParam = params.get("filter");
		const queryParam = params.get("q");
		if (filterParam) setFilter(filterParam as typeof filter);
		if (queryParam) setSearch(queryParam);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const params = new URLSearchParams(window.location.search);
		if (filter && filter !== "all") params.set("filter", filter);
		else params.delete("filter");
		if (search) params.set("q", search);
		else params.delete("q");
		const next = params.toString();
		const url = next
			? `${window.location.pathname}?${next}`
			: window.location.pathname;
		window.history.replaceState(null, "", url);
	}, [filter, search]);

	// Initialize slug value from invitation
	useEffect(() => {
		if (invitation?.slug) {
			setSlugValue(invitation.slug);
		}
	}, [invitation?.slug]);

	// Debounced slug validation
	const validateSlug = useCallback(
		(value: string) => {
			if (slugTimerRef.current) clearTimeout(slugTimerRef.current);

			// Basic character validation: alphanumeric and hyphens only
			const isValidFormat = /^[a-z0-9-]*$/.test(value);
			if (!isValidFormat || !value) {
				setSlugAvailable(value ? false : null);
				setSlugChecking(false);
				return;
			}

			setSlugChecking(true);
			slugTimerRef.current = setTimeout(async () => {
				try {
					const token =
						typeof window !== "undefined"
							? window.localStorage.getItem("dm-auth-token")
							: null;
					if (!token) {
						setSlugChecking(false);
						return;
					}
					const { checkSlugAvailabilityFn } = await import(
						"../../../api/invitations"
					);
					const result = await checkSlugAvailabilityFn({
						data: { token, slug: value, invitationId },
					});
					setSlugAvailable(result.available);
				} catch {
					setSlugAvailable(null);
				} finally {
					setSlugChecking(false);
				}
			}, 500);
		},
		[invitationId],
	);

	const filteredGuests = useMemo(() => {
		let list = guests.filter((guest) => guest.invitationId === invitationId);
		if (filter && filter !== "all") {
			if (filter === "pending") {
				list = list.filter((guest) => !guest.attendance);
			} else {
				list = list.filter((guest) => guest.attendance === filter);
			}
		}
		if (search) {
			list = list.filter((guest) =>
				guest.name.toLowerCase().includes(search.toLowerCase()),
			);
		}
		return list;
	}, [filter, search, guests, invitationId]);

	const handlePublishConfirm = useCallback(async () => {
		if (!publishConfirm) return;
		setPublishing(true);
		try {
			if (publishConfirm === "publish") {
				await publishMutation.mutateAsync({ invitationId });
				addToast({ type: "success", message: "Invitation published" });
			} else {
				await unpublishMutation.mutateAsync(invitationId);
				addToast({ type: "success", message: "Invitation unpublished" });
			}
		} catch {
			addToast({
				type: "error",
				message: `Failed to ${publishConfirm} invitation. Please try again.`,
			});
		} finally {
			setPublishing(false);
			setPublishConfirm(null);
		}
	}, [
		publishConfirm,
		invitationId,
		addToast,
		publishMutation,
		unpublishMutation,
	]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: only fire once when invitation missing
	useEffect(() => {
		if (!invitation && !loading) {
			addToast({ type: "error", message: "Invitation not found" });
		}
	}, [!invitation, loading]);

	if (!user && !loading) return <Navigate to="/auth/login" />;

	if (loading) {
		return (
			<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-10">
				<div className="mx-auto max-w-6xl space-y-8">
					<div>
						<div className="mb-2 h-4 w-20 animate-pulse rounded bg-[color:var(--dm-border)]" />
						<div className="mb-2 h-8 w-48 animate-pulse rounded bg-[color:var(--dm-border)]" />
						<div className="h-4 w-64 animate-pulse rounded bg-[color:var(--dm-border)]" />
					</div>
					<div className="grid gap-4 lg:grid-cols-5">
						{[1, 2, 3, 4, 5].map((i) => (
							<div
								key={i}
								className="animate-pulse rounded-3xl border border-[color:var(--dm-border)] p-6"
							>
								<div className="mb-3 h-3 w-16 rounded bg-[color:var(--dm-border)]" />
								<div className="h-7 w-10 rounded bg-[color:var(--dm-border)]" />
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!user) return <Navigate to="/auth/login" />;
	if (!invitation) return <Navigate to="/dashboard" />;
	if (invitation.userId !== user.id) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
				<h1 className="font-display text-4xl font-bold text-[color:var(--dm-ink)]">
					Access Denied
				</h1>
				<p className="text-[color:var(--dm-muted)]">
					You don't have permission to view this invitation.
				</p>
				<Link
					to="/dashboard"
					className="rounded-full bg-[color:var(--dm-accent-strong)] px-6 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
				>
					Go to Dashboard
				</Link>
			</div>
		);
	}

	const totalGuests = guests.reduce((sum, guest) => sum + guest.guestCount, 0);
	const attending = guests.filter(
		(guest) => guest.attendance === "attending",
	).length;
	const pending = guests.filter((guest) => !guest.attendance).length;
	const dietary = getDietarySummary(invitationId);

	return (
		<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-10">
			<div className="mx-auto max-w-6xl space-y-10">
				{/* Breadcrumb */}
				<div className="mb-6">
					<Link
						to="/dashboard"
						className="inline-flex items-center gap-1.5 text-sm text-[color:var(--dm-muted)] hover:text-[color:var(--dm-ink)] transition-colors"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M19 12H5" />
							<path d="M12 19l-7-7 7-7" />
						</svg>
						Back to Dashboard
					</Link>
				</div>

				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
							Invitation Overview
						</p>
						<h1 className="mt-2 text-3xl font-semibold text-[color:var(--dm-ink)] break-words">
							{invitation.title}
						</h1>
						<p className="mt-2 text-sm text-[color:var(--dm-muted)] break-words">
							{invitation.slug}
						</p>
					</div>
					<div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em]">
						<Link
							to="/editor/canvas/$invitationId"
							params={{ invitationId }}
							className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-[color:var(--dm-ink)]"
						>
							Open Editor
						</Link>
						<button
							type="button"
							className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-[color:var(--dm-ink)]"
							onClick={() => setShareOpen(true)}
						>
							Share
						</button>
					</div>
				</div>

				<div className="grid gap-4 lg:grid-cols-5">
					{[
						{
							label: "Invited",
							value: invitation.invitedCount || guests.length,
						},
						{ label: "Responded", value: guests.length },
						{ label: "Total Guests", value: totalGuests },
						{ label: "Attending", value: attending },
						{ label: "Pending", value: pending },
					].map((stat) => (
						<div
							key={stat.label}
							className="rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6"
						>
							<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
								{stat.label}
							</p>
							<p className="mt-3 text-2xl font-semibold text-[color:var(--dm-ink)] tabular-nums">
								{stat.value}
							</p>
						</div>
					))}
				</div>

				<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6">
						<h2 className="text-xl font-semibold text-[color:var(--dm-ink)]">
							RSVP Management
						</h2>
						<div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em]">
							{filterOptions.map((option) => (
								<button
									key={option.value}
									type="button"
									className={`rounded-full px-3 py-2 transition-colors ${
										filter === option.value
											? "bg-[color:var(--dm-accent-strong)] text-[color:var(--dm-on-accent)]"
											: "border border-[color:var(--dm-border)] text-[color:var(--dm-ink)]"
									}`}
									onClick={() => setFilter(option.value)}
								>
									{option.label}
								</button>
							))}
							<input
								placeholder="Search Guest (e.g., Mei Lin)..."
								aria-label="Search Guest"
								name="guestSearch"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								className="h-10 flex-1 rounded-full border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 text-base text-[color:var(--dm-ink)]"
								autoComplete="off"
								type="search"
							/>
						</div>

						{/* Desktop table view */}
						<div className="mt-4 hidden overflow-auto rounded-2xl border border-[color:var(--dm-border)] md:block">
							<table className="w-full text-left text-xs text-[color:var(--dm-muted)] tabular-nums">
								<thead className="bg-[color:var(--dm-surface)] uppercase tracking-[0.2em]">
									<tr>
										<th className="px-4 py-3">Guest</th>
										<th className="px-4 py-3">Status</th>
										<th className="px-4 py-3">Count</th>
										<th className="px-4 py-3">Dietary</th>
										<th className="px-4 py-3">Message</th>
									</tr>
								</thead>
								<tbody>
									{filteredGuests.length === 0 && (
										<tr>
											<td
												colSpan={5}
												className="px-6 py-12 text-center text-[color:var(--dm-muted)]"
											>
												{guests.length === 0
													? "No guests yet. Share your invitation to start collecting RSVPs."
													: "No guests match the current filter."}
											</td>
										</tr>
									)}
									{filteredGuests.map((guest) => (
										<tr
											key={guest.id}
											className="border-t border-[color:var(--dm-border)]"
										>
											<td className="px-4 py-3">{guest.name}</td>
											<td className="px-4 py-3">
												{attendanceLabels[guest.attendance ?? "pending"]}
											</td>
											<td className="px-4 py-3">{guest.guestCount}</td>
											<td className="px-4 py-3">
												{guest.dietaryRequirements ?? "-"}
											</td>
											<td className="px-4 py-3">{guest.message ?? "-"}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile card view */}
						<div className="mt-4 space-y-3 md:hidden">
							{filteredGuests.length === 0 && (
								<div className="rounded-2xl border border-[color:var(--dm-border)] px-4 py-8 text-center text-sm text-[color:var(--dm-muted)]">
									{guests.length === 0
										? "No guests yet. Share your invitation to start collecting RSVPs."
										: "No guests match the current filter."}
								</div>
							)}
							{filteredGuests.map((guest) => (
								<div
									key={guest.id}
									className="rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4"
								>
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium text-[color:var(--dm-ink)]">
											{guest.name}
										</p>
										<span
											className={`rounded-full px-2 py-0.5 text-xs ${
												guest.attendance === "attending"
													? "bg-dm-success/10 text-dm-success"
													: guest.attendance === "not_attending"
														? "bg-dm-error/10 text-dm-error"
														: "bg-[color:var(--dm-border)] text-[color:var(--dm-muted)]"
											}`}
										>
											{attendanceLabels[guest.attendance ?? "pending"]}
										</span>
									</div>
									<p className="mt-1 text-xs text-[color:var(--dm-muted)]">
										Guests: {guest.guestCount}
									</p>
									{guest.dietaryRequirements && (
										<p className="mt-1 text-xs text-[color:var(--dm-muted)]">
											Dietary: {guest.dietaryRequirements}
										</p>
									)}
									{guest.message && (
										<p className="mt-1 text-xs text-[color:var(--dm-muted)]">
											{guest.message}
										</p>
									)}
								</div>
							))}
						</div>

						<div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em]">
							<button
								type="button"
								className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-[color:var(--dm-ink)]"
								onClick={() =>
									downloadCsv(
										`guests-${invitation.slug}.csv`,
										exportGuestsCsv(invitationId),
									)
								}
							>
								Export Guests CSV
							</button>
							{user.plan === "premium" ? (
								<label className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-[color:var(--dm-ink)]">
									Import Guests CSV
									<input
										type="file"
										accept=".csv"
										className="hidden"
										onChange={async (event) => {
											const file = event.target.files?.[0];
											if (!file) return;
											const text = await file.text();
											const rows = parseCsv(text);
											setImportRows(rows);
											if (rows.length > 0) {
												const headers = Object.keys(rows[0]);
												setMapping(autoDetectMapping(headers));
												setImportStep("preview");
											}
											// Reset input so same file can be re-selected
											event.target.value = "";
										}}
									/>
								</label>
							) : (
								<Link
									to="/upgrade"
									className="text-sm text-[color:var(--dm-accent-strong)] hover:underline"
								>
									Upgrade to import from CSV
								</Link>
							)}
						</div>

						{importRows.length > 0 && importStep !== "idle" ? (
							<div className="mt-4 space-y-4">
								{/* Progress indicator */}
								<div className="flex items-center gap-2 text-xs text-[color:var(--dm-muted)]">
									<span
										className={
											importStep === "preview"
												? "font-medium text-[color:var(--dm-accent-strong)]"
												: ""
										}
									>
										1. Preview
									</span>
									<span aria-hidden="true">-</span>
									<span
										className={
											importStep === "mapping" || importStep === "importing"
												? "font-medium text-[color:var(--dm-accent-strong)]"
												: ""
										}
									>
										2. Map Columns
									</span>
									<span aria-hidden="true">-</span>
									<span
										className={
											importStep === "importing"
												? "font-medium text-[color:var(--dm-accent-strong)]"
												: ""
										}
									>
										3. Import
									</span>
								</div>

								{/* Preview step */}
								{importStep === "preview" && (
									<div className="space-y-3">
										<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]">
											CSV Preview
										</p>
										<p className="text-xs text-[color:var(--dm-muted)]">
											{importRows.length} row
											{importRows.length !== 1 ? "s" : ""} found. Showing first{" "}
											{Math.min(3, importRows.length)}:
										</p>
										<div className="overflow-auto rounded-2xl border border-[color:var(--dm-border)]">
											<table className="w-full text-left text-xs text-[color:var(--dm-muted)]">
												<thead className="bg-[color:var(--dm-surface)] uppercase tracking-[0.2em]">
													<tr>
														{Object.keys(importRows[0]).map((header) => (
															<th
																key={header}
																className="px-3 py-2 whitespace-nowrap"
															>
																{header}
															</th>
														))}
													</tr>
												</thead>
												<tbody>
													{importRows.slice(0, 3).map((row, i) => (
														<tr
															key={i}
															className="border-t border-[color:var(--dm-border)]"
														>
															{Object.values(row).map((val, j) => (
																<td
																	key={j}
																	className="px-3 py-2 whitespace-nowrap"
																>
																	{val || "-"}
																</td>
															))}
														</tr>
													))}
												</tbody>
											</table>
										</div>
										<div className="flex gap-3">
											<button
												type="button"
												className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
												onClick={() => {
													setImportRows([]);
													setImportStep("idle");
													setMapping({});
												}}
											>
												Cancel
											</button>
											<button
												type="button"
												className="rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
												onClick={() => setImportStep("mapping")}
											>
												Continue to Mapping
											</button>
										</div>
									</div>
								)}

								{/* Mapping step */}
								{(importStep === "mapping" || importStep === "importing") && (
									<div className="space-y-3">
										<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]">
											Map Columns
										</p>
										<p className="text-xs text-[color:var(--dm-muted)]">
											Match each field to the corresponding column in your CSV.
											The Name field is required.
											{mapping.name
												? " Columns auto-detected from headers."
												: ""}
										</p>
										<div className="grid gap-3 sm:grid-cols-3">
											{["name", "email", "relationship"].map((field) => (
												<select
													key={field}
													value={mapping[field as keyof CsvMapping] ?? ""}
													onChange={(event) =>
														setMapping((prev) => ({
															...prev,
															[field]: event.target.value,
														}))
													}
													className="h-10 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-3 text-base text-[color:var(--dm-ink)]"
													disabled={importStep === "importing"}
												>
													<option value="">
														{fieldLabels[field as keyof CsvMapping]}
													</option>
													{Object.keys(importRows[0]).map((header) => (
														<option key={header} value={header}>
															{header}
														</option>
													))}
												</select>
											))}
										</div>
										<div className="flex gap-3">
											<button
												type="button"
												className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
												onClick={() => setImportStep("preview")}
												disabled={importStep === "importing"}
											>
												Back
											</button>
											<button
												type="button"
												className="rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)] disabled:opacity-60"
												disabled={importStep === "importing"}
												onClick={() => {
													setImportStep("importing");
													try {
														const existingNames = new Set(
															guests
																.filter((g) => g.invitationId === invitationId)
																.map((g) => g.name.toLowerCase()),
														);
														const mapped = importRows.map((row) => ({
															name: mapping.name ? row[mapping.name] : row.name,
															email: mapping.email
																? row[mapping.email]
																: row.email,
															relationship: mapping.relationship
																? row[mapping.relationship]
																: row.relationship,
														}));
														const unique = mapped.filter(
															(g) =>
																g.name &&
																!existingNames.has(g.name.toLowerCase()),
														);
														const duplicates = mapped.length - unique.length;
														importGuests(invitationId, unique);
														setImportRows([]);
														setImportStep("idle");
														setMapping({});
														const parts = [
															`Imported ${unique.length} guest${unique.length !== 1 ? "s" : ""}`,
														];
														if (duplicates > 0) {
															parts.push(
																`${duplicates} duplicate${duplicates !== 1 ? "s" : ""} skipped`,
															);
														}
														addToast({
															type: "success",
															message: `${parts.join(". ")}.`,
														});
													} catch {
														setImportStep("mapping");
														addToast({
															type: "error",
															message:
																"Failed to import guests. Please check your CSV format.",
														});
													}
												}}
											>
												{importStep === "importing"
													? "Importing..."
													: `Import ${importRows.length} Guest${importRows.length !== 1 ? "s" : ""}`}
											</button>
										</div>
									</div>
								)}
							</div>
						) : null}
					</div>

					<div className="space-y-6">
						<div className="rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6">
							<h3 className="text-sm uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
								Dietary Summary
							</h3>
							<div className="mt-4 space-y-2 text-sm text-[color:var(--dm-muted)]">
								{Object.entries(dietary.summary).map(([label, count]) => (
									<p key={label}>
										{label}: {count}
									</p>
								))}
								{dietary.notes.map((note) => (
									<p key={note}>{note}</p>
								))}
								{!Object.keys(dietary.summary).length &&
								!dietary.notes.length ? (
									<p>No dietary notes yet.</p>
								) : null}
							</div>
						</div>

						<div className="rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6">
							<h3 className="text-sm uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
								Add Guest
							</h3>
							<div className="mt-4 grid gap-3">
								<div>
									<input
										placeholder="Mei Lin..."
										aria-label="Guest Name"
										value={manualGuest.name}
										onChange={(event) => {
											setManualGuest((prev) => ({
												...prev,
												name: event.target.value,
											}));
											if (guestError) setGuestError("");
										}}
										className="h-10 w-full rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-3 text-base text-[color:var(--dm-ink)]"
										name="guestName"
										autoComplete="off"
									/>
									{guestError && (
										<p className="mt-1 text-xs text-dm-error">{guestError}</p>
									)}
								</div>
								<input
									placeholder="mei@example.com..."
									aria-label="Guest Email"
									value={manualGuest.email}
									onChange={(event) =>
										setManualGuest((prev) => ({
											...prev,
											email: event.target.value,
										}))
									}
									className="h-10 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-3 text-base text-[color:var(--dm-ink)]"
									name="guestEmail"
									autoComplete="off"
									spellCheck={false}
									type="email"
								/>
								<input
									placeholder="Cousin..."
									aria-label="Guest Relationship"
									value={manualGuest.relationship}
									onChange={(event) =>
										setManualGuest((prev) => ({
											...prev,
											relationship: event.target.value,
										}))
									}
									className="h-10 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-3 text-base text-[color:var(--dm-ink)]"
									name="guestRelationship"
									autoComplete="off"
								/>
								<button
									type="button"
									className="rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
									onClick={() => {
										if (!manualGuest.name.trim()) {
											setGuestError("Guest name is required");
											return;
										}
										setGuestError("");
										addGuest(invitationId, manualGuest);
										addToast({
											type: "success",
											message: `${manualGuest.name} added to guest list`,
										});
										setManualGuest({
											name: "",
											email: "",
											relationship: "",
										});
									}}
								>
									Add Guest
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					<div className="rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6">
						<AnalyticsPanel invitationId={invitationId} />
					</div>

					<div className="rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6">
						<h2 className="text-xl font-semibold text-[color:var(--dm-ink)]">
							Settings
						</h2>
						<p className="mt-2 text-sm text-[color:var(--dm-muted)]">
							Status: {statusLabels[invitation.status]}
						</p>
						<div className="mt-4 space-y-3">
							<label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
								Custom Slug (Premium)
								<div className="relative">
									<input
										value={slugValue}
										onChange={(event) => {
											const val = event.target.value.toLowerCase();
											setSlugValue(val);
											validateSlug(val);
										}}
										onBlur={() => {
											if (
												slugValue &&
												slugValue !== invitation.slug &&
												slugAvailable
											) {
												setInvitationSlug(invitationId, slugValue);
											}
										}}
										className="h-10 w-full rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-3 pr-8 text-base text-[color:var(--dm-ink)]"
										disabled={user.plan !== "premium"}
										autoComplete="off"
									/>
									{user.plan === "premium" &&
										slugValue &&
										slugValue !== invitation.slug && (
											<span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
												{slugChecking ? (
													<span className="text-[color:var(--dm-muted)]">
														...
													</span>
												) : slugAvailable === true ? (
													<span className="text-dm-success">&#10003;</span>
												) : slugAvailable === false ? (
													<span className="text-dm-error">&#10007;</span>
												) : null}
											</span>
										)}
								</div>
								{user.plan === "premium" &&
									slugValue &&
									!/^[a-z0-9-]*$/.test(slugValue) && (
										<p className="text-xs text-dm-error">
											Only lowercase letters, numbers, and hyphens are allowed.
										</p>
									)}
							</label>
							<div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em]">
								{invitation.status !== "published" ? (
									<button
										type="button"
										className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-[color:var(--dm-ink)]"
										onClick={() => setPublishConfirm("publish")}
									>
										Publish
									</button>
								) : (
									<button
										type="button"
										className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-[color:var(--dm-ink)]"
										onClick={() => setPublishConfirm("unpublish")}
									>
										Unpublish
									</button>
								)}
							</div>
							{user.plan !== "premium" ? (
								<p className="text-xs text-dm-error">Upgrade to edit slug.</p>
							) : null}
						</div>
					</div>
				</div>
			</div>

			<ShareModal
				open={shareOpen}
				invitation={invitation as Invitation}
				onClose={() => setShareOpen(false)}
			/>

			{publishConfirm && (
				<ConfirmPublishDialog
					action={publishConfirm}
					publishing={publishing}
					onConfirm={handlePublishConfirm}
					onCancel={() => setPublishConfirm(null)}
				/>
			)}
		</div>
	);
}
