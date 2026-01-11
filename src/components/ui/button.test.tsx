// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Button } from './button'

describe('Button component', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeDefined()
    expect(button.className).toContain('bg-primary')
  })

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button', { name: /delete/i })
    expect(button.className).toContain('bg-destructive')
  })

  it('applies size classes', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole('button', { name: /large/i })
    expect(button.className).toContain('h-10')
  })

  it('supports asChild prop', () => {
    render(
      <Button asChild>
        <a href="/login">Login</a>
      </Button>
    )
    const link = screen.getByRole('link', { name: /login/i })
    expect(link).toBeDefined()
    expect(link.className).toContain('bg-primary')
  })
})
