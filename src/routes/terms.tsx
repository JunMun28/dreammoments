import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({ component: TermsOfService });

const tocItems = [
	{ id: "agreement-to-terms", label: "1. Agreement to Terms" },
	{ id: "service-description", label: "2. Service Description" },
	{ id: "account-registration", label: "3. Account Registration" },
	{ id: "user-responsibilities", label: "4. User Responsibilities" },
	{ id: "intellectual-property", label: "5. Intellectual Property" },
	{ id: "payment-terms", label: "6. Payment Terms" },
	{ id: "limitation-of-liability", label: "7. Limitation of Liability" },
	{ id: "indemnification", label: "8. Indemnification" },
	{ id: "termination", label: "9. Termination" },
	{ id: "dispute-resolution", label: "10. Dispute Resolution" },
	{ id: "governing-law", label: "11. Governing Law" },
	{ id: "modifications-to-terms", label: "12. Modifications to Terms" },
	{ id: "severability", label: "13. Severability" },
	{ id: "contact-information", label: "14. Contact Information" },
];

function TermsOfService() {
	return (
		<div className="min-h-screen bg-dm-bg">
			<div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
				<Link
					to="/"
					className="inline-flex items-center gap-1 text-sm text-dm-muted transition-colors hover:text-dm-ink mb-8"
				>
					&larr; Back to Home
				</Link>
				<header className="mb-12">
					<p className="font-accent text-2xl text-dm-peach">
						Legal Information
					</p>
					<h1 className="mt-2 font-heading text-4xl sm:text-5xl text-dm-ink">
						Terms of Service
					</h1>
					<p className="mt-4 text-dm-muted">Last updated: February 2026</p>
				</header>

				{/* Table of Contents */}
				<nav
					aria-label="Table of contents"
					className="mb-12 rounded-2xl border border-dm-border bg-dm-surface p-6"
				>
					<p className="text-xs uppercase tracking-[0.3em] text-dm-accent-strong mb-4">
						Table of Contents
					</p>
					<ol className="columns-1 gap-x-8 space-y-2 text-sm sm:columns-2">
						{tocItems.map((item) => (
							<li key={item.id}>
								<a
									href={`#${item.id}`}
									className="text-dm-muted transition-colors hover:text-dm-ink"
								>
									{item.label}
								</a>
							</li>
						))}
					</ol>
				</nav>

				<article className="prose prose-dm max-w-none space-y-10 text-dm-ink">
					{/* Introduction */}
					<section>
						{/* biome-ignore lint/correctness/useUniqueElementIds: TOC anchor target */}
						<h2 id="agreement-to-terms" className="font-heading text-2xl mb-4">
							1. Agreement to Terms
						</h2>
						<p className="text-dm-muted leading-relaxed">
							Welcome to DreamMoments. These Terms of Service ("Terms") govern
							your use of our wedding invitation platform and services. By
							accessing or using DreamMoments, you agree to be bound by these
							Terms.
						</p>
						<p className="text-dm-muted leading-relaxed mt-4">
							If you do not agree to these Terms, please do not use our
							services.
						</p>
					</section>

					{/* Service Description */}
					<section>
						{/* biome-ignore lint/correctness/useUniqueElementIds: TOC anchor target */}
						<h2 id="service-description" className="font-heading text-2xl mb-4">
							2. Service Description
						</h2>
						<p className="text-dm-muted leading-relaxed mb-4">
							DreamMoments provides a digital wedding invitation platform that
							allows couples to:
						</p>
						<ul className="list-disc list-inside text-dm-muted space-y-2">
							<li>
								Create beautiful, customizable digital wedding invitations
							</li>
							<li>Share invitations via unique links with guests</li>
							<li>Collect and manage RSVP responses</li>
							<li>Track invitation views and guest engagement</li>
							<li>Use AI-powered features to enhance invitation content</li>
						</ul>
					</section>

					{/* Account Registration */}
					<section>
						{/* biome-ignore lint/correctness/useUniqueElementIds: TOC anchor target */}
						<h2
							id="account-registration"
							className="font-heading text-2xl mb-4"
						>
							3. Account Registration
						</h2>
						<p className="text-dm-muted leading-relaxed mb-4">
							To use certain features, you must create an account. You agree to:
						</p>
						<ul className="list-disc list-inside text-dm-muted space-y-2">
							<li>Provide accurate and complete registration information</li>
							<li>Maintain the security of your account credentials</li>
							<li>Notify us immediately of any unauthorized access</li>
							<li>
								Accept responsibility for all activities under your account
							</li>
						</ul>
						<p className="text-dm-muted leading-relaxed mt-4">
							You must be at least 18 years old to create an account.
						</p>
					</section>

					{/* User Responsibilities */}
					<section>
						{/* biome-ignore lint/correctness/useUniqueElementIds: TOC anchor target */}
						<h2
							id="user-responsibilities"
							className="font-heading text-2xl mb-4"
						>
							4. User Responsibilities
						</h2>
						<p className="text-dm-muted leading-relaxed mb-4">
							When using DreamMoments, you agree to:
						</p>
						<ul className="list-disc list-inside text-dm-muted space-y-2">
							<li>
								Use the service only for lawful purposes related to wedding
								invitations
							</li>
							<li>
								Not upload content that is illegal, harmful, or infringes on
								others' rights
							</li>
							<li>
								Obtain necessary consent before including others' personal
								information or photos
							</li>
							<li>Not attempt to interfere with or disrupt the service</li>
							<li>
								Not use automated systems to access the service without
								permission
							</li>
							<li>
								Respect the intellectual property rights of DreamMoments and
								third parties
							</li>
						</ul>

						<h3 className="font-heading text-lg mt-6 mb-3">
							4.1 Content Guidelines
						</h3>
						<p className="text-dm-muted leading-relaxed">
							You are solely responsible for the content you upload. Content
							must not include:
						</p>
						<ul className="list-disc list-inside text-dm-muted space-y-2 mt-2">
							<li>Explicit or adult material</li>
							<li>Hate speech or discriminatory content</li>
							<li>Copyrighted material without authorization</li>
							<li>Malicious code or harmful files</li>
							<li>False or misleading information</li>
						</ul>
					</section>

					{/* Intellectual Property */}
					<section>
						{/* biome-ignore lint/correctness/useUniqueElementIds: TOC anchor target */}
						<h2
							id="intellectual-property"
							className="font-heading text-2xl mb-4"
						>
							5. Intellectual Property
						</h2>
						<h3 className="font-heading text-lg mb-3">5.1 Our Content</h3>
						<p className="text-dm-muted leading-relaxed">
							The DreamMoments platform, including its templates, designs, code,
							and branding, is owned by us and protected by intellectual
							property laws. You may not copy, modify, or distribute our
							proprietary content without permission.
						</p>

						<h3 className="font-heading text-lg mt-6 mb-3">5.2 Your Content</h3>
						<p className="text-dm-muted leading-relaxed">
							You retain ownership of content you upload (photos, text, etc.).
							By uploading content, you grant us a limited license to display
							and process it solely to provide our services.
						</p>
					</section>

					{/* Payment Terms */}
					<section>
						{/* biome-ignore lint/correctness/useUniqueElementIds: TOC anchor target */}
						<h2 id="payment-terms" className="font-heading text-2xl mb-4">
							6. Payment Terms
						</h2>
						<p className="text-dm-muted leading-relaxed mb-4">
							Certain features may require payment. By purchasing a subscription
							or service:
						</p>
						<ul className="list-disc list-inside text-dm-muted space-y-2">
							<li>
								You agree to pay all fees associated with your selected plan
							</li>
							<li>
								Payments are processed securely through our payment providers
							</li>
							<li>
								All fees are quoted in the applicable local currency (MYR or
								SGD)
							</li>
							<li>Refunds are provided in accordance with our refund policy</li>
						</ul>
					</section>

					{/* Limitation of Liability */}
					<section>
						{/* biome-ignore lint/correctness/useUniqueElementIds: TOC anchor target */}
						<h2
							id="limitation-of-liability"
							className="font-heading text-2xl mb-4"
						>
							7. Limitation of Liability
						</h2>
						<p className="text-dm-muted leading-relaxed mb-4">
							To the maximum extent permitted by law:
						</p>
						<ul className="list-disc list-inside text-dm-muted space-y-2">
							<li>
								DreamMoments is provided "as is" without warranties of any kind
							</li>
							<li>We do not guarantee uninterrupted or error-free service</li>
							<li>
								We are not liable for any indirect, incidental, or consequential
								damages
							</li>
							<li>
								Our total liability shall not exceed the amount you paid for our
								services in the past 12 months
							</li>
						</ul>

						<h3 className="font-heading text-lg mt-6 mb-3">
							7.1 Service Availability
						</h3>
						<p className="text-dm-muted leading-relaxed">
							While we strive to maintain high availability, we do not guarantee
							that the service will be available at all times. We recommend
							downloading or backing up your important data.
						</p>
					</section>

					{/* Indemnification */}
					<section>
						{/* biome-ignore lint/correctness/useUniqueElementIds: TOC anchor target */}
						<h2 id="indemnification" className="font-heading text-2xl mb-4">
							8. Indemnification
						</h2>
						<p className="text-dm-muted leading-relaxed">
							You agree to indemnify and hold harmless DreamMoments, its
							officers, directors, employees, and agents from any claims,
							damages, or expenses arising from:
						</p>
						<ul className="list-disc list-inside text-dm-muted space-y-2 mt-4">
							<li>Your use of the service</li>
							<li>Your violation of these Terms</li>
							<li>Your violation of any third-party rights</li>
							<li>Content you upload or share</li>
						</ul>
					</section>

					{/* Termination */}
					<section>
						{/* biome-ignore lint/correctness/useUniqueElementIds: TOC anchor target */}
						<h2 id="termination" className="font-heading text-2xl mb-4">
							9. Termination
						</h2>
						<p className="text-dm-muted leading-relaxed mb-4">
							We may suspend or terminate your account if you:
						</p>
						<ul className="list-disc list-inside text-dm-muted space-y-2">
							<li>Violate these Terms</li>
							<li>Engage in fraudulent or illegal activity</li>
							<li>Fail to pay applicable fees</li>
							<li>Abuse or harass other users</li>
						</ul>
						<p className="text-dm-muted leading-relaxed mt-4">
							You may terminate your account at any time through your account
							settings. Upon termination, your right to use the service ceases,
							and your data will be handled according to our Privacy Policy.
						</p>
					</section>

					{/* Dispute Resolution */}
					<section>
						{/* biome-ignore lint/correctness/useUniqueElementIds: TOC anchor target */}
						<h2 id="dispute-resolution" className="font-heading text-2xl mb-4">
							10. Dispute Resolution
						</h2>
						<p className="text-dm-muted leading-relaxed">
							Any disputes arising from these Terms or your use of DreamMoments
							should first be addressed by contacting our support team. If we
							cannot resolve the dispute informally, it will be subject to the
							jurisdiction specified in the Governing Law section.
						</p>
					</section>

					{/* Governing Law */}
					<section>
						{/* biome-ignore lint/correctness/useUniqueElementIds: TOC anchor target */}
						<h2 id="governing-law" className="font-heading text-2xl mb-4">
							11. Governing Law
						</h2>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="p-4 rounded-xl bg-dm-surface border border-dm-border">
								<p className="font-medium text-dm-ink text-sm">
									For Malaysian Users
								</p>
								<p className="text-dm-muted text-sm mt-2">
									These Terms shall be governed by and construed in accordance
									with the laws of Malaysia. Any disputes shall be subject to
									the exclusive jurisdiction of the Malaysian courts.
								</p>
							</div>
							<div className="p-4 rounded-xl bg-dm-surface border border-dm-border">
								<p className="font-medium text-dm-ink text-sm">
									For Singaporean Users
								</p>
								<p className="text-dm-muted text-sm mt-2">
									These Terms shall be governed by and construed in accordance
									with the laws of Singapore. Any disputes shall be subject to
									the exclusive jurisdiction of the Singapore courts.
								</p>
							</div>
						</div>
					</section>

					{/* Modifications */}
					<section>
						{/* biome-ignore lint/correctness/useUniqueElementIds: TOC anchor target */}
						<h2
							id="modifications-to-terms"
							className="font-heading text-2xl mb-4"
						>
							12. Modifications to Terms
						</h2>
						<p className="text-dm-muted leading-relaxed">
							We reserve the right to modify these Terms at any time. We will
							notify users of material changes via email or prominent notice on
							our platform. Continued use of the service after changes
							constitutes acceptance of the modified Terms.
						</p>
					</section>

					{/* Severability */}
					<section>
						{/* biome-ignore lint/correctness/useUniqueElementIds: TOC anchor target */}
						<h2 id="severability" className="font-heading text-2xl mb-4">
							13. Severability
						</h2>
						<p className="text-dm-muted leading-relaxed">
							If any provision of these Terms is found to be unenforceable, the
							remaining provisions will continue in full force and effect.
						</p>
					</section>

					{/* Contact */}
					<section>
						{/* biome-ignore lint/correctness/useUniqueElementIds: TOC anchor target */}
						<h2 id="contact-information" className="font-heading text-2xl mb-4">
							14. Contact Information
						</h2>
						<p className="text-dm-muted leading-relaxed">
							For questions about these Terms of Service, please contact us:
						</p>
						<div className="mt-4 p-6 rounded-2xl bg-dm-surface border border-dm-border">
							<p className="font-medium text-dm-ink">DreamMoments Support</p>
							<p className="text-dm-muted mt-2">
								Email: support@dreammoments.com
							</p>
							<p className="text-dm-muted mt-1">
								Legal inquiries: legal@dreammoments.com
							</p>
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
							to="/privacy"
							className="text-dm-peach hover:text-dm-ink transition-colors"
						>
							Privacy Policy
						</Link>
					</div>
				</footer>
			</div>
		</div>
	);
}
