// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Label } from './label'
import { Textarea } from './textarea'
import { Switch } from './switch'

describe('UI Components', () => {
  afterEach(() => {
    cleanup()
  })

  it('Label renders correctly', () => {
    render(<Label>Test Label</Label>)
    expect(screen.getByText('Test Label')).toBeDefined()
  })

  it('Textarea renders correctly', () => {
    render(<Textarea placeholder="Enter text" />)
    const textarea = screen.getByPlaceholderText('Enter text')
    expect(textarea).toBeDefined()
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('Switch renders correctly', () => {
    render(<Switch aria-label="Toggle feature" />)
    const switchEl = screen.getByRole('switch', { name: "Toggle feature" })
    expect(switchEl).toBeDefined()
  })
})
