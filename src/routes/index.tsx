import { createFileRoute, Link } from "@tanstack/react-router";
import {
	CalendarHeart,
	Camera,
	Heart,
	Mail,
	Palette,
	Sparkles,
	Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllTemplates } from "@/lib/template-data";

export const Route = createFileRoute("/")({ component: HomePage });

// Get templates from shared data source
const templates = getAllTemplates();

/**
 * Format date for display in template card preview
 */
function formatPreviewDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

const features = [
	{
		icon: <Palette className="h-8 w-8" aria-hidden="true" />,
		title: "Beautiful Templates",
		description:
			"Choose from curated designs, then customize colors, fonts, and every detail to match your style.",
	},
	{
		icon: <Users className="h-8 w-8" aria-hidden="true" />,
		title: "Easy Guest Management",
		description:
			"Import your guest list from CSV, organize by groups, and generate unique RSVP links for each.",
	},
	{
		icon: <Mail className="h-8 w-8" aria-hidden="true" />,
		title: "Seamless RSVPs",
		description:
			"Guests RSVP instantly via link—no login required. Track responses in real-time from your dashboard.",
	},
	{
		icon: <Camera className="h-8 w-8" aria-hidden="true" />,
		title: "Shared Photo Memories",
		description:
			"Share a single upload link with all guests. Collect and curate wedding day photos effortlessly.",
	},
];

export function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
			{/* Hero Section */}
			<section className="relative overflow-hidden px-6 py-20 md:py-32">
				{/* Background decoration */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-rose-200/30 blur-3xl" />
					<div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-stone-200/50 blur-3xl" />
				</div>

				<div className="relative mx-auto max-w-5xl text-center">
					{/* Logo / Brand */}
					<div className="mb-6 flex items-center justify-center gap-3">
						<Heart className="h-10 w-10 text-rose-400" fill="currentColor" />
						<span className="text-3xl font-light tracking-wide text-stone-800 md:text-4xl">
							DreamMoments
						</span>
					</div>

					{/* Headline */}
					<h1 className="mb-6 text-4xl font-light leading-tight tracking-tight text-stone-900 md:text-6xl">
						Your love story,
						<br />
						<span className="font-medium text-rose-500">
							beautifully invited
						</span>
					</h1>

					{/* Subheadline */}
					<p className="mx-auto mb-10 max-w-2xl text-lg text-stone-600 md:text-xl">
						Create stunning digital wedding invitations, manage RSVPs
						effortlessly, and collect cherished photo memories—all in one
						elegant platform.
					</p>

					{/* CTAs */}
					<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
						<Button
							size="lg"
							className="min-w-[200px] bg-rose-500 text-white shadow-lg shadow-rose-500/30 transition-all hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-500/40"
							asChild
						>
							<Link to="/builder" search={{ devBypass: true }}>
								<Sparkles className="mr-2 h-5 w-5" />
								Start Creating
							</Link>
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="min-w-[200px] border-stone-300 text-stone-700 hover:bg-stone-100"
							asChild
						>
							<a href="#templates">Browse Templates</a>
						</Button>
					</div>
				</div>
			</section>

			{/* Template Gallery Section */}
			{/* biome-ignore lint/correctness/useUniqueElementIds: Static ID for anchor navigation */}
			<section id="templates" className="px-6 py-20">
				<div className="mx-auto max-w-6xl">
					<div className="mb-12 text-center">
						<p className="mb-2 text-sm uppercase tracking-widest text-rose-500">
							Curated Designs
						</p>
						<h2 className="text-3xl font-light text-stone-800 md:text-4xl">
							Choose Your Perfect Template
						</h2>
						<p className="mx-auto mt-4 max-w-xl text-stone-600">
							Start with a stunning design, then make it uniquely yours with
							custom colors, fonts, and content.
						</p>
					</div>

					{/* Template Cards */}
					<div className="grid gap-8 md:grid-cols-3">
						{templates.map((template) => (
							<Link
								key={template.id}
								to="/templates/$templateId"
								params={{ templateId: template.id }}
								className="group block overflow-hidden rounded-xl border border-stone-200 bg-white/70 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]"
							>
								{/* Preview Card */}
								<div
									className="relative p-8"
									style={{
										background: `linear-gradient(135deg, ${template.accentColor}10 0%, ${template.accentColor}05 100%)`,
									}}
								>
									{/* Mini invitation preview */}
									<div className="rounded-lg border border-white/60 bg-white/80 p-6 text-center shadow-sm backdrop-blur-sm">
										<p
											className="mb-1 text-[10px] uppercase tracking-widest"
											style={{ color: template.accentColor }}
										>
											You are invited
										</p>
										<p className="mb-2 text-xl font-light text-stone-800">
											{template.preview.partner1Name}
											<span
												className="mx-2"
												style={{ color: template.accentColor }}
											>
												&
											</span>
											{template.preview.partner2Name}
										</p>
										<div
											className="mx-auto mb-2 h-px w-12"
											style={{ backgroundColor: template.accentColor }}
										/>
										<div className="flex items-center justify-center gap-1 text-xs text-stone-500">
											<CalendarHeart
												className="h-3 w-3"
												style={{ color: template.accentColor }}
											/>
											<span>
												{formatPreviewDate(template.preview.weddingDate)}
											</span>
										</div>
									</div>
								</div>

								{/* Template Info */}
								<div className="border-t border-stone-100 p-4">
									<h3 className="font-medium text-stone-800">
										{template.name}
									</h3>
									<p className="mt-1 text-sm text-stone-500">
										{template.description}
									</p>
								</div>
							</Link>
						))}
					</div>

					{/* View All CTA */}
					<div className="mt-12 text-center">
						<Button
							variant="outline"
							size="lg"
							className="border-rose-200 text-rose-600 hover:bg-rose-50"
							asChild
						>
							<Link to="/builder" search={{ devBypass: true }}>
								View All Templates
								<Sparkles className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="bg-stone-50/50 px-6 py-20">
				<div className="mx-auto max-w-6xl">
					<div className="mb-12 text-center">
						<p className="mb-2 text-sm uppercase tracking-widest text-rose-500">
							Everything You Need
						</p>
						<h2 className="text-3xl font-light text-stone-800 md:text-4xl">
							A Complete Wedding Platform
						</h2>
					</div>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						{features.map((feature) => (
							<div
								key={feature.title}
								className="rounded-xl border border-stone-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md"
							>
								<div className="mb-4 inline-flex rounded-lg bg-rose-50 p-3 text-rose-500">
									{feature.icon}
								</div>
								<h3 className="mb-2 font-medium text-stone-800">
									{feature.title}
								</h3>
								<p className="text-sm leading-relaxed text-stone-600">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="px-6 py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-12 text-center">
						<p className="mb-2 text-sm uppercase tracking-widest text-rose-500">
							Simple Process
						</p>
						<h2 className="text-3xl font-light text-stone-800 md:text-4xl">
							Ready in Minutes
						</h2>
					</div>

					<div className="grid gap-8 md:grid-cols-3">
						{[
							{
								step: "1",
								title: "Pick a Template",
								description:
									"Browse our curated collection and preview with sample data—no signup required.",
							},
							{
								step: "2",
								title: "Customize Everything",
								description:
									"Add your details, choose colors and fonts, upload your photo, and make it yours.",
							},
							{
								step: "3",
								title: "Share & Celebrate",
								description:
									"Generate RSVP links for each guest group and track responses in real-time.",
							},
						].map((item) => (
							<div key={item.step} className="text-center">
								<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-xl font-semibold text-rose-500">
									{item.step}
								</div>
								<h3 className="mb-2 font-medium text-stone-800">
									{item.title}
								</h3>
								<p className="text-sm text-stone-600">{item.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Final CTA Section */}
			<section className="px-6 py-20">
				<div className="mx-auto max-w-4xl">
					<div className="overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 p-12 text-center shadow-xl shadow-rose-500/20">
						<Heart
							className="mx-auto mb-6 h-12 w-12 text-white/80"
							fill="currentColor"
						/>
						<h2 className="mb-4 text-3xl font-light text-white md:text-4xl">
							Ready to create your invitation?
						</h2>
						<p className="mx-auto mb-8 max-w-xl text-rose-100">
							Join thousands of couples who have shared their special day with
							DreamMoments. Start for free—no credit card required.
						</p>
						<Button
							size="lg"
							className="bg-white text-rose-600 shadow-lg transition-all hover:bg-rose-50"
							asChild
						>
							<Link to="/builder" search={{ devBypass: true }}>
								<Sparkles className="mr-2 h-5 w-5" />
								Get Started Free
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-stone-200 bg-white/50 px-6 py-8">
				<div className="mx-auto max-w-6xl">
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
						<div className="flex items-center gap-2 text-stone-600">
							<Heart className="h-5 w-5 text-rose-400" fill="currentColor" />
							<span className="font-light">DreamMoments</span>
						</div>
						<p className="text-sm text-stone-500">
							Made with love for couples everywhere
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
