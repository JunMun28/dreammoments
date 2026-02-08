import { Link } from "@tanstack/react-router";
import {
	type CSSProperties,
	type KeyboardEvent,
	type MouseEvent,
	useMemo,
	useState,
} from "react";
import { useScrollReveal } from "../../../lib/scroll-effects";
import type { InvitationContent } from "../../../lib/types";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
import SectionShell from "../SectionShell";
import type { RsvpPayload, TemplateInvitationProps } from "../types";

type BlushRomanceInvitationProps = TemplateInvitationProps & {
	content: InvitationContent;
};

/* ─── Typography ─── */

const headingFont: CSSProperties = {
	fontFamily: "'Cormorant Garamond', serif",
};

const bodyFont: CSSProperties = {
	fontFamily: "'Lato', 'Manrope', sans-serif",
};

const accentFont: CSSProperties = {
	fontFamily: "'Sacramento', 'Cormorant Garamond', serif",
};

export default function BlushRomanceInvitation({
	content,
	hiddenSections,
	mode = "public",
	onSectionSelect,
	onAiClick,
	onInlineEdit,
	onRsvpSubmit,
	rsvpStatus,
}: BlushRomanceInvitationProps) {
	useScrollReveal();
	const data = useMemo(() => content, [content]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const parseAttendance = (
		value: FormDataEntryValue | null,
	): RsvpPayload["attendance"] => {
		const candidate = String(value ?? "attending");
		if (
			candidate === "attending" ||
			candidate === "not_attending" ||
			candidate === "undecided"
		) {
			return candidate;
		}
		return "attending";
	};
	const editableProps = (fieldPath: string, className: string) => ({
		onClick:
			mode === "editor"
				? (event: MouseEvent<HTMLElement>) =>
						onInlineEdit?.(fieldPath, event.currentTarget)
				: undefined,
		onKeyDown:
			mode === "editor"
				? (event: KeyboardEvent<HTMLElement>) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							onInlineEdit?.(fieldPath, event.currentTarget);
						}
					}
				: undefined,
		role: mode === "editor" ? "button" : undefined,
		tabIndex: mode === "editor" ? 0 : undefined,
		className: mode === "editor" ? `${className} dm-editable` : className,
	});

	return (
		<div className="blush-romance" style={bodyFont}>
			<SectionShell
				sectionId="hero"
				mode={mode}
				hidden={hiddenSections?.hero}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="blush-section blush-hero"
			>
				<div className="blush-hero-frame" />
				<div className="blush-hero-bloom" />
				<div
					className="blush-hero-corner blush-hero-corner-tl"
					aria-hidden="true"
				/>
				<div
					className="blush-hero-corner blush-hero-corner-tr"
					aria-hidden="true"
				/>
				<div
					className="blush-hero-corner blush-hero-corner-bl"
					aria-hidden="true"
				/>
				<div
					className="blush-hero-corner blush-hero-corner-br"
					aria-hidden="true"
				/>
				<div className="mx-auto flex max-w-4xl flex-col items-center text-center">
					<p className="blush-kicker" style={bodyFont}>
						Blush Romance
					</p>
					<h1
						data-reveal
						style={headingFont}
						{...editableProps("hero.partnerOneName", "dm-reveal blush-title")}
					>
						{data.hero.partnerOneName}{" "}
						<span className="blush-ampersand">&amp;</span>{" "}
						{data.hero.partnerTwoName}
					</h1>
					<p
						data-reveal
						style={accentFont}
						{...editableProps("hero.tagline", "dm-reveal blush-tagline")}
					>
						{data.hero.tagline}
					</p>
					<div
						data-reveal
						className="dm-reveal blush-pill-row"
						style={bodyFont}
					>
						<span>{data.hero.date}</span>
						<span className="blush-pill-dot" aria-hidden="true" />
						<span>{data.venue.name}</span>
					</div>
				</div>
			</SectionShell>

			<div className="blush-floral-divider" aria-hidden="true">
				<svg viewBox="0 0 200 24" className="blush-floral-svg">
					<title>Decorative divider</title>
					<path
						d="M0 12 Q50 0 100 12 Q150 24 200 12"
						fill="none"
						stroke="currentColor"
						strokeWidth="0.5"
					/>
					<circle cx="100" cy="12" r="3" fill="currentColor" />
					<circle cx="80" cy="10" r="1.5" fill="currentColor" opacity="0.5" />
					<circle cx="120" cy="14" r="1.5" fill="currentColor" opacity="0.5" />
				</svg>
			</div>

			<SectionShell
				sectionId="announcement"
				mode={mode}
				hidden={hiddenSections?.announcement}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="blush-section"
			>
				<div className="mx-auto max-w-3xl text-center">
					<p className="blush-kicker" style={bodyFont}>
						Invitation
					</p>
					<h2
						data-reveal
						style={headingFont}
						{...editableProps("announcement.title", "dm-reveal blush-heading")}
					>
						{data.announcement.title}
					</h2>
					<p
						data-reveal
						style={bodyFont}
						{...editableProps("announcement.message", "dm-reveal blush-body")}
					>
						{data.announcement.message}
					</p>
					<p data-reveal className="dm-reveal blush-subtext" style={bodyFont}>
						{data.announcement.formalText}
					</p>
				</div>
			</SectionShell>

			<div className="blush-floral-divider" aria-hidden="true">
				<svg viewBox="0 0 200 24" className="blush-floral-svg">
					<title>Decorative divider</title>
					<path
						d="M0 12 Q50 0 100 12 Q150 24 200 12"
						fill="none"
						stroke="currentColor"
						strokeWidth="0.5"
					/>
					<circle cx="100" cy="12" r="3" fill="currentColor" />
					<circle cx="80" cy="10" r="1.5" fill="currentColor" opacity="0.5" />
					<circle cx="120" cy="14" r="1.5" fill="currentColor" opacity="0.5" />
				</svg>
			</div>

			<SectionShell
				sectionId="story"
				mode={mode}
				hidden={hiddenSections?.story}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="blush-section blush-panel"
			>
				<div className="mx-auto max-w-4xl">
					<p className="blush-kicker blush-kicker-sage" style={bodyFont}>
						Our Story
					</p>
					<div className="mt-6 grid gap-5">
						{data.story.milestones.map((milestone, index) => (
							<div
								key={`${milestone.date}-${milestone.title}`}
								data-reveal
								style={{ transitionDelay: `${index * 90}ms` }}
								className="dm-reveal blush-card blush-card-accent"
							>
								<p className="blush-meta">{milestone.date}</p>
								<p className="blush-heading" style={headingFont}>
									{milestone.title}
								</p>
								<p className="blush-body" style={bodyFont}>
									{milestone.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="gallery"
				mode={mode}
				hidden={hiddenSections?.gallery}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="blush-section"
			>
				<div className="mx-auto max-w-5xl">
					<p className="blush-kicker">Gallery</p>
					<div className="mt-6 grid gap-4 md:grid-cols-3">
						{data.gallery.photos.map((photo, index) => (
							<div
								key={`${photo.url ?? "photo"}-${photo.caption ?? "Moment"}`}
								data-reveal
								style={{ transitionDelay: `${index * 70}ms` }}
								className="dm-reveal blush-photo"
							>
								<img
									src={photo.url || "/placeholders/photo-light.svg"}
									alt={photo.caption || "Wedding photo"}
									loading="lazy"
									width={360}
									height={140}
									className="blush-photo-frame w-full object-cover"
								/>
								<p className="blush-meta">{photo.caption ?? "Moment"}</p>
							</div>
						))}
					</div>
				</div>
			</SectionShell>

			<div className="blush-floral-divider" aria-hidden="true">
				<svg viewBox="0 0 200 24" className="blush-floral-svg">
					<title>Decorative divider</title>
					<path
						d="M0 12 Q50 0 100 12 Q150 24 200 12"
						fill="none"
						stroke="currentColor"
						strokeWidth="0.5"
					/>
					<circle cx="100" cy="12" r="3" fill="currentColor" />
					<circle cx="80" cy="10" r="1.5" fill="currentColor" opacity="0.5" />
					<circle cx="120" cy="14" r="1.5" fill="currentColor" opacity="0.5" />
				</svg>
			</div>

			<SectionShell
				sectionId="schedule"
				mode={mode}
				hidden={hiddenSections?.schedule}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="blush-section blush-panel-sage"
			>
				<div className="mx-auto max-w-4xl">
					<p className="blush-kicker blush-kicker-sage" style={bodyFont}>
						Schedule
					</p>
					<div className="mt-6 grid gap-4">
						{data.schedule.events.map((event, index) => (
							<div
								key={`${event.time}-${event.title}`}
								data-reveal
								style={{ transitionDelay: `${index * 60}ms` }}
								className="dm-reveal blush-timeline"
							>
								<p className="blush-meta">{event.time}</p>
								<p className="blush-heading" style={headingFont}>
									{event.title}
								</p>
								<p className="blush-body" style={bodyFont}>
									{event.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="venue"
				mode={mode}
				hidden={hiddenSections?.venue}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="blush-section"
			>
				<div className="mx-auto max-w-5xl blush-venue">
					<div>
						<p className="blush-kicker" style={bodyFont}>
							Venue
						</p>
						<h3
							style={headingFont}
							{...editableProps("venue.name", "blush-heading")}
						>
							{data.venue.name}
						</h3>
						<p
							style={bodyFont}
							{...editableProps("venue.address", "blush-body")}
						>
							{data.venue.address}
						</p>
						<p
							style={bodyFont}
							{...editableProps("venue.directions", "blush-subtext")}
						>
							{data.venue.directions}
						</p>
					</div>
					<div className="blush-map">
						<img
							src="/placeholders/photo-light.svg"
							alt={`Map showing location of ${data.venue.name}`}
							loading="lazy"
							width={800}
							height={450}
						/>
					</div>
				</div>
			</SectionShell>

			<div className="blush-floral-divider" aria-hidden="true">
				<svg viewBox="0 0 200 24" className="blush-floral-svg">
					<title>Decorative divider</title>
					<path
						d="M0 12 Q50 0 100 12 Q150 24 200 12"
						fill="none"
						stroke="currentColor"
						strokeWidth="0.5"
					/>
					<circle cx="100" cy="12" r="3" fill="currentColor" />
					<circle cx="80" cy="10" r="1.5" fill="currentColor" opacity="0.5" />
					<circle cx="120" cy="14" r="1.5" fill="currentColor" opacity="0.5" />
				</svg>
			</div>

			<SectionShell
				sectionId="rsvp"
				mode={mode}
				hidden={hiddenSections?.rsvp}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="blush-section blush-panel"
			>
				<div className="mx-auto max-w-3xl">
					<p className="blush-kicker" style={bodyFont}>
						RSVP
					</p>
					<form
						className="mt-6 blush-form"
						noValidate
						onSubmit={async (event) => {
							event.preventDefault();
							if (!onRsvpSubmit || isSubmitting) return;
							setIsSubmitting(true);
							try {
								const formData = new FormData(event.currentTarget);
								await onRsvpSubmit({
									name: String(formData.get("name") ?? ""),
									attendance: parseAttendance(formData.get("attendance")),
									guestCount: Number(formData.get("guestCount") ?? 1),
									dietaryRequirements: String(formData.get("dietary") ?? ""),
									message: String(formData.get("message") ?? ""),
									email: String(formData.get("email") ?? ""),
								});
							} finally {
								setIsSubmitting(false);
							}
						}}
					>
						<label className="grid gap-1.5 text-xs uppercase tracking-[0.15em] text-[color:var(--dm-muted)]">
							Name
							<input
								name="name"
								placeholder="Rachel Lim…"
								autoComplete="off"
								required
								aria-required="true"
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-peach)]/30"
							/>
						</label>
						<label className="grid gap-1.5 text-xs uppercase tracking-[0.15em] text-[color:var(--dm-muted)]">
							Attendance
							<select
								name="attendance"
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-peach)]/30"
							>
								<option value="attending">Attending</option>
								<option value="not_attending">Not Attending</option>
								<option value="undecided">Undecided</option>
							</select>
						</label>
						<label className="grid gap-1.5 text-xs uppercase tracking-[0.15em] text-[color:var(--dm-muted)]">
							Email
							<input
								name="email"
								placeholder="rachel@example.com…"
								type="email"
								autoComplete="off"
								spellCheck={false}
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-peach)]/30"
							/>
						</label>
						<label className="grid gap-1.5 text-xs uppercase tracking-[0.15em] text-[color:var(--dm-muted)]">
							Guest count
							<input
								name="guestCount"
								placeholder="2…"
								type="number"
								min={1}
								inputMode="numeric"
								autoComplete="off"
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-peach)]/30"
							/>
						</label>
						<label className="grid gap-1.5 text-xs uppercase tracking-[0.15em] text-[color:var(--dm-muted)]">
							Dietary requirements
							<input
								name="dietary"
								placeholder="Vegetarian, no pork…"
								autoComplete="off"
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-peach)]/30"
							/>
						</label>
						<label className="grid gap-1.5 text-xs uppercase tracking-[0.15em] text-[color:var(--dm-muted)]">
							Message
							<textarea
								name="message"
								placeholder="Can't wait to celebrate with you…"
								autoComplete="off"
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-peach)]/30"
							/>
						</label>
						<label className="blush-consent">
							<input
								type="checkbox"
								name="consent"
								required
								aria-describedby="consent-description"
							/>
							<span id="consent-description">
								I consent to the collection of my personal data as described in
								the{" "}
								<Link
									to="/privacy"
									className="blush-consent-link"
									target="_blank"
									rel="noopener noreferrer"
								>
									Privacy Policy
								</Link>
							</span>
						</label>
						{rsvpStatus ? (
							<output className="blush-meta" aria-live="polite">
								{rsvpStatus}
							</output>
						) : null}
						<button
							type="submit"
							disabled={isSubmitting}
							className="inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
						>
							{isSubmitting && <LoadingSpinner size="sm" />}
							{isSubmitting ? "Sending..." : "Send RSVP"}
						</button>
					</form>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="faq"
				mode={mode}
				hidden={hiddenSections?.faq}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="blush-section"
			>
				<div className="mx-auto max-w-4xl">
					<p className="blush-kicker" style={bodyFont}>
						FAQ
					</p>
					<div className="mt-6 grid gap-4">
						{data.faq.items.map((item, index) => (
							<div
								key={item.question}
								data-reveal
								style={{ transitionDelay: `${index * 70}ms` }}
								className="dm-reveal blush-faq"
							>
								<p className="blush-heading" style={headingFont}>
									{item.question}
								</p>
								<p className="blush-body" style={bodyFont}>
									{item.answer}
								</p>
							</div>
						))}
					</div>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="footer"
				mode={mode}
				hidden={hiddenSections?.footer}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="blush-section blush-footer"
			>
				<div className="mx-auto max-w-3xl text-center">
					<p
						data-reveal
						style={bodyFont}
						{...editableProps("footer.message", "dm-reveal blush-body")}
					>
						{data.footer.message}
					</p>
				</div>
			</SectionShell>
		</div>
	);
}
