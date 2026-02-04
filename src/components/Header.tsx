import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../lib/auth'

const navItems = [
	{ label: 'Templates', href: '/#templates' },
	{ label: 'How It Works', href: '/#process' },
	{ label: 'Pricing', href: '/#pricing' },
	{ label: 'Dashboard', to: '/dashboard' },
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
					className="rounded-full border border-[color:var(--dm-border)] p-2 text-[color:var(--dm-ink)] md:hidden"
					aria-label="Toggle navigation"
				>
					{open ? <X size={18} /> : <Menu size={18} />}
				</button>
				<nav className="hidden items-center gap-6 text-sm uppercase tracking-[0.22em] text-[color:var(--dm-muted)] md:flex">
					{navItems.map((item) =>
						item.to ? (
							<Link
								key={item.label}
								to={item.to}
								className="dm-nav-link transition hover:text-[color:var(--dm-ink)]"
							>
								{item.label}
							</Link>
						) : (
							<a
								key={item.label}
								href={item.href}
								className="dm-nav-link transition hover:text-[color:var(--dm-ink)]"
							>
								{item.label}
							</a>
						),
					)}
					{user?.plan === 'free' ? (
						<Link
							to="/upgrade"
							className="rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
						>
							Upgrade
						</Link>
					) : null}
					{user ? (
						<button
							type="button"
							onClick={signOut}
							className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]"
						>
							Sign Out
						</button>
					) : (
						<Link
							to="/auth/login"
							className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]"
						>
							Sign In
						</Link>
					)}
				</nav>
			</div>
			{open && (
				<div className="border-t border-[color:var(--dm-border)] bg-[color:var(--dm-bg)] md:hidden">
					<div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-sm uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
						{navItems.map((item) =>
							item.to ? (
								<Link
									key={item.label}
									to={item.to}
									className="dm-nav-link transition hover:text-[color:var(--dm-ink)]"
									onClick={() => setOpen(false)}
								>
									{item.label}
								</Link>
							) : (
								<a
									key={item.label}
									href={item.href}
									className="dm-nav-link transition hover:text-[color:var(--dm-ink)]"
									onClick={() => setOpen(false)}
								>
									{item.label}
								</a>
							),
						)}
						{user?.plan === 'free' ? (
							<Link
								to="/upgrade"
								className="rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
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
								className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]"
							>
								Sign Out
							</button>
						) : (
							<Link
								to="/auth/login"
								className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]"
								onClick={() => setOpen(false)}
							>
								Sign In
							</Link>
						)}
					</div>
				</div>
			)}
		</header>
	)
}
