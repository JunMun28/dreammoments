import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../lib/auth";

const navItems = [
	{ label: "Templates", href: "/#templates" },
	{ label: "How it works", href: "/#process" },
	{ label: "Pricing", href: "/#pricing" },
];

export default function Header() {
	const [open, setOpen] = useState(false);
	const { user, signOut } = useAuth();

	return (
		<header className="fixed inset-x-0 top-0 z-50 border-b border-white/70 bg-[color:var(--dm-surface)]/75 backdrop-blur-xl">
			<div className="mx-auto w-full max-w-[1320px] px-6 py-4 lg:px-12">
				<div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
					<Link
						to="/"
						className="[font-family:'Playfair Display',serif] text-[1.85rem] font-bold italic leading-none tracking-tight text-[color:var(--dm-ink)]"
					>
						DreamMoments
					</Link>

					<nav className="hidden items-center justify-center gap-8 text-[11px] uppercase tracking-[0.22em] text-[color:var(--dm-muted)] md:flex">
						{navItems.map((item) => (
							<a
								key={item.label}
								href={item.href}
								className="dm-nav-link inline-flex items-center min-h-[44px] leading-none transition hover:text-[color:var(--dm-ink)]"
							>
								{item.label}
							</a>
						))}
					</nav>

				<div className="flex items-center justify-end gap-2">
					<div className="hidden items-center gap-2 md:flex">
						{user ? (
							<button
								type="button"
								onClick={signOut}
								className="rounded-full inline-flex items-center justify-center border border-[color:var(--dm-border)] bg-white/55 px-4 py-2 text-xs font-semibold leading-none text-[color:var(--dm-ink)]"
							>
								Sign out
							</button>
						) : (
							<Link
								to="/auth/login"
								className="rounded-full inline-flex items-center justify-center border border-[color:var(--dm-border)] bg-white/55 px-4 py-2 text-xs font-semibold leading-none text-[color:var(--dm-ink)]"
							>
								Sign in
							</Link>
						)}
						{user?.plan === "free" ? (
							<Link
								to="/upgrade"
								className="rounded-full inline-flex items-center justify-center border border-[color:var(--dm-peach)]/70 bg-[color:var(--dm-surface)] px-4 py-2 text-xs font-semibold leading-none text-[color:var(--dm-ink)]"
							>
								Upgrade
							</Link>
						) : null}
						{user ? (
							<Link
								to="/dashboard"
								className="rounded-full inline-flex items-center justify-center bg-white px-5 py-2.5 text-sm font-semibold leading-none text-black shadow-[0_8px_22px_-16px_rgba(43,33,24,0.55)]"
							>
								Open App
							</Link>
						) : (
							<Link
								to="/editor/new"
								search={{ template: "love-at-dusk" }}
								className="rounded-full inline-flex items-center justify-center bg-white px-5 py-2.5 text-sm font-semibold leading-none text-black shadow-[0_8px_22px_-16px_rgba(43,33,24,0.55)]"
							>
								Start Free Trial
							</Link>
						)}
					</div>
					<button
						type="button"
						onClick={() => setOpen((prev) => !prev)}
						className="rounded-full border border-[color:var(--dm-border)] bg-white/55 p-2 text-[color:var(--dm-ink)] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-peach)] focus-visible:ring-offset-2"
						aria-label="Toggle navigation"
						aria-expanded={open}
					>
						{open ? (
							<X aria-hidden="true" size={18} />
						) : (
							<Menu aria-hidden="true" size={18} />
						)}
					</button>
				</div>
				</div>
			</div>
			{open && (
				<div className="border-t border-[color:var(--dm-border)] bg-[color:var(--dm-surface)]/95 md:hidden">
					<div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-6 py-4 text-sm text-[color:var(--dm-muted)]">
						{navItems.map((item) => (
							<a
								key={item.label}
								href={item.href}
								className="dm-nav-link inline-flex items-center min-h-[44px] text-[11px] uppercase tracking-[0.22em] leading-none transition hover:text-[color:var(--dm-ink)]"
								onClick={() => setOpen(false)}
							>
								{item.label}
							</a>
						))}
						{user ? (
							<Link
								to="/dashboard"
								className="rounded-full inline-flex items-center justify-center bg-white px-4 py-2 text-center text-sm font-semibold leading-none text-black"
								onClick={() => setOpen(false)}
							>
								Open App
							</Link>
						) : (
							<Link
								to="/editor/new"
								search={{ template: "love-at-dusk" }}
								className="rounded-full inline-flex items-center justify-center bg-white px-4 py-2 text-center text-sm font-semibold leading-none text-black"
								onClick={() => setOpen(false)}
							>
								Start Free Trial
							</Link>
						)}
						{user?.plan === "free" ? (
							<Link
								to="/upgrade"
								className="rounded-full inline-flex items-center justify-center border border-[color:var(--dm-peach)]/70 px-4 py-2 text-center text-xs font-semibold leading-none text-[color:var(--dm-ink)]"
								onClick={() => setOpen(false)}
							>
								Upgrade
							</Link>
						) : null}
							{user ? (
								<button
									type="button"
									onClick={() => {
										signOut();
										setOpen(false);
									}}
									className="rounded-full inline-flex items-center justify-center border border-[color:var(--dm-border)] px-4 py-2 text-xs font-semibold leading-none text-[color:var(--dm-ink)]"
								>
									Sign out
								</button>
							) : (
								<Link
									to="/auth/login"
									className="rounded-full inline-flex items-center justify-center border border-[color:var(--dm-border)] px-4 py-2 text-xs font-semibold leading-none text-[color:var(--dm-ink)]"
									onClick={() => setOpen(false)}
								>
									Sign in
								</Link>
							)}
					</div>
				</div>
			)}
		</header>
	);
}
