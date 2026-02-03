import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Landing })

const templates = [
	{
		id: 'love-at-dusk',
		name: 'Love at Dusk',
		nameZh: '暮色之恋',
		vibe: 'Romantic Chinese',
		description: 'Cinematic reds, gold accents, and poetic pacing.',
		colors: ['#B30E0E', '#741212', '#FFE094'],
	},
	{
		id: 'garden-romance',
		name: 'Garden Romance',
		nameZh: '花园之誓',
		vibe: 'Natural & Light',
		description: 'Soft botanicals with airy typography.',
		colors: ['#2D5A3D', '#E8B4B8', '#FDF8F5'],
	},
	{
		id: 'eternal-elegance',
		name: 'Eternal Elegance',
		nameZh: '恒久典雅',
		vibe: 'Classic Western',
		description: 'Black, champagne gold, and refined restraint.',
		colors: ['#1C1C1C', '#C9A962', '#FFFFFF'],
	},
]

const steps = [
	{
		title: 'Choose a template',
		desc: 'Pick a cinematic base tuned for Chinese weddings.',
	},
	{
		title: 'Edit in minutes',
		desc: 'Live preview, bilingual prompts, instant polish.',
	},
	{
		title: 'Publish and share',
		desc: 'Get a link and QR code ready for WhatsApp.',
	},
]

const pricing = [
	{
		name: 'Free',
		price: 'RM0',
		note: 'Perfect for a fast launch',
		features: [
			'All 3 templates',
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
	return (
		<main className="dm-grid">
			<section className="dm-hero relative overflow-hidden px-6 pb-20 pt-24">
				<div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#d8b25a]/30 blur-[120px] dm-orb" />
				<div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-[#c05b5b]/30 blur-[120px] dm-orb" />
				<div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr]">
					<div className="space-y-8">
						<p className="font-accent text-xs uppercase tracking-[0.5em] text-[#d8b25a]">
							DreamMoments
						</p>
						<h1 className="text-4xl font-semibold leading-tight text-[#fdf6ea] sm:text-5xl lg:text-6xl">
							Beautiful invitations, fast.
							<span className="block text-[#d8b25a]">
								为华人婚礼而生的数字请柬
							</span>
						</h1>
						<p className="max-w-xl text-base leading-relaxed text-[#f7e8c4]/80 sm:text-lg">
							Create a cinematic, bilingual wedding invitation in under 5
							minutes. Built for modern Chinese couples in Malaysia and
							Singapore.
						</p>
						<div className="flex flex-wrap items-center gap-4">
							<Link
								to="/editor/new"
								className="rounded-full bg-[#d8b25a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#0c0a08] transition hover:bg-[#f0c66d]"
							>
								Start with Love at Dusk
							</Link>
							<a
								href="#templates"
								className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#f7e8c4] transition hover:border-[#d8b25a]"
							>
								View Templates
							</a>
						</div>
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
							<div className="dm-card rounded-2xl p-4">
								<p className="text-xs uppercase tracking-[0.3em] text-[#d8b25a]">
									Speed
								</p>
								<p className="text-2xl font-semibold text-[#fdf6ea]">5 min</p>
								<p className="text-xs text-[#f7e8c4]/70">
									Signup to share link
								</p>
							</div>
							<div className="dm-card rounded-2xl p-4">
								<p className="text-xs uppercase tracking-[0.3em] text-[#d8b25a]">
									Quality
								</p>
								<p className="text-2xl font-semibold text-[#fdf6ea]">
									Designer‑level
								</p>
								<p className="text-xs text-[#f7e8c4]/70">Cinematic motion</p>
							</div>
							<div className="dm-card rounded-2xl p-4">
								<p className="text-xs uppercase tracking-[0.3em] text-[#d8b25a]">
									Bilingual
								</p>
								<p className="text-2xl font-semibold text-[#fdf6ea]">EN + 中文</p>
								<p className="text-xs text-[#f7e8c4]/70">AI assisted tone</p>
							</div>
						</div>
					</div>
					<div className="relative">
						<div className="dm-card dm-hover-glow rounded-[28px] border border-white/10 p-6">
							<div className="space-y-5 rounded-2xl border border-white/10 bg-[#100d0a]/80 p-6">
								<p className="text-xs uppercase tracking-[0.4em] text-[#d8b25a]">
									Live Preview
								</p>
								<div className="space-y-2">
									<p className="text-3xl font-semibold text-[#fdf6ea]">
										Sarah & Michael
									</p>
									<p className="text-sm text-[#f7e8c4]/70">
										Grand Hyatt Singapore · 15 Jun 2025
									</p>
								</div>
								<div className="h-44 rounded-2xl border border-white/10 bg-gradient-to-br from-[#2a1b13] via-[#0f0c0a] to-[#5b2f22]" />
								<p className="text-sm leading-relaxed text-[#f7e8c4]/70">
									Two hearts, one beautiful journey. A modern ceremony with
									Chinese elegance.
								</p>
								<div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#d8b25a]">
									<span>Hero</span>
									<span>Announcement</span>
									<span>RSVP</span>
								</div>
							</div>
						</div>
						<div className="absolute -bottom-10 -left-10 hidden h-36 w-36 rounded-full border border-[#d8b25a]/30 bg-[#d8b25a]/10 blur-2xl lg:block" />
					</div>
				</div>
			</section>

			<section id="templates" className="px-6 py-20">
				<div className="mx-auto max-w-6xl space-y-10">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div>
							<p className="font-accent text-xs uppercase tracking-[0.5em] text-[#d8b25a]">
								Templates
							</p>
							<h2 className="text-3xl font-semibold text-[#fdf6ea] sm:text-4xl">
								Three signature styles. One seamless editor.
							</h2>
						</div>
						<p className="max-w-xl text-sm text-[#f7e8c4]/70">
							Each template ships with curated motion, section order, and
							bilingual tone. Swap content, keep the cinematic flow.
						</p>
					</div>
					<div className="grid gap-6 lg:grid-cols-3">
						{templates.map((template) => (
							<div key={template.id} className="dm-card rounded-3xl p-6">
								<div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-[#d8b25a]">
									<span>{template.vibe}</span>
									<span>{template.nameZh}</span>
								</div>
								<h3 className="mt-4 text-2xl font-semibold text-[#fdf6ea]">
									{template.name}
								</h3>
								<p className="mt-3 text-sm text-[#f7e8c4]/70">
									{template.description}
								</p>
								<div className="mt-6 flex gap-2">
									{template.colors.map((color) => (
										<div
											key={color}
											className="h-8 w-8 rounded-full border border-white/20"
											style={{ backgroundColor: color }}
										/>
									))}
								</div>
								<div className="mt-6 flex flex-col gap-3 text-xs uppercase tracking-[0.2em] text-[#f7e8c4]/70">
									<Link
										to="/editor/new"
										className="rounded-full border border-[#d8b25a]/50 px-4 py-2 text-center text-[#d8b25a] transition hover:border-[#d8b25a]"
									>
										Use this template
									</Link>
									<Link
										to="/invite/$slug"
										params={{ slug: `${template.id}-sample` }}
										className="text-center text-[#f7e8c4]/80 transition hover:text-white"
									>
										View sample invitation
									</Link>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<section id="process" className="px-6 py-20">
				<div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
					<div className="space-y-6">
						<p className="font-accent text-xs uppercase tracking-[0.5em] text-[#d8b25a]">
							Process
						</p>
						<h2 className="text-3xl font-semibold text-[#fdf6ea] sm:text-4xl">
							From idea to share link in under 5 minutes.
						</h2>
						<p className="text-sm text-[#f7e8c4]/70">
							Designed for couples with limited time, but high standards. Each
							step is focused and guided.
						</p>
					</div>
					<div className="grid gap-4">
						{steps.map((step, index) => (
							<div key={step.title} className="dm-card rounded-2xl p-5">
								<p className="text-xs uppercase tracking-[0.3em] text-[#d8b25a]">
									Step {index + 1}
								</p>
								<h3 className="mt-2 text-xl font-semibold text-[#fdf6ea]">
									{step.title}
								</h3>
								<p className="mt-2 text-sm text-[#f7e8c4]/70">{step.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section id="pricing" className="px-6 py-20">
				<div className="mx-auto max-w-6xl space-y-8">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div>
							<p className="font-accent text-xs uppercase tracking-[0.5em] text-[#d8b25a]">
								Pricing
							</p>
							<h2 className="text-3xl font-semibold text-[#fdf6ea] sm:text-4xl">
								Simple tiers, generous limits.
							</h2>
						</div>
						<p className="max-w-xl text-sm text-[#f7e8c4]/70">
							Premium unlocks custom slugs and higher AI limits, but the
							template quality never changes.
						</p>
					</div>
					<div className="grid gap-6 lg:grid-cols-2">
						{pricing.map((tier) => (
							<div key={tier.name} className="dm-card rounded-3xl p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs uppercase tracking-[0.3em] text-[#d8b25a]">
											{tier.name}
										</p>
										<p className="mt-2 text-3xl font-semibold text-[#fdf6ea]">
											{tier.price}
										</p>
										<p className="mt-1 text-sm text-[#f7e8c4]/70">{tier.note}</p>
									</div>
									<div className="h-16 w-16 rounded-full border border-[#d8b25a]/40 bg-[#d8b25a]/10" />
								</div>
								<ul className="mt-6 space-y-2 text-sm text-[#f7e8c4]/80">
									{tier.features.map((feature) => (
										<li key={feature} className="flex items-center gap-2">
											<span className="h-1.5 w-1.5 rounded-full bg-[#d8b25a]" />
											{feature}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
					<div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#0f0c0a] p-6">
						<p className="text-sm text-[#f7e8c4]/70">
							Built for Malaysian and Singaporean Chinese weddings. Stripe
							supports FPX and PayNow.
						</p>
						<Link
							to="/editor/new"
							className="rounded-full bg-[#d8b25a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0c0a08]"
						>
							Create your invitation
						</Link>
					</div>
				</div>
			</section>

			<footer className="border-t border-white/10 px-6 py-10 text-xs uppercase tracking-[0.3em] text-[#f7e8c4]/50">
				<div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<span>DreamMoments</span>
					<span>Beautiful invitations, fast.</span>
				</div>
			</footer>
		</main>
	)
}
