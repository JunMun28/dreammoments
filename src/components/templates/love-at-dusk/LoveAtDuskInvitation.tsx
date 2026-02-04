import { useMemo } from 'react'
import type { InvitationContent } from '../../../lib/types'
import { useParallax, useScrollReveal } from '../../../lib/scroll-effects'
import SectionShell from '../SectionShell'
import type { TemplateInvitationProps } from '../types'

type LoveAtDuskInvitationProps = TemplateInvitationProps & {
	content: InvitationContent
}

export default function LoveAtDuskInvitation({
	content,
	hiddenSections,
	mode = 'public',
				onSectionSelect,
				onAiClick,
				onInlineEdit,
				onRsvpSubmit,
				rsvpStatus,
}: LoveAtDuskInvitationProps) {
	useScrollReveal()
	useParallax()

	const data = useMemo(() => content, [content])
	const editableProps = (fieldPath: string, className: string) => ({
		onClick: mode === 'editor' ? () => onInlineEdit?.(fieldPath) : undefined,
		role: mode === 'editor' ? 'button' : undefined,
		tabIndex: mode === 'editor' ? 0 : undefined,
		className: mode === 'editor' ? `${className} dm-editable` : className,
	})

	return (
		<div className="love-at-dusk">
			<SectionShell
				id="hero"
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
							'announcement.title',
							'dm-reveal text-xs uppercase tracking-[0.6em] text-[var(--love-accent)]',
						)}
					>
						{data.announcement.title}
					</p>
					<p
						data-reveal
						className="dm-reveal mt-6 text-5xl text-[var(--love-accent)] sm:text-6xl"
					>
						囍
					</p>
					<h1
						data-reveal
						className="dm-reveal mt-6 text-3xl font-semibold text-[var(--love-cream)] sm:text-5xl"
					>
						<span
							{...editableProps(
								'hero.partnerOneName',
								'love-heading dm-editable',
							)}
						>
							{data.hero.partnerOneName}
						</span>
						<span className="mx-3 text-[var(--love-accent)]">×</span>
						<span
							{...editableProps(
								'hero.partnerTwoName',
								'love-heading dm-editable',
							)}
						>
							{data.hero.partnerTwoName}
						</span>
					</h1>
					<p
						data-reveal
						{...editableProps(
							'hero.tagline',
							'dm-reveal mt-4 max-w-2xl text-base text-[var(--love-muted)]',
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

			<SectionShell
				id="announcement"
				mode={mode}
				hidden={hiddenSections?.announcement}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="love-section"
			>
				<div className="mx-auto max-w-3xl text-center">
					<p
						data-reveal
						className="dm-reveal text-xs uppercase tracking-[0.6em] text-[var(--love-accent)]"
					>
						诚挚邀请
					</p>
					<p
						data-reveal
						{...editableProps(
							'announcement.message',
							'dm-reveal mt-6 text-lg text-[var(--love-cream)]',
						)}
					>
						{data.announcement.message}
					</p>
					<p
						data-reveal
						{...editableProps(
							'announcement.formalText',
							'dm-reveal mt-4 text-sm text-[var(--love-muted)]',
						)}
					>
						{data.announcement.formalText}
					</p>
				</div>
			</SectionShell>

			<SectionShell
				id="couple"
				mode={mode}
				hidden={hiddenSections?.couple}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="love-section love-panel"
			>
				<div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
					{[
						{
							label: 'GROOM',
							fieldPrefix: 'couple.partnerOne',
							name: data.couple.partnerOne.fullName,
							bio: data.couple.partnerOne.bio,
							accent: 'from-[var(--love-primary)] to-[var(--love-secondary)]',
						},
						{
							label: 'BRIDE',
							fieldPrefix: 'couple.partnerTwo',
							name: data.couple.partnerTwo.fullName,
							bio: data.couple.partnerTwo.bio,
							accent: 'from-[var(--love-secondary)] to-[var(--love-primary)]',
						},
					].map((person, index) => (
						<div
							key={person.label}
							data-reveal
							className={`dm-reveal ${
								index === 0 ? 'slide-left' : 'slide-right'
							} rounded-3xl border border-white/10 bg-[#140d0b]/80 p-6`}
						>
							<div
								className={`h-48 rounded-2xl bg-gradient-to-br ${person.accent}`}
							/>
							<p className="mt-5 text-xs uppercase tracking-[0.4em] text-[var(--love-accent)]">
								{person.label}
							</p>
							<p
								{...editableProps(
									`${person.fieldPrefix}.fullName`,
									'mt-3 text-sm text-[var(--love-cream)]',
								)}
							>
								{person.name}
							</p>
							<p
								{...editableProps(
									`${person.fieldPrefix}.bio`,
									'mt-2 text-xs text-[var(--love-muted)]',
								)}
							>
								{person.bio}
							</p>
						</div>
					))}
				</div>
			</SectionShell>

			<SectionShell
				id="story"
				mode={mode}
				hidden={hiddenSections?.story}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="love-section"
			>
				<div className="mx-auto max-w-4xl">
					<p
						data-reveal
						className="dm-reveal text-xs uppercase tracking-[0.6em] text-[var(--love-accent)]"
					>
						Love Story Timeline
					</p>
					<div className="mt-8 grid gap-6">
						{data.story.milestones.map((milestone, index) => (
							<div
								key={`${milestone.title}-${milestone.date}`}
								data-reveal
								style={{ transitionDelay: `${index * 80}ms` }}
								className={`dm-reveal ${
									index % 2 === 0 ? 'slide-left' : 'slide-right'
								} rounded-3xl border border-white/10 bg-[#120c0a] p-6`}
							>
								<p className="text-xs uppercase tracking-[0.4em] text-[var(--love-accent)]">
									{milestone.date}
								</p>
								<p className="mt-2 text-sm text-[var(--love-cream)]">
									{milestone.title}
								</p>
								<p className="mt-2 text-xs text-[var(--love-muted)]">
									{milestone.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</SectionShell>

			<SectionShell
				id="gallery"
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
					<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{data.gallery.photos.map((item, index) => (
							<div
								key={`${item.caption ?? 'photo'}-${index}`}
								data-reveal
								style={{ transitionDelay: `${index * 60}ms` }}
								className="dm-reveal rounded-2xl border border-white/10 bg-gradient-to-br from-[#2a1b13] via-[#0f0c0a] to-[#5b2f22] p-6"
							>
								<div className="h-32 w-full rounded-xl border border-white/10 bg-black/30" />
								<p className="mt-4 text-xs uppercase tracking-[0.3em] text-[var(--love-accent)]">
									{item.caption ?? `Photo ${index + 1}`}
								</p>
							</div>
						))}
					</div>
				</div>
			</SectionShell>

			<SectionShell
				id="schedule"
				mode={mode}
				hidden={hiddenSections?.schedule}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="love-section"
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
								className="dm-reveal rounded-2xl border border-white/10 bg-[#140d0b]/80 p-5"
							>
								<div className="flex flex-wrap items-center justify-between gap-4">
									<p className="text-sm font-semibold text-[var(--love-accent)] tabular-nums">
										{event.time}
									</p>
									<p className="text-sm text-[var(--love-cream)]">
										{event.title}
									</p>
								</div>
								<p className="mt-2 text-xs text-[var(--love-muted)]">
									{event.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</SectionShell>

			<SectionShell
				id="venue"
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
							{...editableProps(
								'venue.name',
								'dm-reveal text-2xl font-semibold text-[var(--love-cream)]',
							)}
						>
							{data.venue.name}
						</h2>
						<p
							data-reveal
							{...editableProps(
								'venue.address',
								'dm-reveal text-sm text-[var(--love-muted)]',
							)}
						>
							{data.venue.address}
						</p>
						<p
							data-reveal
							{...editableProps(
								'venue.directions',
								'dm-reveal text-xs text-[var(--love-muted)]',
							)}
						>
							{data.venue.directions}
						</p>
					</div>
					<div
						data-reveal
						className="dm-reveal rounded-3xl border border-white/10 bg-gradient-to-br from-[#2a1b13] via-[#0f0c0a] to-[#5b2f22] p-6"
					>
						<div className="h-48 rounded-2xl border border-white/10 bg-black/30" />
						<p className="mt-3 text-xs uppercase tracking-[0.3em] text-[var(--love-accent)]">
							Map preview
						</p>
					</div>
				</div>
			</SectionShell>

			<SectionShell
				id="entourage"
				mode={mode}
				hidden={hiddenSections?.entourage}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="love-section"
			>
				<div className="mx-auto max-w-4xl">
					<p
						data-reveal
						className="dm-reveal text-xs uppercase tracking-[0.6em] text-[var(--love-accent)]"
					>
						Entourage
					</p>
					<div className="mt-6 grid gap-4 sm:grid-cols-3">
						{data.entourage.members.map((person, index) => (
							<div
								key={`${person.role}-${index}`}
								data-reveal
								style={{ transitionDelay: `${index * 80}ms` }}
								className="dm-reveal rounded-2xl border border-white/10 bg-[#140d0b]/80 p-5 text-center"
							>
								<p className="text-xs uppercase tracking-[0.3em] text-[var(--love-accent)]">
									{person.role}
								</p>
								<p className="mt-3 text-sm text-[var(--love-cream)]">
									{person.name}
								</p>
							</div>
						))}
					</div>
				</div>
			</SectionShell>

			<SectionShell
				id="registry"
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
				id="rsvp"
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
							className="dm-reveal mt-4 text-2xl font-semibold text-[var(--love-cream)]"
						>
							Join us on our day
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
						onSubmit={(event) => {
							event.preventDefault()
							if (!onRsvpSubmit) return
							const formData = new FormData(event.currentTarget)
							onRsvpSubmit({
								name: String(formData.get('name') ?? ''),
								attendance: String(formData.get('attendance') ?? 'attending') as any,
								guestCount: Number(formData.get('guestCount') ?? 1),
								dietaryRequirements: String(formData.get('dietary') ?? ''),
								message: String(formData.get('message') ?? ''),
								email: String(formData.get('email') ?? ''),
							})
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
						{rsvpStatus ? (
							<p role="status" className="mt-3 text-xs text-[var(--love-accent)]">
								{rsvpStatus}
							</p>
						) : null}
						<button
							type="submit"
							className="mt-6 w-full rounded-full bg-[var(--love-accent)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#0c0a08]"
						>
							Submit RSVP
						</button>
					</form>
				</div>
			</SectionShell>

			<SectionShell
				id="footer"
				mode={mode}
				hidden={hiddenSections?.footer}
				onSelect={onSectionSelect}
				onAiClick={onAiClick}
				className="love-section love-panel"
			>
				<div className="mx-auto max-w-3xl text-center">
					<p
						data-reveal
						{...editableProps(
							'footer.message',
							'dm-reveal text-lg text-[var(--love-cream)]',
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
	)
}
