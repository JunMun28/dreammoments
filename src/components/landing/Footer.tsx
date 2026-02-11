import { Link } from "@tanstack/react-router";
import { MeshGradientBackground } from "./MeshGradientBackground";
import { GoldRule } from "./motifs/GoldRule";

export function Footer({ reducedMotion = false }: { reducedMotion?: boolean }) {
	return (
		<footer
			className="relative px-6 py-16 text-center"
			style={{ background: "var(--dm-bg)" }}
		>
			{/* Subtle mesh gradient strip */}
			<div className="absolute inset-0 pointer-events-none" aria-hidden="true">
				<MeshGradientBackground
					variant="warm"
					className="h-full"
					reducedMotion={reducedMotion}
				>
					<div />
				</MeshGradientBackground>
			</div>

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
							color: "var(--dm-gold-electric)",
							opacity: 0.6,
							textShadow: "0 0 8px rgba(212,184,122,0.4)",
						}}
						aria-hidden="true"
					>
						囍
					</span>
					<p
						className="font-display text-2xl font-semibold"
						style={{
							color: "var(--dm-ink)",
							letterSpacing: "-0.02em",
						}}
					>
						DreamMoments
					</p>
					<span
						className="select-none"
						style={{
							fontFamily: '"Noto Serif SC", serif',
							fontSize: "1rem",
							color: "var(--dm-gold-electric)",
							opacity: 0.6,
							textShadow: "0 0 8px rgba(212,184,122,0.4)",
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

				{/* EST line */}
				<p
					className="mt-4"
					style={{
						fontFamily: '"Inter", system-ui, sans-serif',
						fontSize: "0.6875rem",
						fontWeight: 500,
						textTransform: "uppercase",
						letterSpacing: "0.2em",
						color: "var(--dm-muted)",
						opacity: 0.5,
					}}
				>
					EST. 2025
				</p>

				{/* Contact */}
				<div
					className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm"
					style={{ color: "var(--dm-muted)" }}
				>
					<a
						href="mailto:hello@dreammoments.app"
						className="rounded transition-colors duration-300 hover:text-[var(--dm-ink)] focus-visible:ring-2 focus-visible:ring-[var(--dm-crimson)] focus-visible:ring-offset-2 focus-visible:outline-none"
					>
						hello@dreammoments.app
					</a>
					<span style={{ opacity: 0.4 }} aria-hidden="true">
						{"\u00B7"}
					</span>
					<a
						href="https://wa.me/60123456789"
						target="_blank"
						rel="noopener noreferrer"
						className="rounded transition-colors duration-300 hover:text-[var(--dm-ink)] focus-visible:ring-2 focus-visible:ring-[var(--dm-crimson)] focus-visible:ring-offset-2 focus-visible:outline-none"
					>
						WhatsApp
					</a>
					<span style={{ opacity: 0.4 }} aria-hidden="true">
						{"\u00B7"}
					</span>
					<a
						href="https://instagram.com/dreammoments.app"
						target="_blank"
						rel="noopener noreferrer"
						className="rounded transition-colors duration-300 hover:text-[var(--dm-ink)] focus-visible:ring-2 focus-visible:ring-[var(--dm-crimson)] focus-visible:ring-offset-2 focus-visible:outline-none"
					>
						Instagram
					</a>
				</div>

				{/* Links */}
				<nav
					aria-label="Footer"
					className="mt-4 flex justify-center gap-4 text-sm"
				>
					<Link
						to="/privacy"
						className="rounded transition-colors duration-300 hover:text-[var(--dm-ink)] focus-visible:ring-2 focus-visible:ring-[var(--dm-crimson)] focus-visible:ring-offset-2 focus-visible:outline-none"
						style={{ color: "var(--dm-muted)" }}
					>
						Privacy Policy
					</Link>
					<span
						style={{ color: "var(--dm-muted)", opacity: 0.4 }}
						aria-hidden="true"
					>
						{"\u00B7"}
					</span>
					<Link
						to="/terms"
						className="rounded transition-colors duration-300 hover:text-[var(--dm-ink)] focus-visible:ring-2 focus-visible:ring-[var(--dm-crimson)] focus-visible:ring-offset-2 focus-visible:outline-none"
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
