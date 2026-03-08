import { Link } from "@tanstack/react-router";
import { type CSSProperties, useId, useRef, useState } from "react";
import { AddToCalendarButton } from "../../ui/AddToCalendarButton";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
import AngpowQRCode from "../AngpowQRCode";
import {
	DrawPath,
	LetterboxReveal,
	Parallax,
	ParticleField,
	Reveal,
	Shimmer,
	SplitText,
	Stagger,
} from "../animations";
import BottomActionBar from "../BottomActionBar";
import { CountdownWidget } from "../CountdownWidget";
import { makeEditableProps, parseAttendance } from "../helpers";
import { MusicPlayer } from "../MusicPlayer";
import {
	RsvpConfirmation,
	type RsvpConfirmationProps,
} from "../RsvpConfirmation";
import SectionShell from "../SectionShell";
import SectionTitle from "../SectionTitle";
import type { TemplateInvitationProps } from "../types";
import { HeroMedia } from "./HeroMedia";
import "./double-happiness.css";

/* ─── Design Tokens ─── */

const COLORS = {
	primary: "#D4622A",
	accent: "#B8862D",
	cream: "#FAF7F2",
	dark: "#0A1628",
	espresso: "#0A1628",
	accentLight: "#E0D4BC",
	muted: "#4A5568",
} as const;

/* ─── Typography ─── */

const headingFont: CSSProperties = {
	fontFamily: "'Cinzel', 'Noto Serif SC', Georgia, serif",
};

const bodyFont: CSSProperties = {
	fontFamily: "'Josefin Sans', 'Noto Sans SC', system-ui, sans-serif",
};

const accentFont: CSSProperties = {
	fontFamily: "'Cinzel', 'Noto Serif SC', serif",
	fontWeight: 700,
};

/* ─── Art Deco Divider ─── */

function ArtDecoDivider({ className = "" }: { className?: string }) {
	return (
		<DrawPath
			d="M0,30 L20,10 L40,30 L60,10 L80,30 L100,10 L120,30"
			stroke={COLORS.accent}
			strokeWidth={1.5}
			width={160}
			height={40}
			duration={1.5}
			className={`mx-auto ${className}`}
		/>
	);
}

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

export default function DoubleHappinessInvitation({
	content,
	hiddenSections,
	mode = "public",
	onSectionSelect,
	onAiClick,
	onInlineEdit,
	onRsvpSubmit,
	rsvpStatus,
}: TemplateInvitationProps) {
	const consentDescriptionId = useId();
	const data = content;
	const editableProps = makeEditableProps(mode, onInlineEdit);

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
		<div className="double-happiness" style={bodyFont} lang="zh-Hans">
			{/* ════════════════════════════════════════════
			    1. HERO — Full-bleed photo with espresso overlay
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="hero"
				mode={mode}
				hidden={hiddenSections?.hero}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="relative min-h-[100svh] overflow-hidden"
			>
				<LetterboxReveal barColor="#0A1628">
					{/* Background media */}
					<Parallax speed={0.3} className="absolute inset-0">
						<HeroMedia
							heroImageUrl={data.hero.heroImageUrl}
							avatarImageUrl={data.hero.avatarImageUrl}
							animatedVideoUrl={data.hero.animatedVideoUrl}
							mode={mode}
						/>
					</Parallax>
					{/* Warm espresso overlay */}
					<div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/40 via-[#0A1628]/30 to-[#0A1628]/60" />

					{/* Art Deco sunburst background */}
					<div className="dh-sunburst absolute inset-0" aria-hidden="true" />

					{/* Copper dust particles */}
					<ParticleField preset="copperDust" />

					{/* 囍 watermark — subtle with shimmer */}
					<Shimmer>
						<span
							className="dh-xi-watermark absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
							aria-hidden="true"
							style={accentFont}
						>
							囍
						</span>
					</Shimmer>

					<div className="relative z-10 mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
						<h1 style={accentFont}>
							<SplitText
								left={
									<span
										{...editableProps("hero.partnerOneName", "inline-block")}
									>
										{data.hero.partnerOneName}
									</span>
								}
								right={
									<span
										{...editableProps("hero.partnerTwoName", "inline-block")}
									>
										{data.hero.partnerTwoName}
									</span>
								}
								separator="·"
								className="mt-8 text-4xl text-white sm:text-6xl"
								separatorClassName="dh-gold-shimmer mx-3 text-3xl sm:mx-4 sm:text-5xl"
							/>
						</h1>

						<Reveal direction="up" delay={0.8}>
							<p
								{...editableProps(
									"hero.tagline",
									"mt-6 max-w-xl text-lg leading-relaxed",
								)}
								style={{
									...headingFont,
									color: COLORS.accentLight,
								}}
							>
								{data.hero.tagline}
							</p>
						</Reveal>

						<Reveal direction="up" delay={1.0}>
							<div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-white/90">
								<span
									className="rounded-full border border-[rgba(201,169,110,0.3)] px-4 py-2"
									lang="en"
								>
									{weddingDateEn}
								</span>
								<span className="rounded-full border border-[rgba(201,169,110,0.3)] px-4 py-2">
									{data.venue.name}
								</span>
							</div>
						</Reveal>

						{mode !== "editor" && (
							<Reveal direction="up" delay={1.2}>
								<div className="mt-6">
									<AddToCalendarButton
										title={`${data.hero.partnerOneName} & ${data.hero.partnerTwoName}'s Wedding`}
										date={data.hero.date}
										venue={data.venue.name}
										address={data.venue.address}
										variant="dark"
									/>
								</div>
							</Reveal>
						)}
					</div>
				</LetterboxReveal>
			</SectionShell>

			<div className="dh-gold-divider mx-auto w-48 my-1" />

			{/* ════════════════════════════════════════════
			    2. ANNOUNCEMENT — Bilingual formal greeting
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="announcement"
				mode={mode}
				hidden={hiddenSections?.announcement}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-white relative overflow-hidden px-6 py-16 sm:py-24 sm:px-10"
			>
				<div className="mx-auto max-w-3xl text-center">
					<ArtDecoDivider className="mb-10" />

					<Reveal direction="up">
						<p
							className="text-sm tracking-[0.5em]"
							style={{ ...headingFont, color: COLORS.primary }}
						>
							诚 挚 邀 请
						</p>
						<p
							className="mt-1 text-xs tracking-[0.3em]"
							style={{ color: COLORS.muted }}
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
							style={{ ...accentFont, color: COLORS.dark }}
						>
							{data.announcement.title}
						</h2>
					</Reveal>

					<Reveal direction="up" delay={0.25}>
						<div className="mx-auto mt-8 max-w-2xl rounded-lg border border-[rgba(201,169,110,0.08)] bg-gradient-to-b from-white/50 to-transparent p-8">
							<div className="dh-blockquote mx-auto max-w-2xl text-left">
								<p
									{...editableProps(
										"announcement.message",
										"whitespace-pre-line text-base leading-relaxed",
									)}
									style={{ color: COLORS.dark }}
								>
									{data.announcement.message}
								</p>
							</div>

							<p
								{...editableProps(
									"announcement.formalText",
									"mx-auto mt-6 max-w-2xl text-sm leading-relaxed",
								)}
								style={{ color: COLORS.muted }}
								lang="en"
							>
								{data.announcement.formalText}
							</p>
						</div>
					</Reveal>

					<ArtDecoDivider className="mt-10" />
				</div>
			</SectionShell>

			<div className="dh-gold-divider mx-auto w-48 my-1" />

			{/* ════════════════════════════════════════════
			    3. COUPLE — Rounded-rectangle portraits
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="couple"
				mode={mode}
				hidden={hiddenSections?.couple}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-cream px-6 py-16 sm:py-24 sm:px-10"
			>
				<div className="mx-auto max-w-4xl">
					<SectionTitle
						zhLabel="新 人 简 介"
						enHeading="The Couple"
						primaryColor={COLORS.primary}
						darkColor={COLORS.dark}
						headingFont={headingFont}
						accentFont={accentFont}
					/>

					<Stagger interval={0.15} className="mt-14 grid gap-12 sm:grid-cols-2">
						{/* Groom */}
						<div className="text-center">
							<Reveal direction="scale">
								<div className="dh-portrait-frame mx-auto h-72 w-56 overflow-hidden">
									<img
										src={data.couple.partnerOne.photoUrl || PLACEHOLDER_PHOTO}
										alt={`${data.couple.partnerOne.fullName}`}
										loading="lazy"
										decoding="async"
										className="h-full w-full object-cover"
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
								style={{ color: COLORS.accent }}
							>
								<span>新郎</span> <span lang="en">/ THE GROOM</span>
							</p>
							<div className="mx-auto mt-2 h-px w-12 bg-gradient-to-r from-transparent via-[rgba(201,169,110,0.5)] to-transparent" />
							<h3
								{...editableProps(
									"couple.partnerOne.fullName",
									"mt-2 text-2xl",
								)}
								style={{ ...accentFont, color: COLORS.dark }}
							>
								{data.couple.partnerOne.fullName}
							</h3>
							<p
								{...editableProps(
									"couple.partnerOne.bio",
									"mt-2 whitespace-pre-line text-sm leading-relaxed",
								)}
								style={{ color: COLORS.muted }}
							>
								{data.couple.partnerOne.bio}
							</p>
						</div>

						{/* Bride */}
						<div className="text-center">
							<Reveal direction="scale">
								<div className="dh-portrait-frame mx-auto h-72 w-56 overflow-hidden">
									<img
										src={data.couple.partnerTwo.photoUrl || PLACEHOLDER_PHOTO}
										alt={`${data.couple.partnerTwo.fullName}`}
										loading="lazy"
										decoding="async"
										className="h-full w-full object-cover"
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
								style={{ color: COLORS.accent }}
							>
								<span>新娘</span> <span lang="en">/ THE BRIDE</span>
							</p>
							<div className="mx-auto mt-2 h-px w-12 bg-gradient-to-r from-transparent via-[rgba(201,169,110,0.5)] to-transparent" />
							<h3
								{...editableProps(
									"couple.partnerTwo.fullName",
									"mt-2 text-2xl",
								)}
								style={{ ...accentFont, color: COLORS.dark }}
							>
								{data.couple.partnerTwo.fullName}
							</h3>
							<p
								{...editableProps(
									"couple.partnerTwo.bio",
									"mt-2 whitespace-pre-line text-sm leading-relaxed",
								)}
								style={{ color: COLORS.muted }}
							>
								{data.couple.partnerTwo.bio}
							</p>
						</div>
					</Stagger>
				</div>
			</SectionShell>

			<div className="dh-gold-divider mx-auto w-48 my-1" />

			{/* ════ ENTOURAGE — Wedding Party Grid ════ */}
			<SectionShell
				sectionId="entourage"
				mode={mode}
				hidden={hiddenSections?.entourage}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-dark relative overflow-hidden px-6 py-14 sm:py-20 sm:px-10"
			>
				<div className="mx-auto max-w-4xl text-center">
					<SectionTitle
						zhLabel="伴郎伴娘"
						enHeading="Wedding Party"
						primaryColor={COLORS.accent}
						darkColor="#FAF7F2"
						headingFont={headingFont}
						accentFont={accentFont}
					/>
					<ArtDecoDivider className="my-8" />
					{data.weddingParty && (
						<div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
							<Reveal direction="left">
								<div>
									<p
										className="mb-4 text-sm tracking-widest"
										style={{
											...accentFont,
											color: COLORS.accent,
										}}
									>
										GROOMSMEN
									</p>
									<div className="space-y-3">
										{data.weddingParty.groomsmen.map((g) => (
											<div key={g.name} className="py-1">
												<p
													className="dh-entourage-name text-base"
													style={headingFont}
												>
													{g.name}
												</p>
												<p className="text-xs text-[#FAF7F2]/60" lang="en">
													{g.role}
												</p>
											</div>
										))}
									</div>
								</div>
							</Reveal>
							<Reveal direction="right">
								<div>
									<p
										className="mb-4 text-sm tracking-widest"
										style={{
											...accentFont,
											color: COLORS.accent,
										}}
									>
										BRIDESMAIDS
									</p>
									<div className="space-y-3">
										{data.weddingParty.bridesmaids.map((b) => (
											<div key={b.name} className="py-1">
												<p
													className="dh-entourage-name text-base"
													style={headingFont}
												>
													{b.name}
												</p>
												<p className="text-xs text-[#FAF7F2]/60" lang="en">
													{b.role}
												</p>
											</div>
										))}
									</div>
								</div>
							</Reveal>
						</div>
					)}
				</div>
			</SectionShell>

			<div className="dh-gold-divider mx-auto w-48 my-1" />

			{/* ════════════════════════════════════════════
			    5. STORY — Horizontal scroll timeline
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="story"
				mode={mode}
				hidden={hiddenSections?.story}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-cream relative overflow-hidden px-6 py-14 sm:py-20 sm:px-10"
			>
				<div className="mx-auto max-w-5xl">
					<SectionTitle
						zhLabel="我们的故事"
						enHeading="Our Story"
						primaryColor={COLORS.primary}
						darkColor={COLORS.dark}
						headingFont={headingFont}
						accentFont={accentFont}
					/>
					<ArtDecoDivider className="my-8" />
					<div className="dh-story-scroll -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 sm:-mx-10 sm:px-10">
						{data.story.milestones.map((m, i) => (
							<Reveal key={m.date} direction="up" delay={i * 0.1}>
								<div className="dh-story-card min-w-[260px] max-w-[320px] flex-shrink-0 snap-center rounded-lg border border-[rgba(201,169,110,0.2)] bg-white p-6 shadow-sm sm:min-w-[340px]">
									<p
										className="text-sm tracking-widest"
										style={{
											...accentFont,
											color: COLORS.primary,
										}}
									>
										{m.date}
									</p>
									<h3
										className="mt-2 text-xl"
										style={{
											...headingFont,
											color: COLORS.dark,
										}}
									>
										{m.title}
									</h3>
									{m.photoUrl && (
										<img
											src={m.photoUrl || PLACEHOLDER_PHOTO}
											alt={m.title}
											className="mt-4 aspect-[4/3] w-full rounded object-cover"
											loading="lazy"
											decoding="async"
										/>
									)}
									<p
										className="mt-3 text-sm leading-relaxed whitespace-pre-line"
										style={{ color: COLORS.dark }}
									>
										{m.description}
									</p>
								</div>
							</Reveal>
						))}
					</div>
				</div>
			</SectionShell>

			<div className="dh-gold-divider mx-auto w-48 my-1" />

			{/* ════════════════════════════════════════════
			    6. GALLERY — Masonry grid
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="gallery"
				mode={mode}
				hidden={hiddenSections?.gallery}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-white relative overflow-hidden px-6 py-14 sm:py-20 sm:px-10"
			>
				<div className="mx-auto max-w-4xl">
					<SectionTitle
						zhLabel="甜蜜瞬间"
						enHeading="Gallery"
						primaryColor={COLORS.primary}
						darkColor={COLORS.dark}
						headingFont={headingFont}
						accentFont={accentFont}
					/>
					<ArtDecoDivider className="my-8" />
					<div className="columns-2 gap-4 sm:columns-3">
						{data.gallery.photos.map((photo, i) => (
							<Reveal key={photo.url} direction="up" delay={i * 0.08}>
								<div className="dh-gallery-item mb-4 break-inside-avoid overflow-hidden rounded-lg border border-[rgba(201,169,110,0.15)]">
									<img
										src={photo.url || PLACEHOLDER_PHOTO}
										alt={photo.caption || "Wedding photo"}
										className="w-full object-cover"
										loading="lazy"
										decoding="async"
									/>
									{photo.caption && (
										<p
											className="bg-white px-3 py-2 text-center text-xs"
											style={{
												...headingFont,
												color: COLORS.muted,
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

			<div className="dh-gold-divider mx-auto w-48 my-1" />

			{/* ════════════════════════════════════════════
			    7. COUNTDOWN — Clean centered layout
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="countdown"
				mode={mode}
				hidden={hiddenSections?.countdown}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-cream relative overflow-hidden px-6 py-16 sm:px-10"
			>
				<div className="mx-auto max-w-sm">
					<ArtDecoDivider className="mb-8" />
					<Reveal direction="up">
						<CountdownWidget
							targetDate={data.hero.date}
							eventTime={data.schedule.events[0]?.time}
							displayDate={data.hero.date}
						/>
					</Reveal>
					<ArtDecoDivider className="mt-8" />
				</div>
			</SectionShell>

			<div className="dh-gold-divider mx-auto w-48 my-1" />

			{/* ════════════════════════════════════════════
			    8. SCHEDULE — Event cards with champagne left border
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="schedule"
				mode={mode}
				hidden={hiddenSections?.schedule}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-white relative overflow-hidden px-6 py-16 sm:py-24 sm:px-10"
			>
				<div className="mx-auto max-w-4xl">
					<SectionTitle
						zhLabel="婚 礼 流 程"
						enHeading="Schedule"
						primaryColor={COLORS.primary}
						darkColor={COLORS.dark}
						headingFont={headingFont}
						accentFont={accentFont}
					/>

					<Stagger interval={0.1} className="mt-14 space-y-4">
						{data.schedule.events.map((event, index) => (
							<article
								key={`${event.time}-${index}`}
								className="dh-event-card dh-schedule-card"
							>
								<div className="dh-event-card-stripe" />
								<div>
									<p
										className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em]"
										style={{ color: COLORS.accent }}
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
										style={{
											...headingFont,
											color: COLORS.dark,
										}}
									>
										{event.title}
									</h3>
									<p className="mt-1 text-sm" style={{ color: COLORS.muted }}>
										{event.description}
									</p>
								</div>
							</article>
						))}
					</Stagger>
				</div>
			</SectionShell>

			<div className="dh-gold-divider mx-auto w-48 my-1" />

			{/* ════════════════════════════════════════════
			    9. VENUE — Clean card with champagne buttons
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="venue"
				mode={mode}
				hidden={hiddenSections?.venue}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-cream px-6 py-16 sm:py-24 sm:px-10"
			>
				<div className="mx-auto max-w-3xl text-center">
					<SectionTitle
						zhLabel="婚 宴 地 点"
						enHeading="Venue"
						primaryColor={COLORS.primary}
						darkColor={COLORS.dark}
						headingFont={headingFont}
						accentFont={accentFont}
					/>

					<Reveal direction="up" className="mx-auto mt-8 max-w-md">
						<div className="rounded-2xl border border-[rgba(201,169,110,0.15)] bg-white p-8 text-center shadow-sm">
							<h3
								{...editableProps("venue.name", "text-2xl")}
								style={{ ...headingFont, color: COLORS.dark }}
							>
								{data.venue.name}
							</h3>

							<p
								{...editableProps(
									"venue.address",
									"mt-3 text-sm leading-relaxed",
								)}
								style={{ color: COLORS.muted }}
							>
								{data.venue.address}
							</p>

							{data.venue.directions ? (
								<p className="mt-2 text-sm" style={{ color: COLORS.muted }}>
									{data.venue.directions}
								</p>
							) : null}

							{data.venue.parkingInfo ? (
								<p
									className="mt-3 text-xs uppercase tracking-[0.2em]"
									style={{ color: COLORS.accent }}
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
										className="inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-[rgba(232,118,75,0.05)]"
										style={{
											borderColor: "rgba(232,118,75,0.2)",
											color: COLORS.primary,
										}}
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
										className="inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-[rgba(232,118,75,0.05)]"
										style={{
											borderColor: "rgba(232,118,75,0.2)",
											color: COLORS.primary,
										}}
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

			<div className="dh-gold-divider mx-auto w-48 my-1" />

			{/* ════════════════════════════════════════════
			    10. RSVP — Espresso background with champagne form
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="rsvp"
				mode={mode}
				hidden={hiddenSections?.rsvp}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-dark px-6 py-16 sm:py-24 sm:px-10"
			>
				<div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_auto_1.1fr]">
					{/* Left: info */}
					<Reveal direction="left" className="space-y-5">
						<p
							className="text-sm tracking-[0.5em]"
							style={{
								...headingFont,
								color: COLORS.accentLight,
							}}
						>
							敬 请 回 复
						</p>
						<h2
							className="text-4xl sm:text-5xl"
							style={{ ...accentFont, color: "#FAF7F2" }}
							lang="en"
						>
							RSVP
						</h2>
						<p
							className="max-w-md text-sm leading-relaxed"
							style={{ color: "rgba(250,247,242,0.7)" }}
							lang="en"
						>
							{data.rsvp.customMessage ||
								`Please let us know by ${rsvpDeadlineEn}`}
						</p>

						<div
							className="rounded-xl border border-white/10 p-5"
							style={{
								background: "rgba(255,255,255,0.06)",
							}}
						>
							<p
								className="text-[0.6rem] uppercase tracking-[0.3em]"
								style={{ color: COLORS.accentLight }}
								lang="en"
							>
								RSVP Deadline
							</p>
							<p
								className="mt-2 text-sm"
								style={{ color: "#FAF7F2" }}
								lang="en"
							>
								{rsvpDeadlineEn}
							</p>
							<p
								className="mt-3 text-xs uppercase tracking-[0.2em]"
								style={{ color: "rgba(250,247,242,0.5)" }}
								lang="en"
							>
								{data.rsvp.allowPlusOnes
									? `Up to ${maxGuests} ${maxGuests > 1 ? "guests" : "guest"} on this invite`
									: "This invitation is for one guest"}
							</p>
						</div>
					</Reveal>

					{/* Vertical champagne line */}
					<div className="hidden self-stretch lg:block">
						<div className="h-full w-px bg-gradient-to-b from-transparent via-[rgba(201,169,110,0.3)] to-transparent" />
					</div>

					{/* Right: form or confirmation */}
					{rsvpData ? (
						<div className="relative">
							<Reveal direction="right">
								<div
									className="flex items-center justify-center rounded-2xl border border-[rgba(201,169,110,0.15)] p-6 sm:p-8"
									style={{
										background: COLORS.cream,
									}}
								>
									<RsvpConfirmation
										{...rsvpData}
										onEdit={() => setRsvpData(null)}
									/>
								</div>
							</Reveal>
						</div>
					) : (
						<div className="relative">
							<Reveal direction="right">
								<form
									className="rounded-2xl border border-[rgba(201,169,110,0.15)] p-6 sm:p-10"
									style={{
										background: COLORS.cream,
									}}
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

										const rawGuestCount = Number(
											formData.get("guestCount") ?? 1,
										);
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
											style={{ color: COLORS.muted }}
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
												className="dh-form-input rounded-lg border bg-white px-4 py-3 text-sm placeholder:text-gray-400"
												style={{
													borderColor: "rgba(201,169,110,0.3)",
													color: COLORS.dark,
												}}
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
											style={{ color: COLORS.muted }}
										>
											<span lang="en">Email</span>
											<input
												name="email"
												type="email"
												placeholder="your@email.com"
												autoComplete="email"
												spellCheck={false}
												aria-invalid={!!errors.email}
												className="dh-form-input rounded-lg border bg-white px-4 py-3 text-sm placeholder:text-gray-400"
												style={{
													borderColor: "rgba(201,169,110,0.3)",
													color: COLORS.dark,
												}}
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
											style={{ color: COLORS.muted }}
										>
											<span lang="en">Attendance</span>
											<select
												name="attendance"
												defaultValue="attending"
												className="dh-form-input rounded-lg border bg-white px-4 py-3 text-sm"
												style={{
													borderColor: "rgba(201,169,110,0.3)",
													color: COLORS.dark,
												}}
											>
												<option value="attending">Attending</option>
												<option value="not_attending">Not Attending</option>
												<option value="undecided">Undecided</option>
											</select>
										</label>
										<label
											className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em]"
											style={{ color: COLORS.muted }}
										>
											<span lang="en">Guest Count (Max: {maxGuests})</span>
											<input
												name="guestCount"
												type="number"
												min={1}
												max={maxGuests}
												defaultValue={1}
												inputMode="numeric"
												className="dh-form-input rounded-lg border bg-white px-4 py-3 text-sm"
												style={{
													borderColor: "rgba(201,169,110,0.3)",
													color: COLORS.dark,
												}}
											/>
										</label>
										<label
											className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em]"
											style={{ color: COLORS.muted }}
										>
											<span>
												<span lang="en">Dietary Requirements</span>{" "}
												<span lang="zh-Hans">/ 饮食要求</span>
											</span>
											<select
												name="dietary"
												defaultValue=""
												className="dh-form-input rounded-lg border bg-white px-4 py-3 text-sm"
												style={{
													borderColor: "rgba(201,169,110,0.3)",
													color: COLORS.dark,
												}}
											>
												<option value="">No restrictions</option>
												<option value="halal">Halal</option>
												<option value="vegetarian">Vegetarian</option>
												<option value="no-beef">No Beef</option>
												<option value="no-seafood">No Seafood</option>
												<option value="other">
													Other (specify in message)
												</option>
											</select>
										</label>
										<label
											className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em]"
											style={{ color: COLORS.muted }}
										>
											<span lang="en">Message</span>
											<textarea
												name="message"
												placeholder="Send your wishes to the couple"
												autoComplete="off"
												maxLength={500}
												className="dh-form-input min-h-24 rounded-lg border bg-white px-4 py-3 text-sm placeholder:text-gray-400"
												style={{
													borderColor: "rgba(201,169,110,0.3)",
													color: COLORS.dark,
												}}
											/>
										</label>
										<label className="relative mt-2 flex min-h-[44px] cursor-pointer items-start gap-3">
											<input
												type="checkbox"
												name="consent"
												required
												aria-describedby={consentDescriptionId}
												className="mt-0.5 h-4 w-4 rounded border-2 accent-[#E8764B]"
												style={{
													borderColor: "rgba(201,169,110,0.3)",
												}}
											/>
											<span
												id={consentDescriptionId}
												className="text-xs leading-relaxed"
												style={{ color: COLORS.muted }}
												lang="en"
											>
												I consent to the collection of my personal data as
												described in the{" "}
												<Link
													to="/privacy"
													className="underline hover:no-underline"
													style={{ color: COLORS.primary }}
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
											style={{ color: COLORS.muted }}
											aria-live="polite"
										>
											{rsvpStatus}
										</output>
									) : null}

									<button
										type="submit"
										disabled={isSubmitting}
										className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-sm transition-all hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
										style={{
											background: "linear-gradient(135deg, #E8764B, #C45A30)",
											boxShadow: isSubmitting
												? undefined
												: "0 4px 12px rgba(232,118,75,0.2)",
										}}
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
											style={{ color: COLORS.muted }}
											lang="en"
										>
											Or RSVP via WhatsApp
										</a>
									)}
								</form>
							</Reveal>
						</div>
					)}
				</div>
			</SectionShell>

			<div className="dh-gold-divider mx-auto w-48 my-1" />

			{/* ════════════════════════════════════════════
			    11. FOOTER — Closing with gift merged in
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="footer"
				mode={mode}
				hidden={hiddenSections?.footer}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-cream relative overflow-hidden px-6 pb-20 pt-16 text-center sm:px-10"
			>
				<div className="mx-auto max-w-3xl">
					<ArtDecoDivider className="mb-10" />

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
						<Shimmer>
							<p
								className="dh-gold-shimmer mt-8 text-6xl"
								style={accentFont}
								aria-hidden="true"
							>
								囍
							</p>
						</Shimmer>
					</Reveal>

					<Reveal direction="up" delay={0.2}>
						<p
							{...editableProps(
								"footer.message",
								"mt-6 whitespace-pre-line text-lg leading-relaxed",
							)}
							style={{ ...headingFont, color: COLORS.dark }}
						>
							{data.footer.message}
						</p>
					</Reveal>

					{data.footer.socialLinks?.hashtag ? (
						<Reveal direction="up" delay={0.3}>
							<p
								className="mt-5 text-xs uppercase tracking-[0.28em]"
								style={{ color: COLORS.muted }}
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
					primaryColor={COLORS.primary}
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
