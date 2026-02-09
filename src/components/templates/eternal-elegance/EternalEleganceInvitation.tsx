import { Link } from "@tanstack/react-router";
import { type CSSProperties, useId, useState } from "react";
import { useScrollReveal } from "../../../lib/scroll-effects";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
import { makeEditableProps, parseAttendance } from "../helpers";
import SectionShell from "../SectionShell";
import type { TemplateInvitationProps } from "../types";

/* ─── Typography ─── */

const headingFont: CSSProperties = {
	fontFamily: "'Didot', 'Bodoni MT', 'Cormorant Garamond', serif",
};

const bodyFont: CSSProperties = {
	fontFamily: "'Garamond', 'Cormorant Garamond', serif",
};

const accentFont: CSSProperties = {
	fontFamily: "'Pinyon Script', 'Garamond', serif",
};

export default function EternalEleganceInvitation({
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
	const monogram = `${data.hero.partnerOneName.charAt(0)}${data.hero.partnerTwoName.charAt(0)}`;
	const taglineLetters = data.hero.tagline.split("");
	const editableProps = makeEditableProps(mode, onInlineEdit);

	return (
		<div className="eternal-elegance" style={bodyFont}>
			<SectionShell
				sectionId="hero"
				mode={mode}
				hidden={hiddenSections?.hero}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="eternal-section eternal-hero"
			>
				<div className="eternal-monogram" aria-hidden="true">
					<svg viewBox="0 0 120 120" className="eternal-monogram-svg">
						<title>Monogram</title>
						<circle cx="60" cy="60" r="52" />
						<text x="60" y="68" textAnchor="middle">
							{monogram}
						</text>
					</svg>
				</div>
				<div className="mx-auto max-w-4xl text-center">
					<p className="eternal-kicker" style={bodyFont}>
						Eternal Elegance
					</p>
					<h1
						data-reveal
						style={headingFont}
						{...editableProps("hero.partnerOneName", "dm-reveal eternal-title")}
					>
						{data.hero.partnerOneName} & {data.hero.partnerTwoName}
					</h1>
					<p
						data-reveal
						style={accentFont}
						{...editableProps("hero.tagline", "dm-reveal eternal-tagline")}
					>
						{taglineLetters.map((char, index) => (
							<span
								key={`${index}-${char}`}
								className="eternal-letter"
								style={{ animationDelay: `${index * 40}ms` }}
							>
								{char}
							</span>
						))}
					</p>
					<p data-reveal className="dm-reveal eternal-date" style={bodyFont}>
						{data.hero.date}
					</p>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="announcement"
				mode={mode}
				hidden={hiddenSections?.announcement}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="eternal-section"
			>
				<div className="mx-auto max-w-3xl text-center">
					<p className="eternal-kicker" style={bodyFont}>
						Invitation
					</p>
					<h2
						data-reveal
						style={headingFont}
						{...editableProps(
							"announcement.title",
							"dm-reveal eternal-heading",
						)}
					>
						{data.announcement.title}
					</h2>
					<p
						data-reveal
						style={bodyFont}
						{...editableProps("announcement.message", "dm-reveal eternal-body")}
					>
						{data.announcement.message}
					</p>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="couple"
				mode={mode}
				hidden={hiddenSections?.couple}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="eternal-section eternal-panel"
			>
				<div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
					{[
						{
							name: data.couple.partnerOne.fullName,
							bio: data.couple.partnerOne.bio,
						},
						{
							name: data.couple.partnerTwo.fullName,
							bio: data.couple.partnerTwo.bio,
						},
					].map((person) => (
						<div
							key={person.name}
							data-reveal
							className="dm-reveal eternal-card"
						>
							<p
								style={headingFont}
								{...editableProps(
									`couple.${person.name === data.couple.partnerOne.fullName ? "partnerOne" : "partnerTwo"}.fullName`,
									"eternal-heading",
								)}
							>
								{person.name}
							</p>
							<p
								style={bodyFont}
								{...editableProps(
									`couple.${person.name === data.couple.partnerOne.fullName ? "partnerOne" : "partnerTwo"}.bio`,
									"eternal-body",
								)}
							>
								{person.bio}
							</p>
						</div>
					))}
				</div>
			</SectionShell>

			<SectionShell
				sectionId="gallery"
				mode={mode}
				hidden={hiddenSections?.gallery}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="eternal-section"
			>
				<div className="mx-auto max-w-5xl">
					<p className="eternal-kicker" style={bodyFont}>
						Gallery
					</p>
					<div className="mt-6 grid gap-4 md:grid-cols-3">
						{data.gallery.photos.map((photo) => (
							<div
								key={`${photo.url ?? "photo"}-${photo.caption ?? "Portrait"}`}
								className="eternal-photo"
							>
								<img
									src={photo.url || "/placeholders/photo-light.svg"}
									alt={photo.caption || "Wedding photo"}
									loading="lazy"
									width={360}
									height={140}
									className="absolute inset-0 h-full w-full rounded-[inherit] object-cover"
								/>
								<span>{photo.caption ?? "Portrait"}</span>
							</div>
						))}
					</div>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="details"
				mode={mode}
				hidden={hiddenSections?.details}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="eternal-section eternal-panel"
			>
				<div className="mx-auto max-w-4xl text-center">
					<p className="eternal-kicker" style={bodyFont}>
						Details
					</p>
					<p
						style={headingFont}
						{...editableProps("details.scheduleSummary", "eternal-heading")}
					>
						{data.details.scheduleSummary}
					</p>
					<p
						style={bodyFont}
						{...editableProps("details.venueSummary", "eternal-body")}
					>
						{data.details.venueSummary}
					</p>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="rsvp"
				mode={mode}
				hidden={hiddenSections?.rsvp}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="eternal-section"
			>
				<div className="mx-auto max-w-4xl">
					<p className="eternal-kicker" style={bodyFont}>
						RSVP
					</p>
					<form
						className="eternal-form"
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
						<label
							className="grid gap-1.5 text-xs uppercase tracking-[0.15em]"
							style={{ color: "var(--eternal-muted)" }}
						>
							Name
							<input
								name="name"
								placeholder="James Tan…"
								autoComplete="off"
								required
								aria-required="true"
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-lavender)]/30"
							/>
						</label>
						<label
							className="grid gap-1.5 text-xs uppercase tracking-[0.15em]"
							style={{ color: "var(--eternal-muted)" }}
						>
							Attendance
							<select
								name="attendance"
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-lavender)]/30"
							>
								<option value="attending">Attending</option>
								<option value="not_attending">Not Attending</option>
								<option value="undecided">Undecided</option>
							</select>
						</label>
						<label
							className="grid gap-1.5 text-xs uppercase tracking-[0.15em]"
							style={{ color: "var(--eternal-muted)" }}
						>
							Email
							<input
								name="email"
								placeholder="james@example.com…"
								type="email"
								autoComplete="off"
								spellCheck={false}
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-lavender)]/30"
							/>
						</label>
						<label
							className="grid gap-1.5 text-xs uppercase tracking-[0.15em]"
							style={{ color: "var(--eternal-muted)" }}
						>
							Guest count
							<input
								name="guestCount"
								placeholder="2…"
								type="number"
								min={1}
								inputMode="numeric"
								autoComplete="off"
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-lavender)]/30"
							/>
						</label>
						<label
							className="grid gap-1.5 text-xs uppercase tracking-[0.15em]"
							style={{ color: "var(--eternal-muted)" }}
						>
							Dietary requirements
							<input
								name="dietary"
								placeholder="No seafood…"
								autoComplete="off"
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-lavender)]/30"
							/>
						</label>
						<label
							className="grid gap-1.5 text-xs uppercase tracking-[0.15em]"
							style={{ color: "var(--eternal-muted)" }}
						>
							Message
							<textarea
								name="message"
								placeholder="We're honored to attend…"
								autoComplete="off"
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-lavender)]/30"
							/>
						</label>
						<label className="eternal-consent">
							<input
								type="checkbox"
								name="consent"
								required
								aria-describedby={consentDescriptionId}
							/>
							<span id={consentDescriptionId}>
								I consent to the collection of my personal data as described in
								the{" "}
								<Link
									to="/privacy"
									className="eternal-consent-link"
									target="_blank"
									rel="noopener noreferrer"
								>
									Privacy Policy
								</Link>
							</span>
						</label>
						{rsvpStatus ? (
							<output className="eternal-body" aria-live="polite">
								{rsvpStatus}
							</output>
						) : null}
						<button
							type="submit"
							disabled={isSubmitting}
							className="inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
						>
							{isSubmitting && <LoadingSpinner size="sm" />}
							{isSubmitting ? "Submitting..." : "Submit RSVP"}
						</button>
					</form>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="registry"
				mode={mode}
				hidden={hiddenSections?.registry}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="eternal-section eternal-panel"
			>
				<div className="mx-auto max-w-3xl text-center">
					<p className="eternal-kicker" style={bodyFont}>
						Registry
					</p>
					<p
						style={bodyFont}
						{...editableProps("registry.note", "eternal-body")}
					>
						{data.registry.note}
					</p>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="footer"
				mode={mode}
				hidden={hiddenSections?.footer}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="eternal-section eternal-footer"
			>
				<div className="mx-auto max-w-3xl text-center">
					<p
						style={headingFont}
						{...editableProps("footer.message", "eternal-heading")}
					>
						{data.footer.message}
					</p>
					<p className="eternal-kicker" style={bodyFont}>
						Eternal Elegance
					</p>
				</div>
			</SectionShell>
		</div>
	);
}
