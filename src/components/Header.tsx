import { Link } from "@tanstack/react-router";
import { Heart, Home, LayoutDashboard, Menu, Settings, X } from "lucide-react";
import { useState } from "react";
import { LogoutButton } from "./LogoutButton";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<header className="flex items-center border-b border-stone-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-100"
					aria-label="Open menu"
				>
					<Menu size={24} />
				</button>
				<h1 className="ml-4 flex-1">
					<Link to="/" className="flex items-center gap-2">
						<Heart className="h-7 w-7 text-rose-400" fill="currentColor" />
						<span className="text-xl font-light tracking-wide text-stone-800">
							DreamMoments
						</span>
					</Link>
				</h1>
				<LogoutButton />
			</header>

			{/* Backdrop */}
			{isOpen && (
				<button
					type="button"
					className="fixed inset-0 z-40 cursor-default border-none bg-black/20 backdrop-blur-sm"
					onClick={() => setIsOpen(false)}
					onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
					aria-label="Close sidebar"
					tabIndex={-1}
				/>
			)}

			<aside
				className={`fixed left-0 top-0 z-50 flex h-full w-80 transform flex-col border-r border-stone-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between border-b border-stone-200 p-4">
					<div className="flex items-center gap-2">
						<Heart className="h-6 w-6 text-rose-400" fill="currentColor" />
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
						<X size={24} />
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
						<Home size={20} />
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
						<LayoutDashboard size={20} />
						<span className="font-medium">Dashboard</span>
					</Link>

					<div className="my-4 border-t border-stone-200" />

					<p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-stone-400">
						Coming Soon
					</p>

					<div className="mb-2 flex cursor-not-allowed items-center gap-3 rounded-lg p-3 text-stone-400">
						<Settings size={20} />
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
