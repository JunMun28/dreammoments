import { useMemo } from "react";
import { useScrollReveal } from "../../../lib/scroll-effects";
import type { InvitationContent } from "../../../lib/types";
import SectionShell from "../SectionShell";
import type { RsvpPayload, TemplateInvitationProps } from "../types";

type EternalEleganceInvitationProps = TemplateInvitationProps & {
	content: InvitationContent;
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
}: EternalEleganceInvitationProps) {
	useScrollReveal();
	const data = useMemo(() => content, [content]);
	const monogram = `${data.hero.partnerOneName.charAt(0)}${data.hero.partnerTwoName.charAt(0)}`;
	const taglineLetters = data.hero.tagline.split("");
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
		onClick: mode === "editor" ? () => onInlineEdit?.(fieldPath) : undefined,
		onKeyDown:
			mode === "editor"
				? (event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							onInlineEdit?.(fieldPath);
						}
					}
				: undefined,
		role: mode === "editor" ? "button" : undefined,
		tabIndex: mode === "editor" ? 0 : undefined,
		className: mode === "editor" ? `${className} dm-editable` : className,
	});

	return (
		<div className="eternal-elegance">
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
					<p className="eternal-kicker">Eternal Elegance</p>
					<h1
						data-reveal
						{...editableProps("hero.partnerOneName", "dm-reveal eternal-title")}
					>
						{data.hero.partnerOneName} & {data.hero.partnerTwoName}
					</h1>
					<p
						data-reveal
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
					<p data-reveal className="dm-reveal eternal-date">
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
					<p className="eternal-kicker">Invitation</p>
					<h2
						data-reveal
						{...editableProps(
							"announcement.title",
							"dm-reveal eternal-heading",
						)}
					>
						{data.announcement.title}
					</h2>
					<p
						data-reveal
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
								{...editableProps(
									`couple.${person.name === data.couple.partnerOne.fullName ? "partnerOne" : "partnerTwo"}.fullName`,
									"eternal-heading",
								)}
							>
								{person.name}
							</p>
							<p
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
					<p className="eternal-kicker">Gallery</p>
					<div className="mt-6 grid gap-4 md:grid-cols-3">
						{data.gallery.photos.map((photo) => (
							<div
								key={`${photo.url ?? "photo"}-${photo.caption ?? "Portrait"}`}
								className="eternal-photo"
							>
								<img
									src={photo.url || "/placeholders/photo-light.svg"}
									alt=""
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
					<p className="eternal-kicker">Details</p>
					<p {...editableProps("details.scheduleSummary", "eternal-heading")}>
						{data.details.scheduleSummary}
					</p>
					<p {...editableProps("details.venueSummary", "eternal-body")}>
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
					<p className="eternal-kicker">RSVP</p>
					<form
						className="eternal-form"
						onSubmit={(event) => {
							event.preventDefault();
							if (!onRsvpSubmit) return;
							const formData = new FormData(event.currentTarget);
							onRsvpSubmit({
								name: String(formData.get("name") ?? ""),
								attendance: parseAttendance(formData.get("attendance")),
								guestCount: Number(formData.get("guestCount") ?? 1),
								dietaryRequirements: String(formData.get("dietary") ?? ""),
								message: String(formData.get("message") ?? ""),
								email: String(formData.get("email") ?? ""),
							});
						}}
					>
						<input
							name="name"
							placeholder="James Tan…"
							aria-label="Name"
							autoComplete="off"
							required
						/>
						<select name="attendance" aria-label="Attendance">
							<option value="attending">Attending</option>
							<option value="not_attending">Not Attending</option>
							<option value="undecided">Undecided</option>
						</select>
						<input
							name="email"
							placeholder="james@example.com…"
							aria-label="Email"
							type="email"
							autoComplete="off"
							spellCheck={false}
						/>
						<input
							name="guestCount"
							placeholder="2…"
							aria-label="Guest count"
							type="number"
							min={1}
							inputMode="numeric"
							autoComplete="off"
						/>
						<input
							name="dietary"
							placeholder="No seafood…"
							aria-label="Dietary requirements"
							autoComplete="off"
						/>
						<textarea
							name="message"
							placeholder="We’re honored to attend…"
							aria-label="Message"
							autoComplete="off"
						/>
						{rsvpStatus ? (
							<output className="eternal-body" aria-live="polite">
								{rsvpStatus}
							</output>
						) : null}
						<button type="submit">Submit RSVP</button>
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
					<p className="eternal-kicker">Registry</p>
					<p {...editableProps("registry.note", "eternal-body")}>
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
					<p {...editableProps("footer.message", "eternal-heading")}>
						{data.footer.message}
					</p>
					<p className="eternal-kicker">Eternal Elegance</p>
				</div>
			</SectionShell>
		</div>
	);
}
