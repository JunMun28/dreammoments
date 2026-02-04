import type { InvitationContent } from './types'

const romanticWords = [
	'Two hearts, one promise',
	'Under the stars, always',
	'Forever begins with you',
]

function pick(list: string[]) {
	return list[Math.floor(Math.random() * list.length)]
}

export async function generateAiContent({
	type,
	sectionId,
	prompt,
	context,
}: {
	type: 'schedule' | 'faq' | 'story' | 'tagline' | 'style' | 'translate'
	sectionId: string
	prompt: string
	context: InvitationContent
}) {
	if (type === 'schedule') {
		return {
			events: [
				{ time: '3:00 PM', title: 'Arrival', description: 'Welcome drinks' },
				{ time: '3:30 PM', title: 'Ceremony', description: 'Exchange of vows' },
				{ time: '4:30 PM', title: 'Photos', description: 'Group portraits' },
				{ time: '6:00 PM', title: 'Dinner', description: 'Reception begins' },
				{ time: '8:30 PM', title: 'Celebration', description: 'Toasts and dance' },
			],
		}
	}

	if (type === 'faq') {
		return {
			items: [
				{ question: 'Dress code?', answer: 'Smart casual with soft tones.' },
				{ question: 'Parking?', answer: 'Valet parking is available.' },
				{ question: 'Plus ones?', answer: 'Please RSVP for allocated seats.' },
				{ question: 'Dietary needs?', answer: 'Let us know in RSVP.' },
			],
		}
	}

	if (type === 'story') {
		return {
			milestones: [
				{ date: '2018', title: 'We met', description: 'A campus coffee turned into laughter.' },
				{ date: '2020', title: 'We grew', description: 'Adventures across cities and sunsets.' },
				{ date: '2024', title: 'We said yes', description: 'A quiet proposal with loud hearts.' },
			],
		}
	}

	if (type === 'tagline') {
		return { tagline: pick(romanticWords) }
	}

	if (type === 'translate') {
		const base = prompt || context.announcement.message
		return {
			translation: `这是一段温柔的邀请：${base}`,
		}
	}

	if (type === 'style') {
		const wantsRomantic = /romantic|暖|warm|gold|rose/i.test(prompt)
		return {
			cssVars: {
				'--love-accent': wantsRomantic ? '#D4AF37' : '#E8B4B8',
				'--love-primary': wantsRomantic ? '#B30E0E' : '#2D5A3D',
				'--love-secondary': wantsRomantic ? '#741212' : '#1C1C1C',
				'--garden-accent': '#E8B4B8',
				'--eternal-gold': '#C9A962',
			},
			animationIntensity: wantsRomantic ? 1.1 : 0.9,
		}
	}

	return { message: 'No generation' }
}
