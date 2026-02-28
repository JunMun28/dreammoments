import { Link } from "@tanstack/react-router";
import { type CSSProperties, useId, useRef, useState } from "react";
import { useScrollReveal } from "../../../lib/scroll-effects";
import { AddToCalendarButton } from "../../ui/AddToCalendarButton";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
import AngpowQRCode from "../AngpowQRCode";
import { CountdownWidget } from "../CountdownWidget";
import { makeEditableProps, parseAttendance } from "../helpers";
import {
	RsvpConfirmation,
	type RsvpConfirmationProps,
} from "../RsvpConfirmation";
import SectionShell from "../SectionShell";
import type { TemplateInvitationProps } from "../types";
import "./double-happiness.css";

/* ─── Design Tokens ─── */

// NEVER use gold text on red bg (2.66:1 fails WCAG)
const COLORS = {
	red: "#C8102E",
	gold: "#D4A843",
	cream: "#FFF8F0",
	dark: "#2B1216",
	deepRed: "#8B1A1A",
	goldLight: "#F5E6C8",
	muted: "#8B7355",
} as const;

/* ─── Typography ─── */

const headingFont: CSSProperties = {
	fontFamily: "'Noto Serif SC', 'Songti SC', Georgia, serif",
};

const bodyFont: CSSProperties = {
	fontFamily: "Inter, 'Noto Sans SC', system-ui, sans-serif",
};

const accentFont: CSSProperties = {
	fontFamily: "'Noto Serif SC', 'Songti SC', serif",
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
	useScrollReveal();

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

	const heroImageUrl = data.hero.heroImageUrl || PLACEHOLDER_PHOTO;

	return (
		<div className="double-happiness" style={bodyFont} lang="zh-Hans">
			{/* ════════════════════════════════════════════
			    1. HERO — Full-bleed photo with dark overlay
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="hero"
				mode={mode}
				hidden={hiddenSections?.hero}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="relative min-h-[100svh] overflow-hidden"
			>
				{/* Background image */}
				<img
					src={heroImageUrl}
					alt=""
					fetchPriority="high"
					decoding="async"
					className="absolute inset-0 h-full w-full object-cover"
					onError={(e) => {
						const img = e.target as HTMLImageElement;
						if (!img.dataset.fallback) {
							img.dataset.fallback = "true";
							img.src = PLACEHOLDER_PHOTO;
						}
					}}
				/>
				{/* Dark overlay */}
				<div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />

				{/* 囍 watermark */}
				<span
					className="dh-xi-watermark absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
					aria-hidden="true"
					style={accentFont}
				>
					囍
				</span>

				<div className="relative z-10 mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
					<p
						data-reveal
						className="dm-reveal text-xs uppercase tracking-[0.5em]"
						style={{ color: COLORS.goldLight }}
					>
						<span lang="en">WE ARE GETTING MARRIED</span>
					</p>

					<h1
						data-reveal
						style={accentFont}
						className="dm-reveal mt-8 text-4xl text-white sm:text-6xl"
					>
						<span {...editableProps("hero.partnerOneName", "inline-block")}>
							{data.hero.partnerOneName}
						</span>
						<span
							className="mx-3 inline-block text-3xl sm:mx-4 sm:text-5xl"
							style={{ color: COLORS.gold }}
						>
							&
						</span>
						<span {...editableProps("hero.partnerTwoName", "inline-block")}>
							{data.hero.partnerTwoName}
						</span>
					</h1>

					<p
						data-reveal
						{...editableProps(
							"hero.tagline",
							"dm-reveal mt-6 max-w-xl text-lg leading-relaxed",
						)}
						style={{ ...headingFont, color: COLORS.goldLight }}
					>
						{data.hero.tagline}
					</p>

					<div
						data-reveal
						className="dm-reveal mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-white/90"
					>
						<span
							className="rounded-full border border-white/20 px-4 py-2"
							lang="en"
						>
							{weddingDateEn}
						</span>
						<span className="rounded-full border border-white/20 px-4 py-2">
							{data.venue.name}
						</span>
					</div>

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
			</SectionShell>

			{/* ════════════════════════════════════════════
			    2. COUNTDOWN
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="countdown"
				mode={mode}
				hidden={hiddenSections?.countdown}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-cream px-6 py-16 sm:px-10"
			>
				<CountdownWidget
					targetDate={data.hero.date}
					eventTime={data.schedule.events[0]?.time}
				/>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    3. ANNOUNCEMENT — Bilingual formal greeting
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="announcement"
				mode={mode}
				hidden={hiddenSections?.announcement}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-cream relative px-6 py-24 sm:px-10"
			>
				<div className="mx-auto max-w-3xl text-center">
					<div className="dh-gold-divider mx-auto mb-10 w-32" />

					<p
						data-reveal
						className="dm-reveal text-sm tracking-[0.5em]"
						style={{ ...headingFont, color: COLORS.red }}
					>
						诚 挚 邀 请
					</p>

					<h2
						data-reveal
						{...editableProps(
							"announcement.title",
							"dm-reveal mt-6 text-4xl sm:text-5xl",
						)}
						style={{ ...accentFont, color: COLORS.dark }}
					>
						{data.announcement.title}
					</h2>

					<div
						data-reveal
						className="dm-reveal dh-blockquote mx-auto mt-8 max-w-2xl text-left"
					>
						<p
							{...editableProps(
								"announcement.message",
								"text-base leading-relaxed",
							)}
							style={{ color: COLORS.dark }}
						>
							{data.announcement.message}
						</p>
					</div>

					<p
						data-reveal
						{...editableProps(
							"announcement.formalText",
							"dm-reveal mx-auto mt-6 max-w-2xl text-sm leading-relaxed",
						)}
						style={{ color: COLORS.muted }}
						lang="en"
					>
						{data.announcement.formalText}
					</p>

					<div className="dh-gold-divider mx-auto mt-10 w-32" />
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    4. COUPLE — Side-by-side portraits
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="couple"
				mode={mode}
				hidden={hiddenSections?.couple}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-white px-6 py-24 sm:px-10"
			>
				<div className="mx-auto max-w-4xl">
					<div className="text-center">
						<p
							data-reveal
							className="dm-reveal text-sm tracking-[0.5em]"
							style={{ ...headingFont, color: COLORS.red }}
						>
							新 郎 新 娘
						</p>
						<h2
							data-reveal
							className="dm-reveal mt-3 text-4xl sm:text-5xl"
							style={{ ...accentFont, color: COLORS.dark }}
							lang="en"
						>
							The Couple
						</h2>
					</div>

					<div className="mt-14 grid gap-12 sm:grid-cols-2">
						{/* Groom */}
						<div data-reveal className="dm-reveal text-center">
							<div className="dh-photo-frame mx-auto h-64 w-64 overflow-hidden rounded-full">
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
							<p
								className="mt-4 text-xs uppercase tracking-[0.3em]"
								style={{ color: COLORS.gold }}
							>
								<span>新郎</span> <span lang="en">/ THE GROOM</span>
							</p>
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
									"mt-2 text-sm leading-relaxed",
								)}
								style={{ color: COLORS.muted }}
							>
								{data.couple.partnerOne.bio}
							</p>
						</div>

						{/* Bride */}
						<div
							data-reveal
							className="dm-reveal text-center"
							style={{ transitionDelay: "0.15s" }}
						>
							<div className="dh-photo-frame mx-auto h-64 w-64 overflow-hidden rounded-full">
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
							<p
								className="mt-4 text-xs uppercase tracking-[0.3em]"
								style={{ color: COLORS.gold }}
							>
								<span>新娘</span> <span lang="en">/ THE BRIDE</span>
							</p>
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
									"mt-2 text-sm leading-relaxed",
								)}
								style={{ color: COLORS.muted }}
							>
								{data.couple.partnerTwo.bio}
							</p>
						</div>
					</div>
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    5. STORY — Timeline with gold line
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="story"
				mode={mode}
				hidden={hiddenSections?.story}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-cream px-6 py-24 sm:px-10"
			>
				<div className="mx-auto max-w-4xl">
					<div className="text-center">
						<p
							data-reveal
							className="dm-reveal text-sm tracking-[0.5em]"
							style={{ ...headingFont, color: COLORS.red }}
						>
							爱 情 故 事
						</p>
						<h2
							data-reveal
							className="dm-reveal mt-3 text-4xl sm:text-5xl"
							style={{ ...accentFont, color: COLORS.dark }}
							lang="en"
						>
							Our Story
						</h2>
					</div>

					<div className="relative mt-16 pl-8 sm:pl-12">
						{/* Timeline line */}
						<div className="dh-timeline-line absolute left-1 top-0 h-full sm:left-3" />

						<div className="space-y-16">
							{data.story.milestones.map((milestone, index) => (
								<article
									key={`${milestone.date}-${index}`}
									data-reveal
									className="dm-reveal relative"
									style={{
										transitionDelay: `${Math.min(index * 0.1, 0.5)}s`,
									}}
								>
									{/* Timeline dot */}
									<div className="dh-timeline-dot absolute -left-8 top-1 sm:-left-12" />

									<p
										className="text-xs uppercase tracking-[0.25em]"
										style={{ color: COLORS.gold }}
									>
										{milestone.date}
									</p>
									<h3
										className="mt-2 text-2xl"
										style={{
											...headingFont,
											color: COLORS.dark,
										}}
									>
										{milestone.title}
									</h3>
									<p
										className="mt-2 text-sm leading-relaxed"
										style={{ color: COLORS.muted }}
									>
										{milestone.description}
									</p>
								</article>
							))}
						</div>
					</div>
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    6. GALLERY — 2-column grid
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="gallery"
				mode={mode}
				hidden={hiddenSections?.gallery}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-white px-6 py-24 sm:px-10"
			>
				<div className="mx-auto max-w-5xl">
					<div className="text-center">
						<p
							data-reveal
							className="dm-reveal text-sm tracking-[0.5em]"
							style={{ ...headingFont, color: COLORS.red }}
						>
							甜 蜜 瞬 间
						</p>
						<h2
							data-reveal
							className="dm-reveal mt-3 text-4xl sm:text-5xl"
							style={{ ...accentFont, color: COLORS.dark }}
							lang="en"
						>
							Gallery
						</h2>
					</div>

					<div className="mt-12 grid gap-4 sm:grid-cols-2">
						{data.gallery.photos.map((photo, index) => (
							<figure
								key={`${photo.url}-${index}`}
								data-reveal
								className={`dm-reveal dh-photo-frame group relative overflow-hidden rounded-xl ${index === 0 ? "sm:col-span-2" : ""}`}
								style={{ transitionDelay: `${Math.min(index * 0.1, 0.5)}s` }}
							>
								<img
									src={photo.url || PLACEHOLDER_PHOTO}
									alt={photo.caption || "Couple memory"}
									loading="lazy"
									decoding="async"
									width={900}
									height={index === 0 ? 500 : 600}
									className={`w-full object-cover ${index === 0 ? "h-72 sm:h-96" : "h-64 sm:h-80"}`}
									style={{
										backgroundColor: COLORS.goldLight,
									}}
									onError={(e) => {
										const img = e.target as HTMLImageElement;
										if (!img.dataset.fallback) {
											img.dataset.fallback = "true";
											img.src = PLACEHOLDER_PHOTO;
										}
									}}
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
								<figcaption className="absolute bottom-4 left-4 text-sm font-medium text-white">
									{photo.caption}
								</figcaption>
							</figure>
						))}
					</div>
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    7. SCHEDULE — Event cards
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="schedule"
				mode={mode}
				hidden={hiddenSections?.schedule}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-cream px-6 py-24 sm:px-10"
			>
				<div className="mx-auto max-w-4xl">
					<div className="text-center">
						<p
							data-reveal
							className="dm-reveal text-sm tracking-[0.5em]"
							style={{ ...headingFont, color: COLORS.red }}
						>
							婚 礼 流 程
						</p>
						<h2
							data-reveal
							className="dm-reveal mt-3 text-4xl sm:text-5xl"
							style={{ ...accentFont, color: COLORS.dark }}
							lang="en"
						>
							Schedule
						</h2>
					</div>

					<div className="mt-14 space-y-4">
						{data.schedule.events.map((event, index) => (
							<article
								key={`${event.time}-${index}`}
								data-reveal
								className="dm-reveal flex gap-4 rounded-xl border border-[rgba(212,168,67,0.2)] bg-white p-5"
								style={{ transitionDelay: `${Math.min(index * 0.08, 0.5)}s` }}
							>
								<div
									className="w-1 shrink-0 rounded-full"
									style={{
										background: COLORS.red,
									}}
								/>
								<div>
									<p
										className="text-xs font-semibold uppercase tracking-[0.2em]"
										style={{ color: COLORS.gold }}
									>
										{event.time}
									</p>
									<h3
										className="mt-1 text-lg"
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
					</div>
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    8. VENUE — Name, address, map link
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="venue"
				mode={mode}
				hidden={hiddenSections?.venue}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-white px-6 py-24 sm:px-10"
			>
				<div className="mx-auto max-w-3xl text-center">
					<p
						data-reveal
						className="dm-reveal text-sm tracking-[0.5em]"
						style={{ ...headingFont, color: COLORS.red }}
					>
						婚 礼 地 点
					</p>
					<h2
						data-reveal
						className="dm-reveal mt-3 text-4xl sm:text-5xl"
						style={{ ...accentFont, color: COLORS.dark }}
						lang="en"
					>
						Venue
					</h2>

					<h3
						data-reveal
						{...editableProps("venue.name", "dm-reveal mt-8 text-2xl")}
						style={{ ...headingFont, color: COLORS.dark }}
					>
						{data.venue.name}
					</h3>

					<p
						data-reveal
						{...editableProps(
							"venue.address",
							"dm-reveal mt-3 text-sm leading-relaxed",
						)}
						style={{ color: COLORS.muted }}
					>
						{data.venue.address}
					</p>

					{data.venue.directions ? (
						<p
							data-reveal
							className="dm-reveal mt-2 text-sm"
							style={{ color: COLORS.muted }}
						>
							{data.venue.directions}
						</p>
					) : null}

					{data.venue.parkingInfo ? (
						<p
							data-reveal
							className="dm-reveal mt-3 text-xs uppercase tracking-[0.2em]"
							style={{ color: COLORS.gold }}
						>
							{data.venue.parkingInfo}
						</p>
					) : null}

					{data.venue.coordinates?.lat != null &&
					data.venue.coordinates?.lng != null ? (
						<div
							data-reveal
							className="dm-reveal mt-6 flex flex-wrap justify-center gap-3"
						>
							<a
								href={`https://www.google.com/maps/search/?api=1&query=${data.venue.coordinates.lat},${data.venue.coordinates.lng}`}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-[rgba(200,16,46,0.05)]"
								style={{
									borderColor: "rgba(200,16,46,0.2)",
									color: COLORS.red,
								}}
								lang="en"
							>
								Google Maps
							</a>
							<a
								href={`https://www.waze.com/ul?ll=${data.venue.coordinates.lat},${data.venue.coordinates.lng}&navigate=yes`}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-[rgba(200,16,46,0.05)]"
								style={{
									borderColor: "rgba(200,16,46,0.2)",
									color: COLORS.red,
								}}
								lang="en"
							>
								Waze
							</a>
						</div>
					) : null}
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    9. RSVP — Full form on deep red bg
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="rsvp"
				mode={mode}
				hidden={hiddenSections?.rsvp}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-dark px-6 py-24 sm:px-10"
			>
				<div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
					{/* Left: info */}
					<div data-reveal className="dm-reveal space-y-5">
						<p
							className="text-sm tracking-[0.5em]"
							style={{
								...headingFont,
								color: COLORS.goldLight,
							}}
						>
							敬 请 回 复
						</p>
						<h2
							className="text-4xl sm:text-5xl"
							style={{ ...accentFont, color: "#FFF8F0" }}
							lang="en"
						>
							RSVP
						</h2>
						<p
							className="max-w-md text-sm leading-relaxed"
							style={{ color: "rgba(255,248,240,0.7)" }}
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
								style={{ color: COLORS.goldLight }}
								lang="en"
							>
								RSVP Deadline
							</p>
							<p
								className="mt-2 text-sm"
								style={{ color: "#FFF8F0" }}
								lang="en"
							>
								{rsvpDeadlineEn}
							</p>
							<p
								className="mt-3 text-xs uppercase tracking-[0.2em]"
								style={{ color: "rgba(255,248,240,0.5)" }}
								lang="en"
							>
								{data.rsvp.allowPlusOnes
									? `Up to ${maxGuests} ${maxGuests > 1 ? "guests" : "guest"} on this invite`
									: "This invitation is for one guest"}
							</p>
						</div>
					</div>

					{/* Right: form or confirmation */}
					{rsvpData ? (
						<div
							data-reveal
							className="dm-reveal flex items-center justify-center rounded-2xl p-6 sm:p-8"
							style={{
								background: COLORS.cream,
								border: "1px solid rgba(212,168,67,0.2)",
							}}
						>
							<RsvpConfirmation
								{...rsvpData}
								onEdit={() => setRsvpData(null)}
							/>
						</div>
					) : (
						<form
							data-reveal
							className="dm-reveal rounded-2xl p-6 sm:p-8"
							style={{
								background: COLORS.cream,
								border: "1px solid rgba(212,168,67,0.2)",
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

								const rawGuestCount = Number(formData.get("guestCount") ?? 1);
								const guestCount = Number.isFinite(rawGuestCount)
									? Math.min(Math.max(rawGuestCount, 1), maxGuests)
									: 1;
								const attendance = parseAttendance(formData.get("attendance"));
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
							<div className="grid gap-4 sm:grid-cols-2">
								<label
									className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em] sm:col-span-2"
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
										className="rounded-lg border bg-white px-4 py-3 text-sm placeholder:text-gray-400"
										style={{
											borderColor: "rgba(212,168,67,0.3)",
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
									className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em] sm:col-span-2"
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
										className="rounded-lg border bg-white px-4 py-3 text-sm placeholder:text-gray-400"
										style={{
											borderColor: "rgba(212,168,67,0.3)",
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
										className="rounded-lg border bg-white px-4 py-3 text-sm"
										style={{
											borderColor: "rgba(212,168,67,0.3)",
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
										className="rounded-lg border bg-white px-4 py-3 text-sm"
										style={{
											borderColor: "rgba(212,168,67,0.3)",
											color: COLORS.dark,
										}}
									/>
								</label>
								<label
									className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em] sm:col-span-2"
									style={{ color: COLORS.muted }}
								>
									<span lang="en">Dietary Requirements</span>
									<input
										name="dietary"
										placeholder="e.g., Vegetarian, no pork"
										autoComplete="off"
										maxLength={200}
										className="rounded-lg border bg-white px-4 py-3 text-sm placeholder:text-gray-400"
										style={{
											borderColor: "rgba(212,168,67,0.3)",
											color: COLORS.dark,
										}}
									/>
								</label>
								<label
									className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em] sm:col-span-2"
									style={{ color: COLORS.muted }}
								>
									<span lang="en">Message</span>
									<textarea
										name="message"
										placeholder="Send your wishes to the couple"
										autoComplete="off"
										maxLength={500}
										className="min-h-24 rounded-lg border bg-white px-4 py-3 text-sm placeholder:text-gray-400"
										style={{
											borderColor: "rgba(212,168,67,0.3)",
											color: COLORS.dark,
										}}
									/>
								</label>
								<label className="relative mt-2 flex min-h-[44px] cursor-pointer items-start gap-3 sm:col-span-2">
									<input
										type="checkbox"
										name="consent"
										required
										aria-describedby={consentDescriptionId}
										className="mt-0.5 h-4 w-4 rounded border-2 accent-[#C8102E]"
										style={{
											borderColor: "rgba(212,168,67,0.3)",
										}}
									/>
									<span
										id={consentDescriptionId}
										className="text-xs leading-relaxed"
										style={{ color: COLORS.muted }}
										lang="en"
									>
										I consent to the collection of my personal data as described
										in the{" "}
										<Link
											to="/privacy"
											className="underline hover:no-underline"
											style={{ color: COLORS.red }}
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
								className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-white disabled:cursor-not-allowed disabled:opacity-70"
								style={{
									background: COLORS.red,
								}}
							>
								{isSubmitting && <LoadingSpinner size="sm" />}
								{isSubmitting ? "Sending..." : "Send RSVP"}
							</button>

							{submitError && (
								<p
									className="mt-3 text-center text-sm"
									style={{ color: COLORS.red }}
									role="alert"
								>
									{submitError}
								</p>
							)}
						</form>
					)}
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    10. GIFT — Digital angpow (hidden by default)
			    ════════════════════════════════════════════ */}
			{data.gift && (
				<SectionShell
					sectionId="gift"
					mode={mode}
					hidden={hiddenSections?.gift}
					onSelect={onSectionSelect}
					onAiClick={onAiClick}
					className="dh-section-cream px-6 py-24 sm:px-10"
				>
					<div className="mx-auto max-w-md text-center">
						<p
							data-reveal
							className="dm-reveal text-sm tracking-[0.5em]"
							style={{ ...headingFont, color: COLORS.red }}
						>
							礼 金 祝 福
						</p>
						<h2
							data-reveal
							className="dm-reveal mt-3 text-4xl"
							style={{ ...accentFont, color: COLORS.dark }}
							lang="en"
						>
							Digital Angpow
						</h2>
						<div data-reveal className="dm-reveal mt-8">
							<AngpowQRCode
								paymentUrl={data.gift.paymentUrl}
								paymentMethod={data.gift.paymentMethod}
								recipientName={data.gift.recipientName}
							/>
						</div>
					</div>
				</SectionShell>
			)}

			{/* ════════════════════════════════════════════
			    11. FOOTER — Bilingual thank you
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="footer"
				mode={mode}
				hidden={hiddenSections?.footer}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="dh-section-cream relative px-6 pb-20 pt-16 text-center sm:px-10"
			>
				<div className="mx-auto max-w-3xl">
					<div className="dh-gold-divider mx-auto mb-10 w-24" />

					<p
						data-reveal
						className="dm-reveal text-6xl"
						style={{ ...accentFont, color: COLORS.red }}
						aria-hidden="true"
					>
						囍
					</p>

					<p
						data-reveal
						{...editableProps(
							"footer.message",
							"dm-reveal mt-6 whitespace-pre-line text-lg leading-relaxed",
						)}
						style={{ ...headingFont, color: COLORS.dark }}
					>
						{data.footer.message}
					</p>

					{data.footer.socialLinks?.hashtag ? (
						<p
							data-reveal
							className="dm-reveal mt-5 text-xs uppercase tracking-[0.28em]"
							style={{ color: COLORS.muted }}
						>
							{data.footer.socialLinks.hashtag}
						</p>
					) : null}
				</div>
			</SectionShell>
		</div>
	);
}
