import { Link } from "@tanstack/react-router";
import { type CSSProperties, useId, useRef, useState } from "react";
import { AddToCalendarButton } from "../../ui/AddToCalendarButton";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
import AngpowQRCode from "../AngpowQRCode";
import { LetterboxReveal, Reveal, SplitText, Stagger } from "../animations";
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
import "./neo-brutalism.css";

/* --- Design Tokens --- */

const COLORS = {
	primary: "#FF6B6B",
	accent: "#FFE500",
	cream: "#FFF5E6",
	dark: "#1A1A1A",
	accentLight: "#FFF9C4",
	muted: "#666666",
	pink: "#FFE5E5",
	white: "#FFFFFF",
} as const;

/* --- Typography --- */

const headingFont: CSSProperties = {
	fontFamily: "'Space Grotesk', 'Noto Sans SC', system-ui, sans-serif",
};

const bodyFont: CSSProperties = {
	fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
};

const accentFont: CSSProperties = {
	fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif",
	fontWeight: 700,
};

/* --- Neo-Brutal Divider --- */

function NbDivider({ className = "" }: { className?: string }) {
	return (
		<div className={`flex items-center justify-center gap-3 ${className}`}>
			<div className="h-[3px] w-12 bg-[#1A1A1A]" />
			<div className="h-3 w-3 rotate-45 border-2 border-[#1A1A1A] bg-[#FFE500]" />
			<div className="h-[3px] w-12 bg-[#1A1A1A]" />
		</div>
	);
}

/* --- Helpers --- */

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

/* --- Main Component --- */

export default function NeoBrutalismInvitation({
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
		<div className="neo-brutalism" style={bodyFont} lang="zh-Hans">
			{/* ================================================================
			    1. HERO -- Full-viewport with grid background pattern
			    ================================================================ */}
			<SectionShell
				sectionId="hero"
				mode={mode}
				hidden={hiddenSections?.hero}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="nb-section-cream nb-grid-bg relative min-h-[100svh] overflow-hidden"
			>
				<LetterboxReveal barColor={COLORS.dark}>
					{/* Hero photo behind with dim overlay */}
					{data.hero.heroImageUrl && (
						<div className="absolute inset-0">
							<img
								src={data.hero.heroImageUrl}
								alt=""
								className="h-full w-full object-cover"
								loading="eager"
								decoding="async"
							/>
							<div className="absolute inset-0 bg-[#FFF5E6]/60" />
						</div>
					)}

					<div className="relative z-10 mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
						{/* Names card with hard shadow */}
						<Reveal direction="up" delay={0.3}>
							<div className="rounded-lg border-2 border-[#1A1A1A] bg-white px-8 py-10 shadow-[6px_6px_0px_#1A1A1A] sm:px-12 sm:py-14">
								<h1 style={{ ...accentFont, fontWeight: 900 }}>
									<SplitText
										left={
											<span
												{...editableProps(
													"hero.partnerOneName",
													"inline-block",
												)}
											>
												{data.hero.partnerOneName}
											</span>
										}
										right={
											<span
												{...editableProps(
													"hero.partnerTwoName",
													"inline-block",
												)}
											>
												{data.hero.partnerTwoName}
											</span>
										}
										separator="&"
										className="text-4xl text-[#1A1A1A] sm:text-6xl"
										separatorClassName="mx-3 text-3xl text-[#FFE500] sm:mx-4 sm:text-5xl"
									/>
								</h1>

								<Reveal direction="up" delay={0.8}>
									<p
										{...editableProps(
											"hero.tagline",
											"mt-5 max-w-xl text-base leading-relaxed",
										)}
										style={{
											...headingFont,
											color: COLORS.muted,
										}}
									>
										{data.hero.tagline}
									</p>
								</Reveal>
							</div>
						</Reveal>

						{/* Date and venue pill badges */}
						<Reveal direction="up" delay={1.0}>
							<div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
								<span
									className="rounded-lg border-2 border-[#1A1A1A] bg-[#FFE500] px-4 py-2 font-bold shadow-[3px_3px_0px_#1A1A1A]"
									lang="en"
								>
									{weddingDateEn}
								</span>
								<span className="rounded-lg border-2 border-[#1A1A1A] bg-white px-4 py-2 font-bold shadow-[3px_3px_0px_#1A1A1A]">
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

			{/* ================================================================
			    2. ANNOUNCEMENT -- Coral/pink section
			    ================================================================ */}
			<SectionShell
				sectionId="announcement"
				mode={mode}
				hidden={hiddenSections?.announcement}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="nb-section-pink relative overflow-hidden px-6 py-16 sm:py-24 sm:px-10"
			>
				<div className="mx-auto max-w-3xl text-center">
					<NbDivider className="mb-10" />

					<Reveal direction="up">
						<p
							className="text-sm font-bold uppercase tracking-[0.5em]"
							style={{ ...headingFont, color: COLORS.primary }}
						>
							INVITATION
						</p>
					</Reveal>

					<Reveal direction="up" delay={0.15}>
						<div className="mx-auto mt-6 inline-block rounded-lg border-2 border-[#1A1A1A] bg-white px-6 py-4 shadow-[4px_4px_0px_#1A1A1A]">
							<h2
								{...editableProps("announcement.title", "text-3xl sm:text-4xl")}
								style={{ ...accentFont, color: COLORS.dark }}
							>
								{data.announcement.title}
							</h2>
						</div>
					</Reveal>

					<Reveal direction="up" delay={0.25}>
						<div className="nb-card mx-auto mt-8 max-w-2xl p-6 sm:p-8 text-left">
							<div className="nb-blockquote">
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
									"mt-6 text-sm leading-relaxed",
								)}
								style={{ color: COLORS.muted }}
								lang="en"
							>
								{data.announcement.formalText}
							</p>
						</div>
					</Reveal>

					<NbDivider className="mt-10" />
				</div>
			</SectionShell>

			{/* ================================================================
			    3. COUPLE -- Sticker-style portrait cards
			    ================================================================ */}
			<SectionShell
				sectionId="couple"
				mode={mode}
				hidden={hiddenSections?.couple}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="nb-section-cream px-6 py-16 sm:py-24 sm:px-10"
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
								<div className="nb-portrait-frame mx-auto h-72 w-56 -rotate-1 overflow-hidden">
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
								className="mt-4 text-xs font-bold uppercase tracking-[0.3em]"
								style={{ color: COLORS.primary }}
							>
								<span>THE GROOM</span>
							</p>
							<NbDivider className="mx-auto mt-2 mb-2" />
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
								<div className="nb-portrait-frame mx-auto h-72 w-56 rotate-1 overflow-hidden">
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
								className="mt-4 text-xs font-bold uppercase tracking-[0.3em]"
								style={{ color: COLORS.primary }}
							>
								<span>THE BRIDE</span>
							</p>
							<NbDivider className="mx-auto mt-2 mb-2" />
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

			{/* ================================================================
			    4. STORY -- Stacked timeline cards with alternating colors
			    ================================================================ */}
			<SectionShell
				sectionId="story"
				mode={mode}
				hidden={hiddenSections?.story}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="nb-section-white relative overflow-hidden px-6 py-14 sm:py-20 sm:px-10"
			>
				<div className="mx-auto max-w-3xl">
					<SectionTitle
						zhLabel="我们的故事"
						enHeading="Our Story"
						primaryColor={COLORS.primary}
						darkColor={COLORS.dark}
						headingFont={headingFont}
						accentFont={accentFont}
					/>
					<NbDivider className="my-8" />
					<Stagger interval={0.12} className="space-y-6">
						{data.story.milestones.map((m, i) => {
							const cardColors = [
								{ bg: COLORS.primary, text: COLORS.white },
								{ bg: COLORS.accent, text: COLORS.dark },
								{ bg: COLORS.pink, text: COLORS.dark },
							];
							const color = cardColors[i % cardColors.length];
							return (
								<div
									key={m.date}
									className="rounded-lg border-2 border-[#1A1A1A] p-5 shadow-[4px_4px_0px_#1A1A1A]"
									style={{ backgroundColor: color.bg }}
								>
									<p
										className="text-sm font-bold uppercase tracking-widest"
										style={{
											...accentFont,
											color: color.text,
											opacity: 0.8,
										}}
									>
										{m.date}
									</p>
									<h3
										className="mt-2 text-xl font-bold"
										style={{
											...headingFont,
											color: color.text,
										}}
									>
										{m.title}
									</h3>
									{m.photoUrl && (
										<div className="nb-photo-frame mt-4">
											<img
												src={m.photoUrl || PLACEHOLDER_PHOTO}
												alt={m.title}
												className="aspect-[4/3] w-full object-cover"
												loading="lazy"
												decoding="async"
											/>
										</div>
									)}
									<p
										className="mt-3 text-sm leading-relaxed whitespace-pre-line"
										style={{ color: color.text }}
									>
										{m.description}
									</p>
								</div>
							);
						})}
					</Stagger>
				</div>
			</SectionShell>

			{/* ================================================================
			    5. GALLERY -- Photo grid with thick borders
			    ================================================================ */}
			<SectionShell
				sectionId="gallery"
				mode={mode}
				hidden={hiddenSections?.gallery}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="nb-section-cream relative overflow-hidden px-6 py-14 sm:py-20 sm:px-10"
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
					<NbDivider className="my-8" />
					<div className="columns-2 gap-4">
						{data.gallery.photos.map((photo, i) => (
							<Reveal key={photo.url} direction="up" delay={i * 0.08}>
								<div className="nb-gallery-item mb-4 break-inside-avoid">
									<img
										src={photo.url || PLACEHOLDER_PHOTO}
										alt={photo.caption || "Wedding photo"}
										className="w-full object-cover"
										loading="lazy"
										decoding="async"
									/>
									{photo.caption && (
										<p
											className="bg-white px-3 py-2 text-center text-xs font-bold"
											style={{
												...headingFont,
												color: COLORS.dark,
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

			{/* ================================================================
			    6. COUNTDOWN -- Bold card on yellow background
			    ================================================================ */}
			<SectionShell
				sectionId="countdown"
				mode={mode}
				hidden={hiddenSections?.countdown}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="nb-section-yellow relative overflow-hidden px-6 py-16 sm:px-10"
			>
				<div className="mx-auto max-w-sm">
					<NbDivider className="mb-8" />
					<Reveal direction="up">
						<div className="rounded-lg border-2 border-[#1A1A1A] bg-white p-6 shadow-[6px_6px_0px_#1A1A1A]">
							<CountdownWidget
								targetDate={data.hero.date}
								eventTime={data.schedule.events[0]?.time}
								displayDate={data.hero.date}
							/>
						</div>
					</Reveal>
					<NbDivider className="mt-8" />
				</div>
			</SectionShell>

			{/* ================================================================
			    7. SCHEDULE -- Event sticker cards
			    ================================================================ */}
			<SectionShell
				sectionId="schedule"
				mode={mode}
				hidden={hiddenSections?.schedule}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="nb-section-white relative overflow-hidden px-6 py-16 sm:py-24 sm:px-10"
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
								className="nb-schedule-card"
							>
								<div>
									<p
										className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em]"
										style={{ color: COLORS.primary }}
									>
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2.5"
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
										className="mt-2 text-lg font-bold"
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

			{/* ================================================================
			    8. VENUE -- Card with shadow
			    ================================================================ */}
			<SectionShell
				sectionId="venue"
				mode={mode}
				hidden={hiddenSections?.venue}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="nb-section-pink px-6 py-16 sm:py-24 sm:px-10"
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
						<div className="nb-card p-8 text-center">
							<h3
								{...editableProps("venue.name", "text-2xl font-bold")}
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
									className="mt-3 text-xs font-bold uppercase tracking-[0.2em]"
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
										className="nb-btn rounded-lg text-xs font-bold uppercase tracking-[0.15em]"
										style={{
											backgroundColor: COLORS.primary,
											color: COLORS.white,
										}}
										lang="en"
									>
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2.5"
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
										className="nb-btn rounded-lg text-xs font-bold uppercase tracking-[0.15em]"
										style={{
											backgroundColor: COLORS.accent,
											color: COLORS.dark,
										}}
										lang="en"
									>
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2.5"
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

			{/* ================================================================
			    9. DRESS CODE -- Sticker cards (extra section)
			    ================================================================ */}
			{data.dressCode && (
				<SectionShell
					sectionId="extra"
					mode={mode}
					hidden={hiddenSections?.extra}
					onSelect={onSectionSelect}
					onAiClick={onAiClick}
					className="nb-section-cream px-6 py-14 sm:py-20 sm:px-10"
				>
					<div className="mx-auto max-w-3xl">
						<SectionTitle
							zhLabel="着 装 要 求"
							enHeading="Dress Code"
							primaryColor={COLORS.primary}
							darkColor={COLORS.dark}
							headingFont={headingFont}
							accentFont={accentFont}
						/>
						<NbDivider className="my-8" />

						<Reveal direction="up">
							<div className="nb-card p-6 sm:p-8">
								<p
									className="text-sm leading-relaxed"
									style={{ color: COLORS.dark }}
								>
									{data.dressCode.guidelines}
								</p>

								{/* Do colors */}
								{data.dressCode.doColors.length > 0 && (
									<div className="mt-6">
										<p
											className="text-xs font-bold uppercase tracking-[0.2em]"
											style={{ color: COLORS.primary }}
											lang="en"
										>
											Recommended Colors
										</p>
										<div className="mt-3 flex flex-wrap gap-2">
											{data.dressCode.doColors.map((color) => (
												<span
													key={color}
													className="rounded-lg border-2 border-[#1A1A1A] px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_#1A1A1A]"
													style={{
														backgroundColor: COLORS.accentLight,
														color: COLORS.dark,
													}}
												>
													{color}
												</span>
											))}
										</div>
									</div>
								)}

								{/* Don't colors */}
								{data.dressCode.dontColors.length > 0 && (
									<div className="mt-5">
										<p
											className="text-xs font-bold uppercase tracking-[0.2em]"
											style={{ color: COLORS.muted }}
											lang="en"
										>
											Please Avoid
										</p>
										<div className="mt-3 flex flex-wrap gap-2">
											{data.dressCode.dontColors.map((color) => (
												<span
													key={color}
													className="rounded-lg border-2 border-[#1A1A1A] px-3 py-1.5 text-xs font-bold line-through shadow-[2px_2px_0px_#1A1A1A]"
													style={{
														backgroundColor: COLORS.pink,
														color: COLORS.muted,
													}}
												>
													{color}
												</span>
											))}
										</div>
									</div>
								)}

								{/* Tips */}
								{data.dressCode.tips.length > 0 && (
									<div className="mt-6 space-y-2">
										{data.dressCode.tips.map((tip, i) => (
											<div key={tip} className="flex items-start gap-3">
												<span
													className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border-2 border-[#1A1A1A] text-xs font-bold shadow-[2px_2px_0px_#1A1A1A]"
													style={{
														backgroundColor: COLORS.accent,
														color: COLORS.dark,
													}}
												>
													{i + 1}
												</span>
												<p
													className="text-sm leading-relaxed"
													style={{ color: COLORS.dark }}
												>
													{tip}
												</p>
											</div>
										))}
									</div>
								)}
							</div>
						</Reveal>
					</div>
				</SectionShell>
			)}

			{/* ================================================================
			    10. RSVP -- Dark section with bold form
			    ================================================================ */}
			<SectionShell
				sectionId="rsvp"
				mode={mode}
				hidden={hiddenSections?.rsvp}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="nb-section-dark px-6 py-16 sm:py-24 sm:px-10"
			>
				<div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_auto_1.1fr]">
					{/* Left: info */}
					<Reveal direction="left" className="space-y-5">
						<p
							className="text-sm font-bold uppercase tracking-[0.5em]"
							style={{
								...headingFont,
								color: COLORS.accent,
							}}
							lang="en"
						>
							RSVP
						</p>
						<h2
							className="text-4xl font-black sm:text-5xl"
							style={{ ...accentFont, color: COLORS.cream }}
							lang="en"
						>
							RSVP
						</h2>
						<p
							className="max-w-md text-sm leading-relaxed"
							style={{ color: "rgba(255,245,230,0.7)" }}
							lang="en"
						>
							{data.rsvp.customMessage ||
								`Please let us know by ${rsvpDeadlineEn}`}
						</p>

						<div
							className="rounded-lg border-2 border-white/20 p-5"
							style={{ background: "rgba(255,255,255,0.06)" }}
						>
							<p
								className="text-[0.6rem] font-bold uppercase tracking-[0.3em]"
								style={{ color: COLORS.accent }}
								lang="en"
							>
								RSVP Deadline
							</p>
							<p
								className="mt-2 text-sm font-bold"
								style={{ color: COLORS.cream }}
								lang="en"
							>
								{rsvpDeadlineEn}
							</p>
							<p
								className="mt-3 text-xs font-bold uppercase tracking-[0.2em]"
								style={{ color: "rgba(255,245,230,0.5)" }}
								lang="en"
							>
								{data.rsvp.allowPlusOnes
									? `Up to ${maxGuests} ${maxGuests > 1 ? "guests" : "guest"} on this invite`
									: "This invitation is for one guest"}
							</p>
						</div>
					</Reveal>

					{/* Vertical divider line */}
					<div className="hidden self-stretch lg:block">
						<div className="h-full w-[3px] bg-[#FF6B6B]" />
					</div>

					{/* Right: form or confirmation */}
					{rsvpData ? (
						<div className="relative">
							<Reveal direction="right">
								<div
									className="flex items-center justify-center rounded-lg border-2 border-[#1A1A1A] p-6 shadow-[4px_4px_0px_#1A1A1A] sm:p-8"
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
									className="rounded-lg border-2 border-[#1A1A1A] p-6 shadow-[4px_4px_0px_#1A1A1A] sm:p-10"
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
											className="flex flex-col gap-2 text-[0.6rem] font-bold uppercase tracking-[0.28em]"
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
												className="nb-form-input rounded-lg text-sm placeholder:text-gray-400"
												style={{ color: COLORS.dark }}
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
											className="flex flex-col gap-2 text-[0.6rem] font-bold uppercase tracking-[0.28em]"
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
												className="nb-form-input rounded-lg text-sm placeholder:text-gray-400"
												style={{ color: COLORS.dark }}
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
											className="flex flex-col gap-2 text-[0.6rem] font-bold uppercase tracking-[0.28em]"
											style={{ color: COLORS.muted }}
										>
											<span lang="en">Attendance</span>
											<select
												name="attendance"
												defaultValue="attending"
												className="nb-form-input rounded-lg text-sm"
												style={{ color: COLORS.dark }}
											>
												<option value="attending">Attending</option>
												<option value="not_attending">Not Attending</option>
												<option value="undecided">Undecided</option>
											</select>
										</label>
										<label
											className="flex flex-col gap-2 text-[0.6rem] font-bold uppercase tracking-[0.28em]"
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
												className="nb-form-input rounded-lg text-sm"
												style={{ color: COLORS.dark }}
											/>
										</label>
										<label
											className="flex flex-col gap-2 text-[0.6rem] font-bold uppercase tracking-[0.28em]"
											style={{ color: COLORS.muted }}
										>
											<span>
												<span lang="en">Dietary Requirements</span>{" "}
												<span lang="zh-Hans">/ 饮食要求</span>
											</span>
											<select
												name="dietary"
												defaultValue=""
												className="nb-form-input rounded-lg text-sm"
												style={{ color: COLORS.dark }}
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
											className="flex flex-col gap-2 text-[0.6rem] font-bold uppercase tracking-[0.28em]"
											style={{ color: COLORS.muted }}
										>
											<span lang="en">Message</span>
											<textarea
												name="message"
												placeholder="Send your wishes to the couple"
												autoComplete="off"
												maxLength={500}
												className="nb-form-input min-h-24 rounded-lg text-sm placeholder:text-gray-400"
												style={{ color: COLORS.dark }}
											/>
										</label>
										<label className="relative mt-2 flex min-h-[44px] cursor-pointer items-start gap-3">
											<input
												type="checkbox"
												name="consent"
												required
												aria-describedby={consentDescriptionId}
												className="mt-0.5 h-4 w-4 rounded border-2 border-[#1A1A1A] accent-[#FF6B6B]"
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
													className="font-bold underline hover:no-underline"
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
											className="mt-4 block text-sm font-bold"
											style={{ color: COLORS.muted }}
											aria-live="polite"
										>
											{rsvpStatus}
										</output>
									) : null}

									<button
										type="submit"
										disabled={isSubmitting}
										className="nb-btn mt-6 w-full rounded-lg px-5 py-3.5 text-xs font-bold uppercase tracking-[0.3em] text-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
										style={{
											backgroundColor: COLORS.primary,
										}}
									>
										{isSubmitting && <LoadingSpinner size="sm" />}
										{isSubmitting ? "Sending..." : "Send RSVP"}
									</button>

									{submitError && (
										<p
											className="mt-3 text-center text-sm font-bold"
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
											className="mt-3 block text-center text-sm font-bold underline"
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

			{/* ================================================================
			    11. FOOTER -- Closing with gift merged in
			    ================================================================ */}
			<SectionShell
				sectionId="footer"
				mode={mode}
				hidden={hiddenSections?.footer}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="nb-section-cream relative overflow-hidden px-6 pb-20 pt-16 text-center sm:px-10"
			>
				<div className="mx-auto max-w-3xl">
					<NbDivider className="mb-10" />

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
							className="mt-8 text-6xl font-black"
							style={{ ...accentFont, color: COLORS.primary }}
							aria-hidden="true"
						>
							XOXO
						</p>
					</Reveal>

					<Reveal direction="up" delay={0.2}>
						<p
							{...editableProps(
								"footer.message",
								"mt-6 whitespace-pre-line text-lg font-bold leading-relaxed",
							)}
							style={{ ...headingFont, color: COLORS.dark }}
						>
							{data.footer.message}
						</p>
					</Reveal>

					{data.footer.socialLinks?.hashtag ? (
						<Reveal direction="up" delay={0.3}>
							<p className="mt-5">
								<span
									className="inline-block rounded-lg border-2 border-[#1A1A1A] bg-[#FFE500] px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] shadow-[3px_3px_0px_#1A1A1A]"
									style={{ color: COLORS.dark }}
								>
									{data.footer.socialLinks.hashtag}
								</span>
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
