// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { App } from './index'

describe('Index Route', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders correctly', () => {
    render(<App />)
    expect(screen.getByText('TANSTACK')).toBeDefined()
    expect(screen.getByText('START')).toBeDefined()
    expect(screen.getByText('Powerful Server Functions')).toBeDefined()
  })
})
