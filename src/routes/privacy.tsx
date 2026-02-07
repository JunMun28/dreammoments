import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({ component: PrivacyPolicy });

function PrivacyPolicy() {
	return (
		<div className="min-h-screen bg-dm-bg">
			<div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
				<header className="mb-12">
					<p className="font-accent text-2xl text-dm-peach">
						Legal Information
					</p>
					<h1 className="mt-2 font-heading text-4xl sm:text-5xl text-dm-ink">
						Privacy Policy
					</h1>
					<p className="mt-4 text-dm-muted">
						Last updated: February 2026
					</p>
				</header>

				<article className="prose prose-dm max-w-none space-y-10 text-dm-ink">
					{/* Introduction */}
					<section>
						<h2 className="font-heading text-2xl mb-4">
							1. Introduction
						</h2>
						<p className="text-dm-muted leading-relaxed">
							DreamMoments ("we", "our", or "us") is committed to
							protecting your personal data. This Privacy Policy
							explains how we collect, use, disclose, and
							safeguard your information when you use our wedding
							invitation platform.
						</p>
						<p className="text-dm-muted leading-relaxed mt-4">
							We comply with the Personal Data Protection Act
							2010 (Malaysia) and the Personal Data Protection
							Act 2012 (Singapore), collectively referred to as
							"PDPA" in this policy.
						</p>
					</section>

					{/* Data We Collect */}
					<section>
						<h2 className="font-heading text-2xl mb-4">
							2. Information We Collect
						</h2>
						<p className="text-dm-muted leading-relaxed mb-4">
							We collect personal data that you voluntarily
							provide when using our services:
						</p>

						<h3 className="font-heading text-lg mt-6 mb-3">
							2.1 Account Information
						</h3>
						<ul className="list-disc list-inside text-dm-muted space-y-2">
							<li>Full name</li>
							<li>Email address</li>
							<li>
								Google account information (if using Google
								sign-in)
							</li>
						</ul>

						<h3 className="font-heading text-lg mt-6 mb-3">
							2.2 Wedding Invitation Content
						</h3>
						<ul className="list-disc list-inside text-dm-muted space-y-2">
							<li>Names of the couple</li>
							<li>Wedding date and venue details</li>
							<li>Photos and messages</li>
							<li>Event schedule information</li>
						</ul>

						<h3 className="font-heading text-lg mt-6 mb-3">
							2.3 RSVP Guest Information
						</h3>
						<ul className="list-disc list-inside text-dm-muted space-y-2">
							<li>Guest name</li>
							<li>Email address</li>
							<li>Attendance status</li>
							<li>Number of guests attending</li>
							<li>
								Dietary requirements and food preferences (e.g.,
								vegetarian, halal, allergies)
							</li>
							<li>Personal messages</li>
						</ul>

						<h3 className="font-heading text-lg mt-6 mb-3">
							2.4 Usage Data
						</h3>
						<ul className="list-disc list-inside text-dm-muted space-y-2">
							<li>Invitation page views</li>
							<li>Device and browser information</li>
							<li>IP address and approximate location</li>
						</ul>
					</section>

					{/* How We Use Data */}
					<section>
						<h2 className="font-heading text-2xl mb-4">
							3. How We Use Your Information
						</h2>
						<p className="text-dm-muted leading-relaxed mb-4">
							We use the collected information for the following
							purposes:
						</p>
						<ul className="list-disc list-inside text-dm-muted space-y-2">
							<li>
								<strong>Wedding Planning:</strong> To create and
								manage your digital wedding invitations
							</li>
							<li>
								<strong>RSVP Management:</strong> To collect and
								organize guest responses for the couple
							</li>
							<li>
								<strong>Communication:</strong> To send
								important updates about your wedding invitation
								or our service
							</li>
							<li>
								<strong>Service Improvement:</strong> To analyze
								usage patterns and improve our platform
							</li>
							<li>
								<strong>Customer Support:</strong> To respond to
								your inquiries and provide assistance
							</li>
							<li>
								<strong>Legal Compliance:</strong> To comply
								with applicable laws and regulations
							</li>
						</ul>
					</section>

					{/* Data Sharing */}
					<section>
						<h2 className="font-heading text-2xl mb-4">
							4. Data Sharing and Disclosure
						</h2>
						<p className="text-dm-muted leading-relaxed mb-4">
							We do not sell your personal data. We may share your
							information in the following circumstances:
						</p>
						<ul className="list-disc list-inside text-dm-muted space-y-2">
							<li>
								<strong>With the Couple:</strong> RSVP
								information is shared with the wedding couple
								who created the invitation
							</li>
							<li>
								<strong>Service Providers:</strong> With trusted
								third-party services that help us operate our
								platform (e.g., cloud hosting, payment
								processing)
							</li>
							<li>
								<strong>Legal Requirements:</strong> When
								required by law, court order, or government
								request
							</li>
							<li>
								<strong>Business Transfers:</strong> In
								connection with any merger, acquisition, or sale
								of assets
							</li>
						</ul>
					</section>

					{/* Data Retention */}
					<section>
						<h2 className="font-heading text-2xl mb-4">
							5. Data Retention
						</h2>
						<p className="text-dm-muted leading-relaxed">
							We retain your personal data for as long as
							necessary to provide our services:
						</p>
						<ul className="list-disc list-inside text-dm-muted space-y-2 mt-4">
							<li>
								<strong>Account Data:</strong> Retained until
								you delete your account
							</li>
							<li>
								<strong>Invitation Data:</strong> Retained for
								12 months after the wedding date, unless you
								request earlier deletion
							</li>
							<li>
								<strong>RSVP Data:</strong> Retained for 12
								months after the wedding date
							</li>
							<li>
								<strong>Usage Analytics:</strong> Retained in
								anonymized form for up to 24 months
							</li>
						</ul>
						<p className="text-dm-muted leading-relaxed mt-4">
							After the retention period, data is securely deleted
							or anonymized.
						</p>
					</section>

					{/* Your Rights */}
					<section>
						<h2 className="font-heading text-2xl mb-4">
							6. Your Rights
						</h2>
						<p className="text-dm-muted leading-relaxed mb-4">
							Under the PDPA (Malaysia and Singapore), you have
							the following rights:
						</p>
						<ul className="list-disc list-inside text-dm-muted space-y-2">
							<li>
								<strong>Right of Access:</strong> Request a copy
								of your personal data we hold
							</li>
							<li>
								<strong>Right to Correction:</strong> Request
								correction of inaccurate or incomplete data
							</li>
							<li>
								<strong>Right to Deletion:</strong> Request
								deletion of your personal data
							</li>
							<li>
								<strong>Right to Withdraw Consent:</strong>{" "}
								Withdraw your consent for data processing at any
								time
							</li>
							<li>
								<strong>Right to Data Portability:</strong>{" "}
								Request your data in a commonly used format
							</li>
						</ul>
						<p className="text-dm-muted leading-relaxed mt-4">
							To exercise any of these rights, please contact us
							using the details provided below.
						</p>
					</section>

					{/* Data Security */}
					<section>
						<h2 className="font-heading text-2xl mb-4">
							7. Data Security
						</h2>
						<p className="text-dm-muted leading-relaxed">
							We implement appropriate technical and
							organizational measures to protect your personal
							data, including:
						</p>
						<ul className="list-disc list-inside text-dm-muted space-y-2 mt-4">
							<li>Encryption of data in transit (HTTPS/TLS)</li>
							<li>Encryption of data at rest</li>
							<li>Regular security assessments</li>
							<li>Access controls and authentication</li>
							<li>Secure cloud infrastructure</li>
						</ul>
					</section>

					{/* Cookies */}
					<section>
						<h2 className="font-heading text-2xl mb-4">
							8. Cookies and Tracking
						</h2>
						<p className="text-dm-muted leading-relaxed">
							We use essential cookies to maintain your session
							and preferences. We may also use analytics cookies
							to understand how you use our platform. You can
							control cookie settings through your browser.
						</p>
					</section>

					{/* Children's Privacy */}
					<section>
						<h2 className="font-heading text-2xl mb-4">
							9. Children's Privacy
						</h2>
						<p className="text-dm-muted leading-relaxed">
							Our services are not intended for individuals under
							18 years of age. We do not knowingly collect
							personal data from children. If you believe we have
							collected data from a child, please contact us
							immediately.
						</p>
					</section>

					{/* International Transfers */}
					<section>
						<h2 className="font-heading text-2xl mb-4">
							10. International Data Transfers
						</h2>
						<p className="text-dm-muted leading-relaxed">
							Your data may be processed in countries outside
							Malaysia and Singapore. We ensure appropriate
							safeguards are in place when transferring data
							internationally, in compliance with PDPA
							requirements.
						</p>
					</section>

					{/* Updates */}
					<section>
						<h2 className="font-heading text-2xl mb-4">
							11. Changes to This Policy
						</h2>
						<p className="text-dm-muted leading-relaxed">
							We may update this Privacy Policy from time to time.
							We will notify you of any material changes by
							posting the new policy on this page and updating the
							"Last updated" date. We encourage you to review this
							policy periodically.
						</p>
					</section>

					{/* Contact */}
					<section>
						<h2 className="font-heading text-2xl mb-4">
							12. Contact Us
						</h2>
						<p className="text-dm-muted leading-relaxed">
							If you have questions about this Privacy Policy or
							wish to exercise your data protection rights, please
							contact our Data Protection Officer:
						</p>
						<div className="mt-4 p-6 rounded-2xl bg-dm-surface border border-dm-border">
							<p className="font-medium text-dm-ink">
								DreamMoments Data Protection Officer
							</p>
							<p className="text-dm-muted mt-2">
								Email: privacy@dreammoments.com
							</p>
							<p className="text-dm-muted mt-1">
								Response time: Within 30 days of receiving your
								request
							</p>
						</div>
					</section>

					{/* Regulatory Information */}
					<section>
						<h2 className="font-heading text-2xl mb-4">
							13. Regulatory Information
						</h2>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="p-4 rounded-xl bg-dm-surface border border-dm-border">
								<p className="font-medium text-dm-ink text-sm">
									Malaysia
								</p>
								<p className="text-dm-muted text-sm mt-1">
									Personal Data Protection Act 2010 (Act 709)
								</p>
								<p className="text-dm-muted text-sm mt-1">
									Regulated by: Department of Personal Data
									Protection (JPDP)
								</p>
							</div>
							<div className="p-4 rounded-xl bg-dm-surface border border-dm-border">
								<p className="font-medium text-dm-ink text-sm">
									Singapore
								</p>
								<p className="text-dm-muted text-sm mt-1">
									Personal Data Protection Act 2012 (No. 26 of
									2012)
								</p>
								<p className="text-dm-muted text-sm mt-1">
									Regulated by: Personal Data Protection
									Commission (PDPC)
								</p>
							</div>
						</div>
					</section>
				</article>

				{/* Footer Navigation */}
				<footer className="mt-16 pt-8 border-t border-dm-border">
					<div className="flex flex-wrap gap-4 justify-between items-center">
						<Link
							to="/"
							className="text-dm-muted hover:text-dm-ink transition-colors"
						>
							Back to Home
						</Link>
						<Link
							to="/terms"
							className="text-dm-peach hover:text-dm-ink transition-colors"
						>
							Terms of Service
						</Link>
					</div>
				</footer>
			</div>
		</div>
	);
}
