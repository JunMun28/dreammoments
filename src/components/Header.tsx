import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/auth";
import { useFocusTrap } from "./editor/hooks/useFocusTrap";

const navItems = [
	{ label: "Templates", hash: "templates" },
	{ label: "How it works", hash: "process" },
	{ label: "Pricing", hash: "pricing" },
];

export default function Header() {
	const [open, setOpen] = useState(false);
	const { user, signOut } = useAuth();
	const navigate = useNavigate();
	const hamburgerRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const closeMenu = useCallback(() => {
		setOpen(false);
		hamburgerRef.current?.focus();
	}, []);

	const handleSignOut = useCallback(() => {
		signOut();
		navigate({ to: "/" });
	}, [signOut, navigate]);

	useFocusTrap(menuRef, {
		enabled: open,
		onEscape: closeMenu,
	});

	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	return (
		<header className="fixed inset-x-0 top-0 z-50 border-b border-dm-border/50 bg-dm-bg/80 backdrop-blur-xl">
			<div className="mx-auto w-full max-w-[1320px] px-6 py-4 lg:px-12">
				<div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
					<Link
						to="/"
						className="font-heading text-[1.65rem] font-semibold leading-none tracking-tight text-dm-ink"
					>
						DreamMoments
					</Link>

					<nav
						aria-label="Main navigation"
						className="hidden items-center justify-center gap-8 text-[11px] uppercase tracking-[0.22em] text-dm-muted md:flex"
					>
						{navItems.map((item) => (
							<Link
								key={item.label}
								to="/"
								hash={item.hash}
								className="dm-nav-link inline-flex items-center min-h-[44px] leading-none transition-colors duration-300 hover:text-dm-ink"
							>
								{item.label}
							</Link>
						))}
					</nav>

					<div className="flex items-center justify-end gap-2">
						<div className="hidden items-center gap-2 md:flex">
							{user ? (
								<button
									type="button"
									onClick={handleSignOut}
									className="rounded-full inline-flex items-center justify-center border border-dm-border bg-dm-surface/60 px-4 py-2 text-xs font-semibold leading-none text-dm-ink"
								>
									Sign out
								</button>
							) : (
								<Link
									to="/auth/login"
									className="rounded-full inline-flex items-center justify-center border border-dm-border bg-dm-surface/60 px-4 py-2 text-xs font-semibold leading-none text-dm-ink"
								>
									Sign in
								</Link>
							)}
							{user?.plan === "free" ? (
								<Link
									to="/upgrade"
									className="rounded-full inline-flex items-center justify-center border border-dm-peach/40 bg-dm-surface px-4 py-2 text-xs font-semibold leading-none text-dm-ink"
								>
									Upgrade
								</Link>
							) : null}
							{user ? (
								<Link
									to="/dashboard"
									className="rounded-full inline-flex items-center justify-center bg-dm-ink px-5 py-2.5 text-sm font-semibold leading-none text-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.12)]"
								>
									Open App
								</Link>
							) : (
								<Link
									to="/editor/new"
									search={{ template: "love-at-dusk" }}
									className="rounded-full inline-flex items-center justify-center bg-dm-ink px-5 py-2.5 text-sm font-semibold leading-none text-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.12)]"
								>
									Start Free Trial
								</Link>
							)}
						</div>
						<button
							ref={hamburgerRef}
							type="button"
							onClick={() => setOpen((prev) => !prev)}
							className="rounded-full border border-dm-border bg-dm-surface/60 p-3 text-dm-ink md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dm-peach focus-visible:ring-offset-2"
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
				<>
					<div
						className="fixed inset-0 top-[65px] bg-black/30 backdrop-blur-sm md:hidden"
						onClick={closeMenu}
						aria-hidden="true"
					/>
					<div
						ref={menuRef}
						role="dialog"
						aria-modal="true"
						className="relative border-t border-dm-border bg-dm-bg md:hidden"
					>
						<div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-6 py-4 text-sm text-dm-muted">
							{navItems.map((item) => (
								<Link
									key={item.label}
									to="/"
									hash={item.hash}
									className="dm-nav-link inline-flex items-center min-h-[44px] text-[11px] uppercase tracking-[0.22em] leading-none transition-colors duration-300 hover:text-dm-ink"
									onClick={closeMenu}
								>
									{item.label}
								</Link>
							))}
							{user ? (
								<Link
									to="/dashboard"
									className="rounded-full inline-flex items-center justify-center bg-dm-ink px-4 py-2 text-center text-sm font-semibold leading-none text-white"
									onClick={closeMenu}
								>
									Open App
								</Link>
							) : (
								<Link
									to="/editor/new"
									search={{ template: "love-at-dusk" }}
									className="rounded-full inline-flex items-center justify-center bg-dm-ink px-4 py-2 text-center text-sm font-semibold leading-none text-white"
									onClick={closeMenu}
								>
									Start Free Trial
								</Link>
							)}
							{user?.plan === "free" ? (
								<Link
									to="/upgrade"
									className="rounded-full inline-flex items-center justify-center border border-dm-peach/40 px-4 py-2 text-center text-xs font-semibold leading-none text-dm-ink"
									onClick={closeMenu}
								>
									Upgrade
								</Link>
							) : null}
							{user ? (
								<button
									type="button"
									onClick={() => {
										handleSignOut();
										closeMenu();
									}}
									className="rounded-full inline-flex items-center justify-center border border-dm-border px-4 py-2 text-xs font-semibold leading-none text-dm-ink"
								>
									Sign out
								</button>
							) : (
								<Link
									to="/auth/login"
									className="rounded-full inline-flex items-center justify-center border border-dm-border px-4 py-2 text-xs font-semibold leading-none text-dm-ink"
									onClick={closeMenu}
								>
									Sign in
								</Link>
							)}
						</div>
					</div>
				</>
			)}
		</header>
	);
}
