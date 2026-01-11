import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
  })

  it('should handle conditional classes', () => {
    expect(cn('bg-red-500', true && 'text-white', false && 'p-4')).toBe('bg-red-500 text-white')
  })

  it('should merge tailwind classes', () => {
    expect(cn('p-4 p-2')).toBe('p-2')
    expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500')
  })

  it('should handle arrays and objects', () => {
    expect(cn(['flex', 'items-center'], { 'justify-center': true, 'hidden': false })).toBe('flex items-center justify-center')
  })
})
