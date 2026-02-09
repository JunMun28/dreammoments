import { Link } from "@tanstack/react-router";
import { GoldRule } from "./motifs/GoldRule";

export function Footer() {
	return (
		<footer
			className="relative px-6 py-12 text-center"
			style={{ background: "var(--dm-bg)" }}
		>
			{/* Gold hairline at top */}
			<GoldRule className="absolute top-0 left-0 right-0" />

			<div className="mx-auto max-w-4xl">
				{/* Brand */}
				<div className="flex items-center justify-center gap-3">
					<span
						className="select-none"
						style={{
							fontFamily: '"Noto Serif SC", serif',
							fontSize: "1rem",
							color: "var(--dm-gold)",
							opacity: 0.4,
						}}
						aria-hidden="true"
					>
						囍
					</span>
					<p
						className="font-display text-xl font-semibold"
						style={{ color: "var(--dm-ink)" }}
					>
						DreamMoments
					</p>
					<span
						className="select-none"
						style={{
							fontFamily: '"Noto Serif SC", serif',
							fontSize: "1rem",
							color: "var(--dm-gold)",
							opacity: 0.4,
						}}
						aria-hidden="true"
					>
						囍
					</span>
				</div>

				{/* Tagline */}
				<p className="mt-2 text-sm" style={{ color: "var(--dm-muted)" }}>
					AI-powered wedding invitations for Chinese couples in Malaysia &
					Singapore.
				</p>

				{/* Links */}
				<nav
					aria-label="Footer"
					className="mt-8 flex justify-center gap-6 text-sm"
				>
					<Link
						to="/privacy"
						className="transition-colors duration-300 hover:text-[var(--dm-ink)]"
						style={{ color: "var(--dm-muted)" }}
					>
						Privacy Policy
					</Link>
					<span style={{ color: "var(--dm-border)" }} aria-hidden="true">
						|
					</span>
					<Link
						to="/terms"
						className="transition-colors duration-300 hover:text-[var(--dm-ink)]"
						style={{ color: "var(--dm-muted)" }}
					>
						Terms of Service
					</Link>
				</nav>

				{/* PDPA line */}
				<p
					className="mt-6 text-xs"
					style={{ color: "var(--dm-muted)", opacity: 0.6 }}
				>
					PDPA compliant for Malaysia and Singapore
				</p>
			</div>
		</footer>
	);
}
