import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Check, Play, Star, Sparkles, Heart } from 'lucide-react'
import { motion, useScroll, useTransform } from 'motion/react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for safe class merging
function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const Route = createFileRoute('/')({ component: Landing })

// --- Components ---

function Hero() {
	const { scrollY } = useScroll();
	const y1 = useTransform(scrollY, [0, 500], [0, 200]);
	const y2 = useTransform(scrollY, [0, 500], [0, -150]);

	return (
		<section className="relative min-h-[95svh] w-full overflow-hidden bg-[color:var(--dm-bg)] text-[color:var(--dm-ink)] flex flex-col justify-center">
			
			{/* Soft Blob Backgrounds */}
			<div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
				<motion.div 
					style={{ y: y1 }}
					className="absolute -top-[10%] -left-[5%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-[color:var(--dm-sage)] blur-[100px] opacity-60 animate-float"
				/>
				<motion.div 
					style={{ y: y2 }}
					className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-[color:var(--dm-lavender)] blur-[80px] opacity-60 animate-float" 
				/>
				<motion.div 
					className="absolute bottom-[10%] left-[20%] w-[30vw] h-[30vw] max-w-[300px] max-h-[300px] rounded-full bg-[color:var(--dm-peach)] blur-[90px] opacity-40 animate-float" 
					transition={{ delay: 2 }}
				/>
			</div>

			<div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<span className="font-accent text-3xl sm:text-4xl text-[color:var(--dm-muted)] block mb-4 rotate-[-2deg]">
						slow down & savour
					</span>
					<h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-8">
						Digital invites that feel <br/>
						<span className="text-[color:var(--dm-peach)] italic">warmly</span> yours.
					</h1>
					<p className="font-body text-xl text-[color:var(--dm-ink)]/80 max-w-lg mx-auto leading-relaxed mb-10">
						A quiet space for your big news. Thoughtfully designed, intentionally simple, and beautiful on every screen.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Link
							to="/editor/new"
							className="group relative px-8 py-4 bg-[color:var(--dm-ink)] text-[color:var(--dm-surface)] rounded-full text-lg font-medium transition-transform hover:scale-105 active:scale-95"
						>
							Start Designing
							<span className="absolute inset-0 rounded-full ring-1 ring-white/20 group-hover:ring-white/40 transition-all" />
						</Link>
						<a
							href="#showcase"
							className="px-8 py-4 bg-white/50 backdrop-blur-sm border border-[color:var(--dm-border)] text-[color:var(--dm-ink)] rounded-full text-lg font-medium transition-all hover:bg-white hover:shadow-lg"
						>
							View Collection
						</a>
					</div>
				</motion.div>
			</div>

			{/* Scroll Indicator */}
			<motion.div 
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1, duration: 1 }}
				className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[color:var(--dm-muted)]"
			>
				<span className="text-sm font-medium tracking-widest uppercase text-[10px]">Scroll to Explore</span>
				<div className="w-[1px] h-12 bg-gradient-to-b from-[color:var(--dm-muted)] to-transparent" />
			</motion.div>
		</section>
	)
}

function Showcase() {
	const templates = [
		{
			id: 'sage-morning',
			title: 'Sage Morning',
			desc: 'For quiet garden ceremonies.',
			color: 'bg-[#E8EFE8]',
			image: '/placeholders/photo-light.svg'
		},
		{
			id: 'velvet-dusk',
			title: 'Velvet Dusk',
			desc: 'Warm tones for evening vows.',
			color: 'bg-[#F2E8E8]',
			image: '/placeholders/photo-dark.svg'
		},
		{
			id: 'peach-haze',
			title: 'Peach Haze',
			desc: 'Soft, sun-drenched romance.',
			color: 'bg-[#FFF0ED]',
			image: '/placeholders/photo-light.svg'
		}
	];

	return (
		<section id="showcase" className="py-32 px-6">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-20">
					<h2 className="font-heading text-4xl sm:text-5xl mb-4">The Collection</h2>
					<p className="font-accent text-2xl text-[color:var(--dm-muted)]">curated for intimacy</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					{templates.map((t, i) => (
						<motion.div
							key={t.id}
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{ delay: i * 0.2, duration: 0.8 }}
							className="group cursor-pointer"
						>
							<div className={cn(
								"aspect-[3/4] rounded-[2.5rem] overflow-hidden mb-6 relative transition-transform duration-700 ease-out group-hover:-translate-y-2",
								t.color
							)}>
								<div className="absolute inset-4 rounded-[2rem] overflow-hidden bg-white/40 border border-white/50 backdrop-blur-sm shadow-sm transition-all duration-500 group-hover:shadow-md">
                   {/* Placeholder visual */}
                   <div className="h-full w-full flex items-center justify-center opacity-30">
                      <Heart className="w-16 h-16 text-[color:var(--dm-ink)]" />
                   </div>
                </div>
							</div>
							<div className="text-center">
								<h3 className="font-heading text-2xl mb-1 group-hover:text-[color:var(--dm-peach)] transition-colors">{t.title}</h3>
								<p className="text-[color:var(--dm-muted)]">{t.desc}</p>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}

function Features() {
	return (
		<section className="py-32 px-6 bg-[color:var(--dm-surface-muted)] rounded-[3rem] mx-4 sm:mx-8 mb-20">
			<div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
				<motion.div
					initial={{ opacity: 0, x: -30 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
				>
					<span className="font-accent text-3xl text-[color:var(--dm-peach)] block mb-4">gentle features</span>
					<h2 className="font-heading text-5xl sm:text-6xl mb-8 leading-tight">
						Designed to feel <br/> like a <span className="italic">living room.</span>
					</h2>
					<p className="text-xl text-[color:var(--dm-muted)] leading-relaxed mb-12">
						No clutter, no noise. Just a serene space for your guests to feel the love, get the details, and say yes.
					</p>
					
					<div className="space-y-8">
						{[
							{ title: 'Tactile Textures', desc: 'Grainy, paper-like feel.', icon: <Sparkles className="w-5 h-5"/> },
							{ title: 'Fluid Motion', desc: 'Slow, calming transitions.', icon: <Play className="w-5 h-5"/> },
							{ title: 'Guest Ease', desc: 'One-tap RSVP, no logins.', icon: <Check className="w-5 h-5"/> }
						].map((item, i) => (
							<motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.5 }}
                className="flex items-start gap-4"
              >
								<div className="w-10 h-10 rounded-full bg-[color:var(--dm-surface)] border border-[color:var(--dm-border)] flex items-center justify-center text-[color:var(--dm-ink)] shadow-sm">
									{item.icon}
								</div>
								<div>
									<h4 className="font-bold text-lg">{item.title}</h4>
									<p className="text-[color:var(--dm-muted)]">{item.desc}</p>
								</div>
							</motion.div>
						))}
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 1, ease: "easeOut" }}
					className="relative aspect-square bg-[color:var(--dm-surface)] rounded-[3rem] shadow-2xl p-8 border border-[color:var(--dm-border)] transform rotate-2 hover:rotate-0 transition-transform duration-700"
				>
           {/* Abstract Phone / Card UI */}
           <div className="h-full w-full rounded-[2rem] bg-[color:var(--dm-bg)] overflow-hidden relative flex flex-col">
              <div className="h-12 border-b border-[color:var(--dm-border)] flex items-center px-6 gap-2">
                 <div className="w-2 h-2 rounded-full bg-[color:var(--dm-border)]"></div>
                 <div className="w-2 h-2 rounded-full bg-[color:var(--dm-border)]"></div>
              </div>
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-[color:var(--dm-sage)] blur-2xl absolute top-1/4 left-1/4 opacity-50"></div>
                  <div className="w-32 h-32 rounded-full bg-[color:var(--dm-peach)] blur-3xl absolute bottom-1/4 right-1/4 opacity-40"></div>
                  
                  <div className="relative z-10">
                     <p className="font-accent text-3xl mb-2">Sarah & Tom</p>
                     <h3 className="font-heading text-4xl mb-6">We're getting married.</h3>
                     <div className="inline-block px-6 py-2 rounded-full border border-[color:var(--dm-ink)]/20 bg-white/50 backdrop-blur-md text-sm uppercase tracking-widest">
                        Sept 24
                     </div>
                  </div>
              </div>
           </div>
				</motion.div>
			</div>
		</section>
	)
}

function Footer() {
	return (
		<footer className="py-20 text-center text-[color:var(--dm-muted)]">
			<div className="flex justify-center gap-2 mb-8 opacity-50">
				<Star className="w-4 h-4" />
				<Star className="w-4 h-4" />
				<Star className="w-4 h-4" />
			</div>
			<p className="font-heading text-2xl text-[color:var(--dm-ink)] mb-2">DreamMoments</p>
			<p className="text-sm">Made with <Heart className="w-3 h-3 inline text-[color:var(--dm-peach)]" /> for love.</p>
		</footer>
	)
}

export function Landing() {
	return (
		<main className="min-h-screen bg-[color:var(--dm-bg)] selection:bg-[color:var(--dm-peach)] selection:text-[color:var(--dm-ink)]">
			<Hero />
			<Showcase />
			<Features />
			<Footer />
		</main>
	)
}

