import { createFileRoute, Link } from '@tanstack/react-router'
import { useScrollReveal } from '../lib/scroll-effects'

export const Route = createFileRoute('/')({ component: Landing })

const templates = [
	{
		id: 'blush-romance',
		name: 'Blush Romance',
		nameZh: '胭脂之恋',
		vibe: 'Romantic & Light',
		description: 'Soft blush tones with botanical romance.',
		colors: ['#7F1D1D', '#D94674', '#FFF1F2'],
		preview: ['Hero', 'Story', 'Gallery'],
	},
	{
		id: 'love-at-dusk',
		name: 'Love at Dusk',
		nameZh: '暮色之恋',
		vibe: 'Romantic Chinese',
		description: 'Cinematic reds, gold accents, and poetic pacing.',
		colors: ['#B30E0E', '#741212', '#FFE094'],
		preview: ['Hero', 'Announcement', 'RSVP'],
	},
	{
		id: 'garden-romance',
		name: 'Garden Romance',
		nameZh: '花园之誓',
		vibe: 'Natural & Light',
		description: 'Soft botanicals with airy typography.',
		colors: ['#2D5A3D', '#E8B4B8', '#FDF8F5'],
		preview: ['Hero', 'Story', 'Gallery'],
	},
	{
		id: 'eternal-elegance',
		name: 'Eternal Elegance',
		nameZh: '恒久典雅',
		vibe: 'Classic Western',
		description: 'Black, champagne gold, and refined restraint.',
		colors: ['#1C1C1C', '#C9A962', '#FFFFFF'],
		preview: ['Hero', 'Schedule', 'RSVP'],
	},
]

const steps = [
	{
		title: 'Choose a Template',
		desc: 'Pick a cinematic base tuned for Chinese weddings.',
	},
	{
		title: 'Edit in Minutes',
		desc: 'Live preview, bilingual prompts, instant polish.',
	},
	{
		title: 'Publish and Share',
		desc: 'Get a link and QR code ready for WhatsApp.',
	},
]

const pricing = [
	{
		name: 'Free',
		price: 'RM0',
		note: 'Perfect for a fast launch',
		features: [
			'All 4 templates',
			'5 AI generations',
			'Randomized URL',
			'Unlimited RSVPs',
		],
	},
	{
		name: 'Premium',
		price: 'RM49 / SGD19',
		note: 'For a polished final',
		features: [
			'Custom URL slug',
			'100 AI generations',
			'Guest import + export',
			'Advanced analytics',
		],
	},
]

export function Landing() {
	useScrollReveal()
	return (
		<main className="dm-grid">
			<section className="dm-hero relative overflow-hidden px-6 pb-20 pt-24">
				<div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[color:var(--dm-accent)]/20 blur-[120px] dm-orb" />
				<div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-[color:var(--dm-accent-strong)]/15 blur-[120px] dm-orb" />
				<div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr]">
					<div className="space-y-8">
						<p className="font-accent text-xs uppercase tracking-[0.5em] text-[color:var(--dm-accent-strong)]">
							DreamMoments
						</p>
						<h1 className="text-4xl font-semibold leading-tight text-[color:var(--dm-ink)] sm:text-5xl lg:text-6xl">
							Beautiful Invitations, Fast.
							<span className="block text-[color:var(--dm-accent-strong)]">
								为华人婚礼而生的数字请柬
							</span>
						</h1>
						<p className="max-w-xl text-base leading-relaxed text-[color:var(--dm-muted)] sm:text-lg">
							Create a cinematic, bilingual wedding invitation in under 5
							minutes. Built for modern Chinese couples in Malaysia and
							Singapore.
						</p>
						<div className="flex flex-wrap items-center gap-4">
							<Link
								to="/editor/new"
								search={{ template: 'blush-romance' }}
								className="rounded-full bg-[color:var(--dm-accent-strong)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)] transition hover:bg-[color:var(--dm-accent)]"
							>
								Start with Blush Romance
							</Link>
							<a
								href="#templates"
								className="rounded-full border border-[color:var(--dm-border)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)] transition hover:border-[color:var(--dm-accent)]"
							>
								View Templates
							</a>
						</div>
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
							<div className="dm-card rounded-2xl p-4">
								<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
									Speed
								</p>
								<p className="text-2xl font-semibold text-[color:var(--dm-ink)]">5 min</p>
								<p className="text-xs text-[color:var(--dm-muted)]">
									Signup to share link
								</p>
							</div>
							<div className="dm-card rounded-2xl p-4">
								<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
									Quality
								</p>
								<p className="text-2xl font-semibold text-[color:var(--dm-ink)]">
									Designer‑level
								</p>
								<p className="text-xs text-[color:var(--dm-muted)]">Cinematic motion</p>
							</div>
							<div className="dm-card rounded-2xl p-4">
								<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
									Bilingual
								</p>
								<p className="text-2xl font-semibold text-[color:var(--dm-ink)]">EN + 中文</p>
								<p className="text-xs text-[color:var(--dm-muted)]">AI assisted tone</p>
							</div>
						</div>
					</div>
					<div className="relative">
						<div className="dm-card dm-hover-glow rounded-[28px] border border-[color:var(--dm-border)] p-6">
							<div className="space-y-5 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6">
								<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
									Live Preview
								</p>
								<div className="space-y-2">
									<p className="text-3xl font-semibold text-[color:var(--dm-ink)]">
										Sarah & Michael
									</p>
									<p className="text-sm text-[color:var(--dm-muted)]">
										Grand Hyatt Singapore · 15 Jun 2025
									</p>
								</div>
								<img
									src="/placeholders/photo-light.svg"
									alt=""
									loading="lazy"
									width={640}
									height={176}
									className="h-44 w-full rounded-2xl border border-[color:var(--dm-border)] object-cover"
								/>
								<p className="text-sm leading-relaxed text-[color:var(--dm-muted)]">
									Two hearts, one beautiful journey. A modern ceremony with
									Chinese elegance.
								</p>
								<div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]">
									<span>Hero</span>
									<span>Announcement</span>
									<span>RSVP</span>
								</div>
							</div>
						</div>
						<div className="absolute -bottom-10 -left-10 hidden h-36 w-36 rounded-full border border-[color:var(--dm-accent-strong)]/30 bg-[color:var(--dm-accent-strong)]/10 blur-2xl lg:block" />
					</div>
				</div>
			</section>

			<section id="templates" className="px-6 py-20">
				<div className="mx-auto max-w-6xl space-y-10">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div>
							<p className="font-accent text-xs uppercase tracking-[0.5em] text-[color:var(--dm-accent-strong)]">
								Templates
							</p>
							<h2 className="text-3xl font-semibold text-[color:var(--dm-ink)] sm:text-4xl">
								Four Signature Styles. One Seamless Editor.
							</h2>
						</div>
						<p className="max-w-xl text-sm text-[color:var(--dm-muted)]">
							Each template ships with curated motion, section order, and
							bilingual tone. Swap content, keep the cinematic flow.
						</p>
					</div>
					<div className="grid gap-10">
						{templates.map((template, index) => {
							const isDarkPreview = template.id === 'love-at-dusk'
							const previewImage = isDarkPreview
								? '/placeholders/photo-dark.svg'
								: '/placeholders/photo-light.svg'
							return (
							<section
								key={template.id}
								data-template-section
								className="dm-card rounded-[32px] p-8 lg:min-h-screen"
							>
								<div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
									<div className="space-y-6">
										<p className="font-accent text-xs uppercase tracking-[0.5em] text-[color:var(--dm-accent-strong)]">
											Template {index + 1}
										</p>
										<h3
											data-reveal
											className="dm-reveal text-3xl font-semibold text-[color:var(--dm-ink)]"
										>
											{template.name}
										</h3>
										<p
											data-reveal
											className="dm-reveal text-sm text-[color:var(--dm-muted)]"
										>
											{template.description}
										</p>
										<div
											data-reveal
											className="dm-reveal flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]"
										>
											<span>{template.vibe}</span>
											<span>{template.nameZh}</span>
										</div>
										<div className="flex gap-2">
											{template.colors.map((color) => (
												<div
													key={color}
													className="h-8 w-8 rounded-full border border-[color:var(--dm-border)]"
													style={{ backgroundColor: color }}
												/>
											))}
										</div>
										<div className="flex flex-col gap-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
											<Link
												to="/editor/new"
												search={{ template: template.id }}
												className="rounded-full border border-[color:var(--dm-accent-strong)]/40 px-4 py-2 text-center text-[color:var(--dm-accent-strong)] transition hover:border-[color:var(--dm-accent)]"
											>
												Use This Template
											</Link>
											<Link
												to="/invite/$slug"
												params={{ slug: `${template.id}-sample` }}
												className="text-center text-[color:var(--dm-muted)] transition hover:text-[color:var(--dm-ink)]"
											>
												View Sample Invitation
											</Link>
										</div>
									</div>
									<div data-reveal className="dm-reveal">
										<div
											className={`rounded-3xl border border-[color:var(--dm-border)] p-6 ${
												isDarkPreview ? 'dm-shell-dark' : 'dm-shell-light'
											}`}
										>
											<div className="space-y-5 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6">
												<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
													Live Preview
												</p>
												<h4 className="mt-3 text-2xl font-semibold text-[color:var(--dm-ink)]">
													{template.name}
												</h4>
												<p className="mt-2 text-sm text-[color:var(--dm-muted)]">
													{template.nameZh}
												</p>
												<img
													src={previewImage}
													alt=""
													loading="lazy"
													width={720}
													height={192}
													className="mt-6 h-48 w-full rounded-2xl border border-[color:var(--dm-border)] object-cover"
												/>
												<div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]">
													{template.preview.map((item) => (
														<span key={item}>{item}</span>
													))}
												</div>
											</div>
										</div>
									</div>
								</div>
							</section>
							)
						})}
					</div>
				</div>
			</section>

			<section id="process" className="px-6 py-20">
				<div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
					<div className="space-y-6">
						<p className="font-accent text-xs uppercase tracking-[0.5em] text-[color:var(--dm-accent-strong)]">
							Process
						</p>
						<h2 className="text-3xl font-semibold text-[color:var(--dm-ink)] sm:text-4xl">
							From Idea to Share Link in Under 5 Minutes.
						</h2>
						<p className="text-sm text-[color:var(--dm-muted)]">
							Designed for couples with limited time, but high standards. Each
							step is focused and guided.
						</p>
					</div>
					<div className="grid gap-4">
						{steps.map((step, index) => (
							<div key={step.title} className="dm-card rounded-2xl p-5">
								<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
									Step {index + 1}
								</p>
								<h3 className="mt-2 text-xl font-semibold text-[color:var(--dm-ink)]">
									{step.title}
								</h3>
								<p className="mt-2 text-sm text-[color:var(--dm-muted)]">{step.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section id="pricing" className="px-6 py-20">
				<div className="mx-auto max-w-6xl space-y-8">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div>
							<p className="font-accent text-xs uppercase tracking-[0.5em] text-[color:var(--dm-accent-strong)]">
								Pricing
							</p>
							<h2 className="text-3xl font-semibold text-[color:var(--dm-ink)] sm:text-4xl">
							Simple Tiers, Generous Limits.
							</h2>
						</div>
						<p className="max-w-xl text-sm text-[color:var(--dm-muted)]">
							Premium unlocks custom slugs and higher AI limits, but the
							template quality never changes.
						</p>
					</div>
					<div className="grid gap-6 lg:grid-cols-2">
						{pricing.map((tier) => (
							<div key={tier.name} className="dm-card rounded-3xl p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
											{tier.name}
										</p>
										<p className="mt-2 text-3xl font-semibold text-[color:var(--dm-ink)]">
											{tier.price}
										</p>
										<p className="mt-1 text-sm text-[color:var(--dm-muted)]">{tier.note}</p>
									</div>
									<div className="h-16 w-16 rounded-full border border-[color:var(--dm-accent-strong)]/40 bg-[color:var(--dm-accent-strong)]/10" />
								</div>
								<ul className="mt-6 space-y-2 text-sm text-[color:var(--dm-muted)]">
									{tier.features.map((feature) => (
										<li key={feature} className="flex items-center gap-2">
											<span className="h-1.5 w-1.5 rounded-full bg-[color:var(--dm-accent-strong)]" />
											{feature}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
					<div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6">
						<p className="text-sm text-[color:var(--dm-muted)]">
							Built for Malaysian and Singaporean Chinese weddings. Stripe
							supports FPX and PayNow.
						</p>
						<Link
							to="/editor/new"
							search={{ template: 'blush-romance' }}
							className="rounded-full bg-[color:var(--dm-accent-strong)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
						>
							Create Your Invitation
						</Link>
					</div>
				</div>
			</section>

			<footer className="border-t border-[color:var(--dm-border)] px-6 py-10 text-xs uppercase tracking-[0.3em] text-[color:var(--dm-muted)]">
				<div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<span>DreamMoments</span>
					<span>Beautiful Invitations, Fast.</span>
				</div>
			</footer>
		</main>
	)
}
