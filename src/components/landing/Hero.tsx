import { Link } from "@tanstack/react-router";

export function Hero({ reducedMotion }: { reducedMotion: boolean }) {
	return (
		<section className="relative h-screen min-h-[800px] w-full overflow-hidden flex items-center justify-center">
			{/* Cinematic Background Layer */}
			<div className="absolute inset-0 z-0">
				<div className="absolute inset-0 bg-cinematic-overlay z-10" />
				<img
					src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
					alt="Wedding couple sharing a quiet moment"
					className={`w-full h-full object-cover object-center ${
						!reducedMotion ? "animate-scale-in" : ""
					}`}
				/>
			</div>

			{/* Content Layer */}
			<div className="relative z-20 container mx-auto px-4 text-center text-white">
				<div className="space-y-6 max-w-4xl mx-auto">
					<p
						className={`text-lg md:text-xl font-medium tracking-[0.2em] uppercase text-white/90 ${
							!reducedMotion ? "animate-fade-in delay-200" : ""
						}`}
						style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
					>
						The Digital Wedding Experience
					</p>

					<h1
						className={`font-display text-5xl md:text-7xl lg:text-8xl leading-tight md:leading-tight text-shadow-hero ${
							!reducedMotion ? "animate-fade-up delay-500" : ""
						}`}
					>
						Your Love Story, <br />
						<span className="italic text-white">Cinema Quality.</span>
					</h1>

					<p
						className={`text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed text-shadow-sm ${
							!reducedMotion ? "animate-fade-up delay-700" : ""
						}`}
					>
						Create a stunning, animated wedding invitation that feels like a
						movie trailer for your life together.
					</p>

					<div
						className={`pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 ${
							!reducedMotion ? "animate-fade-up delay-1000" : ""
						}`}
					>
						<Link
							to="/auth/signup"
							className="group relative px-8 py-4 bg-white text-dm-ink font-medium text-lg rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
						>
							<span className="relative z-10">Create Your Invitation</span>
							<div className="absolute inset-0 bg-dm-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
						</Link>

						<Link
							to="/"
							hash="how-it-works"
							className="group flex items-center gap-2 text-white/90 hover:text-white transition-colors text-lg font-medium px-4 py-2"
						>
							<span>View Examples</span>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="group-hover:translate-x-1 transition-transform"
							>
								<title>Arrow right</title>
								<path d="M5 12h14" />
								<path d="m12 5 7 7-7 7" />
							</svg>
						</Link>
					</div>
				</div>
			</div>

			{/* Scroll Indicator */}
			<div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/70 animate-bounce duration-[2000ms]">
				<span className="text-xs tracking-widest uppercase opacity-80">
					Scroll
				</span>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<title>Scroll down</title>
					<path d="M12 5v14" />
					<path d="m19 12-7 7-7-7" />
				</svg>
			</div>
		</section>
	);
}
