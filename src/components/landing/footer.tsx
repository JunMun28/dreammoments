const navLinks = [
	{ label: "Templates", href: "#showcase" },
	{ label: "FAQ", href: "#faq" },
	{ label: "Privacy", href: "/privacy" },
	{ label: "Terms", href: "/terms" },
];

const socialLinks = [
	{
		label: "Instagram",
		href: "https://instagram.com/dreammoments",
	},
	{
		label: "Facebook",
		href: "https://facebook.com/dreammoments",
	},
	{
		label: "TikTok",
		href: "https://tiktok.com/@dreammoments",
	},
];

export function Footer() {
	return (
		<footer className="bg-[#0f1a0f] dark:bg-[#0a120a] border-t border-white/10">
			<div className="mx-auto max-w-5xl px-6 py-12">
				<div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
					{/* Brand */}
					<div>
						<span className="font-heading text-lg font-light text-white">
							DreamMoments
						</span>
						<p className="text-xs text-white/40">Malaysia &amp; Singapore</p>
					</div>

					{/* Nav */}
					<nav aria-label="Footer navigation">
						<ul className="flex flex-wrap gap-x-6 gap-y-2">
							{navLinks.map((link) => (
								<li key={link.label}>
									<a
										href={link.href}
										className="text-sm text-white/60 transition-colors hover:text-white"
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</nav>

					{/* Social */}
					<ul className="flex gap-4">
						{socialLinks.map((link) => (
							<li key={link.label}>
								<a
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={link.label}
									className="text-sm text-white/60 transition-colors hover:text-white"
								>
									{link.label}
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>

			{/* Copyright */}
			<div className="border-t border-white/5">
				<div className="mx-auto max-w-5xl px-6 py-4 text-center">
					<p className="text-xs text-white/30">
						{new Date().getFullYear()} DreamMoments. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
