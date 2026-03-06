"use client";

import { Link } from "@tanstack/react-router";

const socialLinks = [
	{ label: "Instagram", href: "https://instagram.com" },
	{ label: "Facebook", href: "https://facebook.com" },
	{ label: "X", href: "https://x.com" },
	{ label: "TikTok", href: "https://tiktok.com" },
];

const navLinks = [
	{ label: "Home", href: "#" },
	{ label: "Templates", href: "#projects" },
	{ label: "Features", href: "#services-menu" },
	{ label: "About us", href: "#about" },
	{ label: "FAQ", href: "#faq" },
];

const footerLinks = [
	{ label: "About Us", href: "#about" },
	{ label: "Templates", href: "#projects" },
	{ label: "FAQ", href: "#faq" },
];

const serviceItems = [
	"Invitation Design",
	"RSVP Management",
	"Guest Messaging",
	"Timeline Updates",
	"Wedding Website Hosting",
];

export function Footer() {
	return (
		// biome-ignore lint/correctness/useUniqueElementIds: stable hash target for in-page navigation
		<footer
			id="contact"
			className="bg-[#1C1017] text-[#FDF2F8] lg:sticky lg:bottom-0 lg:z-0"
		>
			<div className="mx-auto max-w-[90rem] px-6 py-16 lg:px-24 lg:py-24 2xl:max-w-[112.5rem] min-[120rem]:max-w-[137.5rem]">
				<div className="flex flex-col justify-between gap-12 lg:flex-row lg:gap-8">
					<div>
						<span className="font-heading text-4xl font-medium tracking-tight">
							DreamMoments
						</span>
						<p className="font-heading mt-4 text-4xl text-[#D4A0B8]">
							Designed for modern wedding storytelling.
						</p>
						<div className="mt-8">
							<Link
								to="/editor/new"
								search={{ template: "double-happiness" }}
								className="inline-flex items-center justify-center rounded-full bg-[#EAB308] px-8 py-4 text-lg font-medium text-white transition-colors hover:opacity-90"
							>
								Start Creating
							</Link>
						</div>
					</div>

					<div className="flex flex-col gap-16 sm:flex-row lg:gap-24">
						<div>
							<h4 className="mb-6 text-sm font-medium text-[#D4A0B8]">
								Location
							</h4>
							<div className="mb-6">
								<p className="mb-1 font-medium">Malaysia & Singapore</p>
								<p className="text-sm text-[#D4A0B8]">Remote-first support</p>
							</div>
						</div>

						<div>
							<h4 className="mb-6 text-sm font-medium text-[#D4A0B8]">
								Services
							</h4>
							<ul className="space-y-3">
								{serviceItems.map((service) => (
									<li key={service}>
										<span className="text-[#FDF2F8]">{service}</span>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h4 className="mb-6 text-sm font-medium text-[#D4A0B8]">
								Navigation
							</h4>
							<ul className="space-y-3">
								{navLinks.map((link) => (
									<li key={link.label}>
										<a
											href={link.href}
											className="text-[#FDF2F8] transition-colors hover:text-[#D4A0B8]"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h4 className="mb-6 text-sm font-medium text-[#D4A0B8]">
								Social
							</h4>
							<ul className="space-y-3">
								{socialLinks.map((link) => (
									<li key={link.label}>
										<a
											href={link.href}
											target="_blank"
											rel="noopener noreferrer"
											className="text-[#FDF2F8] transition-colors hover:text-[#D4A0B8]"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-[90rem] px-6 py-6 lg:px-24 2xl:max-w-[112.5rem] min-[120rem]:max-w-[137.5rem]">
				<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
					<div className="flex items-center gap-6">
						{footerLinks.map((link) => (
							<a
								key={link.label}
								href={link.href}
								className="text-sm text-[#D4A0B8] transition-colors hover:text-[#FDF2F8]"
							>
								{link.label}
							</a>
						))}
					</div>

					<p className="text-sm text-[#D4A0B8]/60">
						© 2026 DreamMoments - All rights reserved
					</p>

					<p className="text-sm text-[#D4A0B8]/60">
						Built with love by DreamMoments
					</p>
				</div>
			</div>
		</footer>
	);
}
