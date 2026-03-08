import { Link } from "@tanstack/react-router";
import { type CSSProperties, useId, useRef, useState } from "react";
import { AddToCalendarButton } from "../../ui/AddToCalendarButton";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
import AngpowQRCode from "../AngpowQRCode";
import {
	ClipReveal,
	DrawPath,
	ParticleField,
	Reveal,
	Stagger,
} from "../animations";
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
import SwiperGallery from "../SwiperGallery";
import type { TemplateInvitationProps } from "../types";
import "./romantic-cinematic.css";

/* ─── Design Tokens ─── */

const COLORS = {
	primary: "#A8354D",
	accent: "#C4B5D4",
	cream: "#F8F5F0",
	dark: "#1A1225",
	espresso: "#1A1225",
	accentLight: "#E0D8EB",
	muted: "#5C5168",
} as const;

/* ─── Typography ─── */

const headingFont: CSSProperties = {
	fontFamily: "'Bodoni Moda', 'Noto Serif SC', Georgia, serif",
};

const bodyFont: CSSProperties = {
	fontFamily: "'Jost', 'Noto Sans SC', system-ui, sans-serif",
};

const accentFont: CSSProperties = {
	fontFamily: "'Bodoni Moda', 'Noto Serif SC', serif",
	fontWeight: 700,
};

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

/* ─── Diamond Divider ─── */

function DiamondDivider({ className = "" }: { className?: string }) {
	return (
		<DrawPath
			d="M0,15 L60,15 M70,5 L80,15 L70,25 L60,15 M80,15 L140,15"
			stroke={COLORS.primary}
			strokeWidth={1.5}
			width={140}
			height={30}
			duration={1.2}
			className={`mx-auto ${className}`}
		/>
	);
}

/* ─── Main Component ─── */

export default function RomanticCinematicInvitation({
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
		<div className="romantic-cinematic" style={bodyFont} lang="zh-Hans">
			{/* ════════════════════════════════════════════
			    1. HERO — Full-bleed photo with cinematic curtain reveal
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="hero"
				mode={mode}
				hidden={hiddenSections?.hero}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="relative min-h-[100svh] overflow-hidden bg-[#1A1225]"
			>
				<ClipReveal shape="curtain" duration={1.4}>
					{/* Background media */}
					<HeroMedia
						heroImageUrl={data.hero.heroImageUrl}
						avatarImageUrl={data.hero.avatarImageUrl}
						animatedVideoUrl={data.hero.animatedVideoUrl}
						mode={mode}
					/>

					{/* Cinematic gradient overlay — transparent top, aubergine bottom */}
					<div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1A1225]/30 to-[#1A1225]/70" />

					{/* Film-grain texture */}
					<div className="rc-film-grain" aria-hidden="true" />

					{/* Starlight particles */}
					<ParticleField preset="starlight" />

					{/* Letterbox bar — top */}
					<div
						className="rc-letterbox-bar absolute left-0 right-0 top-0 z-10"
						aria-hidden="true"
					/>

					{/* Letterbox bar — bottom */}
					<div
						className="rc-letterbox-bar absolute bottom-0 left-0 right-0 z-10"
						aria-hidden="true"
					/>

					<div className="relative z-10 mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
						<Reveal direction="blur" duration={0.9}>
							<h1
								style={accentFont}
								className="mt-8 text-5xl text-white sm:text-7xl"
							>
								<span {...editableProps("hero.partnerOneName", "inline-block")}>
									{data.hero.partnerOneName}
								</span>
								<span
									className="rc-gold-shimmer mx-3 inline-block text-4xl sm:mx-4 sm:text-6xl"
									style={{ color: COLORS.accent }}
								>
									&amp;
								</span>
								<span {...editableProps("hero.partnerTwoName", "inline-block")}>
									{data.hero.partnerTwoName}
								</span>
							</h1>
						</Reveal>

						<Reveal direction="blur" delay={0.2} duration={0.9}>
							<p
								{...editableProps(
									"hero.tagline",
									"mt-6 max-w-xl text-lg italic leading-relaxed",
								)}
								style={{
									...headingFont,
									color: COLORS.accentLight,
								}}
							>
								{data.hero.tagline}
							</p>
						</Reveal>

						<Reveal direction="up" delay={0.4} duration={0.9}>
							<div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-white/90">
								<span
									className="rounded-full border border-[rgba(196,181,212,0.3)] px-4 py-2"
									lang="en"
								>
									{weddingDateEn}
								</span>
								<span className="rounded-full border border-[rgba(196,181,212,0.3)] px-4 py-2">
									{data.venue.name}
								</span>
							</div>
						</Reveal>

						{mode !== "editor" && (
							<div className="mt-6">
								<AddToCalendarButton
									title={`${data.hero.partnerOneName} & ${data.hero.partnerTwoName}'s Wedding`}
									date={data.hero.date}
									venue={data.venue.name}
									address={data.venue.address}
									variant="dark"
								/>
							</div>
						)}
					</div>
				</ClipReveal>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    2. LOVE LETTER — Italic serif on parchment card
			    ════════════════════════════════════════════ */}
			{data.loveLetter && (
				<SectionShell
					sectionId="extra"
					mode={mode}
					hidden={hiddenSections?.extra}
					onSelect={onSectionSelect}
					onAiClick={onAiClick}
					className="rc-section-parchment relative overflow-hidden px-6 py-16 sm:py-24 sm:px-10"
				>
					<Reveal direction="blur" duration={1.2}>
						<div className="mx-auto max-w-lg text-center">
							<div className="rc-love-letter rounded-xl p-8 backdrop-blur-sm sm:p-12">
								<p
									className="text-sm tracking-widest"
									style={{ ...accentFont, color: COLORS.primary }}
								>
									A LETTER FROM {data.loveLetter.from.toUpperCase()}
								</p>
								<DiamondDivider className="my-6" />
								<p
									className="whitespace-pre-line text-base leading-loose italic"
									style={{ ...headingFont, color: COLORS.dark }}
								>
									{data.loveLetter.message}
								</p>
							</div>
						</div>
					</Reveal>
				</SectionShell>
			)}

			<div className="rc-rose-divider mx-auto w-32 my-1" aria-hidden="true" />

			{/* ════════════════════════════════════════════
			    3. COUPLE — Overlapping portrait frames
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="couple"
				mode={mode}
				hidden={hiddenSections?.couple}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="rc-section-parchment px-6 py-16 sm:py-24 sm:px-10"
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

					<div className="relative mx-auto mt-14 max-w-md">
						<Reveal direction="left">
							<div
								className="relative z-10 ml-0 w-3/5 overflow-hidden rounded-lg"
								style={{
									boxShadow:
										"0 8px 30px rgba(26, 18, 37, 0.2), 0 2px 8px rgba(26, 18, 37, 0.1)",
								}}
							>
								<img
									src={data.couple.partnerOne.photoUrl || PLACEHOLDER_PHOTO}
									alt={data.couple.partnerOne.fullName}
									className="aspect-[3/4] w-full object-cover"
									loading="lazy"
									decoding="async"
								/>
							</div>
						</Reveal>
						<Reveal direction="right" delay={0.2}>
							<div
								className="relative z-20 -mt-24 ml-auto mr-0 w-3/5 overflow-hidden rounded-lg border-2 border-white"
								style={{
									boxShadow:
										"0 12px 40px rgba(26, 18, 37, 0.25), 0 4px 12px rgba(26, 18, 37, 0.12)",
								}}
							>
								<img
									src={data.couple.partnerTwo.photoUrl || PLACEHOLDER_PHOTO}
									alt={data.couple.partnerTwo.fullName}
									className="aspect-[3/4] w-full object-cover"
									loading="lazy"
									decoding="async"
								/>
							</div>
						</Reveal>
						<div className="mt-8 text-center">
							<h3
								style={{ ...headingFont, color: COLORS.dark }}
								className="text-2xl sm:text-3xl"
							>
								<span
									{...editableProps("couple.partnerOne.fullName", "inline")}
								>
									{data.couple.partnerOne.fullName}
								</span>{" "}
								<span style={{ color: COLORS.primary }}>&amp;</span>{" "}
								<span
									{...editableProps("couple.partnerTwo.fullName", "inline")}
								>
									{data.couple.partnerTwo.fullName}
								</span>
							</h3>
						</div>
						{/* Bios below */}
						<div className="mt-6 grid grid-cols-1 gap-4 text-center sm:grid-cols-2">
							<p
								{...editableProps(
									"couple.partnerOne.bio",
									"text-sm leading-relaxed whitespace-pre-line",
								)}
								style={{ color: COLORS.muted }}
							>
								{data.couple.partnerOne.bio}
							</p>
							<p
								{...editableProps(
									"couple.partnerTwo.bio",
									"text-sm leading-relaxed whitespace-pre-line",
								)}
								style={{ color: COLORS.muted }}
							>
								{data.couple.partnerTwo.bio}
							</p>
						</div>
					</div>
				</div>
			</SectionShell>

			<div className="rc-rose-divider mx-auto w-32 my-1" aria-hidden="true" />

			{/* ════════════════════════════════════════════
			    4. STORY — Full-bleed alternating photo/text layout
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="story"
				mode={mode}
				hidden={hiddenSections?.story}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="relative overflow-hidden"
			>
				<div>
					<div className="px-6 py-12 text-center sm:px-10">
						<SectionTitle
							zhLabel="爱 情 故 事"
							enHeading="Our Story"
							primaryColor={COLORS.primary}
							darkColor={COLORS.dark}
							headingFont={headingFont}
							accentFont={accentFont}
						/>
						<DiamondDivider className="my-8" />
					</div>
					<div className="space-y-0">
						{data.story.milestones.map((m, i) => (
							<Reveal
								key={`${m.date}-${i}`}
								direction="up"
								duration={0.9}
								delay={i * 0.1}
							>
								<div
									className={`flex flex-col ${i % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row"}`}
								>
									{m.photoUrl && (
										<div className="rc-photo-frame sm:w-1/2">
											<img
												src={m.photoUrl || PLACEHOLDER_PHOTO}
												alt={m.title}
												className="aspect-[16/9] w-full object-cover"
												loading="lazy"
												decoding="async"
											/>
										</div>
									)}
									<div
										className="flex flex-col justify-center px-8 py-10 sm:w-1/2"
										style={{
											backgroundColor: COLORS.dark,
											color: "#F8F5F0",
										}}
									>
										<p
											className="text-sm tracking-widest"
											style={{
												...accentFont,
												color: COLORS.accent,
											}}
										>
											{m.date}
										</p>
										<h3 className="mt-2 text-2xl" style={headingFont}>
											{m.title}
										</h3>
										<p className="mt-3 whitespace-pre-line text-sm leading-relaxed opacity-80">
											{m.description}
										</p>
									</div>
								</div>
							</Reveal>
						))}
					</div>
				</div>
			</SectionShell>

			<div className="rc-rose-divider mx-auto w-32 my-1" aria-hidden="true" />

			{/* ════════════════════════════════════════════
			    5. GALLERY — Parchment section with film-strip
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="gallery"
				mode={mode}
				hidden={hiddenSections?.gallery}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="rc-section-parchment px-6 py-16 sm:py-24 sm:px-10"
			>
				<div className="mx-auto max-w-5xl">
					<SectionTitle
						zhLabel="幸 福 留 影"
						enHeading="Gallery"
						primaryColor={COLORS.primary}
						darkColor={COLORS.dark}
						headingFont={headingFont}
						accentFont={accentFont}
					/>

					<Reveal direction="up" duration={0.9}>
						<div className="rc-film-strip mt-12">
							<SwiperGallery
								photos={data.gallery.photos.map((p) => ({
									url: p.url,
									caption: p.caption,
								}))}
								primaryColor={COLORS.primary}
							/>
						</div>
					</Reveal>
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    6. HIGHLIGHTS REEL — Cinematic photo montage
			    ════════════════════════════════════════════ */}
			{data.highlightsReel && (
				<SectionShell
					sectionId="details"
					mode={mode}
					hidden={hiddenSections?.details}
					onSelect={onSectionSelect}
					onAiClick={onAiClick}
					className="rc-section-aubergine relative overflow-hidden px-6 py-14 sm:py-20 sm:px-10"
				>
					<div className="mx-auto max-w-5xl text-center">
						<SectionTitle
							zhLabel="精 彩 瞬 间"
							enHeading="Highlights"
							primaryColor={COLORS.primary}
							darkColor={COLORS.cream}
							headingFont={headingFont}
							accentFont={accentFont}
						/>
						<DiamondDivider className="my-8" />
						<Stagger interval={0.1}>
							<div className="grid grid-cols-2 gap-3 sm:gap-4">
								{data.highlightsReel.photos.map((photo) => (
									<div
										key={photo.url}
										className="rc-highlight-photo group relative"
									>
										<img
											src={photo.url || PLACEHOLDER_PHOTO}
											alt={photo.caption || "Highlight"}
											className="aspect-[16/10] w-full object-cover"
											loading="lazy"
											decoding="async"
										/>
										{photo.caption && (
											<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1A1225]/80 to-transparent p-3">
												<p
													className="text-xs text-[#F8F5F0]"
													style={headingFont}
												>
													{photo.caption}
												</p>
											</div>
										)}
									</div>
								))}
							</div>
						</Stagger>
					</div>
				</SectionShell>
			)}

			{/* ════════════════════════════════════════════
			    7. SCHEDULE — Aubergine section with event cards
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="schedule"
				mode={mode}
				hidden={hiddenSections?.schedule}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="rc-section-aubergine relative overflow-hidden px-6 py-16 sm:py-24 sm:px-10"
			>
				<div className="mx-auto max-w-4xl">
					<SectionTitle
						zhLabel="婚 礼 流 程"
						enHeading="Schedule"
						primaryColor={COLORS.primary}
						darkColor={COLORS.cream}
						headingFont={headingFont}
						accentFont={accentFont}
					/>

					<Stagger className="mt-14 space-y-4" interval={0.08} direction="up">
						{data.schedule.events.map((event, index) => (
							<article
								key={`${event.time}-${index}`}
								className="rc-event-card rc-schedule-card"
							>
								<div className="rc-event-card-stripe" />
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
											color: COLORS.cream,
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

			<div className="rc-rose-divider mx-auto w-32 my-1" aria-hidden="true" />

			{/* ════════════════════════════════════════════
			    8. VENUE — Parchment section
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="venue"
				mode={mode}
				hidden={hiddenSections?.venue}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="rc-section-parchment px-6 py-16 sm:py-24 sm:px-10"
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

					<Reveal direction="up" duration={0.9}>
						<div className="mx-auto mt-8 max-w-md">
							<div className="rounded-2xl border border-[rgba(168,53,77,0.12)] bg-white p-8 text-center shadow-sm">
								<h3
									{...editableProps("venue.name", "text-2xl")}
									style={{
										...headingFont,
										color: COLORS.dark,
									}}
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
										style={{ color: COLORS.primary }}
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
											className="inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-[rgba(168,53,77,0.05)]"
											style={{
												borderColor: "rgba(168,53,77,0.2)",
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
											className="inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-[rgba(168,53,77,0.05)]"
											style={{
												borderColor: "rgba(168,53,77,0.2)",
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
						</div>
					</Reveal>
				</div>
			</SectionShell>

			<div className="rc-rose-divider mx-auto w-32 my-1" aria-hidden="true" />

			{/* ════════════════════════════════════════════
			    9. COUNTDOWN — Minimal centered
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="countdown"
				mode={mode}
				hidden={hiddenSections?.countdown}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="rc-section-parchment relative overflow-hidden px-6 py-16 sm:px-10"
			>
				<Reveal direction="up" duration={0.9}>
					<div className="mx-auto max-w-sm">
						<DiamondDivider className="mb-8" />
						<CountdownWidget
							targetDate={data.hero.date}
							eventTime={data.schedule.events[0]?.time}
							displayDate={data.hero.date}
						/>
						<DiamondDivider className="mt-8" />
					</div>
				</Reveal>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    10. RSVP — Single-column centered on dark bg
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="rsvp"
				mode={mode}
				hidden={hiddenSections?.rsvp}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="rc-section-aubergine px-6 py-16 sm:py-24 sm:px-10"
			>
				<div className="mx-auto max-w-md text-center">
					<SectionTitle
						zhLabel="敬 请 回 复"
						enHeading="RSVP"
						primaryColor={COLORS.primary}
						darkColor={COLORS.cream}
						headingFont={headingFont}
						accentFont={accentFont}
					/>

					<Reveal direction="up" duration={0.9}>
						<p
							className="mt-4 text-sm leading-relaxed"
							style={{ color: "rgba(248,245,240,0.7)" }}
							lang="en"
						>
							{data.rsvp.customMessage ||
								`Please let us know by ${rsvpDeadlineEn}`}
						</p>
					</Reveal>

					{/* Form or confirmation */}
					{rsvpData ? (
						<Reveal direction="up" duration={0.9}>
							<div className="mt-8">
								<div
									className="flex items-center justify-center rounded-2xl border border-[rgba(168,53,77,0.15)] p-6 sm:p-8"
									style={{ background: COLORS.cream }}
								>
									<RsvpConfirmation
										{...rsvpData}
										onEdit={() => setRsvpData(null)}
									/>
								</div>
							</div>
						</Reveal>
					) : (
						<Reveal direction="up" duration={0.9}>
							<div className="mt-8">
								<form
									className="rounded-2xl border border-[rgba(168,53,77,0.15)] p-6 text-left sm:p-10"
									style={{ background: COLORS.cream }}
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
												className="rc-form-input rounded-lg border bg-white px-4 py-3 text-sm placeholder:text-gray-400"
												style={{
													borderColor: "rgba(168,53,77,0.2)",
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
												className="rc-form-input rounded-lg border bg-white px-4 py-3 text-sm placeholder:text-gray-400"
												style={{
													borderColor: "rgba(168,53,77,0.2)",
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
												className="rc-form-input rounded-lg border bg-white px-4 py-3 text-sm"
												style={{
													borderColor: "rgba(168,53,77,0.2)",
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
												className="rc-form-input rounded-lg border bg-white px-4 py-3 text-sm"
												style={{
													borderColor: "rgba(168,53,77,0.2)",
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
												className="rc-form-input rounded-lg border bg-white px-4 py-3 text-sm"
												style={{
													borderColor: "rgba(168,53,77,0.2)",
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
												className="rc-form-input min-h-24 rounded-lg border bg-white px-4 py-3 text-sm placeholder:text-gray-400"
												style={{
													borderColor: "rgba(168,53,77,0.2)",
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
												className="mt-0.5 h-4 w-4 rounded border-2 accent-[#A8354D]"
												style={{
													borderColor: "rgba(168,53,77,0.3)",
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
													style={{
														color: COLORS.primary,
													}}
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
											background: "linear-gradient(135deg, #A8354D, #7E2538)",
											boxShadow: isSubmitting
												? undefined
												: "0 4px 12px rgba(168,53,77,0.2)",
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
							</div>
						</Reveal>
					)}
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    11. FOOTER — Aubergine closing (with gift merged in)
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="footer"
				mode={mode}
				hidden={hiddenSections?.footer}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="rc-section-aubergine relative overflow-hidden px-6 pb-20 pt-16 text-center sm:px-10"
			>
				<div className="mx-auto max-w-3xl">
					<DiamondDivider className="mb-10" />

					<Reveal direction="blur" duration={0.9}>
						<p
							className="rc-gold-shimmer mt-8 text-5xl"
							style={accentFont}
							aria-hidden="true"
						>
							Forever
						</p>
					</Reveal>

					<Reveal direction="up" delay={0.2} duration={0.9}>
						<p
							{...editableProps(
								"footer.message",
								"mt-6 whitespace-pre-line text-lg leading-relaxed",
							)}
							style={{ ...headingFont, color: COLORS.cream }}
						>
							{data.footer.message}
						</p>
					</Reveal>

					{data.footer.socialLinks?.hashtag ? (
						<Reveal direction="up" delay={0.3} duration={0.9}>
							<p
								className="mt-5 text-xs uppercase tracking-[0.28em]"
								style={{ color: COLORS.muted }}
							>
								{data.footer.socialLinks.hashtag}
							</p>
						</Reveal>
					) : null}

					{/* Gift merged into footer */}
					{data.gift && (
						<Reveal direction="up" delay={0.4} duration={0.9}>
							<div className="mt-10">
								<DiamondDivider className="mb-6" />
								<p
									className="mb-4 text-sm tracking-[0.3em]"
									style={{ ...headingFont, color: COLORS.accent }}
								>
									礼 金 祝 福
								</p>
								<div className="mx-auto max-w-xs">
									<AngpowQRCode
										paymentUrl={data.gift.paymentUrl}
										paymentMethod={data.gift.paymentMethod}
										recipientName={data.gift.recipientName}
									/>
								</div>
							</div>
						</Reveal>
					)}
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
