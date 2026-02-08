import { Link } from "@tanstack/react-router";

export function Footer() {
	return (
		<footer
			className="border-t py-16 px-6 text-center"
			style={{
				borderColor: "var(--dm-border)",
				background: "var(--dm-bg)",
			}}
		>
			<div className="mx-auto max-w-4xl">
				<p
					className="font-display text-2xl font-semibold"
					style={{ color: "var(--dm-ink)" }}
				>
					DreamMoments
				</p>
				<p className="mt-2 text-sm" style={{ color: "var(--dm-muted)" }}>
					AI-powered wedding invitations for Chinese couples in Malaysia and
					Singapore.
				</p>

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
