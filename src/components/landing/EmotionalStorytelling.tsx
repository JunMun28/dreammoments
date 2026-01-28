import { DecorativeBorder } from "@/components/ui/decorative-border";

/**
 * EmotionalStorytelling - Cultural/emotional narrative section.
 * Features alternate burgundy/cream backgrounds with decorative flourishes.
 */
export function EmotionalStorytelling() {
	return (
		<section className="overflow-hidden">
			{/* First block - Cream background */}
			<div className="bg-[#faf8f5] px-6 py-20">
				<div className="mx-auto max-w-3xl text-center">
					<DecorativeBorder
						style="flourish"
						position="top"
						color="#d4af37"
						width={200}
						className="mb-8"
					/>

					<h2
						className="mb-6 text-3xl font-light text-[#5c1a1b] md:text-4xl"
						style={{ fontFamily: "'Cinzel Decorative', serif" }}
					>
						Your Love Story, Beautifully Told
					</h2>

					<p
						className="mb-8 text-lg leading-relaxed text-stone-600"
						style={{ fontFamily: "'EB Garamond', serif" }}
					>
						A wedding invitation is more than an announcement—it's the first
						chapter of your celebration. It sets the tone, builds anticipation,
						and gives your guests a glimpse into the magic that awaits.
					</p>

					<DecorativeBorder
						style="flourish"
						position="bottom"
						color="#d4af37"
						width={200}
						className="mt-8"
					/>
				</div>
			</div>

			{/* Second block - Burgundy background */}
			<div className="bg-[#5c1a1b] px-6 py-20">
				<div className="mx-auto max-w-3xl text-center">
					<DecorativeBorder
						style="flourish"
						position="top"
						color="#d4af37"
						width={200}
						className="mb-8"
					/>

					<h3
						className="mb-6 text-2xl font-light text-white md:text-3xl"
						style={{ fontFamily: "'Cinzel Decorative', serif" }}
					>
						Honoring Heritage, Embracing Tomorrow
					</h3>

					<p
						className="mb-8 text-lg leading-relaxed text-white/80"
						style={{ fontFamily: "'EB Garamond', serif" }}
					>
						The Double Happiness symbol represents the union of two families,
						two hearts, two futures. Let your invitation carry forward these
						timeless blessings while reflecting your unique journey together.
					</p>

					<DecorativeBorder
						style="flourish"
						position="bottom"
						color="#d4af37"
						width={200}
						className="mt-8"
					/>
				</div>
			</div>

			{/* Third block - Cream background */}
			<div className="bg-[#faf8f5] px-6 py-20">
				<div className="mx-auto max-w-3xl text-center">
					<DecorativeBorder
						style="flourish"
						position="top"
						color="#d4af37"
						width={200}
						className="mb-8"
					/>

					<h3
						className="mb-6 text-2xl font-light text-[#5c1a1b] md:text-3xl"
						style={{ fontFamily: "'Cinzel Decorative', serif" }}
					>
						Every Detail Matters
					</h3>

					<p
						className="mb-8 text-lg leading-relaxed text-stone-600"
						style={{ fontFamily: "'EB Garamond', serif" }}
					>
						From the shimmer of gold accents to the elegance of carefully chosen
						typography, every element has been crafted to make your guests feel
						the importance of this day—and their place in it.
					</p>

					<DecorativeBorder
						style="flourish"
						position="bottom"
						color="#d4af37"
						width={200}
						className="mt-8"
					/>
				</div>
			</div>
		</section>
	);
}
