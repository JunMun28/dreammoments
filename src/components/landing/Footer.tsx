import { Link } from "@tanstack/react-router";

export function Footer({
	reducedMotion: _reducedMotion = false,
}: {
	reducedMotion?: boolean;
}) {
	return (
		<footer className="py-12 bg-white border-t border-dm-border">
			<div className="dm-container">
				<div className="grid md:grid-cols-4 gap-8 mb-12">
					<div className="md:col-span-1">
						<Link
							to="/"
							className="text-xl font-display font-bold text-dm-ink flex items-center gap-2"
						>
							DreamMoments
						</Link>
						<p className="mt-4 text-sm text-dm-ink-muted leading-relaxed">
							The modern platform for wedding invitations. Thinking of every
							detail so you don&apos;t have to.
						</p>
					</div>

					<div>
						<h4 className="font-semibold text-dm-ink mb-4">Product</h4>
						<ul className="space-y-2 text-sm text-dm-ink-muted">
							<li>
								<Link
									to="/"
									hash="features"
									className="hover:text-dm-primary transition-colors"
								>
									Features
								</Link>
							</li>
							<li>
								<Link
									to="/"
									hash="templates"
									className="hover:text-dm-primary transition-colors"
								>
									Templates
								</Link>
							</li>
							<li>
								<Link
									to="/"
									hash="pricing"
									className="hover:text-dm-primary transition-colors"
								>
									Pricing
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="font-semibold text-dm-ink mb-4">Resources</h4>
						<ul className="space-y-2 text-sm text-dm-ink-muted">
							<li>
								<a
									href="/blog"
									className="hover:text-dm-primary transition-colors"
								>
									Blog
								</a>
							</li>
							<li>
								<a
									href="/help"
									className="hover:text-dm-primary transition-colors"
								>
									Help Center
								</a>
							</li>
							<li>
								<a
									href="/guides"
									className="hover:text-dm-primary transition-colors"
								>
									Wedding Guides
								</a>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="font-semibold text-dm-ink mb-4">Legal</h4>
						<ul className="space-y-2 text-sm text-dm-ink-muted">
							<li>
								<Link
									to="/privacy"
									className="hover:text-dm-primary transition-colors"
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									to="/terms"
									className="hover:text-dm-primary transition-colors"
								>
									Terms of Service
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="pt-8 border-t border-dm-border flex flex-col md:flex-row justify-between items-center gap-4">
					<p className="text-sm text-dm-ink-muted">
						© {new Date().getFullYear()} DreamMoments. All rights reserved.
					</p>
					<div className="flex gap-6">
						<a
							href="https://instagram.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-dm-ink-muted hover:text-dm-primary transition-colors"
						>
							Instagram
						</a>
						<a
							href="https://twitter.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-dm-ink-muted hover:text-dm-primary transition-colors"
						>
							Twitter
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
