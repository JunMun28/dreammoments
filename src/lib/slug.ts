const SLUG_SAFE = /[^a-z0-9]+/g

export function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(SLUG_SAFE, '-')
		.replace(/^-+|-+$/g, '')
}

export function generateSlug(base: string, existing: Set<string>) {
	let slug = slugify(base)
	if (!slug) slug = 'dreammoments'
	if (!existing.has(slug)) return slug
	let suffix = 0
	while (suffix < 50) {
		const token = Math.random().toString(36).slice(2, 6)
		const candidate = `${slug}-${token}`
		if (!existing.has(candidate)) return candidate
		suffix += 1
	}
	return `${slug}-${Date.now().toString(36).slice(-4)}`
}
