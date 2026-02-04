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
		<header className="sticky top-0 z-50 border-b border-white/10 bg-[#0c0a08]/80 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
				<Link
					to="/"
					className="text-lg font-semibold tracking-[0.2em] text-[#f7e8c4]"
				>
					DREAMMOMENTS
				</Link>
				<button
					onClick={() => setOpen((prev) => !prev)}
					className="rounded-full border border-white/15 p-2 text-[#f7e8c4] md:hidden"
					aria-label="Toggle navigation"
				>
					{open ? <X size={18} /> : <Menu size={18} />}
				</button>
				<nav className="hidden items-center gap-6 text-sm uppercase tracking-[0.22em] text-[#f7e8c4]/80 md:flex">
					{navItems.map((item) =>
						item.to ? (
							<Link
								key={item.label}
								to={item.to}
								className="transition hover:text-white"
							>
								{item.label}
							</Link>
						) : (
							<a
								key={item.label}
								href={item.href}
								className="transition hover:text-white"
							>
								{item.label}
							</a>
						),
					)}
					{user?.plan === 'free' ? (
						<Link
							to="/upgrade"
							className="rounded-full bg-[#d8b25a] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#0c0a08]"
						>
							Upgrade
						</Link>
					) : null}
					{user ? (
						<button
							type="button"
							onClick={signOut}
							className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#f7e8c4]"
						>
							Sign out
						</button>
					) : (
						<Link
							to="/auth/login"
							className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#f7e8c4]"
						>
							Sign in
						</Link>
					)}
				</nav>
			</div>
			{open && (
				<div className="border-t border-white/10 bg-[#0c0a08] md:hidden">
					<div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-sm uppercase tracking-[0.2em] text-[#f7e8c4]/80">
						{navItems.map((item) =>
							item.to ? (
								<Link
									key={item.label}
									to={item.to}
									className="transition hover:text-white"
									onClick={() => setOpen(false)}
								>
									{item.label}
								</Link>
							) : (
								<a
									key={item.label}
									href={item.href}
									className="transition hover:text-white"
									onClick={() => setOpen(false)}
								>
									{item.label}
								</a>
							),
						)}
						{user?.plan === 'free' ? (
							<Link
								to="/upgrade"
								className="rounded-full bg-[#d8b25a] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#0c0a08]"
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
								className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#f7e8c4]"
							>
								Sign out
							</button>
						) : (
							<Link
								to="/auth/login"
								className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#f7e8c4]"
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
