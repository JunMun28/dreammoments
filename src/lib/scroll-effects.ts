import { useEffect } from 'react'

const prefersReducedMotion = () =>
	window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function useScrollReveal() {
	useEffect(() => {
		if (typeof window === 'undefined') return
		const elements = Array.from(
			document.querySelectorAll<HTMLElement>('[data-reveal]')
		)
		if (!elements.length) return

		if (prefersReducedMotion()) {
			elements.forEach((element) => {
				element.classList.add('is-visible')
				element.classList.remove('is-hidden')
			})
			return
		}

		elements.forEach((element) => {
			const rect = element.getBoundingClientRect()
			if (rect.top < window.innerHeight * 0.9) {
				element.classList.add('is-visible')
				element.classList.remove('is-hidden')
			} else {
				element.classList.add('is-hidden')
			}
		})

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const element = entry.target as HTMLElement
					if (entry.isIntersecting) {
						element.classList.add('is-visible')
						element.classList.remove('is-hidden')
					}
				})
			},
			{ threshold: 0.2 }
		)

		elements.forEach((element) => observer.observe(element))
		return () => observer.disconnect()
	}, [])
}

export function useParallax() {
	useEffect(() => {
		if (typeof window === 'undefined') return
		if (prefersReducedMotion()) return

		const elements = Array.from(
			document.querySelectorAll<HTMLElement>('[data-parallax]')
		)
		if (!elements.length) return

		let raf = 0
		const update = () => {
			raf = window.requestAnimationFrame(() => {
				const scrollY = window.scrollY
				elements.forEach((element) => {
					const speed = Number(element.dataset.parallax) || 0.08
					element.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`
				})
			})
		}

		update()
		window.addEventListener('scroll', update, { passive: true })
		return () => {
			window.cancelAnimationFrame(raf)
			window.removeEventListener('scroll', update)
		}
	}, [])
}
