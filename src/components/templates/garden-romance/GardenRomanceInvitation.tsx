import { useMemo } from "react";
import { useScrollReveal } from "../../../lib/scroll-effects";
import type { InvitationContent } from "../../../lib/types";
import SectionShell from "../SectionShell";
import type { RsvpPayload, TemplateInvitationProps } from "../types";

type GardenRomanceInvitationProps = TemplateInvitationProps & {
	content: InvitationContent;
};

export default function GardenRomanceInvitation({
	content,
	hiddenSections,
	mode = "public",
	onSectionSelect,
	onAiClick,
	onInlineEdit,
	onRsvpSubmit,
	rsvpStatus,
}: GardenRomanceInvitationProps) {
	useScrollReveal();
	const data = useMemo(() => content, [content]);
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
		<div className="garden-romance">
			<SectionShell
				sectionId="hero"
				mode={mode}
				hidden={hiddenSections?.hero}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="garden-section garden-hero"
			>
				<div className="garden-hero-frame" />
				<div className="garden-hero-bloom" />
				<div className="mx-auto flex max-w-4xl flex-col items-center text-center">
					<p className="garden-kicker">Garden Romance</p>
					<h1
						data-reveal
						{...editableProps("hero.partnerOneName", "dm-reveal garden-title")}
					>
						{data.hero.partnerOneName} & {data.hero.partnerTwoName}
					</h1>
					<p
						data-reveal
						{...editableProps("hero.tagline", "dm-reveal garden-tagline")}
					>
						{data.hero.tagline}
					</p>
					<div data-reveal className="dm-reveal garden-pill-row">
						<span>{data.hero.date}</span>
						<span>{data.venue.name}</span>
					</div>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="announcement"
				mode={mode}
				hidden={hiddenSections?.announcement}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="garden-section"
			>
				<div className="mx-auto max-w-3xl text-center">
					<p className="garden-kicker">Invitation</p>
					<h2
						data-reveal
						{...editableProps("announcement.title", "dm-reveal garden-heading")}
					>
						{data.announcement.title}
					</h2>
					<p
						data-reveal
						{...editableProps("announcement.message", "dm-reveal garden-body")}
					>
						{data.announcement.message}
					</p>
					<p data-reveal className="dm-reveal garden-subtext">
						{data.announcement.formalText}
					</p>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="story"
				mode={mode}
				hidden={hiddenSections?.story}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="garden-section garden-panel"
			>
				<div className="mx-auto max-w-4xl">
					<p className="garden-kicker">Our Story</p>
					<div className="mt-6 grid gap-4">
						{data.story.milestones.map((milestone, index) => (
							<div
								key={`${milestone.date}-${milestone.title}`}
								data-reveal
								style={{ transitionDelay: `${index * 90}ms` }}
								className="dm-reveal garden-card"
							>
								<p className="garden-meta">{milestone.date}</p>
								<p className="garden-heading">{milestone.title}</p>
								<p className="garden-body">{milestone.description}</p>
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
				className="garden-section"
			>
				<div className="mx-auto max-w-5xl">
					<p className="garden-kicker">Gallery</p>
					<div className="mt-6 grid gap-4 md:grid-cols-3">
						{data.gallery.photos.map((photo, index) => (
							<div
								key={`${photo.url ?? "photo"}-${photo.caption ?? "Moment"}`}
								data-reveal
								style={{ transitionDelay: `${index * 70}ms` }}
								className="dm-reveal garden-photo"
							>
								<img
									src={photo.url || "/placeholders/photo-light.svg"}
									alt=""
									loading="lazy"
									width={360}
									height={140}
									className="garden-photo-frame w-full object-cover"
								/>
								<p className="garden-meta">{photo.caption ?? "Moment"}</p>
							</div>
						))}
					</div>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="schedule"
				mode={mode}
				hidden={hiddenSections?.schedule}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="garden-section garden-panel"
			>
				<div className="mx-auto max-w-4xl">
					<p className="garden-kicker">Schedule</p>
					<div className="mt-6 grid gap-4">
						{data.schedule.events.map((event, index) => (
							<div
								key={`${event.time}-${event.title}`}
								data-reveal
								style={{ transitionDelay: `${index * 60}ms` }}
								className="dm-reveal garden-timeline"
							>
								<p className="garden-meta">{event.time}</p>
								<p className="garden-heading">{event.title}</p>
								<p className="garden-body">{event.description}</p>
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
				className="garden-section"
			>
				<div className="mx-auto max-w-5xl garden-venue">
					<div>
						<p className="garden-kicker">Venue</p>
						<h3 {...editableProps("venue.name", "garden-heading")}>
							{data.venue.name}
						</h3>
						<p {...editableProps("venue.address", "garden-body")}>
							{data.venue.address}
						</p>
						<p {...editableProps("venue.directions", "garden-subtext")}>
							{data.venue.directions}
						</p>
					</div>
					<div className="garden-map">
						<img
							src="/placeholders/photo-light.svg"
							alt=""
							loading="lazy"
							width={800}
							height={450}
						/>
					</div>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="rsvp"
				mode={mode}
				hidden={hiddenSections?.rsvp}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="garden-section garden-panel"
			>
				<div className="mx-auto max-w-4xl">
					<p className="garden-kicker">RSVP</p>
					<form
						className="garden-form"
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
							placeholder="Rachel Lim…"
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
							placeholder="rachel@example.com…"
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
							placeholder="Vegetarian, no pork…"
							aria-label="Dietary requirements"
							autoComplete="off"
						/>
						<textarea
							name="message"
							placeholder="Can’t wait to celebrate with you…"
							aria-label="Message"
							autoComplete="off"
						/>
						{rsvpStatus ? (
							<output className="garden-meta" aria-live="polite">
								{rsvpStatus}
							</output>
						) : null}
						<button type="submit">Send RSVP</button>
					</form>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="faq"
				mode={mode}
				hidden={hiddenSections?.faq}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="garden-section"
			>
				<div className="mx-auto max-w-4xl">
					<p className="garden-kicker">FAQ</p>
					<div className="mt-4 grid gap-3">
						{data.faq.items.map((item) => (
							<div key={item.question} className="garden-faq">
								<p className="garden-heading">{item.question}</p>
								<p className="garden-body">{item.answer}</p>
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
				className="garden-section garden-footer"
			>
				<div className="mx-auto max-w-3xl text-center">
					<p {...editableProps("footer.message", "garden-heading")}>
						{data.footer.message}
					</p>
					<p className="garden-kicker">Garden Romance</p>
				</div>
			</SectionShell>
		</div>
	);
}
