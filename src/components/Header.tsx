import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../lib/auth'

const navItems = [
	{ label: 'Templates', href: '/#templates' },
	{ label: 'How it works', href: '/#process' },
	{ label: 'Pricing', href: '/#pricing' },
]

export default function Header() {
	const [open, setOpen] = useState(false)
	const { user, signOut } = useAuth()

	return (
		<header className="sticky top-0 z-50 border-b border-[color:var(--dm-border)] bg-[color:var(--dm-bg)] backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
				<Link
					to="/"
					className="text-lg font-semibold tracking-[0.2em] text-[color:var(--dm-ink)]"
				>
					DREAMMOMENTS
				</Link>
				<button
					type="button"
					onClick={() => setOpen((prev) => !prev)}
					className="rounded-full border border-[color:var(--dm-border)] p-2 text-[color:var(--dm-ink)] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-peach)] focus-visible:ring-offset-2"
					aria-label="Toggle navigation"
					aria-expanded={open}
				>
					{open ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
				</button>
				<nav className="hidden items-center gap-6 text-sm text-[color:var(--dm-muted)] md:flex">
					{navItems.map((item) =>
						<a
							key={item.label}
							href={item.href}
							className="dm-nav-link inline-flex items-center min-h-[44px] leading-none transition hover:text-[color:var(--dm-ink)]"
						>
							{item.label}
						</a>,
					)}
					{user ? (
						<Link
							to="/dashboard"
							className="rounded-full inline-flex items-center justify-center bg-[color:var(--dm-accent-strong)] px-4 py-2 text-sm font-semibold leading-none text-[color:var(--dm-on-accent)]"
						>
							Open app
						</Link>
					) : (
						<Link
							to="/editor/new"
							search={{ template: 'love-at-dusk' }}
							className="rounded-full inline-flex items-center justify-center bg-[color:var(--dm-accent-strong)] px-4 py-2 text-sm font-semibold leading-none text-[color:var(--dm-on-accent)]"
						>
							Start free
						</Link>
					)}
					{user?.plan === 'free' ? (
						<Link
							to="/upgrade"
							className="rounded-full inline-flex items-center justify-center border border-[color:var(--dm-border)] px-4 py-2 text-xs font-semibold leading-none text-[color:var(--dm-accent-strong)]"
						>
							Upgrade
						</Link>
					) : null}
					{user ? (
						<button
							type="button"
							onClick={signOut}
							className="rounded-full inline-flex items-center justify-center border border-[color:var(--dm-border)] px-4 py-2 text-xs font-semibold leading-none text-[color:var(--dm-accent-strong)]"
						>
							Sign out
						</button>
					) : (
						<Link
							to="/auth/login"
							className="rounded-full inline-flex items-center justify-center border border-[color:var(--dm-border)] px-4 py-2 text-xs font-semibold leading-none text-[color:var(--dm-accent-strong)]"
						>
							Sign in
						</Link>
					)}
				</nav>
			</div>
			{open && (
				<div className="border-t border-[color:var(--dm-border)] bg-[color:var(--dm-bg)] md:hidden">
					<div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-sm text-[color:var(--dm-muted)]">
						{navItems.map((item) =>
							<a
								key={item.label}
								href={item.href}
								className="dm-nav-link inline-flex items-center min-h-[44px] leading-none transition hover:text-[color:var(--dm-ink)]"
								onClick={() => setOpen(false)}
							>
								{item.label}
							</a>,
						)}
						{user ? (
							<Link
								to="/dashboard"
								className="rounded-full inline-flex items-center justify-center bg-[color:var(--dm-accent-strong)] px-4 py-2 text-center text-sm font-semibold leading-none text-[color:var(--dm-on-accent)]"
								onClick={() => setOpen(false)}
							>
								Open app
							</Link>
						) : (
							<Link
								to="/editor/new"
								search={{ template: 'love-at-dusk' }}
								className="rounded-full inline-flex items-center justify-center bg-[color:var(--dm-accent-strong)] px-4 py-2 text-center text-sm font-semibold leading-none text-[color:var(--dm-on-accent)]"
								onClick={() => setOpen(false)}
							>
								Start free
							</Link>
						)}
						{user?.plan === 'free' ? (
							<Link
								to="/upgrade"
								className="rounded-full inline-flex items-center justify-center border border-[color:var(--dm-border)] px-4 py-2 text-center text-xs font-semibold leading-none text-[color:var(--dm-accent-strong)]"
								onClick={() => setOpen(false)}
							>
								Upgrade
							</Link>
						) : null}
						{user ? (
							<button
								type="button"
								onClick={() => {
									signOut()
									setOpen(false)
								}}
								className="rounded-full inline-flex items-center justify-center border border-[color:var(--dm-border)] px-4 py-2 text-xs font-semibold leading-none text-[color:var(--dm-accent-strong)]"
							>
								Sign out
							</button>
						) : (
							<Link
								to="/auth/login"
								className="rounded-full inline-flex items-center justify-center border border-[color:var(--dm-border)] px-4 py-2 text-xs font-semibold leading-none text-[color:var(--dm-accent-strong)]"
								onClick={() => setOpen(false)}
							>
								Sign in
							</Link>
						)}
					</div>
				</div>
			)}
		</header>
	)
}
