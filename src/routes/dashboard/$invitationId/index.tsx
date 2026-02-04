import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import ShareModal from '../../../components/share/ShareModal'
import {
	addGuest,
	exportGuestsCsv,
	getAnalytics,
	getDeviceBreakdown,
	getDietarySummary,
	importGuests,
	listGuests,
	publishInvitation,
	setInvitationSlug,
	unpublishInvitation,
} from '../../../lib/data'
import { useAuth } from '../../../lib/auth'
import { useStore } from '../../../lib/store'
import type { AttendanceStatus, Invitation, InvitationStatus } from '../../../lib/types'

export const Route = createFileRoute('/dashboard/$invitationId/')({
	component: InvitationDashboard,
})

type CsvMapping = {
	name?: string
	email?: string
	relationship?: string
}

function parseCsv(text: string) {
	const [headerLine, ...rows] = text.split(/\r?\n/).filter(Boolean)
	const headers = headerLine.split(',').map((item) => item.trim().replace(/^"|"$/g, ''))
	return rows.map((row) => {
		const values = row.split(',').map((item) => item.trim().replace(/^"|"$/g, ''))
		return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
	})
}

function downloadCsv(name: string, content: string) {
	const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = name
	link.click()
	URL.revokeObjectURL(url)
}

const filterOptions: Array<{ value: AttendanceStatus | 'pending' | 'all'; label: string }> =
	[
		{ value: 'all', label: 'All' },
		{ value: 'attending', label: 'Attending' },
		{ value: 'not_attending', label: 'Not Attending' },
		{ value: 'pending', label: 'Pending' },
	]

const attendanceLabels: Record<AttendanceStatus | 'pending' | 'undecided', string> = {
	attending: 'Attending',
	not_attending: 'Not Attending',
	undecided: 'Undecided',
	pending: 'Pending',
}

const statusLabels: Record<InvitationStatus, string> = {
	draft: 'Draft',
	published: 'Published',
	archived: 'Archived',
}

const fieldLabels: Record<keyof CsvMapping, string> = {
	name: 'Name',
	email: 'Email',
	relationship: 'Relationship',
}

export function InvitationDashboard() {
	const { invitationId } = Route.useParams()
	const { user } = useAuth()
	const invitation = useStore((store) =>
		store.invitations.find((item) => item.id === invitationId),
	)
	const guests = useStore((store) =>
		store.guests.filter((guest) => guest.invitationId === invitationId),
	)
	const [filter, setFilter] = useState<AttendanceStatus | 'pending' | 'all'>('all')
	const [search, setSearch] = useState('')
	const [shareOpen, setShareOpen] = useState(false)
	const [importRows, setImportRows] = useState<Record<string, string>[]>([])
	const [mapping, setMapping] = useState<CsvMapping>({})
	const [manualGuest, setManualGuest] = useState({ name: '', email: '', relationship: '' })

	useEffect(() => {
		if (typeof window === 'undefined') return
		const params = new URLSearchParams(window.location.search)
		const filterParam = params.get('filter')
		const queryParam = params.get('q')
		if (filterParam) setFilter(filterParam as typeof filter)
		if (queryParam) setSearch(queryParam)
	}, [])

	useEffect(() => {
		if (typeof window === 'undefined') return
		const params = new URLSearchParams(window.location.search)
		if (filter && filter !== 'all') params.set('filter', filter)
		else params.delete('filter')
		if (search) params.set('q', search)
		else params.delete('q')
		const next = params.toString()
		const url = next ? `${window.location.pathname}?${next}` : window.location.pathname
		window.history.replaceState(null, '', url)
	}, [filter, search])

	if (!user) return <Navigate to="/auth/login" />
	if (!invitation) return <Navigate to="/dashboard" />
	if (invitation.userId !== user.id) {
		return (
			<div className="min-h-screen bg-[#0c0a08] px-6 py-10 text-sm text-[#f7e8c4]/70">
				403 · Not authorized.
			</div>
		)
	}

	const filteredGuests = useMemo(() => {
		let list = listGuests(invitationId, filter === 'all' ? undefined : filter)
		if (search) {
			list = list.filter((guest) => guest.name.toLowerCase().includes(search.toLowerCase()))
		}
		return list
	}, [filter, search, guests, invitationId])

	const totalGuests = guests.reduce((sum, guest) => sum + guest.guestCount, 0)
	const attending = guests.filter((guest) => guest.attendance === 'attending').length
	const pending = guests.filter((guest) => !guest.attendance).length
	const analytics = getAnalytics(invitationId)
	const devices = getDeviceBreakdown(invitationId)
	const dietary = getDietarySummary(invitationId)

	return (
		<div className="min-h-screen bg-[#0c0a08] px-6 py-10">
			<div className="mx-auto max-w-6xl space-y-10">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.4em] text-[#d8b25a]">Invitation Overview</p>
						<h1 className="mt-2 text-3xl font-semibold text-[#fdf6ea] break-words">{invitation.title}</h1>
						<p className="mt-2 text-sm text-[#f7e8c4]/70 break-words">{invitation.slug}</p>
					</div>
					<div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em]">
						<Link
							to="/editor/$invitationId"
							params={{ invitationId }}
							className="rounded-full border border-white/20 px-4 py-2 text-[#f7e8c4]"
						>
							Open Editor
						</Link>
						<button
							type="button"
							className="rounded-full border border-white/20 px-4 py-2 text-[#f7e8c4]"
							onClick={() => setShareOpen(true)}
						>
							Share
						</button>
					</div>
				</div>

				<div className="grid gap-4 lg:grid-cols-5">
				{[
						{ label: 'Invited', value: invitation.invitedCount || guests.length },
						{ label: 'Responded', value: guests.length },
						{ label: 'Total Guests', value: totalGuests },
						{ label: 'Attending', value: attending },
						{ label: 'Pending', value: pending },
					].map((stat) => (
						<div key={stat.label} className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-6">
							<p className="text-xs uppercase tracking-[0.3em] text-[#d8b25a]">{stat.label}</p>
							<p className="mt-3 text-2xl font-semibold text-[#fdf6ea] tabular-nums">{stat.value}</p>
						</div>
					))}
				</div>

				<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-6">
						<h2 className="text-xl font-semibold text-[#fdf6ea]">RSVP Management</h2>
						<div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em]">
							{filterOptions.map((option) => (
								<button
									key={option.value}
									type="button"
									className="rounded-full border border-white/20 px-3 py-2 text-[#f7e8c4]"
									onClick={() => setFilter(option.value)}
								>
									{option.label}
								</button>
							))}
							<input
								placeholder="Search Guest (e.g., Mei Lin)…"
								aria-label="Search Guest"
								name="guestSearch"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								className="h-10 flex-1 rounded-full border border-white/10 bg-[#0f0c0a] px-4 text-xs text-[#f7e8c4]"
								autoComplete="off"
								type="search"
							/>
						</div>

						<div className="mt-4 overflow-auto rounded-2xl border border-white/10">
							<table className="w-full text-left text-xs text-[#f7e8c4]/80 tabular-nums">
								<thead className="bg-[#14100d] uppercase tracking-[0.2em]">
									<tr>
										<th className="px-4 py-3">Guest</th>
										<th className="px-4 py-3">Status</th>
										<th className="px-4 py-3">Count</th>
										<th className="px-4 py-3">Dietary</th>
										<th className="px-4 py-3">Message</th>
									</tr>
								</thead>
								<tbody>
									{filteredGuests.map((guest) => (
										<tr key={guest.id} className="border-t border-white/5">
											<td className="px-4 py-3">{guest.name}</td>
											<td className="px-4 py-3">
												{attendanceLabels[guest.attendance ?? 'pending']}
											</td>
											<td className="px-4 py-3">{guest.guestCount}</td>
											<td className="px-4 py-3">{guest.dietaryRequirements ?? '-'}</td>
											<td className="px-4 py-3">{guest.message ?? '-'}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em]">
							<button
								type="button"
								className="rounded-full border border-white/20 px-4 py-2 text-[#f7e8c4]"
								onClick={() => downloadCsv(`guests-${invitation.slug}.csv`, exportGuestsCsv(invitationId))}
							>
								Export Guests CSV
							</button>
							{user.plan === 'premium' ? (
								<label className="rounded-full border border-white/20 px-4 py-2 text-[#f7e8c4]">
									Import Guests CSV
									<input
										type="file"
										accept=".csv"
										className="hidden"
										onChange={async (event) => {
											const file = event.target.files?.[0]
											if (!file) return
											const text = await file.text()
											setImportRows(parseCsv(text))
										}}
									/>
								</label>
							) : (
								<span className="rounded-full border border-white/10 px-4 py-2 text-[#f7e8c4]/50">
									Premium CSV Import
								</span>
							)}
						</div>

						{importRows.length ? (
							<div className="mt-4 space-y-3">
								<p className="text-xs uppercase tracking-[0.2em] text-[#d8b25a]">Map Columns</p>
								<div className="grid gap-3 sm:grid-cols-3">
									{['name', 'email', 'relationship'].map((field) => (
										<select
											key={field}
											value={mapping[field as keyof CsvMapping] ?? ''}
											onChange={(event) =>
												setMapping((prev) => ({
													...prev,
													[field]: event.target.value,
												}))
											}
											className="h-10 rounded-2xl border border-white/10 bg-[#0f0c0a] px-3 text-xs text-[#f7e8c4]"
										>
											<option value="">{fieldLabels[field as keyof CsvMapping]}</option>
											{Object.keys(importRows[0]).map((header) => (
												<option key={header} value={header}>
													{header}
												</option>
											))}
										</select>
									))}
								</div>
								<button
									type="button"
									className="rounded-full bg-[#d8b25a] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#0c0a08]"
									onClick={() => {
										const mapped = importRows.map((row) => ({
											name: mapping.name ? row[mapping.name] : row.name,
											email: mapping.email ? row[mapping.email] : row.email,
											relationship: mapping.relationship ? row[mapping.relationship] : row.relationship,
										}))
										importGuests(invitationId, mapped)
										setImportRows([])
									}}
								>
									Import Guests
								</button>
							</div>
						) : null}
					</div>

					<div className="space-y-6">
						<div className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-6">
							<h3 className="text-sm uppercase tracking-[0.3em] text-[#d8b25a]">Dietary Summary</h3>
							<div className="mt-4 space-y-2 text-sm text-[#f7e8c4]/70">
								{Object.entries(dietary.summary).map(([label, count]) => (
									<p key={label}>{label}: {count}</p>
								))}
								{dietary.notes.map((note) => (
									<p key={note}>{note}</p>
								))}
								{!Object.keys(dietary.summary).length && !dietary.notes.length ? (
									<p>No dietary notes yet.</p>
								) : null}
							</div>
						</div>

						<div className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-6">
							<h3 className="text-sm uppercase tracking-[0.3em] text-[#d8b25a]">Add Guest</h3>
							<div className="mt-4 grid gap-3">
							<input
								placeholder="Mei Lin…"
								aria-label="Guest Name"
								value={manualGuest.name}
								onChange={(event) => setManualGuest((prev) => ({ ...prev, name: event.target.value }))}
								className="h-10 rounded-2xl border border-white/10 bg-[#0f0c0a] px-3 text-sm text-[#f7e8c4]"
								name="guestName"
								autoComplete="off"
							/>
							<input
								placeholder="mei@example.com…"
								aria-label="Guest Email"
								value={manualGuest.email}
								onChange={(event) => setManualGuest((prev) => ({ ...prev, email: event.target.value }))}
								className="h-10 rounded-2xl border border-white/10 bg-[#0f0c0a] px-3 text-sm text-[#f7e8c4]"
								name="guestEmail"
								autoComplete="off"
								spellCheck={false}
								type="email"
							/>
							<input
								placeholder="Cousin…"
								aria-label="Guest Relationship"
								value={manualGuest.relationship}
								onChange={(event) => setManualGuest((prev) => ({ ...prev, relationship: event.target.value }))}
								className="h-10 rounded-2xl border border-white/10 bg-[#0f0c0a] px-3 text-sm text-[#f7e8c4]"
								name="guestRelationship"
								autoComplete="off"
							/>
								<button
									type="button"
									className="rounded-full bg-[#d8b25a] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#0c0a08]"
									onClick={() => {
										if (!manualGuest.name) return
										addGuest(invitationId, manualGuest)
										setManualGuest({ name: '', email: '', relationship: '' })
									}}
								>
									Add Guest
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					<div className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-6">
						<h2 className="text-xl font-semibold text-[#fdf6ea]">Analytics</h2>
						<p className="mt-2 text-sm text-[#f7e8c4]/70">
							Views: {analytics.totalViews} · RSVP Rate: {(analytics.rsvpRate * 100).toFixed(0)}%
						</p>
						<div className="mt-4 h-24 rounded-2xl border border-white/10 bg-[#14100d] p-3">
							<svg viewBox="0 0 200 60" className="h-full w-full">
								{analytics.viewsByDay.map((point, index) => (
									<circle
										key={point.date}
										cx={20 + index * 30}
										cy={50 - point.views * 8}
										r="3"
										fill="#d8b25a"
									/>
								))}
							</svg>
						</div>
						<p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#f7e8c4]/60">
							Device Mix: {devices.mobile ?? 0} Mobile / {devices.desktop ?? 0} Desktop
						</p>
					</div>

					<div className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-6">
						<h2 className="text-xl font-semibold text-[#fdf6ea]">Settings</h2>
						<p className="mt-2 text-sm text-[#f7e8c4]/70">Status: {statusLabels[invitation.status]}</p>
						<div className="mt-4 space-y-3">
							<label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-[#f7e8c4]/70">
								Custom Slug (Premium)
								<input
									defaultValue={invitation.slug}
									onBlur={(event) => setInvitationSlug(invitationId, event.target.value)}
									className="h-10 rounded-2xl border border-white/10 bg-[#0f0c0a] px-3 text-sm text-[#f7e8c4]"
									disabled={user.plan !== 'premium'}
									autoComplete="off"
								/>
							</label>
							<div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em]">
								<button
									type="button"
									className="rounded-full border border-white/20 px-4 py-2 text-[#f7e8c4]"
									onClick={() => publishInvitation(invitationId)}
								>
									Publish
								</button>
								<button
									type="button"
									className="rounded-full border border-white/20 px-4 py-2 text-[#f7e8c4]"
									onClick={() => unpublishInvitation(invitationId)}
								>
									Unpublish
								</button>
							</div>
							{user.plan !== 'premium' ? (
								<p className="text-xs text-[#f59e0b]">Upgrade to edit slug.</p>
							) : null}
						</div>
					</div>
				</div>
			</div>

			<ShareModal open={shareOpen} invitation={invitation as Invitation} onClose={() => setShareOpen(false)} />
		</div>
	)
}
