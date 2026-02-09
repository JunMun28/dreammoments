import { Link } from "@tanstack/react-router";
import { type CSSProperties, useId, useState } from "react";
import { useScrollReveal } from "../../../lib/scroll-effects";
import { AddToCalendarButton } from "../../ui/AddToCalendarButton";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
import AngpowQRCode from "../AngpowQRCode";
import { Parallax, ParticleField } from "../animations";
import { CountdownWidget } from "../CountdownWidget";
import { makeEditableProps, parseAttendance } from "../helpers";
import {
	RsvpConfirmation,
	type RsvpConfirmationProps,
} from "../RsvpConfirmation";
import SectionShell from "../SectionShell";
import type { TemplateInvitationProps } from "../types";

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
}: TemplateInvitationProps) {
	useScrollReveal();
	const consentDescriptionId = useId();
	const data = content;
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [rsvpData, setRsvpData] = useState<Omit<
		RsvpConfirmationProps,
		"onEdit" | "className"
	> | null>(null);
	const editableProps = makeEditableProps(mode, onInlineEdit);

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
				<ParticleField
					count={15}
					color="rgba(232, 160, 152, 0.5)"
					shape="petal"
				/>
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
					{mode !== "editor" && (
						<div className="mt-4">
							<AddToCalendarButton
								title={`${data.hero.partnerOneName} & ${data.hero.partnerTwoName}'s Wedding`}
								date={data.hero.date}
								venue={data.venue.name}
								address={data.venue.address}
								variant="light"
							/>
						</div>
					)}
				</div>
			</SectionShell>

			<SectionShell
				sectionId="countdown"
				mode={mode}
				hidden={hiddenSections?.countdown}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="blush-section"
			>
				<CountdownWidget targetDate={data.hero.date} />
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
					<Parallax speed={0.15}>
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
					</Parallax>
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
						{data.venue.coordinates?.lat != null &&
						data.venue.coordinates?.lng != null ? (
							<div className="mt-3 flex flex-wrap justify-center gap-3">
								<a
									href={`https://www.google.com/maps/search/?api=1&query=${data.venue.coordinates.lat},${data.venue.coordinates.lng}`}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.15em] text-[color:var(--dm-muted)] transition-colors hover:border-[color:var(--dm-peach)] hover:text-[color:var(--dm-ink)]"
								>
									Google Maps
								</a>
								<a
									href={`https://www.waze.com/ul?ll=${data.venue.coordinates.lat},${data.venue.coordinates.lng}&navigate=yes`}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.15em] text-[color:var(--dm-muted)] transition-colors hover:border-[color:var(--dm-peach)] hover:text-[color:var(--dm-ink)]"
								>
									Waze
								</a>
							</div>
						) : null}
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
					{rsvpData ? (
						<RsvpConfirmation
							{...rsvpData}
							onEdit={() => setRsvpData(null)}
							className="mt-6"
						/>
					) : (
						<form
							className="mt-6 blush-form"
							onSubmit={async (event) => {
								event.preventDefault();
								if (!onRsvpSubmit || isSubmitting) return;
								const formData = new FormData(event.currentTarget);
								const name = String(formData.get("name") ?? "").trim();
								if (!name) return;
								const maxGuests = data.rsvp.allowPlusOnes
									? Math.max(1, data.rsvp.maxPlusOnes + 1)
									: 1;
								const rawGuestCount = Number(formData.get("guestCount") ?? 1);
								const guestCount = Number.isFinite(rawGuestCount)
									? Math.min(Math.max(rawGuestCount, 1), maxGuests)
									: 1;
								const attendance = parseAttendance(formData.get("attendance"));
								const dietaryRequirements = String(
									formData.get("dietary") ?? "",
								);
								setIsSubmitting(true);
								try {
									await onRsvpSubmit({
										name,
										attendance,
										guestCount,
										dietaryRequirements,
										message: String(formData.get("message") ?? ""),
										email: String(formData.get("email") ?? ""),
									});
									setRsvpData({
										name,
										attendance,
										guestCount,
										dietaryRequirements,
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
									max={
										data.rsvp.allowPlusOnes
											? Math.max(1, data.rsvp.maxPlusOnes + 1)
											: 1
									}
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
									aria-describedby={consentDescriptionId}
								/>
								<span id={consentDescriptionId}>
									I consent to the collection of my personal data as described
									in the{" "}
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
					)}
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

			{data.gift && (
				<SectionShell
					sectionId="gift"
					mode={mode}
					hidden={hiddenSections?.gift}
					onSelect={onSectionSelect}
					onAiClick={onAiClick}
					className="blush-section"
				>
					<AngpowQRCode
						paymentUrl={data.gift.paymentUrl}
						paymentMethod={data.gift.paymentMethod}
						recipientName={data.gift.recipientName}
					/>
				</SectionShell>
			)}

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
