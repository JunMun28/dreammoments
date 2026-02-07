import { Link } from "@tanstack/react-router";
import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
	type Variants,
} from "motion/react";
import { type KeyboardEvent, type MouseEvent, useId, useMemo } from "react";
import type { InvitationContent } from "../../../lib/types";
import SectionShell from "../SectionShell";
import type { RsvpPayload, TemplateInvitationProps } from "../types";

/* ─── Types ─── */

type GardenRomanceInvitationProps = TemplateInvitationProps & {
	content: InvitationContent;
};

/* ─── Design Tokens (Light Theme) ─── */

const COLORS = {
	crimson: "#C41E3A",
	deepRed: "#8B0000",
	gold: "#D4AF37",
	goldDark: "#8B6914",
	richBlack: "#1A1A1A",
	warmIvory: "#FFF8E7",
	cream: "#FFFDF5",
	roseMist: "#FFF0F0",
	softPink: "#FFF5F3",
	textPrimary: "#2C1810",
	textSecondary: "#5A4A3A",
	textMuted: "#8A7A6A",
} as const;

/* ─── Typography ─── */

const serifDisplay: React.CSSProperties = {
	fontFamily: '"Playfair Display", "Times New Roman", serif',
};

const hanziDisplay: React.CSSProperties = {
	fontFamily: '"Noto Serif SC", "Songti SC", "STSong", "KaiTi", serif',
};

/* ─── Animation Variants ─── */

const motionEase: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

const fadeUp: Variants = {
	hidden: { opacity: 0, y: 40 },
	visible: { opacity: 1, y: 0 },
};

const scaleIn: Variants = {
	hidden: { opacity: 0, scale: 0.92 },
	visible: { opacity: 1, scale: 1 },
};

const slideFromLeft: Variants = {
	hidden: { opacity: 0, x: -60 },
	visible: { opacity: 1, x: 0 },
};

const slideFromRight: Variants = {
	hidden: { opacity: 0, x: 60 },
	visible: { opacity: 1, x: 0 },
};

const staggerContainer: Variants = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.12 } },
};

/* ─── Constants ─── */

const chapterLabels = ["序章", "第一幕", "第二幕", "第三幕", "终章"];

const galleryLayoutClasses = [
	"md:col-span-2 md:row-span-2 h-[19rem] md:h-[32rem]",
	"h-[19rem] md:h-[15.5rem]",
	"h-[19rem] md:h-[15.5rem]",
];

/* Sample wedding photos for placeholders */
const SAMPLE_PHOTOS = {
	hero: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&h=1500&fit=crop",
	story: [
		"https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=600&fit=crop",
		"https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800&h=600&fit=crop",
		"https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=800&h=600&fit=crop",
	],
	venue:
		"https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&h=800&fit=crop",
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

/* ─── AnimatedText (Per-character reveal) ─── */

function AnimatedText({
	text,
	className,
	style,
	skip,
}: {
	text: string;
	className?: string;
	style?: React.CSSProperties;
	skip?: boolean;
}) {
	const indexedChars = useMemo(
		() => text.split("").map((char, idx) => ({ char, key: `${char}-${idx}` })),
		[text],
	);
	if (skip) {
		return (
			<span className={className} style={style}>
				{text}
			</span>
		);
	}
	return (
		<motion.span
			className={className}
			style={{ ...style, display: "inline-block" }}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
			variants={{
				hidden: {},
				visible: { transition: { staggerChildren: 0.045 } },
			}}
		>
			{indexedChars.map(({ char, key }) => (
				<motion.span
					key={key}
					className="inline-block"
					style={char === " " ? { width: "0.25em" } : undefined}
					variants={{
						hidden: { opacity: 0, y: 30 },
						visible: {
							opacity: 1,
							y: 0,
							transition: { duration: 0.5, ease: motionEase },
						},
					}}
				>
					{char === " " ? "\u00A0" : char}
				</motion.span>
			))}
		</motion.span>
	);
}

/* ─── Scroll Progress Line for Story ─── */

function StoryProgressLine() {
	const { scrollYProgress } = useScroll();
	const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
	return (
		<motion.div
			className="pointer-events-none absolute left-1 top-0 h-full w-px origin-top sm:left-3"
			style={{
				scaleY,
				background: `linear-gradient(180deg, ${COLORS.gold}, ${COLORS.crimson})`,
			}}
		/>
	);
}

/* ─── Main Component ─── */

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
	const prefersReducedMotion = useReducedMotion();
	const skip = Boolean(prefersReducedMotion);

	const data = useMemo(() => content, [content]);
	const rawRsvpSceneId = useId();
	const rsvpSceneId = `rsvp-scene-${rawRsvpSceneId.replaceAll(":", "")}`;

	const weddingDateZh = useMemo(
		() => formatDisplayDate(data.hero.date, "zh-CN"),
		[data.hero.date],
	);
	const weddingDateEn = useMemo(
		() => formatDisplayDate(data.hero.date, "en-US"),
		[data.hero.date],
	);
	const rsvpDeadlineZh = useMemo(
		() => formatDisplayDate(data.rsvp.deadline, "zh-CN"),
		[data.rsvp.deadline],
	);
	const rsvpDeadlineEn = useMemo(
		() => formatDisplayDate(data.rsvp.deadline, "en-US"),
		[data.rsvp.deadline],
	);

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

	const maxGuests = data.rsvp.allowPlusOnes
		? Math.max(1, data.rsvp.maxPlusOnes + 1)
		: 1;

	/* Shared motion props helper */
	const reveal = (variants: Variants, delay = 0): Record<string, unknown> =>
		skip
			? {}
			: {
					initial: "hidden",
					whileInView: "visible",
					viewport: { once: true, margin: "-80px" },
					variants,
					transition: { duration: 0.8, ease: motionEase, delay },
				};

	return (
		<div
			className="relative overflow-hidden"
			style={{ background: COLORS.cream }}
		>
			{/* ════════════════════════════════════════════
			    1. HERO — Warm light, full viewport
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="hero"
				mode={mode}
				hidden={hiddenSections?.hero}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="relative min-h-[100svh] overflow-hidden px-6 sm:px-10 lg:px-16"
			>
				{/* Light background with subtle red/gold radials */}
				<div
					className="absolute inset-0 -z-10"
					style={{ background: COLORS.cream }}
				>
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(196,30,58,0.08),transparent_50%)]" />
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(212,175,55,0.1),transparent_50%)]" />
					<div className="gr-lattice-pattern absolute inset-0 opacity-20" />
				</div>

				{/* Floating decorative 囍 */}
				<div
					aria-hidden="true"
					className="gr-float-slow pointer-events-none absolute right-[8%] top-[12%] text-7xl opacity-[0.06] sm:text-8xl"
					style={{ ...hanziDisplay, color: COLORS.crimson }}
				>
					囍
				</div>
				<div
					aria-hidden="true"
					className="gr-float-medium pointer-events-none absolute bottom-[18%] left-[5%] text-6xl opacity-[0.05]"
					style={{
						...hanziDisplay,
						color: COLORS.gold,
						animationDelay: "2s",
					}}
				>
					囍
				</div>

				<div className="mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center py-20 text-center">
					{/* Kicker */}
					<motion.p
						{...reveal(fadeUp)}
						style={hanziDisplay}
						className="text-sm tracking-[0.5em] sm:text-base"
					>
						<span style={{ color: COLORS.crimson }}>恭 请 光 临</span>
					</motion.p>

					{/* Partner Names */}
					<h1 className="mt-8 leading-[0.88]" style={serifDisplay}>
						<AnimatedText
							text={data.hero.partnerOneName}
							skip={skip}
							className="text-6xl sm:text-8xl lg:text-9xl"
							style={{ color: COLORS.textPrimary }}
						/>
						<motion.span
							{...reveal(scaleIn, 0.3)}
							className="mx-3 block py-4 text-5xl sm:mx-5 sm:inline sm:py-0 sm:text-7xl lg:text-8xl"
							style={{ ...hanziDisplay, color: COLORS.crimson }}
						>
							囍
						</motion.span>
						<AnimatedText
							text={data.hero.partnerTwoName}
							skip={skip}
							className="text-6xl sm:text-8xl lg:text-9xl"
							style={{ color: COLORS.textPrimary }}
						/>
					</h1>

					{/* Tagline */}
					<motion.p
						{...reveal(fadeUp, 0.5)}
						{...editableProps(
							"hero.tagline",
							"mt-8 max-w-xl text-lg leading-relaxed sm:text-xl",
						)}
						style={{ ...hanziDisplay, color: COLORS.textSecondary }}
					>
						{data.hero.tagline}
					</motion.p>

					{/* Date & Venue pills */}
					<motion.div
						{...reveal(fadeUp, 0.65)}
						className="mt-8 flex flex-wrap justify-center gap-3"
					>
						<div className="gr-glass-light rounded-2xl px-5 py-3 text-center">
							<p
								className="text-[0.6rem] uppercase tracking-[0.25em]"
								style={{ color: COLORS.goldDark }}
							>
								Wedding Date
							</p>
							<p className="mt-1 text-sm" style={{ color: COLORS.textPrimary }}>
								{weddingDateEn}
							</p>
							<p
								className="mt-1 text-xs"
								style={{ ...hanziDisplay, color: COLORS.crimson }}
							>
								{weddingDateZh}
							</p>
						</div>
						<div className="gr-glass-light rounded-2xl px-5 py-3 text-center">
							<p
								className="text-[0.6rem] uppercase tracking-[0.25em]"
								style={{ color: COLORS.goldDark }}
							>
								Venue
							</p>
							<p className="mt-1 text-sm" style={{ color: COLORS.textPrimary }}>
								{data.venue.name}
							</p>
							<p className="mt-1 text-xs" style={{ color: COLORS.textMuted }}>
								{data.details.venueSummary}
							</p>
						</div>
					</motion.div>

					{/* CTA */}
					<motion.div
						{...reveal(fadeUp, 0.8)}
						className="mt-10 flex flex-wrap justify-center gap-4"
					>
						<motion.a
							href={`#${rsvpSceneId}`}
							className="rounded-full px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.28em] text-white"
							style={{ background: COLORS.crimson }}
							whileHover={skip ? undefined : { scale: 1.03 }}
							whileTap={skip ? undefined : { scale: 0.97 }}
						>
							RSVP Now
						</motion.a>
						<span
							className="inline-flex items-center rounded-full border px-5 py-3 text-xs uppercase tracking-[0.24em]"
							style={{
								borderColor: "rgba(196,30,58,0.2)",
								color: COLORS.textMuted,
							}}
						>
							{data.details.scheduleSummary}
						</span>
					</motion.div>

					{/* Scroll indicator */}
					<motion.div
						className="mt-auto pt-12"
						animate={skip ? undefined : { y: [0, 8, 0] }}
						transition={
							skip
								? undefined
								: {
										repeat: Number.POSITIVE_INFINITY,
										duration: 2,
										ease: "easeInOut",
									}
						}
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke={COLORS.crimson}
							strokeWidth="1.5"
							className="mx-auto opacity-40"
							aria-hidden="true"
						>
							<path d="M12 5v14M5 12l7 7 7-7" />
						</svg>
					</motion.div>
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    2. ANNOUNCEMENT — Warm ivory card
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="announcement"
				mode={mode}
				hidden={hiddenSections?.announcement}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="relative px-6 py-24 sm:px-10 lg:px-16"
				style={{ background: COLORS.warmIvory }}
			>
				<div className="mx-auto max-w-3xl text-center">
					<motion.div
						{...reveal(scaleIn)}
						className="gr-gold-divider mx-auto mb-10 w-32"
					/>

					<motion.p
						{...reveal(fadeUp, 0.1)}
						style={{ ...hanziDisplay, color: COLORS.crimson }}
						className="text-base tracking-[0.5em]"
					>
						敬 邀 光 临
					</motion.p>

					<motion.h2
						{...reveal(fadeUp, 0.2)}
						style={{ ...serifDisplay, color: COLORS.textPrimary }}
						{...editableProps(
							"announcement.title",
							"mt-6 text-4xl sm:text-5xl",
						)}
					>
						{data.announcement.title}
					</motion.h2>

					<motion.p
						{...reveal(fadeUp, 0.3)}
						{...editableProps(
							"announcement.message",
							"mx-auto mt-6 max-w-2xl text-base leading-relaxed",
						)}
						style={{ color: COLORS.textSecondary }}
					>
						{data.announcement.message}
					</motion.p>

					<motion.p
						{...reveal(fadeUp, 0.4)}
						style={{ ...hanziDisplay, color: COLORS.goldDark }}
						{...editableProps(
							"announcement.formalText",
							"mx-auto mt-5 max-w-2xl text-sm tracking-[0.15em]",
						)}
					>
						{data.announcement.formalText}
					</motion.p>

					<motion.div
						{...reveal(scaleIn, 0.5)}
						className="gr-gold-divider mx-auto mt-10 w-32"
					/>
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    3. STORY — Light with soft pink tint
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="story"
				mode={mode}
				hidden={hiddenSections?.story}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="relative px-6 py-24 sm:px-10 lg:px-16"
				style={{ background: COLORS.softPink }}
			>
				<div className="mx-auto max-w-6xl">
					<div className="text-center">
						<motion.p
							{...reveal(fadeUp)}
							style={{ ...hanziDisplay, color: COLORS.crimson }}
							className="text-sm tracking-[0.5em]"
						>
							爱 情 故 事
						</motion.p>
						<motion.h2
							{...reveal(fadeUp, 0.1)}
							style={{ ...serifDisplay, color: COLORS.textPrimary }}
							className="mt-3 text-4xl sm:text-5xl"
						>
							Our Story
						</motion.h2>
					</div>

					{/* Milestones */}
					<div className="relative mt-16 pl-8 sm:pl-12">
						<StoryProgressLine />

						<div className="space-y-16">
							{data.story.milestones.map((milestone, index) => {
								const isEven = index % 2 === 0;
								const variant = isEven ? slideFromLeft : slideFromRight;

								return (
									<motion.article
										key={`${milestone.date}-${milestone.title}`}
										{...reveal(variant, index * 0.1)}
										className="relative"
									>
										{/* Timeline dot */}
										<div
											className="absolute -left-8 top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 sm:-left-12"
											style={{
												borderColor: COLORS.gold,
												background: COLORS.softPink,
											}}
										>
											<div
												className="h-2 w-2 rounded-full"
												style={{ background: COLORS.crimson }}
											/>
										</div>

										{/* Large watermark number */}
										<div
											aria-hidden="true"
											className="pointer-events-none absolute -left-4 -top-10 text-[8rem] font-bold leading-none sm:-left-6"
											style={{
												...serifDisplay,
												color: COLORS.crimson,
												opacity: 0.05,
											}}
										>
											{index + 1}
										</div>

										<div className="grid gap-6 lg:grid-cols-2 lg:items-center">
											<div className={isEven ? "" : "lg:order-2"}>
												<p
													style={{ ...hanziDisplay, color: COLORS.crimson }}
													className="text-[0.65rem] uppercase tracking-[0.35em]"
												>
													{chapterLabels[index] ?? `第${index + 1}幕`}
												</p>
												<h3
													style={{
														...serifDisplay,
														color: COLORS.textPrimary,
													}}
													className="mt-3 text-3xl sm:text-4xl"
												>
													{milestone.title}
												</h3>
												<p
													className="mt-1 text-xs uppercase tracking-[0.27em]"
													style={{ color: COLORS.goldDark }}
												>
													{milestone.date}
												</p>
												<p
													className="mt-4 text-sm leading-relaxed"
													style={{ color: COLORS.textSecondary }}
												>
													{milestone.description}
												</p>
											</div>

											{/* Photo */}
											<div
												className={`overflow-hidden rounded-2xl border shadow-lg ${isEven ? "" : "lg:order-1"}`}
												style={{ borderColor: "rgba(212,175,55,0.2)" }}
											>
												<img
													src={
														SAMPLE_PHOTOS.story[
															index % SAMPLE_PHOTOS.story.length
														]
													}
													alt={milestone.title}
													loading="lazy"
													width={600}
													height={400}
													className="h-56 w-full object-cover sm:h-64"
												/>
											</div>
										</div>
									</motion.article>
								);
							})}
						</div>
					</div>
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    4. GALLERY — Cream background
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="gallery"
				mode={mode}
				hidden={hiddenSections?.gallery}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="relative px-6 py-24 sm:px-10 lg:px-16"
				style={{ background: COLORS.warmIvory }}
			>
				<div className="mx-auto max-w-6xl">
					<div className="text-center">
						<motion.p
							{...reveal(fadeUp)}
							style={{ ...hanziDisplay, color: COLORS.crimson }}
							className="text-sm tracking-[0.5em]"
						>
							影 像 集 锦
						</motion.p>
						<motion.h2
							{...reveal(fadeUp, 0.1)}
							style={{ ...serifDisplay, color: COLORS.textPrimary }}
							className="mt-3 text-4xl sm:text-5xl"
						>
							Gallery
						</motion.h2>
					</div>

					<motion.div
						{...reveal(staggerContainer, 0.2)}
						className="mt-12 grid auto-rows-fr gap-4 md:grid-cols-3"
					>
						{data.gallery.photos.map((photo, index) => (
							<motion.figure
								key={`${photo.url ?? "photo"}-${photo.caption ?? "memory"}`}
								variants={scaleIn}
								transition={{ duration: 0.6, ease: motionEase }}
								className={`group relative overflow-hidden rounded-2xl border shadow-md ${galleryLayoutClasses[index % galleryLayoutClasses.length]}`}
								style={{ borderColor: "rgba(212,175,55,0.25)" }}
							>
								<motion.img
									src={photo.url || SAMPLE_PHOTOS.hero}
									alt={photo.caption || "Couple memory"}
									loading="lazy"
									width={900}
									height={900}
									className="h-full w-full object-cover"
									whileHover={skip ? undefined : { scale: 1.03 }}
									transition={{ type: "spring", stiffness: 300, damping: 20 }}
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
								<figcaption className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white">
									{photo.caption || "Memory"}
								</figcaption>
							</motion.figure>
						))}
					</motion.div>
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    5. SCHEDULE — Cream vertical timeline
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="schedule"
				mode={mode}
				hidden={hiddenSections?.schedule}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="relative px-6 py-24 sm:px-10 lg:px-16"
				style={{ background: COLORS.cream }}
			>
				<div className="mx-auto max-w-4xl">
					<div className="text-center">
						<motion.p
							{...reveal(fadeUp)}
							style={{ ...hanziDisplay, color: COLORS.crimson }}
							className="text-sm tracking-[0.5em]"
						>
							婚 礼 流 程
						</motion.p>
						<motion.h2
							{...reveal(fadeUp, 0.1)}
							style={{ ...serifDisplay, color: COLORS.textPrimary }}
							className="mt-3 text-4xl sm:text-5xl"
						>
							Wedding Day
						</motion.h2>
					</div>

					<div className="relative mt-14">
						<div
							className="absolute left-[1.35rem] top-0 h-full w-px"
							style={{
								background: `linear-gradient(180deg, ${COLORS.crimson}, ${COLORS.gold})`,
							}}
						/>

						<motion.div
							{...reveal(staggerContainer, 0.2)}
							className="space-y-6"
						>
							{data.schedule.events.map((event) => (
								<motion.article
									key={`${event.time}-${event.title}`}
									variants={slideFromRight}
									transition={{ duration: 0.7, ease: motionEase }}
									className="relative flex gap-6 pl-14"
								>
									<div
										className="absolute left-3 top-1 h-5 w-5 rounded-full border-2"
										style={{
											borderColor: COLORS.crimson,
											background: COLORS.cream,
										}}
									>
										<div
											className="absolute inset-1 rounded-full"
											style={{ background: COLORS.crimson }}
										/>
									</div>

									<div
										className="flex-1 rounded-2xl border p-5"
										style={{
											borderColor: "rgba(212,175,55,0.2)",
											background: "white",
										}}
									>
										<p
											className="inline-block rounded-full px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em]"
											style={{
												background: "rgba(196,30,58,0.08)",
												color: COLORS.crimson,
											}}
										>
											{event.time}
										</p>
										<h3
											style={{ ...serifDisplay, color: COLORS.textPrimary }}
											className="mt-3 text-2xl"
										>
											{event.title}
										</h3>
										<p
											className="mt-2 text-sm"
											style={{ color: COLORS.textSecondary }}
										>
											{event.description}
										</p>
									</div>
								</motion.article>
							))}
						</motion.div>
					</div>
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    6. VENUE — Split layout (light)
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="venue"
				mode={mode}
				hidden={hiddenSections?.venue}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="relative overflow-hidden"
				style={{ background: COLORS.softPink }}
			>
				<div className="grid lg:grid-cols-2">
					{/* Left: warm info */}
					<motion.div
						{...reveal(slideFromLeft)}
						className="flex flex-col justify-center px-8 py-20 sm:px-12 lg:px-16"
					>
						<p
							style={{ ...hanziDisplay, color: COLORS.crimson }}
							className="text-sm tracking-[0.3em]"
						>
							婚礼地点
						</p>
						<h3
							style={{ ...serifDisplay, color: COLORS.textPrimary }}
							{...editableProps("venue.name", "mt-4 text-4xl sm:text-5xl")}
						>
							{data.venue.name}
						</h3>
						<p
							{...editableProps(
								"venue.address",
								"mt-5 text-sm leading-relaxed",
							)}
							style={{ color: COLORS.textSecondary }}
						>
							{data.venue.address}
						</p>
						<p
							{...editableProps(
								"venue.directions",
								"mt-3 text-sm leading-relaxed",
							)}
							style={{ color: COLORS.textMuted }}
						>
							{data.venue.directions}
						</p>
						{data.venue.parkingInfo ? (
							<p
								className="mt-4 text-xs uppercase tracking-[0.24em]"
								style={{ color: COLORS.goldDark }}
							>
								{data.venue.parkingInfo}
							</p>
						) : null}
						<div
							className="mt-6 inline-flex w-fit items-center rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em]"
							style={{
								borderColor: "rgba(196,30,58,0.15)",
								color: COLORS.textMuted,
							}}
						>
							{data.venue.coordinates.lat.toFixed(4)},{" "}
							{data.venue.coordinates.lng.toFixed(4)}
						</div>
					</motion.div>

					{/* Right: venue image */}
					<motion.figure
						{...reveal(slideFromRight)}
						className="relative h-[22rem] lg:h-auto lg:min-h-[28rem]"
					>
						<img
							src={SAMPLE_PHOTOS.venue}
							alt={`${data.venue.name} wedding venue`}
							loading="lazy"
							width={1200}
							height={760}
							className="h-full w-full object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-l from-transparent to-[rgba(255,245,243,0.3)]" />
					</motion.figure>
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    7. RSVP — Warm crimson section
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="rsvp"
				mode={mode}
				hidden={hiddenSections?.rsvp}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="relative px-6 py-24 sm:px-10 lg:px-16"
				style={{ background: COLORS.deepRed }}
			>
				<div
					id={rsvpSceneId}
					className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]"
				>
					{/* Left: info */}
					<motion.div {...reveal(slideFromLeft)} className="space-y-6">
						<p
							style={{ ...hanziDisplay, color: COLORS.gold }}
							className="text-sm tracking-[0.5em]"
						>
							敬 请 回 复
						</p>
						<h3
							style={{ ...serifDisplay, color: COLORS.warmIvory }}
							className="text-5xl leading-[0.9] sm:text-6xl"
						>
							Reserve
							<br />
							Your Seat
						</h3>
						<p
							className="max-w-md text-sm leading-relaxed"
							style={{ color: "rgba(255,248,231,0.7)" }}
						>
							{data.rsvp.customMessage}
						</p>

						<div className="gr-glass-dark rounded-2xl p-5">
							<p
								className="text-[0.62rem] uppercase tracking-[0.3em]"
								style={{ color: COLORS.gold }}
							>
								RSVP Deadline
							</p>
							<p className="mt-2 text-sm" style={{ color: COLORS.warmIvory }}>
								{rsvpDeadlineEn}
							</p>
							<p
								className="mt-1 text-xs"
								style={{ ...hanziDisplay, color: "rgba(212,175,55,0.7)" }}
							>
								{rsvpDeadlineZh}
							</p>
							<p
								className="mt-3 text-xs uppercase tracking-[0.24em]"
								style={{ color: "rgba(255,248,231,0.5)" }}
							>
								{data.rsvp.allowPlusOnes
									? `Up to ${maxGuests} guests on this invite`
									: "This invitation is for one guest"}
							</p>
						</div>

						<div className="flex flex-wrap gap-2">
							{data.rsvp.dietaryOptions.slice(0, 4).map((option) => (
								<span
									key={option}
									className="rounded-full border px-3 py-1 text-[0.6rem] uppercase tracking-[0.24em]"
									style={{
										borderColor: "rgba(212,175,55,0.25)",
										color: "rgba(255,248,231,0.6)",
									}}
								>
									{option}
								</span>
							))}
						</div>
					</motion.div>

					{/* Right: form */}
					<motion.form
						{...reveal(slideFromRight)}
						className="rounded-[2rem] p-6 shadow-[0_22px_64px_-24px_rgba(0,0,0,0.5)] sm:p-8"
						style={{
							background: COLORS.cream,
							border: "1px solid rgba(212,175,55,0.2)",
						}}
						noValidate
						onSubmit={(event) => {
							event.preventDefault();
							if (!onRsvpSubmit) return;
							const formData = new FormData(event.currentTarget);
							const rawGuestCount = Number(formData.get("guestCount") ?? 1);
							const safeGuestCount = Number.isFinite(rawGuestCount)
								? Math.min(Math.max(rawGuestCount, 1), maxGuests)
								: 1;
							onRsvpSubmit({
								name: String(formData.get("name") ?? ""),
								attendance: parseAttendance(formData.get("attendance")),
								guestCount: safeGuestCount,
								dietaryRequirements: String(formData.get("dietary") ?? ""),
								message: String(formData.get("message") ?? ""),
								email: String(formData.get("email") ?? ""),
							});
						}}
					>
						<div className="grid gap-4 sm:grid-cols-2">
							<label
								className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em] sm:col-span-2"
								style={{ color: COLORS.goldDark }}
							>
								Name
								<input
									name="name"
									placeholder="Rachel Lim"
									autoComplete="name"
									required
									aria-required="true"
									className="rounded-xl border bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41E3A]/30"
									style={{
										borderColor: "rgba(212,175,55,0.3)",
										color: COLORS.textPrimary,
									}}
								/>
							</label>
							<label
								className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em]"
								style={{ color: COLORS.goldDark }}
							>
								Attendance
								<select
									name="attendance"
									defaultValue="attending"
									className="rounded-xl border bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41E3A]/30"
									style={{
										borderColor: "rgba(212,175,55,0.3)",
										color: COLORS.textPrimary,
									}}
								>
									<option value="attending">Attending</option>
									<option value="not_attending">Not Attending</option>
									<option value="undecided">Undecided</option>
								</select>
							</label>
							<label
								className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em]"
								style={{ color: COLORS.goldDark }}
							>
								Guest Count
								<input
									name="guestCount"
									type="number"
									min={1}
									max={maxGuests}
									defaultValue={1}
									inputMode="numeric"
									className="rounded-xl border bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41E3A]/30"
									style={{
										borderColor: "rgba(212,175,55,0.3)",
										color: COLORS.textPrimary,
									}}
								/>
							</label>
							<label
								className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em] sm:col-span-2"
								style={{ color: COLORS.goldDark }}
							>
								Email
								<input
									name="email"
									type="email"
									placeholder="rachel@example.com"
									autoComplete="email"
									spellCheck={false}
									className="rounded-xl border bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41E3A]/30"
									style={{
										borderColor: "rgba(212,175,55,0.3)",
										color: COLORS.textPrimary,
									}}
								/>
							</label>
							<label
								className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em] sm:col-span-2"
								style={{ color: COLORS.goldDark }}
							>
								Dietary Requirements
								<input
									name="dietary"
									placeholder="Vegetarian, halal, no pork..."
									autoComplete="off"
									className="rounded-xl border bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41E3A]/30"
									style={{
										borderColor: "rgba(212,175,55,0.3)",
										color: COLORS.textPrimary,
									}}
								/>
							</label>
							<label
								className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.28em] sm:col-span-2"
								style={{ color: COLORS.goldDark }}
							>
								Message
								<textarea
									name="message"
									placeholder="Can't wait to celebrate your wedding"
									autoComplete="off"
									className="min-h-24 rounded-xl border bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41E3A]/30"
									style={{
										borderColor: "rgba(212,175,55,0.3)",
										color: COLORS.textPrimary,
									}}
								/>
							</label>
							<label className="flex items-start gap-3 sm:col-span-2 mt-2 cursor-pointer">
								<input
									type="checkbox"
									name="consent"
									required
									aria-describedby="gr-consent-description"
									className="mt-0.5 h-4 w-4 rounded border-2 accent-[#C41E3A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41E3A]/30"
									style={{ borderColor: "rgba(212,175,55,0.3)" }}
								/>
								<span
									id="gr-consent-description"
									className="text-xs leading-relaxed"
									style={{ color: COLORS.textSecondary }}
								>
									I consent to the collection of my personal data as described
									in the{" "}
									<Link
										to="/privacy"
										className="underline hover:no-underline"
										style={{ color: COLORS.crimson }}
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
								style={{ color: COLORS.textSecondary }}
								aria-live="polite"
							>
								{rsvpStatus}
							</output>
						) : null}
						<motion.button
							type="submit"
							className="mt-6 w-full rounded-full px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41E3A]/50"
							style={{ background: COLORS.crimson }}
							whileHover={skip ? undefined : { scale: 1.02 }}
							whileTap={skip ? undefined : { scale: 0.98 }}
						>
							Send RSVP
						</motion.button>
					</motion.form>
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    8. FAQ — Warm ivory stacked cards
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="faq"
				mode={mode}
				hidden={hiddenSections?.faq}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="relative px-6 py-24 sm:px-10 lg:px-16"
				style={{ background: COLORS.warmIvory }}
			>
				<div className="mx-auto max-w-4xl">
					<div className="text-center">
						<motion.p
							{...reveal(fadeUp)}
							style={{ ...hanziDisplay, color: COLORS.crimson }}
							className="text-sm tracking-[0.5em]"
						>
							常 见 问 题
						</motion.p>
						<motion.h2
							{...reveal(fadeUp, 0.1)}
							style={{ ...serifDisplay, color: COLORS.textPrimary }}
							className="mt-3 text-4xl sm:text-5xl"
						>
							Questions
						</motion.h2>
					</div>

					<motion.div
						{...reveal(staggerContainer, 0.2)}
						className="mt-12 grid gap-4"
					>
						{data.faq.items.map((item) => (
							<motion.article
								key={item.question}
								variants={fadeUp}
								transition={{ duration: 0.6, ease: motionEase }}
								className="rounded-2xl border p-6"
								style={{
									borderColor: "rgba(212,175,55,0.2)",
									background: "white",
								}}
							>
								<p
									style={{ ...serifDisplay, color: COLORS.textPrimary }}
									className="text-2xl"
								>
									{item.question}
								</p>
								<p
									className="mt-3 text-sm leading-relaxed"
									style={{ color: COLORS.textSecondary }}
								>
									{item.answer}
								</p>
							</motion.article>
						))}
					</motion.div>
				</div>
			</SectionShell>

			{/* ════════════════════════════════════════════
			    9. FOOTER — Soft cream closing
			    ════════════════════════════════════════════ */}
			<SectionShell
				sectionId="footer"
				mode={mode}
				hidden={hiddenSections?.footer}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="relative px-6 pb-20 pt-16 text-center sm:px-10 lg:px-16"
				style={{ background: COLORS.cream }}
			>
				<div className="mx-auto max-w-3xl">
					<motion.div
						{...reveal(scaleIn)}
						className="gr-gold-divider mx-auto mb-10 w-24"
					/>

					<motion.p
						{...reveal(fadeUp, 0.1)}
						style={{ ...hanziDisplay, color: COLORS.crimson }}
						className="text-base tracking-[0.45em]"
					>
						良 辰 吉 日 · 敬 候 君 临
					</motion.p>

					<motion.p
						{...reveal(fadeUp, 0.2)}
						style={{ ...serifDisplay, color: COLORS.textPrimary }}
						{...editableProps("footer.message", "mt-5 text-4xl")}
					>
						{data.footer.message}
					</motion.p>

					{data.footer.socialLinks?.hashtag ? (
						<motion.p
							{...reveal(fadeUp, 0.3)}
							className="mt-5 text-xs uppercase tracking-[0.28em]"
							style={{ color: COLORS.textMuted }}
						>
							{data.footer.socialLinks.hashtag}
						</motion.p>
					) : null}
				</div>
			</SectionShell>
		</div>
	);
}
