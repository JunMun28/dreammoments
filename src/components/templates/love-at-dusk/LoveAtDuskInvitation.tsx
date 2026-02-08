import { Link } from "@tanstack/react-router";
import {
	type CSSProperties,
	type KeyboardEvent,
	type MouseEvent,
	useId,
	useMemo,
	useState,
} from "react";
import { useParallax, useScrollReveal } from "../../../lib/scroll-effects";
import type { InvitationContent } from "../../../lib/types";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
import SectionShell from "../SectionShell";
import type { RsvpPayload, TemplateInvitationProps } from "../types";

type LoveAtDuskInvitationProps = TemplateInvitationProps & {
	content: InvitationContent;
};

/* ─── Typography ─── */

const headingFont: CSSProperties = {
	fontFamily: "'Playfair Display', 'Noto Serif SC', serif",
};

const bodyFont: CSSProperties = {
	fontFamily: "'Noto Serif SC', 'Manrope', serif",
};

const accentFont: CSSProperties = {
	fontFamily: "'Noto Serif SC', serif",
};

export default function LoveAtDuskInvitation({
	content,
	hiddenSections,
	mode = "public",
	onSectionSelect,
	onAiClick,
	onInlineEdit,
	onRsvpSubmit,
	rsvpStatus,
}: LoveAtDuskInvitationProps) {
	useScrollReveal();
	useParallax();

	const consentDescriptionId = useId();
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
		<div className="love-at-dusk" style={bodyFont}>
			<div className="love-starfield" aria-hidden="true">
				<div
					className="love-star"
					style={{ left: "8%", top: "12%", animationDelay: "0s" }}
				/>
				<div
					className="love-star"
					style={{ left: "15%", top: "35%", animationDelay: "1.2s" }}
				/>
				<div
					className="love-star"
					style={{ left: "25%", top: "8%", animationDelay: "0.4s" }}
				/>
				<div
					className="love-star"
					style={{ left: "40%", top: "22%", animationDelay: "2.1s" }}
				/>
				<div
					className="love-star"
					style={{ left: "55%", top: "5%", animationDelay: "0.8s" }}
				/>
				<div
					className="love-star"
					style={{ left: "65%", top: "30%", animationDelay: "1.6s" }}
				/>
				<div
					className="love-star"
					style={{ left: "78%", top: "15%", animationDelay: "0.3s" }}
				/>
				<div
					className="love-star"
					style={{ left: "88%", top: "25%", animationDelay: "1.9s" }}
				/>
				<div
					className="love-star"
					style={{ left: "92%", top: "8%", animationDelay: "0.7s" }}
				/>
				<div
					className="love-star"
					style={{ left: "35%", top: "42%", animationDelay: "2.5s" }}
				/>
				<div
					className="love-star"
					style={{ left: "72%", top: "40%", animationDelay: "1.1s" }}
				/>
				<div
					className="love-star"
					style={{ left: "50%", top: "18%", animationDelay: "0.6s" }}
				/>
			</div>

			<SectionShell
				sectionId="hero"
				mode={mode}
				hidden={hiddenSections?.hero}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="love-section love-hero relative overflow-hidden"
			>
				<div className="love-hero-bg dm-parallax" data-parallax="0.06" />
				<div className="love-hero-glow" />
				<div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
					<p
						data-reveal
						{...editableProps(
							"announcement.title",
							"dm-reveal text-xs uppercase tracking-[0.6em] text-[var(--love-accent)]",
						)}
					>
						{data.announcement.title}
					</p>
					<p
						data-reveal
						style={accentFont}
						className="dm-reveal mt-6 text-5xl text-[var(--love-accent)] sm:text-6xl"
					>
						囍
					</p>
					<h1
						data-reveal
						style={headingFont}
						className="dm-reveal mt-6 text-3xl font-semibold text-[var(--love-cream)] sm:text-5xl"
					>
						<span
							{...editableProps(
								"hero.partnerOneName",
								"love-heading dm-editable",
							)}
						>
							{data.hero.partnerOneName}
						</span>
						<span className="mx-3 text-[var(--love-accent)]">×</span>
						<span
							{...editableProps(
								"hero.partnerTwoName",
								"love-heading dm-editable",
							)}
						>
							{data.hero.partnerTwoName}
						</span>
					</h1>
					<p
						data-reveal
						{...editableProps(
							"hero.tagline",
							"dm-reveal mt-4 max-w-2xl text-base text-[var(--love-muted)]",
						)}
					>
						{data.hero.tagline}
					</p>
					<div
						data-reveal
						className="dm-reveal mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--love-cream)]"
					>
						<span className="love-pill">{data.hero.date}</span>
						<span className="love-pill">{data.venue.name}</span>
					</div>
				</div>
			</SectionShell>

			<div
				className="love-gradient-divider love-gradient-hero-to-section"
				aria-hidden="true"
			/>

			<SectionShell
				sectionId="announcement"
				mode={mode}
				hidden={hiddenSections?.announcement}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="love-section love-section-wide"
			>
				<div className="mx-auto max-w-3xl text-center">
					<p
						data-reveal
						style={accentFont}
						className="dm-reveal text-xs uppercase tracking-[0.6em] text-[var(--love-accent)]"
					>
						诚挚邀请
					</p>
					<p
						data-reveal
						{...editableProps(
							"announcement.message",
							"dm-reveal mt-6 text-xl leading-relaxed text-[var(--love-cream)]",
						)}
					>
						{data.announcement.message}
					</p>
					<p
						data-reveal
						{...editableProps(
							"announcement.formalText",
							"dm-reveal mt-4 text-sm text-[var(--love-muted)]",
						)}
					>
						{data.announcement.formalText}
					</p>
				</div>
			</SectionShell>

			<div
				className="love-gradient-divider love-gradient-section-to-panel"
				aria-hidden="true"
			/>

			<SectionShell
				sectionId="couple"
				mode={mode}
				hidden={hiddenSections?.couple}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="love-section love-panel"
			>
				<div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
					{[
						{
							label: "GROOM",
							fieldPrefix: "couple.partnerOne",
							name: data.couple.partnerOne.fullName,
							bio: data.couple.partnerOne.bio,
							accent: "from-[var(--love-primary)] to-[var(--love-secondary)]",
						},
						{
							label: "BRIDE",
							fieldPrefix: "couple.partnerTwo",
							name: data.couple.partnerTwo.fullName,
							bio: data.couple.partnerTwo.bio,
							accent: "from-[var(--love-secondary)] to-[var(--love-primary)]",
						},
					].map((person, index) => (
						<div
							key={person.label}
							data-reveal
							className={`dm-reveal ${
								index === 0 ? "slide-left" : "slide-right"
							} love-couple-card`}
						>
							<div
								className={`h-48 rounded-2xl bg-gradient-to-br ${person.accent}`}
							/>
							<p className="mt-5 text-xs uppercase tracking-[0.4em] text-[var(--love-accent)]">
								{person.label}
							</p>
							<p
								style={headingFont}
								{...editableProps(
									`${person.fieldPrefix}.fullName`,
									"mt-3 text-xl font-semibold text-[var(--love-cream)]",
								)}
							>
								{person.name}
							</p>
							<p
								{...editableProps(
									`${person.fieldPrefix}.bio`,
									"mt-2 text-sm leading-relaxed text-[var(--love-muted)]",
								)}
							>
								{person.bio}
							</p>
						</div>
					))}
				</div>
			</SectionShell>

			<SectionShell
				sectionId="story"
				mode={mode}
				hidden={hiddenSections?.story}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="love-section love-section-wide"
			>
				<div className="mx-auto max-w-4xl">
					<p
						data-reveal
						className="dm-reveal text-center text-xs uppercase tracking-[0.6em] text-[var(--love-accent)]"
					>
						Love Story Timeline
					</p>
					<div className="mt-8 love-story-timeline">
						<div className="love-timeline-track" aria-hidden="true" />
						{data.story.milestones.map((milestone, index) => (
							<div
								key={`${milestone.title}-${milestone.date}`}
								data-reveal
								style={{ transitionDelay: `${index * 80}ms` }}
								className={`dm-reveal love-timeline-item ${
									index % 2 === 0 ? "love-timeline-left" : "love-timeline-right"
								}`}
							>
								<div className="love-timeline-dot" aria-hidden="true" />
								<div className="love-timeline-content">
									<p className="text-xs uppercase tracking-[0.4em] text-[var(--love-accent)]">
										{milestone.date}
									</p>
									<p
										style={headingFont}
										className="mt-2 text-lg font-semibold text-[var(--love-cream)]"
									>
										{milestone.title}
									</p>
									<p className="mt-2 text-sm leading-relaxed text-[var(--love-muted)]">
										{milestone.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</SectionShell>

			<div
				className="love-gradient-divider love-gradient-section-to-panel"
				aria-hidden="true"
			/>

			<SectionShell
				sectionId="gallery"
				mode={mode}
				hidden={hiddenSections?.gallery}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="love-section love-panel"
			>
				<div className="mx-auto max-w-5xl">
					<p
						data-reveal
						className="dm-reveal text-xs uppercase tracking-[0.6em] text-[var(--love-accent)]"
					>
						Gallery
					</p>
					<div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{data.gallery.photos.map((item, index) => (
							<div
								key={`${item.url ?? "photo"}-${item.caption ?? "Photo"}`}
								data-reveal
								style={{ transitionDelay: `${index * 60}ms` }}
								className="dm-reveal love-gallery-card"
							>
								<img
									src={item.url || "/placeholders/photo-dark.svg"}
									alt={item.caption || "Wedding photo"}
									loading="lazy"
									width={360}
									height={256}
									className="h-56 w-full rounded-xl border border-white/10 object-cover"
								/>
								<p className="mt-4 text-xs uppercase tracking-[0.3em] text-[var(--love-accent)]">
									{item.caption ?? `Photo ${index + 1}`}
								</p>
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
				className="love-section love-section-wide"
			>
				<div className="mx-auto max-w-4xl">
					<p
						data-reveal
						className="dm-reveal text-xs uppercase tracking-[0.6em] text-[var(--love-accent)]"
					>
						Schedule
					</p>
					<div className="mt-6 grid gap-4">
						{data.schedule.events.map((event, index) => (
							<div
								key={`${event.time}-${event.title}`}
								data-reveal
								style={{ transitionDelay: `${index * 70}ms` }}
								className="dm-reveal love-schedule-item"
							>
								<div className="love-schedule-time">
									<p className="text-base font-semibold text-[var(--love-accent)] tabular-nums">
										{event.time}
									</p>
								</div>
								<div className="love-schedule-details">
									<p
										style={headingFont}
										className="text-lg text-[var(--love-cream)]"
									>
										{event.title}
									</p>
									<p className="mt-1 text-sm text-[var(--love-muted)]">
										{event.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</SectionShell>

			<div
				className="love-gradient-divider love-gradient-section-to-panel"
				aria-hidden="true"
			/>

			<SectionShell
				sectionId="venue"
				mode={mode}
				hidden={hiddenSections?.venue}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="love-section love-panel"
			>
				<div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="space-y-4">
						<p
							data-reveal
							className="dm-reveal text-xs uppercase tracking-[0.6em] text-[var(--love-accent)]"
						>
							Venue
						</p>
						<h2
							data-reveal
							style={headingFont}
							{...editableProps(
								"venue.name",
								"dm-reveal text-2xl font-semibold text-[var(--love-cream)]",
							)}
						>
							{data.venue.name}
						</h2>
						<p
							data-reveal
							{...editableProps(
								"venue.address",
								"dm-reveal text-sm text-[var(--love-muted)]",
							)}
						>
							{data.venue.address}
						</p>
						<p
							data-reveal
							{...editableProps(
								"venue.directions",
								"dm-reveal text-xs text-[var(--love-muted)]",
							)}
						>
							{data.venue.directions}
						</p>
					</div>
					<div data-reveal className="dm-reveal love-venue-map">
						<img
							src="/placeholders/photo-dark.svg"
							alt={`Map showing location of ${data.venue.name}`}
							loading="lazy"
							width={480}
							height={192}
							className="h-48 w-full rounded-2xl border border-white/10 object-cover"
						/>
						<p className="mt-3 text-xs uppercase tracking-[0.3em] text-[var(--love-accent)]">
							Map preview
						</p>
					</div>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="entourage"
				mode={mode}
				hidden={hiddenSections?.entourage}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="love-section love-section-wide"
			>
				<div className="mx-auto max-w-4xl">
					<p
						data-reveal
						className="dm-reveal text-xs uppercase tracking-[0.6em] text-[var(--love-accent)]"
					>
						Entourage
					</p>
					<div className="mt-6 grid gap-5 sm:grid-cols-3">
						{data.entourage.members.map((person, index) => (
							<div
								key={`${person.role}-${person.name}`}
								data-reveal
								style={{ transitionDelay: `${index * 80}ms` }}
								className="dm-reveal love-entourage-card"
							>
								<p className="text-xs uppercase tracking-[0.3em] text-[var(--love-accent)]">
									{person.role}
								</p>
								<p
									style={headingFont}
									className="mt-3 text-base text-[var(--love-cream)]"
								>
									{person.name}
								</p>
							</div>
						))}
					</div>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="registry"
				mode={mode}
				hidden={hiddenSections?.registry}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="love-section love-panel"
			>
				<div className="mx-auto max-w-3xl text-center">
					<p
						data-reveal
						className="dm-reveal text-xs uppercase tracking-[0.6em] text-[var(--love-accent)]"
					>
						{data.registry.title}
					</p>
					<p
						data-reveal
						className="dm-reveal mt-5 text-sm text-[var(--love-cream)]"
					>
						{data.registry.note}
					</p>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="rsvp"
				mode={mode}
				hidden={hiddenSections?.rsvp}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="love-section"
			>
				<div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[0.7fr_1.3fr]">
					<div>
						<p
							data-reveal
							className="dm-reveal text-xs uppercase tracking-[0.6em] text-[var(--love-accent)]"
						>
							RSVP
						</p>
						<h2
							data-reveal
							style={headingFont}
							className="dm-reveal mt-4 text-2xl font-semibold text-[var(--love-cream)]"
						>
							Join Us on Our Day
						</h2>
						<p
							data-reveal
							className="dm-reveal mt-3 text-sm text-[var(--love-muted)]"
						>
							{data.rsvp.customMessage}
						</p>
					</div>
					<form
						data-reveal
						className="dm-reveal rounded-3xl border border-white/10 bg-[#140d0b]/80 p-6"
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
						<div className="grid gap-4 sm:grid-cols-2">
							<label className="grid gap-2 text-xs uppercase tracking-[0.3em] text-[var(--love-accent)]">
								Name
								<input
									name="name"
									className="h-11 rounded-2xl border border-white/10 bg-[#0f0c0a] px-4 text-base text-[var(--love-cream)]"
									placeholder="Sarah Lim…"
									autoComplete="off"
									required
									aria-required="true"
								/>
							</label>
							<label className="grid gap-2 text-xs uppercase tracking-[0.3em] text-[var(--love-accent)]">
								Attendance
								<select
									name="attendance"
									className="h-11 rounded-2xl border border-white/10 bg-[#0f0c0a] px-4 text-base text-[var(--love-cream)]"
								>
									<option value="attending">Attending</option>
									<option value="not_attending">Not Attending</option>
									<option value="undecided">Undecided</option>
								</select>
							</label>
							<label className="grid gap-2 text-xs uppercase tracking-[0.3em] text-[var(--love-accent)]">
								Email
								<input
									name="email"
									type="email"
									className="h-11 rounded-2xl border border-white/10 bg-[#0f0c0a] px-4 text-base text-[var(--love-cream)]"
									placeholder="sarah@example.com…"
									autoComplete="off"
									spellCheck={false}
								/>
							</label>
							<label className="grid gap-2 text-xs uppercase tracking-[0.3em] text-[var(--love-accent)]">
								Guests
								<input
									name="guestCount"
									className="h-11 rounded-2xl border border-white/10 bg-[#0f0c0a] px-4 text-base text-[var(--love-cream)]"
									placeholder="2…"
									type="number"
									min={1}
									inputMode="numeric"
									autoComplete="off"
								/>
							</label>
							<label className="grid gap-2 text-xs uppercase tracking-[0.3em] text-[var(--love-accent)]">
								Dietary
								<input
									name="dietary"
									className="h-11 rounded-2xl border border-white/10 bg-[#0f0c0a] px-4 text-base text-[var(--love-cream)]"
									placeholder="Vegetarian, no pork…"
									autoComplete="off"
								/>
							</label>
						</div>
						<label className="mt-4 grid gap-2 text-xs uppercase tracking-[0.3em] text-[var(--love-accent)]">
							Message
							<textarea
								name="message"
								className="min-h-[120px] rounded-2xl border border-white/10 bg-[#0f0c0a] px-4 py-3 text-base text-[var(--love-cream)]"
								placeholder="Congratulations and love…"
								autoComplete="off"
							/>
						</label>
						<label className="relative mt-4 flex min-h-[44px] cursor-pointer items-start gap-3">
							<input
								type="checkbox"
								name="consent"
								required
								aria-describedby={consentDescriptionId}
								className="mt-0.5 h-4 w-4 rounded border border-white/10 bg-[#0f0c0a] accent-[var(--love-accent)] before:absolute before:left-0 before:top-1/2 before:h-[44px] before:w-[44px] before:-translate-x-[13px] before:-translate-y-1/2 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--love-accent)]/30"
							/>
							<span
								id={consentDescriptionId}
								className="text-xs leading-relaxed text-[var(--love-muted)]"
							>
								I consent to the collection of my personal data as described in
								the{" "}
								<Link
									to="/privacy"
									className="text-[var(--love-accent)] underline hover:no-underline"
									target="_blank"
									rel="noopener noreferrer"
								>
									Privacy Policy
								</Link>
							</span>
						</label>
						{rsvpStatus ? (
							<output
								className="mt-3 text-xs text-[var(--love-accent)]"
								aria-live="polite"
							>
								{rsvpStatus}
							</output>
						) : null}
						<button
							type="submit"
							disabled={isSubmitting}
							className="mt-6 w-full rounded-full bg-[var(--love-accent)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--love-ink)] disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
						>
							{isSubmitting && <LoadingSpinner size="sm" />}
							{isSubmitting ? "Submitting..." : "Submit RSVP"}
						</button>
					</form>
				</div>
			</SectionShell>

			<SectionShell
				sectionId="footer"
				mode={mode}
				hidden={hiddenSections?.footer}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="love-section love-panel"
			>
				<div className="mx-auto max-w-3xl text-center">
					<p
						data-reveal
						style={bodyFont}
						{...editableProps(
							"footer.message",
							"dm-reveal text-lg text-[var(--love-cream)]",
						)}
					>
						{data.footer.message}
					</p>
					<p
						data-reveal
						className="dm-reveal mt-4 text-xs uppercase tracking-[0.4em] text-[var(--love-accent)]"
					>
						Love at Dusk
					</p>
				</div>
			</SectionShell>
		</div>
	);
}
