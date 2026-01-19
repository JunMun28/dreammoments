import { Link } from "@tanstack/react-router";
import { Heart, Home, LayoutDashboard, Menu, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LogoutButton } from "./LogoutButton";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);

	// Handle Escape key to close sidebar
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsOpen(false);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen]);

	return (
		<>
			<header className="flex items-center border-b border-stone-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-100"
					aria-label="Open menu"
				>
					<Menu size={24} aria-hidden="true" />
				</button>
				<h1 className="ml-4 flex-1">
					<Link to="/" className="flex items-center gap-2">
						<Heart
							className="h-7 w-7 text-rose-400"
							fill="currentColor"
							aria-hidden="true"
						/>
						<span className="text-xl font-light tracking-wide text-stone-800">
							DreamMoments
						</span>
					</Link>
				</h1>
				<LogoutButton />
			</header>

			{/* Backdrop - uses div since it's a click-away target, not interactive element */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
					onClick={() => setIsOpen(false)}
					aria-hidden="true"
				/>
			)}

			<aside
				className={`fixed left-0 top-0 z-50 flex h-full w-80 transform flex-col border-r border-stone-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between border-b border-stone-200 p-4">
					<div className="flex items-center gap-2">
						<Heart
							className="h-6 w-6 text-rose-400"
							fill="currentColor"
							aria-hidden="true"
						/>
						<span className="text-lg font-light text-stone-800">
							DreamMoments
						</span>
					</div>
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-100"
						aria-label="Close menu"
					>
						<X size={24} aria-hidden="true" />
					</button>
				</div>

				<nav className="flex-1 overflow-y-auto p-4">
					<Link
						to="/"
						onClick={() => setIsOpen(false)}
						className="mb-2 flex items-center gap-3 rounded-lg p-3 text-stone-600 transition-colors hover:bg-stone-100"
						activeProps={{
							className:
								"mb-2 flex items-center gap-3 rounded-lg p-3 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100",
						}}
					>
						<Home size={20} aria-hidden="true" />
						<span className="font-medium">Home</span>
					</Link>

					<Link
						to="/login"
						onClick={() => setIsOpen(false)}
						className="mb-2 flex items-center gap-3 rounded-lg p-3 text-stone-600 transition-colors hover:bg-stone-100"
						activeProps={{
							className:
								"mb-2 flex items-center gap-3 rounded-lg p-3 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100",
						}}
					>
						<LayoutDashboard size={20} aria-hidden="true" />
						<span className="font-medium">Dashboard</span>
					</Link>

					<div className="my-4 border-t border-stone-200" />

					<p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-stone-400">
						Coming Soon
					</p>

					<div
						className="mb-2 flex cursor-not-allowed items-center gap-3 rounded-lg p-3 text-stone-400"
						aria-disabled="true"
					>
						<Settings size={20} aria-hidden="true" />
						<span className="font-medium">Settings</span>
					</div>
				</nav>

				<div className="border-t border-stone-200 p-4">
					<p className="text-center text-xs text-stone-400">
						Made with love for couples everywhere
					</p>
				</div>
			</aside>
		</>
	);
}
