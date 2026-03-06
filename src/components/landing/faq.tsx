import { useState } from "react";

const faqs = [
	{
		question: "Do my guests need to download an app?",
		answer:
			"No. Your invitation is a beautiful web page that works on any device. Guests just tap the link you share - no app needed.",
	},
	{
		question: "Can I have my invitation in both English and Chinese?",
		answer:
			"Yes! All our templates support bilingual content. Your guests can switch between languages with one tap.",
	},
	{
		question: "How do RSVPs and plus-ones work?",
		answer:
			"Guests RSVP directly from the invitation. They can confirm plus-ones, select meal preferences, and leave you a message - all in one flow.",
	},
	{
		question: "Can I update details after sending?",
		answer:
			"Absolutely. Change venue details, timings, or any content in real-time. Guests always see the latest version.",
	},
	{
		question: "Is there a free trial?",
		answer:
			"Yes. Create and preview your full invitation for free. You only pay when you're ready to publish and share with guests.",
	},
];

export function Faq() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	return (
		// biome-ignore lint/correctness/useUniqueElementIds: scroll navigation anchor
		<section id="faq" className="bg-background py-24 sm:py-32">
			<div className="mx-auto max-w-2xl px-6">
				{/* Header */}
				<div className="text-center mb-16">
					<p className="font-script text-lg text-gold">Common questions</p>
					<h2 className="font-heading text-3xl sm:text-4xl font-light text-foreground mt-3">
						Everything you need to know
					</h2>
				</div>

				{/* Accordion */}
				<dl className="divide-y divide-border">
					{faqs.map((faq, i) => {
						const isOpen = openIndex === i;
						return (
							<div key={faq.question} className="py-5">
								<dt>
									<button
										type="button"
										className="flex w-full items-center justify-between text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
										aria-expanded={isOpen}
										onClick={() => setOpenIndex(isOpen ? null : i)}
									>
										<span className="text-base font-medium text-foreground">
											{faq.question}
										</span>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											aria-hidden="true"
											className={`ml-4 h-5 w-5 shrink-0 text-gold transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
										>
											<path
												fillRule="evenodd"
												d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
												clipRule="evenodd"
											/>
										</svg>
									</button>
								</dt>
								<dd
									className="grid transition-[grid-template-rows] duration-300 ease-out"
									style={{
										gridTemplateRows: isOpen ? "1fr" : "0fr",
									}}
								>
									<div className="overflow-hidden">
										<p className="pt-4 text-muted-foreground leading-relaxed">
											{faq.answer}
										</p>
									</div>
								</dd>
							</div>
						);
					})}
				</dl>
			</div>
		</section>
	);
}
