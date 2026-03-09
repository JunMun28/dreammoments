import { Link } from "@tanstack/react-router";
import { useId, useRef, useState } from "react";
import { AddToCalendarButton } from "../../ui/AddToCalendarButton";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
import AngpowQRCode from "../AngpowQRCode";
import { ParticleField, Reveal, Stagger } from "../animations";
import BottomActionBar from "../BottomActionBar";
import { CountdownWidget } from "../CountdownWidget";
import { HeroMedia } from "../double-happiness/HeroMedia";
import { makeEditableProps, parseAttendance } from "../helpers";
import { MusicPlayer } from "../MusicPlayer";
import {
	RsvpConfirmation,
	type RsvpConfirmationProps,
} from "../RsvpConfirmation";
import SectionShell from "../SectionShell";
import SectionTitle from "../SectionTitle";
import type { TemplateInvitationProps } from "../types";
import "./superdesign.css";

/* ─── Helpers ─── */

const formatDisplayDate = (rawDate: string, locale: string) => {
	const parsedDate = new Date(rawDate);
	if (Number.isNaN(parsedDate.getTime())) return rawDate;
	return parsedDate.toLocaleDateString(locale, {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});
};

const PLACEHOLDER_PHOTO =
	"https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=900&fit=crop";

/* ─── Main Component ─── */

export default function SuperDesignInvitation(props: TemplateInvitationProps) {
	const {
		content,
		hiddenSections,
		mode = "public",
		onSectionSelect,
		onAiClick,
		onInlineEdit,
		onRsvpSubmit,
		rsvpStatus,
		tokens,
	} = props;

	const consentDescriptionId = useId();
	const data = content;
	const editableProps = makeEditableProps(mode, onInlineEdit);

	/* Colors & fonts from tokens — CSS vars do the heavy lifting */
	const primary = tokens?.colors.primary ?? "#C4727F";
	const accent = tokens?.colors.accent ?? "#C5A880";
	const bg = tokens?.colors.background ?? "#FDF8F5";
	const text = tokens?.colors.text ?? "#2C2420";
	const muted = tokens?.colors.muted ?? "#8A7F7A";
	const headingFont = {
		fontFamily:
			tokens?.typography.headingFont ??
			"'Cinzel', 'Noto Serif SC', Georgia, serif",
	};
	const bodyFont = {
		fontFamily:
			tokens?.typography.bodyFont ??
			"'Josefin Sans', 'Noto Sans SC', system-ui, sans-serif",
	};
	const accentFont = {
		fontFamily:
			tokens?.typography.accentFont ?? "'Cinzel', 'Noto Serif SC', serif",
		fontWeight: 700 as const,
	};

	/* Determine if the background is dark for contrast decisions */
	const isDark = isDarkColor(bg);

	/* RSVP state */
	const [isSubmitting, setIsSubmitting] = useState(false);
	const submittingRef = useRef(false);
	const [submitError, setSubmitError] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [rsvpData, setRsvpData] = useState<Omit<
		RsvpConfirmationProps,
		"onEdit" | "className"
	> | null>(null);

	const maxGuests = data.rsvp.allowPlusOnes
		? Math.max(1, data.rsvp.maxPlusOnes + 1)
		: 1;

	const weddingDateEn = formatDisplayDate(data.hero.date, "en-US");
	const rsvpDeadlineEn = formatDisplayDate(data.rsvp.deadline, "en-US");

	return (
		<div className="sd-template" style={bodyFont} lang="zh-Hans">
			{/* ═══════ HERO ═══════ */}
			<SectionShell
				sectionId="hero"
				mode={mode}
				hidden={hiddenSections?.hero}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="sd-hero"
			>
				{/* Background */}
				<div className="absolute inset-0">
					<HeroMedia
						heroImageUrl={data.hero.heroImageUrl}
						avatarImageUrl={data.hero.avatarImageUrl}
						animatedVideoUrl={data.hero.animatedVideoUrl}
						mode={mode}
					/>
				</div>
				<div className="sd-hero-overlay" />
				<ParticleField preset="goldDust" />

				<div className="sd-hero-content">
					<Reveal direction="up">
						<p
							className="text-xs uppercase tracking-[0.5em]"
							style={{ ...headingFont, color: accent }}
						>
							We&apos;re Getting Married
						</p>
					</Reveal>

					<Reveal direction="up" delay={0.3}>
						<h1 className="sd-hero-names" style={accentFont}>
							<span {...editableProps("hero.partnerOneName", "inline-block")}>
								{data.hero.partnerOneName}
							</span>
							<span className="sd-hero-separator">&amp;</span>
							<span {...editableProps("hero.partnerTwoName", "inline-block")}>
								{data.hero.partnerTwoName}
							</span>
						</h1>
					</Reveal>

					<Reveal direction="up" delay={0.5}>
						<p
							{...editableProps("hero.tagline", "sd-hero-tagline")}
							style={headingFont}
						>
							{data.hero.tagline}
						</p>
					</Reveal>

					<Reveal direction="up" delay={0.7}>
						<div className="sd-hero-pills">
							<span className="sd-hero-pill" lang="en">
								{weddingDateEn}
							</span>
							<span className="sd-hero-pill">{data.venue.name}</span>
						</div>
					</Reveal>

					{mode !== "editor" && (
						<Reveal direction="up" delay={0.9}>
							<div className="mt-6">
								<AddToCalendarButton
									title={`${data.hero.partnerOneName} & ${data.hero.partnerTwoName}'s Wedding`}
									date={data.hero.date}
									venue={data.venue.name}
									address={data.venue.address}
									variant={isDark ? "dark" : "light"}
								/>
							</div>
						</Reveal>
					)}
				</div>
			</SectionShell>

			<div className="sd-divider" />

			{/* ═══════ ANNOUNCEMENT ═══════ */}
			<SectionShell
				sectionId="announcement"
				mode={mode}
				hidden={hiddenSections?.announcement}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="sd-section"
			>
				<div className="mx-auto max-w-3xl text-center">
					<Reveal direction="up">
						<p
							className="text-sm tracking-[0.5em]"
							style={{ ...headingFont, color: primary }}
						>
							诚 挚 邀 请
						</p>
						<p
							className="mt-1 text-xs tracking-[0.3em]"
							style={{ color: muted }}
							lang="en"
						>
							INVITATION
						</p>
					</Reveal>

					<Reveal direction="up" delay={0.15}>
						<h2
							{...editableProps(
								"announcement.title",
								"mt-6 text-4xl sm:text-5xl",
							)}
							style={{ ...accentFont, color: text }}
						>
							{data.announcement.title}
						</h2>
					</Reveal>

					<Reveal direction="up" delay={0.25}>
						<div className="sd-card-solid mx-auto mt-8 max-w-2xl p-8">
							<p
								{...editableProps(
									"announcement.message",
									"whitespace-pre-line text-base leading-relaxed",
								)}
								style={{ color: text }}
							>
								{data.announcement.message}
							</p>

							<p
								{...editableProps(
									"announcement.formalText",
									"mt-6 text-sm leading-relaxed",
								)}
								style={{ color: muted }}
								lang="en"
							>
								{data.announcement.formalText}
							</p>
						</div>
					</Reveal>
				</div>
			</SectionShell>

			<div className="sd-divider" />

			{/* ═══════ COUPLE ═══════ */}
			<SectionShell
				sectionId="couple"
				mode={mode}
				hidden={hiddenSections?.couple}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="sd-section"
			>
				<div className="mx-auto max-w-4xl">
					<SectionTitle
						zhLabel="新 人 简 介"
						enHeading="The Couple"
						primaryColor={primary}
						darkColor={text}
						headingFont={headingFont}
						accentFont={accentFont}
					/>

					<Stagger interval={0.15} className="mt-14 grid gap-12 sm:grid-cols-2">
						{/* Partner One */}
						<div className="text-center">
							<Reveal direction="scale">
								<div className="sd-portrait mx-auto">
									<img
										src={data.couple.partnerOne.photoUrl || PLACEHOLDER_PHOTO}
										alt={data.couple.partnerOne.fullName}
										loading="lazy"
										decoding="async"
										onError={(e) => {
											const img = e.target as HTMLImageElement;
											if (!img.dataset.fallback) {
												img.dataset.fallback = "true";
												img.src = PLACEHOLDER_PHOTO;
											}
										}}
									/>
								</div>
							</Reveal>
							<p
								className="mt-4 text-xs uppercase tracking-[0.3em]"
								style={{ color: accent }}
							>
								<span>新郎</span> <span lang="en">/ THE GROOM</span>
							</p>
							<h3
								{...editableProps(
									"couple.partnerOne.fullName",
									"mt-2 text-2xl",
								)}
								style={{ ...accentFont, color: text }}
							>
								{data.couple.partnerOne.fullName}
							</h3>
							<p
								{...editableProps(
									"couple.partnerOne.bio",
									"mt-2 whitespace-pre-line text-sm leading-relaxed",
								)}
								style={{ color: muted }}
							>
								{data.couple.partnerOne.bio}
							</p>
						</div>

						{/* Partner Two */}
						<div className="text-center">
							<Reveal direction="scale">
								<div className="sd-portrait mx-auto">
									<img
										src={data.couple.partnerTwo.photoUrl || PLACEHOLDER_PHOTO}
										alt={data.couple.partnerTwo.fullName}
										loading="lazy"
										decoding="async"
										onError={(e) => {
											const img = e.target as HTMLImageElement;
											if (!img.dataset.fallback) {
												img.dataset.fallback = "true";
												img.src = PLACEHOLDER_PHOTO;
											}
										}}
									/>
								</div>
							</Reveal>
							<p
								className="mt-4 text-xs uppercase tracking-[0.3em]"
								style={{ color: accent }}
							>
								<span>新娘</span> <span lang="en">/ THE BRIDE</span>
							</p>
							<h3
								{...editableProps(
									"couple.partnerTwo.fullName",
									"mt-2 text-2xl",
								)}
								style={{ ...accentFont, color: text }}
							>
								{data.couple.partnerTwo.fullName}
							</h3>
							<p
								{...editableProps(
									"couple.partnerTwo.bio",
									"mt-2 whitespace-pre-line text-sm leading-relaxed",
								)}
								style={{ color: muted }}
							>
								{data.couple.partnerTwo.bio}
							</p>
						</div>
					</Stagger>
				</div>
			</SectionShell>

			<div className="sd-divider" />

			{/* ═══════ STORY ═══════ */}
			<SectionShell
				sectionId="story"
				mode={mode}
				hidden={hiddenSections?.story}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="sd-section"
			>
				<div className="mx-auto max-w-5xl">
					<SectionTitle
						zhLabel="我们的故事"
						enHeading="Our Story"
						primaryColor={primary}
						darkColor={text}
						headingFont={headingFont}
						accentFont={accentFont}
					/>
					<div className="sd-story-scroll mt-10 -mx-6 px-6 sm:-mx-10 sm:px-10">
						{data.story.milestones.map((m, i) => (
							<Reveal key={m.date} direction="up" delay={i * 0.1}>
								<div className="sd-story-card sd-card-solid">
									<p
										className="text-sm tracking-widest"
										style={{
											...accentFont,
											color: primary,
										}}
									>
										{m.date}
									</p>
									<h3
										className="mt-2 text-xl"
										style={{
											...headingFont,
											color: text,
										}}
									>
										{m.title}
									</h3>
									{m.photoUrl && (
										<img
											src={m.photoUrl}
											alt={m.title}
											className="mt-4 aspect-[4/3] w-full rounded object-cover"
											loading="lazy"
											decoding="async"
										/>
									)}
									<p
										className="mt-3 whitespace-pre-line text-sm leading-relaxed"
										style={{ color: text }}
									>
										{m.description}
									</p>
								</div>
							</Reveal>
						))}
					</div>
				</div>
			</SectionShell>

			<div className="sd-divider" />

			{/* ═══════ GALLERY ═══════ */}
			<SectionShell
				sectionId="gallery"
				mode={mode}
				hidden={hiddenSections?.gallery}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="sd-section"
			>
				<div className="mx-auto max-w-4xl">
					<SectionTitle
						zhLabel="甜蜜瞬间"
						enHeading="Gallery"
						primaryColor={primary}
						darkColor={text}
						headingFont={headingFont}
						accentFont={accentFont}
					/>
					<div className="sd-gallery mt-10">
						{data.gallery.photos.map((photo, i) => (
							<Reveal key={photo.url} direction="up" delay={i * 0.08}>
								<div className="sd-gallery-item">
									<img
										src={photo.url || PLACEHOLDER_PHOTO}
										alt={photo.caption || "Wedding photo"}
										loading="lazy"
										decoding="async"
									/>
									{photo.caption && (
										<p
											className="px-3 py-2 text-center text-xs"
											style={{
												...headingFont,
												color: muted,
											}}
										>
											{photo.caption}
										</p>
									)}
								</div>
							</Reveal>
						))}
					</div>
				</div>
			</SectionShell>

			<div className="sd-divider" />

			{/* ═══════ COUNTDOWN ═══════ */}
			<SectionShell
				sectionId="countdown"
				mode={mode}
				hidden={hiddenSections?.countdown}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="sd-section"
			>
				<div className="mx-auto max-w-sm text-center">
					<Reveal direction="up">
						<CountdownWidget
							targetDate={data.hero.date}
							eventTime={data.schedule.events[0]?.time}
							displayDate={data.hero.date}
						/>
					</Reveal>
				</div>
			</SectionShell>

			<div className="sd-divider" />

			{/* ═══════ SCHEDULE ═══════ */}
			<SectionShell
				sectionId="schedule"
				mode={mode}
				hidden={hiddenSections?.schedule}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="sd-section"
			>
				<div className="mx-auto max-w-4xl">
					<SectionTitle
						zhLabel="婚 礼 流 程"
						enHeading="Schedule"
						primaryColor={primary}
						darkColor={text}
						headingFont={headingFont}
						accentFont={accentFont}
					/>

					<Stagger interval={0.1} className="mt-14 space-y-4">
						{data.schedule.events.map((event, index) => (
							<article key={`${event.time}-${index}`} className="sd-event-card">
								<div className="sd-event-stripe" />
								<div>
									<p
										className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em]"
										style={{ color: accent }}
									>
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<circle cx="12" cy="12" r="10" />
											<polyline points="12 6 12 12 16 14" />
										</svg>
										{event.time}
									</p>
									<h3
										className="mt-2 text-lg"
										style={{ ...headingFont, color: text }}
									>
										{event.title}
									</h3>
									<p className="mt-1 text-sm" style={{ color: muted }}>
										{event.description}
									</p>
								</div>
							</article>
						))}
					</Stagger>
				</div>
			</SectionShell>

			<div className="sd-divider" />

			{/* ═══════ VENUE ═══════ */}
			<SectionShell
				sectionId="venue"
				mode={mode}
				hidden={hiddenSections?.venue}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="sd-section"
			>
				<div className="mx-auto max-w-3xl text-center">
					<SectionTitle
						zhLabel="婚 宴 地 点"
						enHeading="Venue"
						primaryColor={primary}
						darkColor={text}
						headingFont={headingFont}
						accentFont={accentFont}
					/>

					<Reveal direction="up" className="mt-8">
						<div className="sd-venue-card">
							<h3
								{...editableProps("venue.name", "text-2xl")}
								style={{ ...headingFont, color: text }}
							>
								{data.venue.name}
							</h3>

							<p
								{...editableProps(
									"venue.address",
									"mt-3 text-sm leading-relaxed",
								)}
								style={{ color: muted }}
							>
								{data.venue.address}
							</p>

							{data.venue.directions ? (
								<p className="mt-2 text-sm" style={{ color: muted }}>
									{data.venue.directions}
								</p>
							) : null}

							{data.venue.parkingInfo ? (
								<p
									className="mt-3 text-xs uppercase tracking-[0.2em]"
									style={{ color: accent }}
								>
									{data.venue.parkingInfo}
								</p>
							) : null}

							{data.venue.coordinates?.lat != null &&
							data.venue.coordinates?.lng != null ? (
								<div className="mt-6 flex flex-wrap justify-center gap-3">
									<a
										href={`https://www.google.com/maps/search/?api=1&query=${data.venue.coordinates.lat},${data.venue.coordinates.lng}`}
										target="_blank"
										rel="noopener noreferrer"
										className="sd-map-link"
										lang="en"
									>
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
											<circle cx="12" cy="10" r="3" />
										</svg>
										Google Maps
									</a>
									<a
										href={`https://www.waze.com/ul?ll=${data.venue.coordinates.lat},${data.venue.coordinates.lng}&navigate=yes`}
										target="_blank"
										rel="noopener noreferrer"
										className="sd-map-link"
										lang="en"
									>
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<path d="M3 11l19-9-9 19-2-8-8-2z" />
										</svg>
										Waze
									</a>
								</div>
							) : null}
						</div>
					</Reveal>
				</div>
			</SectionShell>

			<div className="sd-divider" />

			{/* ═══════ RSVP ═══════ */}
			<SectionShell
				sectionId="rsvp"
				mode={mode}
				hidden={hiddenSections?.rsvp}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="sd-section sd-section-alt"
			>
				<div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_auto_1.1fr]">
					{/* Left: info */}
					<Reveal direction="left" className="space-y-5">
						<p
							className="text-sm tracking-[0.5em]"
							style={{ ...headingFont, color: accent }}
						>
							敬 请 回 复
						</p>
						<h2
							className="text-4xl sm:text-5xl"
							style={{ ...accentFont, color: text }}
							lang="en"
						>
							RSVP
						</h2>
						<p
							className="max-w-md text-sm leading-relaxed"
							style={{ color: muted }}
							lang="en"
						>
							{data.rsvp.customMessage ||
								`Please let us know by ${rsvpDeadlineEn}`}
						</p>

						<div className="sd-card-solid p-5">
							<p
								className="text-[0.6rem] uppercase tracking-[0.3em]"
								style={{ color: accent }}
								lang="en"
							>
								RSVP Deadline
							</p>
							<p className="mt-2 text-sm" style={{ color: text }} lang="en">
								{rsvpDeadlineEn}
							</p>
							<p
								className="mt-3 text-xs uppercase tracking-[0.2em]"
								style={{ color: muted }}
								lang="en"
							>
								{data.rsvp.allowPlusOnes
									? `Up to ${maxGuests} ${maxGuests > 1 ? "guests" : "guest"} on this invite`
									: "This invitation is for one guest"}
							</p>
						</div>
					</Reveal>

					{/* Vertical divider */}
					<div className="hidden self-stretch lg:block">
						<div
							className="h-full w-px"
							style={{
								background: `linear-gradient(to bottom, transparent, ${accent}40, transparent)`,
							}}
						/>
					</div>

					{/* Right: form or confirmation */}
					{rsvpData ? (
						<Reveal direction="right">
							<div className="sd-form flex items-center justify-center">
								<RsvpConfirmation
									{...rsvpData}
									onEdit={() => setRsvpData(null)}
								/>
							</div>
						</Reveal>
					) : (
						<Reveal direction="right">
							<form
								className="sd-form"
								onSubmit={async (event) => {
									event.preventDefault();
									if (!onRsvpSubmit || submittingRef.current) return;
									submittingRef.current = true;
									setIsSubmitting(true);

									const formData = new FormData(event.currentTarget);
									const name = String(formData.get("name") ?? "").trim();
									const email = String(formData.get("email") ?? "").trim();
									const newErrors: Record<string, string> = {};
									if (!name) {
										newErrors.name = "Please enter your name";
									}
									if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
										newErrors.email = "Please enter a valid email address";
									}
									if (Object.keys(newErrors).length > 0) {
										setErrors(newErrors);
										submittingRef.current = false;
										setIsSubmitting(false);
										return;
									}
									setErrors({});
									setSubmitError("");

									const rawGuestCount = Number(formData.get("guestCount") ?? 1);
									const guestCount = Number.isFinite(rawGuestCount)
										? Math.min(Math.max(rawGuestCount, 1), maxGuests)
										: 1;
									const attendance = parseAttendance(
										formData.get("attendance"),
									);
									const dietaryRequirements = String(
										formData.get("dietary") ?? "",
									);

									try {
										await onRsvpSubmit({
											name,
											attendance,
											guestCount,
											dietaryRequirements,
											message: String(formData.get("message") ?? ""),
											email,
										});
										setSubmitError("");
										setRsvpData({
											name,
											attendance,
											guestCount,
											dietaryRequirements,
										});
									} catch {
										setSubmitError("Something went wrong. Please try again.");
									} finally {
										submittingRef.current = false;
										setIsSubmitting(false);
									}
								}}
							>
								<div className="grid gap-5">
									<label
										className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em]"
										style={{ color: muted }}
									>
										<span lang="en">Name</span>
										<input
											name="name"
											placeholder="Your name"
											autoComplete="name"
											required
											maxLength={100}
											aria-required="true"
											aria-invalid={!!errors.name}
											className="sd-form-input"
											onBlur={(e) => {
												if (!e.target.value.trim()) {
													setErrors((prev) => ({
														...prev,
														name: "Please enter your name",
													}));
												}
											}}
											onChange={() =>
												setErrors((prev) => {
													const { name: _, ...rest } = prev;
													return rest;
												})
											}
										/>
										{errors.name && (
											<p className="mt-1 text-xs text-red-500" role="alert">
												{errors.name}
											</p>
										)}
									</label>
									<label
										className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em]"
										style={{ color: muted }}
									>
										<span lang="en">Email</span>
										<input
											name="email"
											type="email"
											placeholder="your@email.com"
											autoComplete="email"
											spellCheck={false}
											aria-invalid={!!errors.email}
											className="sd-form-input"
											onBlur={(e) => {
												const v = e.target.value.trim();
												if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
													setErrors((prev) => ({
														...prev,
														email: "Please enter a valid email address",
													}));
												}
											}}
											onChange={() =>
												setErrors((prev) => {
													const { email: _, ...rest } = prev;
													return rest;
												})
											}
										/>
										{errors.email && (
											<p className="mt-1 text-xs text-red-500" role="alert">
												{errors.email}
											</p>
										)}
									</label>
									<label
										className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em]"
										style={{ color: muted }}
									>
										<span lang="en">Attendance</span>
										<select
											name="attendance"
											defaultValue="attending"
											className="sd-form-input"
										>
											<option value="attending">Attending</option>
											<option value="not_attending">Not Attending</option>
											<option value="undecided">Undecided</option>
										</select>
									</label>
									<label
										className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em]"
										style={{ color: muted }}
									>
										<span lang="en">Guest Count (Max: {maxGuests})</span>
										<input
											name="guestCount"
											type="number"
											min={1}
											max={maxGuests}
											defaultValue={1}
											inputMode="numeric"
											className="sd-form-input"
										/>
									</label>
									<label
										className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em]"
										style={{ color: muted }}
									>
										<span>
											<span lang="en">Dietary Requirements</span>{" "}
											<span lang="zh-Hans">/ 饮食要求</span>
										</span>
										<select
											name="dietary"
											defaultValue=""
											className="sd-form-input"
										>
											<option value="">No restrictions</option>
											<option value="halal">Halal</option>
											<option value="vegetarian">Vegetarian</option>
											<option value="no-beef">No Beef</option>
											<option value="no-seafood">No Seafood</option>
											<option value="other">Other (specify in message)</option>
										</select>
									</label>
									<label
										className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em]"
										style={{ color: muted }}
									>
										<span lang="en">Message</span>
										<textarea
											name="message"
											placeholder="Send your wishes to the couple"
											autoComplete="off"
											maxLength={500}
											className="sd-form-input min-h-24"
										/>
									</label>
									<label className="relative mt-2 flex min-h-[44px] cursor-pointer items-start gap-3">
										<input
											type="checkbox"
											name="consent"
											required
											aria-describedby={consentDescriptionId}
											className="mt-0.5 h-4 w-4 rounded border-2"
											style={{
												accentColor: primary,
											}}
										/>
										<span
											id={consentDescriptionId}
											className="text-xs leading-relaxed"
											style={{ color: muted }}
											lang="en"
										>
											I consent to the collection of my personal data as
											described in the{" "}
											<Link
												to="/privacy"
												className="underline hover:no-underline"
												style={{ color: primary }}
												target="_blank"
												rel="noopener noreferrer"
											>
												Privacy Policy
											</Link>
										</span>
									</label>
								</div>

								{rsvpStatus ? (
									<output
										className="mt-4 block text-sm"
										style={{ color: muted }}
										aria-live="polite"
									>
										{rsvpStatus}
									</output>
								) : null}

								<button
									type="submit"
									disabled={isSubmitting}
									className="sd-submit-btn mt-6"
								>
									{isSubmitting && <LoadingSpinner size="sm" />}
									{isSubmitting ? "Sending..." : "Send RSVP"}
								</button>

								{submitError && (
									<p
										className="mt-3 text-center text-sm"
										style={{ color: "#c44" }}
										role="alert"
									>
										{submitError}
									</p>
								)}

								{data.couple?.contactPhone && (
									<a
										href={`https://wa.me/${data.couple.contactPhone}?text=${encodeURIComponent("Hi, I would like to RSVP for your wedding!")}`}
										target="_blank"
										rel="noopener noreferrer"
										className="mt-3 block text-center text-sm underline"
										style={{ color: muted }}
										lang="en"
									>
										Or RSVP via WhatsApp
									</a>
								)}
							</form>
						</Reveal>
					)}
				</div>
			</SectionShell>

			<div className="sd-divider" />

			{/* ═══════ FOOTER ═══════ */}
			<SectionShell
				sectionId="footer"
				mode={mode}
				hidden={hiddenSections?.footer}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="sd-section pb-20 text-center"
			>
				<div className="mx-auto max-w-3xl">
					{data.gift && (
						<Reveal direction="up">
							<div className="mx-auto mb-10 max-w-md">
								<AngpowQRCode
									paymentUrl={data.gift.paymentUrl}
									paymentMethod={data.gift.paymentMethod}
									recipientName={data.gift.recipientName}
								/>
							</div>
						</Reveal>
					)}

					<Reveal direction="blur">
						<p
							className="text-6xl"
							style={{ ...accentFont, color: primary }}
							aria-hidden="true"
						>
							囍
						</p>
					</Reveal>

					<Reveal direction="up" delay={0.2}>
						<p
							{...editableProps(
								"footer.message",
								"mt-6 whitespace-pre-line text-lg leading-relaxed",
							)}
							style={{ ...headingFont, color: text }}
						>
							{data.footer.message}
						</p>
					</Reveal>

					{data.footer.socialLinks?.hashtag ? (
						<Reveal direction="up" delay={0.3}>
							<p
								className="mt-5 text-xs uppercase tracking-[0.28em]"
								style={{ color: muted }}
							>
								{data.footer.socialLinks.hashtag}
							</p>
						</Reveal>
					) : null}
				</div>
			</SectionShell>

			{data.musicUrl && mode !== "editor" && (
				<MusicPlayer audioUrl={data.musicUrl} />
			)}

			{mode !== "editor" && (
				<BottomActionBar
					primaryColor={primary}
					onGiftClick={() =>
						document
							.getElementById("footer")
							?.scrollIntoView({ behavior: "smooth" })
					}
					onMessageClick={() =>
						document
							.getElementById("rsvp")
							?.scrollIntoView({ behavior: "smooth" })
					}
				/>
			)}
		</div>
	);
}

/** Simple luminance check to determine if a hex color is dark */
function isDarkColor(hex: string): boolean {
	const c = hex.replace("#", "");
	if (c.length < 6) return false;
	const r = Number.parseInt(c.slice(0, 2), 16);
	const g = Number.parseInt(c.slice(2, 4), 16);
	const b = Number.parseInt(c.slice(4, 6), 16);
	// Relative luminance
	return r * 0.299 + g * 0.587 + b * 0.114 < 128;
}
