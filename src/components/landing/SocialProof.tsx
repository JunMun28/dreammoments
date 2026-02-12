import { useRef } from "react";
import { useScrollReveal } from "./hooks/useScrollReveal";

const TESTIMONIALS = [
	{
		quote:
			"It felt less like sending an invite and more like sharing a piece of our story. Our guests were in tears.",
		author: "Sarah & Michael",
		location: "Singapore",
		img: "https://images.unsplash.com/photo-1623091410901-00e2d5b6a0ff?q=80&w=200&auto=format&fit=crop",
	},
	{
		quote:
			"We wanted something that honored our traditions but felt modern. DreamMoments was the perfect bridge between generations.",
		author: "Wei Ling & Jun Hao",
		location: "Kuala Lumpur",
		img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=200&auto=format&fit=crop",
	},
	{
		quote:
			"Simple, beautiful, and deeply personal. I'll cherish this digital keepsake forever.",
		author: "Elena & David",
		location: "Penang",
		img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
	},
];

export function SocialProof({ reducedMotion }: { reducedMotion: boolean }) {
	const sectionRef = useRef<HTMLElement>(null);
	useScrollReveal(reducedMotion, sectionRef);

	return (
		<section
			ref={sectionRef}
			className="py-32 bg-white overflow-hidden relative"
		>
			{/* Background Texture */}
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
				}}
			/>

			<div className="dm-container relative z-10">
				<div className="text-center mb-20 animate-fade-up">
					<span className="text-dm-primary font-medium tracking-widest uppercase text-sm mb-4 block">
						Real Stories
					</span>
					<h2 className="text-display text-4xl md:text-5xl text-dm-ink">
						Loved by Couples, <br /> Adored by Guests.
					</h2>
				</div>

				<div className="grid md:grid-cols-3 gap-8 lg:gap-12">
					{TESTIMONIALS.map((t, i) => (
						<div
							key={t.author}
							className={`relative p-8 rounded-none border-l-2 border-dm-primary/20 bg-white hover:border-dm-primary transition-colors duration-500 animate-fade-up`}
							style={{ animationDelay: `${i * 150}ms` }}
						>
							{/* Quote Icon */}
							<div className="absolute -top-4 -left-3 bg-white px-2 text-4xl text-dm-primary font-display">
								"
							</div>

							<p className="text-xl md:text-2xl font-display text-dm-ink/90 mb-8 leading-relaxed italic">
								{t.quote}
							</p>

							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-full overflow-hidden border border-dm-border">
									<img
										src={t.img}
										alt={t.author}
										className="w-full h-full object-cover"
									/>
								</div>
								<div>
									<h4 className="font-semibold text-dm-ink">{t.author}</h4>
									<p className="text-sm text-dm-ink-muted uppercase tracking-wider">
										{t.location}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Trust Indicators */}
				<div className="mt-24 pt-12 border-t border-dm-border flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 animate-fade-in delay-300">
					{["Vogue", "Brides", "Tatler", "The Knot"].map((brand) => (
						<span
							key={brand}
							className="text-2xl font-display font-bold text-dm-ink-muted"
						>
							{brand}
						</span>
					))}
				</div>
			</div>
		</section>
	);
}
